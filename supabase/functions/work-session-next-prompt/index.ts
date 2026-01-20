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
- If job context is provided, tailor questions to test the specific skills and requirements mentioned in the job posting
- Focus on real work: requirements, tradeoffs, execution
- No trivia, no gotchas, no leetcode-style puzzles
- Keep questions SHORT (1 sentence max)
- This is a QUICK DEMO - only 2 questions total

DEMO MODE (2 questions only):
- Stage 1 (framing): Ask ONE question about how they'd understand/approach a problem relevant to the job
- Stage 2 (build): Ask ONE question about implementation or technical decisions relevant to the job's tech stack/requirements
- After candidate answers, ALWAYS mark stageComplete as true

JOB-BASED INTERVIEWING:
- Use the job title, description, requirements, and tech stack to craft relevant questions
- Test the specific skills mentioned in the job posting
- Reference the job's context naturally in your questions

SIGNAL TAGS (use 1-2 per response):
- Ownership, Judgment, Execution, Communication, ProductSense`;

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

    // Extract job context if available
    let jobContextSummary = "";
    if (session.job_context) {
      const job = session.job_context;
      const analyzedData = job.analyzed_data || {};
      const requiredSkills = analyzedData.requiredSkills || [];
      const niceToHaveSkills = analyzedData.niceToHaveSkills || [];
      const techStack = analyzedData.techStack || [];
      
      jobContextSummary = `\nJOB POSTING CONTEXT (CRITICAL - tailor questions to this):
Job Title: ${job.title || "Not specified"}
Description: ${job.description ? job.description.slice(0, 500) : "Not specified"}
Requirements: ${job.requirements ? job.requirements.slice(0, 500) : "Not specified"}
Required Skills: ${requiredSkills.length > 0 ? requiredSkills.join(", ") : "Not specified"}
Nice-to-Have Skills: ${niceToHaveSkills.length > 0 ? niceToHaveSkills.join(", ") : "None"}
Tech Stack: ${techStack.length > 0 ? techStack.join(", ") : "Not specified"}

IMPORTANT: Your questions MUST test the candidate's ability to work on this specific role. Reference the job's requirements, tech stack, and context naturally in your questions.`;
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
DEMO MODE: Only 2 questions total (framing + build)
Current Stage: ${currentStage}
${githubSummary}
${jobContextSummary}

CONVERSATION SO FAR:
${conversationHistory || "(Starting conversation)"}

${candidateResponse ? `CANDIDATE'S RESPONSE:\n${candidateResponse}\n\nIMPORTANT: Candidate has answered. Set stageComplete to TRUE.` : "Generate ONE short opening question for this stage."}

Generate a brief response for the ${currentStage} stage.${candidateResponse ? " MUST set stageComplete: true" : ""}`;

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
    console.log("AI response structure:", JSON.stringify(data.choices?.[0]?.message, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    // Handle case where model returns content directly instead of tool call
    if (!toolCall || toolCall.function.name !== "generate_next_prompt") {
      // Try to extract from message content if tool call failed
      const messageContent = data.choices?.[0]?.message?.content;
      if (messageContent) {
        console.log("No tool call, attempting to parse content as fallback");
        // Generate a fallback response
        const fallbackResult = {
          nextPrompt: typeof messageContent === "string" 
            ? messageContent.slice(0, 500) 
            : "Let's continue. Can you tell me more about your approach?",
          stageComplete: false,
          signalTags: []
        };
        
        // Store the prompt as an event
        await supabase
          .from("work_session_events")
          .insert({
            session_id: sessionId,
            event_type: "PROMPT",
            content: {
              text: fallbackResult.nextPrompt,
              stage: currentStage,
              signal_tags: fallbackResult.signalTags
            },
            created_at: new Date().toISOString(),
          });

        return new Response(
          JSON.stringify(fallbackResult),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.error("Unexpected AI response format:", JSON.stringify(data));
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
