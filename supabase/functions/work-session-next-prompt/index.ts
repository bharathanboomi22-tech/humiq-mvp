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
- Keep questions SHORT and concise (1-2 sentences max)
- This is a DEMO session - be brief and move quickly
- After 1 question per stage, mark stageComplete as true

DEMO MODE (5 min session):
- Ask only ONE focused question per stage
- Keep your responses very short
- Move to next stage after the candidate answers

STAGE GUIDELINES (1 question each):
- Framing: Ask about understanding the problem and key requirements
- Approach: Ask about their solution design or architecture choice
- Build: Ask about implementation approach or key code decisions
- Review: Ask about testing, edge cases, or deployment

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

    // Count responses in current stage
    const stageResponses = (events || []).filter(
      e => e.event_type === "RESPONSE" && e.content?.stage === currentStage
    ).length;

    // In demo mode (5 min), move to next stage after 1 response
    const isDemoMode = session.duration === 5;
    const shouldCompleteStage = isDemoMode && candidateResponse && stageResponses >= 0;

    // Build user prompt
    const userPrompt = `SESSION CONTEXT:
Role Track: ${session.role_track}
Level: ${session.level}
Duration: ${session.duration} minutes (${isDemoMode ? "DEMO MODE - 1 question per stage" : "standard"})
Current Stage: ${currentStage}
${githubSummary}

CONVERSATION SO FAR:
${conversationHistory || "(Starting conversation)"}

${candidateResponse ? `CANDIDATE'S LATEST RESPONSE:\n${candidateResponse}` : "Generate the opening question for this stage."}

${isDemoMode && candidateResponse ? "IMPORTANT: This is DEMO MODE. The candidate has answered. Set stageComplete to TRUE and provide brief acknowledgment before moving on." : ""}

Generate the next prompt for the ${currentStage} stage.${shouldCompleteStage ? " Mark stageComplete as true since this is demo mode and the candidate has responded." : ""}`;

    // Call LLM
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const AI_TIMEOUT_MS = 25_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          max_tokens: 250,
          messages: [
            { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [promptToolSchema],
          tool_choice: { type: "function", function: { name: "generate_next_prompt" } },
        }),
      });
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      if (isAbort) {
        return new Response(
          JSON.stringify({ error: "AI is taking too long. Please retry." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits and retry." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate prompt" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
