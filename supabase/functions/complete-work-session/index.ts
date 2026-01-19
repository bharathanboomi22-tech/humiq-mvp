import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVIDENCE_PACK_SYSTEM_PROMPT = `You are HumIQ AI generating an Evidence Pack report for a technical work session.

CRITICAL RULES:
- Only claim what was observed (from GitHub evidence or transcript/code)
- Explicitly list gaps in evidence
- Avoid generic praise
- Be specific with examples from the conversation
- Make it skimmable in 5 minutes
- No numeric scores

The report should help a hiring manager quickly understand:
1. What signals were observed
2. What evidence supports each signal
3. What's still unknown
4. Recommended next steps`;

const evidencePackToolSchema = {
  type: "function",
  function: {
    name: "generate_evidence_pack",
    description: "Generate a structured Evidence Pack report from a work session",
    parameters: {
      type: "object",
      properties: {
        roleTrack: {
          type: "string",
          enum: ["backend", "frontend"],
          description: "The role track of the session"
        },
        levelEstimate: {
          type: "string",
          enum: ["junior", "mid", "senior"],
          description: "Estimated level based on observed signals"
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level in the assessment"
        },
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              signal: { type: "string", description: "The strength observed" },
              evidence: { type: "string", description: "Specific example from the session" }
            },
            required: ["signal", "evidence"]
          },
          description: "Observed strengths with evidence"
        },
        risks_or_unknowns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              signal: { type: "string", description: "The risk or unknown area" },
              evidence_gap: { type: "string", description: "What evidence is missing" }
            },
            required: ["signal", "evidence_gap"]
          },
          description: "Risks and unknowns with evidence gaps"
        },
        decision_log: {
          type: "array",
          items: {
            type: "object",
            properties: {
              decision: { type: "string", description: "A decision the candidate made" },
              tradeoff: { type: "string", description: "The tradeoff they considered" },
              example: { type: "string", description: "Quote or specific example" }
            },
            required: ["decision", "tradeoff", "example"]
          },
          description: "Key decisions and tradeoffs observed"
        },
        execution_observations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              observation: { type: "string", description: "What was observed" },
              example: { type: "string", description: "Specific example" }
            },
            required: ["observation", "example"]
          },
          description: "Observations about execution quality"
        },
        recommended_next_step: {
          type: "string",
          description: "Recommendation: skip to onsite, 15-min follow-up, etc."
        },
        highlights: {
          type: "array",
          items: { type: "string" },
          description: "3-5 key highlights for quick scanning"
        },
        github_summary: {
          type: "string",
          description: "Brief summary of GitHub evidence if available"
        }
      },
      required: ["roleTrack", "levelEstimate", "confidence", "strengths", "risks_or_unknowns", "decision_log", "execution_observations", "recommended_next_step", "highlights"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Completing work session:", sessionId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch session
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

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from("work_session_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
    }

    // Build transcript
    const transcript = (events || [])
      .map(e => {
        const timestamp = new Date(e.created_at).toLocaleTimeString();
        if (e.event_type === "PROMPT") {
          return `[${timestamp}] INTERVIEWER: ${e.content.text}`;
        } else if (e.event_type === "RESPONSE") {
          return `[${timestamp}] CANDIDATE: ${e.content.text}`;
        } else if (e.event_type === "CODE_SNAPSHOT") {
          return `[${timestamp}] CODE:\n\`\`\`\n${e.content.code?.slice(0, 500) || ""}\n\`\`\``;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n\n");

    // Collect signal tags
    const allSignalTags = (events || [])
      .filter(e => e.event_type === "PROMPT" && e.content.signal_tags)
      .flatMap(e => e.content.signal_tags);

    // Build prompt for evidence pack generation
    const userPrompt = `Generate an Evidence Pack for this technical work session.

SESSION INFO:
- Role Track: ${session.role_track}
- Target Level: ${session.level}
- Duration: ${session.duration} minutes

${session.raw_work_evidence ? `GITHUB EVIDENCE:\n${session.raw_work_evidence.slice(0, 3000)}\n\n` : ""}

SESSION TRANSCRIPT:
${transcript || "(No transcript available)"}

OBSERVED SIGNAL TAGS: ${allSignalTags.length > 0 ? allSignalTags.join(", ") : "None recorded"}

Generate the Evidence Pack now. Be specific, cite examples from the transcript, and explicitly note any gaps.`;

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
          { role: "system", content: EVIDENCE_PACK_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        tools: [evidencePackToolSchema],
        tool_choice: { type: "function", function: { name: "generate_evidence_pack" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate evidence pack" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_evidence_pack") {
      console.error("Unexpected AI response format");
      return new Response(
        JSON.stringify({ error: "Failed to generate evidence pack" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const summaryJson = JSON.parse(toolCall.function.arguments);
    console.log("Evidence pack generated, confidence:", summaryJson.confidence);

    // Create evidence pack record
    const { data: evidencePack, error: packError } = await supabase
      .from("evidence_packs")
      .insert({
        session_id: sessionId,
        summary_json: summaryJson,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (packError) {
      console.error("Error creating evidence pack:", packError);
      return new Response(
        JSON.stringify({ error: "Failed to save evidence pack" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update session status
    await supabase
      .from("work_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Close current stage
    await supabase
      .from("work_session_stages")
      .update({ ended_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .is("ended_at", null);

    console.log("Work session completed:", evidencePack.id);

    return new Response(
      JSON.stringify({
        evidencePackId: evidencePack.id,
        shareId: evidencePack.public_share_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in complete-work-session:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
