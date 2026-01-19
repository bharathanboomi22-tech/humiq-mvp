import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTERVIEWER_SYSTEM_PROMPT = `You are a calm, supportive teammate conducting a real-work technical conversation for HumIQ.

CRITICAL RULES:
- Ask exactly 1 question at a time
- Be conversational, not interrogative
- Base prompts on GitHub insights when available
- Focus on real work: requirements, tradeoffs, execution, testing, observability
- No trivia, no gotchas, no leetcode-style puzzles
- If evidence is missing, ask questions that can reveal it
- Keep questions concise (2-3 sentences max)
- Acknowledge good answers briefly before moving on

STAGE GUIDELINES:
- Framing (5-10 min): Understand problem space, clarify requirements, identify constraints
- Approach (10-15 min): Explore solution options, discuss tradeoffs, system design
- Build (10-20 min): Walk through implementation, pseudocode, key decisions
- Review (5-10 min): Edge cases, testing strategy, observability, deployment considerations

SIGNAL TAGS (use 1-2 per response):
- Ownership: Takes responsibility, drives to completion
- Judgment: Makes good tradeoffs, prioritizes well
- Execution: Ships working code, unblocks self
- Communication: Explains clearly, asks good questions
- ProductSense: Understands user impact, business context`;

const promptToolSchema = {
  type: "function",
  function: {
    name: "generate_next_prompt",
    description: "Generate the next interview prompt based on conversation context",
    parameters: {
      type: "object",
      properties: {
        nextPrompt: {
          type: "string",
          description: "The next question or prompt for the candidate (1-3 sentences)"
        },
        stageComplete: {
          type: "boolean",
          description: "Whether the current stage has enough signal to move on"
        },
        signalTags: {
          type: "array",
          items: { type: "string", enum: ["Ownership", "Judgment", "Execution", "Communication", "ProductSense"] },
          description: "1-2 signal tags observed in the candidate's last response (empty if first prompt)"
        }
      },
      required: ["nextPrompt", "stageComplete", "signalTags"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, candidateResponse, currentStage } = await req.json();

    if (!sessionId || !currentStage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sessionId, currentStage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating next prompt:", { sessionId, currentStage, hasResponse: !!candidateResponse });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch conversation history
    const { data: events, error: eventsError } = await supabase
      .from("work_session_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
    }

    // Build conversation context
    const conversationHistory = (events || [])
      .filter(e => e.event_type === "PROMPT" || e.event_type === "RESPONSE")
      .map(e => {
        if (e.event_type === "PROMPT") {
          return `Interviewer: ${e.content.text}`;
        } else {
          return `Candidate: ${e.content.text}`;
        }
      })
      .join("\n\n");

    // Summarize GitHub insights if available
    let githubSummary = "";
    if (session.raw_work_evidence) {
      githubSummary = `\nGITHUB INSIGHTS (use to tailor questions):\n${session.raw_work_evidence.slice(0, 2000)}`;
    }

    // Build user prompt
    const userPrompt = `SESSION CONTEXT:
Role Track: ${session.role_track}
Level: ${session.level}
Duration: ${session.duration} minutes
Current Stage: ${currentStage}
${githubSummary}

CONVERSATION SO FAR:
${conversationHistory || "(Starting conversation)"}

${candidateResponse ? `CANDIDATE'S LATEST RESPONSE:\n${candidateResponse}` : "Generate the opening question for this stage."}

Generate the next prompt for the ${currentStage} stage. Consider whether we have enough signal to move to the next stage.`;

    // Call LLM
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        tools: [promptToolSchema],
        tool_choice: { type: "function", function: { name: "generate_next_prompt" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate prompt" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "generate_next_prompt") {
      console.error("Unexpected AI response format");
      return new Response(
        JSON.stringify({ error: "Failed to generate prompt" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Generated prompt:", { stageComplete: result.stageComplete, signalTags: result.signalTags });

    // Store the prompt as an event
    await supabase
      .from("work_session_events")
      .insert({
        session_id: sessionId,
        event_type: "PROMPT",
        content: {
          text: result.nextPrompt,
          stage: currentStage,
          signal_tags: result.signalTags
        },
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        nextPrompt: result.nextPrompt,
        stageComplete: result.stageComplete,
        signalTags: result.signalTags || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in work-session-next-prompt:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
