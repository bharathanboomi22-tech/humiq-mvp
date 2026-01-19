import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVIDENCE_PACK_SYSTEM_PROMPT = `You are HumIQ AI generating a merged Evidence Pack report combining GitHub analysis and interview insights.

CRITICAL RULES:
- Only claim what was observed (from GitHub evidence or transcript/code)
- Explicitly list gaps in evidence
- Avoid generic praise
- Be specific with examples from the conversation AND from GitHub work
- Make it skimmable in 5 minutes
- No numeric scores
- Provide a clear verdict: "interview" (strong signal to proceed), "caution" (mixed signals), or "pass" (insufficient evidence)

The report should help a hiring manager quickly understand:
1. What real work artifacts the candidate has produced (from GitHub)
2. How they performed in the interview conversation
3. Signal synthesis combining both sources
4. What's still unknown or risky
5. A clear verdict with recommendation`;

const evidencePackToolSchema = {
  type: "function",
  function: {
    name: "generate_evidence_pack",
    description: "Generate a merged Evidence Pack report combining GitHub analysis and interview insights",
    parameters: {
      type: "object",
      properties: {
        // Core assessment
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
        verdict: {
          type: "string",
          enum: ["interview", "caution", "pass"],
          description: "Overall verdict: interview (proceed), caution (mixed), pass (insufficient)"
        },
        rationale: {
          type: "string",
          description: "One paragraph explaining the verdict based on combined evidence"
        },
        candidateName: {
          type: "string",
          description: "Candidate name extracted from GitHub profile or 'Unknown'"
        },
        
        // Interview-based insights
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              signal: { type: "string", description: "The strength observed" },
              evidence: { type: "string", description: "Specific example from interview or GitHub" }
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
          description: "Key decisions and tradeoffs observed in interview"
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
          description: "Observations about execution quality in interview"
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
        },
        
        // GitHub-sourced data
        workArtifacts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Unique ID for the artifact" },
              title: { type: "string", description: "Repository or project name" },
              url: { type: "string", description: "GitHub URL" },
              whatItIs: { type: "string", description: "Brief description of what this is" },
              whyItMatters: { type: "string", description: "Why this artifact is significant" },
              signals: { 
                type: "array", 
                items: { type: "string" },
                description: "Signals this artifact demonstrates (Shipping, Ownership, Judgment, etc.)"
              }
            },
            required: ["id", "title", "whatItIs", "whyItMatters", "signals"]
          },
          description: "Notable work artifacts from GitHub"
        },
        signalSynthesis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Signal name (Ownership, Judgment, Execution, Communication)" },
              level: { 
                type: "string", 
                enum: ["high", "medium", "low"],
                description: "Signal strength level"
              },
              evidence: { type: "string", description: "Evidence supporting this signal" }
            },
            required: ["name", "level", "evidence"]
          },
          description: "Synthesized signals combining GitHub and interview evidence"
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: { 
              type: "string", 
              enum: ["interview", "caution", "pass"],
              description: "Final hiring recommendation"
            },
            reasons: {
              type: "array",
              items: { type: "string" },
              description: "2-3 key reasons for the recommendation"
            }
          },
          required: ["verdict", "reasons"],
          description: "Final recommendation for hiring manager"
        }
      },
      required: ["roleTrack", "levelEstimate", "confidence", "verdict", "rationale", "strengths", "risks_or_unknowns", "decision_log", "execution_observations", "recommended_next_step", "highlights", "signalSynthesis", "recommendation"]
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

    // Format GitHub brief if available
    const githubBrief = session.github_brief;
    let githubBriefSection = "";
    if (githubBrief) {
      githubBriefSection = `
PRE-COMPUTED GITHUB ANALYSIS (Use this data directly in the merged report):
- Candidate Name: ${githubBrief.candidateName || "Unknown"}
- GitHub Verdict: ${githubBrief.verdict}
- GitHub Confidence: ${githubBrief.confidence}
- Rationale: ${githubBrief.rationale}

Work Artifacts from GitHub:
${(githubBrief.workArtifacts || []).map((a: any, i: number) => `${i + 1}. ${a.title}
   - What it is: ${a.whatItIs}
   - Why it matters: ${a.whyItMatters}
   - Signals: ${(a.signals || []).join(", ")}
   - URL: ${a.url || "N/A"}`).join("\n")}

Signal Synthesis from GitHub:
${(githubBrief.signalSynthesis || []).map((s: any) => `- ${s.name}: ${s.level.toUpperCase()} — ${s.evidence}`).join("\n")}

Risks/Unknowns from GitHub:
${(githubBrief.risksUnknowns || []).map((r: any) => `- ${r.description}`).join("\n")}

GitHub Recommendation: ${githubBrief.recommendation?.verdict} 
Reasons: ${(githubBrief.recommendation?.reasons || []).join("; ")}
`;
    }

    // Build prompt for evidence pack generation
    const userPrompt = `Generate a MERGED Evidence Pack combining GitHub analysis and interview insights.

SESSION INFO:
- Role Track: ${session.role_track}
- Target Level: ${session.level}
- Duration: ${session.duration} minutes
- GitHub URL: ${session.github_url}

${githubBriefSection || (session.raw_work_evidence ? `RAW GITHUB EVIDENCE:
${session.raw_work_evidence.slice(0, 3000)}

` : "NO GITHUB EVIDENCE AVAILABLE - Note this as a gap in risks_or_unknowns.\n\n")}
SESSION TRANSCRIPT (Interview conversation):
${transcript || "(No transcript available - rely more on GitHub evidence)"}

OBSERVED SIGNAL TAGS FROM INTERVIEW: ${allSignalTags.length > 0 ? allSignalTags.join(", ") : "None recorded"}

INSTRUCTIONS:
1. IMPORTANT: If GitHub analysis is provided above, USE those workArtifacts and signalSynthesis directly in your output
2. Merge the GitHub signals with interview observations to create updated signalSynthesis
3. If the interview confirms or contradicts GitHub signals, note this in the evidence field
4. Provide a final verdict considering BOTH sources: "interview" if strong signals, "caution" if mixed, "pass" if insufficient
5. The rationale should explain how GitHub work + interview performance combined to reach the verdict
6. Keep the candidate name from GitHub analysis

Generate the merged Evidence Pack now.`;

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

    let summaryJson = JSON.parse(toolCall.function.arguments);
    console.log("Evidence pack generated, confidence:", summaryJson.confidence);

    // Merge with GitHub brief data if available (ensure we don't lose pre-computed data)
    if (githubBrief) {
      // Use GitHub candidate name if not set
      if (!summaryJson.candidateName || summaryJson.candidateName === "Unknown") {
        summaryJson.candidateName = githubBrief.candidateName || "Unknown";
      }
      
      // If workArtifacts are empty or missing, use GitHub artifacts
      if (!summaryJson.workArtifacts || summaryJson.workArtifacts.length === 0) {
        summaryJson.workArtifacts = githubBrief.workArtifacts || [];
      }
      
      // Ensure signalSynthesis has all signals from GitHub if missing
      if (!summaryJson.signalSynthesis || summaryJson.signalSynthesis.length === 0) {
        summaryJson.signalSynthesis = githubBrief.signalSynthesis || [];
      }
      
      // Add validation plan from GitHub brief if not present
      if (githubBrief.validationPlan) {
        summaryJson.validationPlan = githubBrief.validationPlan;
      }
    }

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
