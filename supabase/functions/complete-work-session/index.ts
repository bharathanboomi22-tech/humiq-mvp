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
- Provide a clear verdict: "pass" (strong signals to proceed) or "fail" (insufficient evidence)

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
          description: "The role track of the session",
        },
        levelEstimate: {
          type: "string",
          enum: ["junior", "mid", "senior"],
          description: "Estimated level based on observed signals",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level in the assessment",
        },
        verdict: {
          type: "string",
          enum: ["pass", "fail"],
          description: "Overall verdict: 'pass' if strong signals to proceed, 'fail' if insufficient evidence",
        },
        rationale: {
          type: "string",
          description: "2-3 sentences MAX explaining the verdict concisely. Be direct and specific.",
        },
        candidateName: {
          type: "string",
          description: "Candidate name extracted from GitHub profile or 'Unknown'",
        },

        // Interview-based insights
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              signal: { type: "string", description: "The strength observed" },
              evidence: { type: "string", description: "Specific example from interview or GitHub" },
            },
            required: ["signal", "evidence"],
          },
          description: "Observed strengths with evidence",
        },
        risks_or_unknowns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              signal: { type: "string", description: "The risk or unknown area" },
              evidence_gap: { type: "string", description: "What evidence is missing" },
            },
            required: ["signal", "evidence_gap"],
          },
          description: "Risks and unknowns with evidence gaps",
        },
        decision_log: {
          type: "array",
          items: {
            type: "object",
            properties: {
              decision: { type: "string", description: "A decision the candidate made" },
              tradeoff: { type: "string", description: "The tradeoff they considered" },
              example: { type: "string", description: "Quote or specific example" },
            },
            required: ["decision", "tradeoff", "example"],
          },
          description: "Key decisions and tradeoffs observed in interview",
        },
        execution_observations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              observation: { type: "string", description: "What was observed" },
              example: { type: "string", description: "Specific example" },
            },
            required: ["observation", "example"],
          },
          description: "Observations about execution quality in interview",
        },
        recommended_next_step: {
          type: "string",
          description: "Recommendation: skip to onsite, 15-min follow-up, etc.",
        },
        highlights: {
          type: "array",
          items: { type: "string" },
          description: "3-5 key highlights for quick scanning",
        },
        github_summary: {
          type: "string",
          description: "Brief summary of GitHub evidence if available",
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
                description: "Signals this artifact demonstrates (Shipping, Ownership, Judgment, etc.)",
              },
            },
            required: ["id", "title", "whatItIs", "whyItMatters", "signals"],
          },
          description: "Notable work artifacts from GitHub",
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
                description: "Signal strength level",
              },
              evidence: { type: "string", description: "Evidence supporting this signal" },
            },
            required: ["name", "level", "evidence"],
          },
          description: "Synthesized signals combining GitHub and interview evidence",
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: {
              type: "string",
              enum: ["pass", "fail"],
              description: "Final hiring recommendation: 'pass' to proceed, 'fail' if insufficient",
            },
            reasons: {
              type: "array",
              items: { type: "string" },
              description: "2-3 key reasons for the recommendation",
            },
          },
          required: ["verdict", "reasons"],
          description: "Final recommendation for hiring manager",
        },
      },
      required: [
        "roleTrack",
        "levelEstimate",
        "confidence",
        "verdict",
        "rationale",
        "strengths",
        "risks_or_unknowns",
        "decision_log",
        "execution_observations",
        "recommended_next_step",
        "highlights",
        "signalSynthesis",
        "recommendation",
      ],
    },
  },
};

// Tool schema for interview recaps - ensures consistent JSON structure
const interviewRecapToolSchema = {
  type: "function",
  function: {
    name: "generate_interview_recaps",
    description: "Generate interview feedback for both the candidate and the hiring company",
    parameters: {
      type: "object",
      properties: {
        passed: {
          type: "boolean",
          description: "Whether the candidate passed the interview based on their responses",
        },
        talentRecap: {
          type: "object",
          description: "Feedback for the candidate - focused on their growth and learning",
          properties: {
            summary: {
              type: "string",
              description: "2-3 sentences summarizing their performance in an encouraging way",
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "2-3 specific strengths demonstrated during the interview",
            },
            areasToImprove: {
              type: "array",
              items: { type: "string" },
              description: "2-3 specific areas where they can improve (especially if failed)",
            },
            advice: {
              type: "string",
              description: "Actionable advice for their career development",
            },
            nextSteps: {
              type: "string",
              description: "What they should do next",
            },
          },
          required: ["summary", "strengths", "areasToImprove", "advice", "nextSteps"],
        },
        companyRecap: {
          type: "object",
          description: "Assessment for the hiring company - focused on hiring decision",
          properties: {
            summary: {
              type: "string",
              description: "Brief assessment for the hiring manager",
            },
            fitScore: {
              type: "number",
              description: "Score from 0-100 indicating job fit",
            },
            skillsAssessed: {
              type: "array",
              items: { type: "string" },
              description: "Skills evaluated with level (e.g., 'Node.js: Strong')",
            },
            redFlags: {
              type: "array",
              items: { type: "string" },
              description: "Concerns or red flags observed (empty if none)",
            },
            recommendation: {
              type: "string",
              description: "'hire', 'maybe', or 'pass' with brief reason",
            },
          },
          required: ["summary", "fitScore", "skillsAssessed", "redFlags", "recommendation"],
        },
      },
      required: ["passed", "talentRecap", "companyRecap"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing required field: sessionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      .map((e) => {
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
      .filter((e) => e.event_type === "PROMPT" && e.content.signal_tags)
      .flatMap((e) => e.content.signal_tags);

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
${(githubBrief.workArtifacts || [])
  .map(
    (a: any, i: number) => `${i + 1}. ${a.title}
   - What it is: ${a.whatItIs}
   - Why it matters: ${a.whyItMatters}
   - Signals: ${(a.signals || []).join(", ")}
   - URL: ${a.url || "N/A"}`,
  )
  .join("\n")}

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

${
  githubBriefSection ||
  (session.raw_work_evidence
    ? `RAW GITHUB EVIDENCE:
${session.raw_work_evidence.slice(0, 3000)}

`
    : "NO GITHUB EVIDENCE AVAILABLE - Note this as a gap in risks_or_unknowns.\n\n")
}
SESSION TRANSCRIPT (Interview conversation):
${transcript || "(No transcript available - rely more on GitHub evidence)"}

OBSERVED SIGNAL TAGS FROM INTERVIEW: ${allSignalTags.length > 0 ? allSignalTags.join(", ") : "None recorded"}

INSTRUCTIONS:
1. IMPORTANT: If GitHub analysis is provided above, USE those workArtifacts and signalSynthesis directly in your output
2. Merge the GitHub signals with interview observations to create updated signalSynthesis
3. If the interview confirms or contradicts GitHub signals, note this in the evidence field
4. Provide a final verdict considering BOTH sources: "pass" if strong signals to proceed, "fail" if insufficient evidence
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
          { role: "user", content: userPrompt },
        ],
        tools: [evidencePackToolSchema],
        tool_choice: { type: "function", function: { name: "generate_evidence_pack" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate evidence pack" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "generate_evidence_pack") {
      console.error("Unexpected AI response format");
      return new Response(JSON.stringify({ error: "Failed to generate evidence pack" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let summaryJson;
    try {
      summaryJson = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("Failed to parse evidence pack response:", toolCall.function.arguments);
      // Provide fallback evidence pack
      summaryJson = {
        roleTrack: session.role_track,
        levelEstimate: session.level,
        confidence: "low",
        verdict: "fail",
        rationale: "Failed to generate complete evidence pack due to parsing error.",
        strengths: [],
        risks_or_unknowns: [{ signal: "Assessment Error", evidence_gap: "Could not parse AI response" }],
        decision_log: [],
        execution_observations: [],
        recommended_next_step: "Re-attempt the session",
        highlights: ["Assessment could not be completed"],
        signalSynthesis: [],
        recommendation: { verdict: "fail", reasons: ["Technical error during assessment"] },
      };
    }
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

    // Check if this is an interview (has job_context)
    const isInterview = session.job_context && Object.keys(session.job_context).length > 0;

    if (isInterview) {
      // Generate interview-specific recaps
      console.log("This is an interview, generating talent and company recaps");

      const jobTitle = session.job_context?.title || "the position";
      const jobDescription = session.job_context?.description || "";
      const jobRequirements = session.job_context?.requirements || "";

      const interviewRecapSystemPrompt = `You are an expert career coach generating interview feedback.

CRITICAL RULES FOR TALENT RECAP (what the candidate sees):
- Be encouraging and constructive, never harsh
- Focus on SPECIFIC examples from their answers
- If they failed: explain WHY clearly but kindly, give concrete improvement tips
- If they passed: celebrate their strengths, suggest areas to grow further
- Strengths should be specific things they said/did well
- Areas to improve should be actionable and specific
- Advice should be practical and immediately applicable

CRITICAL RULES FOR COMPANY RECAP (what the hiring manager sees):
- Be objective and assessment-focused
- Provide clear hiring recommendation
- List specific skills observed with levels
- Note any concerns or red flags honestly`;

      const interviewRecapPrompt = `Generate interview feedback for a candidate who just completed an interview.

JOB DETAILS:
- Position: ${jobTitle}
- Description: ${jobDescription}
- Requirements: ${jobRequirements}

INTERVIEW TRANSCRIPT:
${transcript || "No transcript available"}

PERFORMANCE INDICATORS:
- Overall verdict: ${summaryJson.verdict}
- Confidence: ${summaryJson.confidence}
- Observed strengths: ${(summaryJson.strengths || []).map((s: any) => s.signal + ": " + s.evidence).join("; ") || "None identified"}
- Concerns/risks: ${(summaryJson.risks_or_unknowns || []).map((r: any) => r.signal + ": " + r.evidence_gap).join("; ") || "None identified"}

INSTRUCTIONS:
1. Determine if they PASSED based on:
   - Did they demonstrate the core skills needed for ${jobTitle}?
   - Were their answers clear and technically sound?
   - Would you recommend them for the next round?

2. Generate a TALENT RECAP (for the candidate):
   - summary: Start with encouragement. If passed, congratulate them. If failed, be supportive.
   - strengths: List 2-3 SPECIFIC things they did well (quote from their answers if possible)
   - areasToImprove: List 2-3 SPECIFIC areas to work on (especially important if failed)
   - advice: Give ONE practical tip they can use immediately
   - nextSteps: What should they do now?

3. Generate a COMPANY RECAP (for the hiring manager):
   - summary: Objective assessment of the candidate
   - fitScore: 0-100 based on job fit
   - skillsAssessed: List skills with levels (e.g., "Problem solving: Strong")
   - redFlags: Any concerns (empty array if none)
   - recommendation: "hire" / "maybe" / "pass" with brief reason

Generate the feedback now.`;

      const interviewRecapResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: interviewRecapSystemPrompt },
            { role: "user", content: interviewRecapPrompt },
          ],
          tools: [interviewRecapToolSchema],
          tool_choice: { type: "function", function: { name: "generate_interview_recaps" } },
        }),
      });

      if (!interviewRecapResponse.ok) {
        console.error("Failed to generate interview recaps");
        // Fallback: create basic recaps
        const passed = summaryJson.verdict === "pass";
        const talentRecap = {
          summary: passed
            ? "You demonstrated strong technical understanding and problem-solving skills during the interview."
            : "The interview revealed some areas where you can improve your technical responses.",
          strengths: (summaryJson.strengths || []).slice(0, 3).map((s: any) => s.signal),
          areasToImprove: passed ? [] : (summaryJson.risks_or_unknowns || []).slice(0, 3).map((r: any) => r.signal),
          advice: "Continue building your skills and preparing for technical discussions.",
          nextSteps: "Review the feedback and focus on the areas mentioned.",
        };

        const companyRecap = {
          summary: passed
            ? "Candidate showed good technical competence and communication skills."
            : "Candidate needs more preparation for technical interviews.",
          fitScore: passed ? 75 : 45,
          skillsAssessed: [],
          redFlags: [],
          recommendation: passed ? "maybe" : "pass",
        };

        // Find interview_request_id from job_context
        const interviewRequestId = session.job_context?.interview_request_id;

        if (interviewRequestId) {
          const { data: interviewResult, error: resultError } = await supabase
            .from("interview_results")
            .insert({
              interview_request_id: interviewRequestId,
              work_session_id: sessionId,
              passed,
              confidence: summaryJson.confidence || "medium",
              talent_recap: talentRecap,
              company_recap: companyRecap,
            })
            .select()
            .single();

          if (!resultError && interviewResult) {
            // Update interview request status
            await supabase
              .from("interview_requests")
              .update({ status: "completed" })
              .eq("id", interviewRequestId);

            // Update session status
            await supabase
              .from("work_sessions")
              .update({
                status: "completed",
                ended_at: new Date().toISOString(),
              })
              .eq("id", sessionId);

            return new Response(
              JSON.stringify({
                interviewResultId: interviewResult.id,
                isInterview: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } else {
        const recapData = await interviewRecapResponse.json();
        const toolCall = recapData.choices?.[0]?.message?.tool_calls?.[0];
        
        let recapContent;
        if (toolCall?.function?.arguments) {
          try {
            recapContent = JSON.parse(toolCall.function.arguments);
            console.log("Successfully parsed interview recap from tool call");
          } catch (parseError) {
            console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
            recapContent = null;
          }
        } else {
          console.error("No tool call found in response:", JSON.stringify(recapData.choices?.[0]?.message));
          recapContent = null;
        }

        // Use parsed content or fallback
        if (!recapContent) {
          const defaultPassed = summaryJson.verdict === "pass";
          recapContent = {
            passed: defaultPassed,
            talentRecap: {
              summary: defaultPassed
                ? "Great job on your interview! You demonstrated solid skills and communicated well."
                : "Thank you for completing the interview. While there are areas to improve, this is a valuable learning experience.",
              strengths: (summaryJson.strengths || []).slice(0, 3).map((s: any) => s.signal || "Good technical foundation"),
              areasToImprove: defaultPassed 
                ? ["Continue building on your existing skills"] 
                : (summaryJson.risks_or_unknowns || []).slice(0, 3).map((r: any) => r.signal || "Technical depth"),
              advice: defaultPassed
                ? "Keep practicing and stay curious about new technologies."
                : "Focus on the areas mentioned above and practice with mock interviews.",
              nextSteps: defaultPassed
                ? "The company will review your results and get back to you soon."
                : "Review the feedback, practice the weak areas, and try again when ready.",
            },
            companyRecap: {
              summary: defaultPassed
                ? "Candidate showed good technical competence and communication skills."
                : "Candidate needs more preparation. Potential for growth with more experience.",
              fitScore: defaultPassed ? 70 : 40,
              skillsAssessed: [],
              redFlags: [],
              recommendation: defaultPassed ? "maybe" : "pass",
            },
          };
        }

        const passed = recapContent.passed ?? (summaryJson.verdict === "pass");
        const interviewRequestId = session.job_context?.interview_request_id;

        if (interviewRequestId) {
          const { data: interviewResult, error: resultError } = await supabase
            .from("interview_results")
            .insert({
              interview_request_id: interviewRequestId,
              work_session_id: sessionId,
              passed,
              confidence: summaryJson.confidence || "medium",
              talent_recap: recapContent.talentRecap || {
                summary: "Interview completed. Thank you for your time!",
                strengths: ["Completed the interview"],
                areasToImprove: [],
                advice: "Keep learning and growing.",
                nextSteps: "Wait for company feedback.",
              },
              company_recap: recapContent.companyRecap || {
                summary: "Interview completed. Manual review recommended.",
                fitScore: 50,
                skillsAssessed: [],
                redFlags: [],
                recommendation: "maybe",
              },
            })
            .select()
            .single();

          if (!resultError && interviewResult) {
            // Update interview request status
            await supabase
              .from("interview_requests")
              .update({ status: "completed" })
              .eq("id", interviewRequestId);

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

            console.log("Interview result created:", interviewResult.id);

            return new Response(
              JSON.stringify({
                interviewResultId: interviewResult.id,
                isInterview: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      }
    }

    // Regular work session (not an interview) - create evidence pack
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
      return new Response(JSON.stringify({ error: "Failed to save evidence pack" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        isInterview: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in complete-work-session:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
