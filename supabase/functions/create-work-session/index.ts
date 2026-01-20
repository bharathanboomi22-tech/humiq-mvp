import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// GitHub Analysis System Prompt (from analyze-candidate)
const ANALYSIS_SYSTEM_PROMPT = `You are HumIQ AI.

You evaluate Founding Engineers for early-stage startups.

You must act like a founder who has been burned by bad hires.

CRITICAL RULES:
- You may ONLY use the text inside RAW_WORK_EVIDENCE below.
- You must NOT infer, guess, scrape, or invent information.
- Candidate links are reference only.
- If RAW_WORK_EVIDENCE is empty or insufficient, you MUST say so clearly.
- No resumes, no buzzwords, no hype.
- No numeric scores.`;

const analysisToolSchema = {
  type: "function",
  function: {
    name: "generate_candidate_brief",
    description:
      "Generate a structured candidate brief for a founding engineer candidate based ONLY on provided Raw Work Evidence.",
    parameters: {
      type: "object",
      properties: {
        candidateName: {
          type: "string",
          description: "The candidate's name ONLY if it appears in Raw Work Evidence. Otherwise empty string.",
        },
        verdict: {
          type: "string",
          enum: ["pass", "fail"],
          description: "'pass' if strong signals to proceed, 'fail' if insufficient evidence",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level based on evidence quality.",
        },
        rationale: {
          type: "string",
          description: "One calm, specific sentence tied to evidence.",
        },
        workArtifacts: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              url: { type: "string" },
              whatItIs: { type: "string" },
              whyItMatters: { type: "string" },
              signals: {
                type: "array",
                maxItems: 2,
                items: {
                  type: "string",
                  enum: ["Shipping", "Ownership", "Judgment", "Product Sense", "Communication"],
                },
              },
            },
            required: ["id", "title", "whatItIs", "whyItMatters", "signals"],
          },
        },
        signalSynthesis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", enum: ["Ownership", "Judgment", "Execution", "Communication"] },
              level: { type: "string", enum: ["high", "medium", "low"] },
              evidence: { type: "string" },
            },
            required: ["name", "level", "evidence"],
          },
        },
        risksUnknowns: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
            },
            required: ["id", "description"],
          },
        },
        validationPlan: {
          type: "object",
          properties: {
            riskToValidate: { type: "string" },
            question: { type: "string" },
            strongAnswer: { type: "string" },
          },
          required: ["riskToValidate", "question", "strongAnswer"],
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["pass", "fail"] },
            reasons: {
              type: "array",
              maxItems: 2,
              items: { type: "string" },
            },
          },
          required: ["verdict", "reasons"],
        },
      },
      required: [
        "candidateName",
        "verdict",
        "confidence",
        "rationale",
        "workArtifacts",
        "signalSynthesis",
        "risksUnknowns",
        "validationPlan",
        "recommendation",
      ],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubUrl, roleTrack, level, duration, jobPostingId, interviewRequestId } = await req.json();

    // Validate inputs
    if (!githubUrl || !roleTrack || !level || !duration) {
      return new Response(JSON.stringify({ error: "Missing required fields: githubUrl, roleTrack, level, duration" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["backend", "frontend"].includes(roleTrack)) {
      return new Response(JSON.stringify({ error: "roleTrack must be 'backend' or 'frontend'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["junior", "mid", "senior"].includes(level)) {
      return new Response(JSON.stringify({ error: "level must be 'junior', 'mid', or 'senior'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (![5, 15, 30, 45].includes(duration)) {
      return new Response(JSON.stringify({ error: "duration must be 5, 15, 30, or 45 minutes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Creating work session:", { githubUrl, roleTrack, level, duration });

    // Fetch GitHub evidence (similar to analyzeCandidate flow)
    let rawWorkEvidence = "";
    let hasGitHubData = false;

    if (githubUrl.includes("github.com")) {
      try {
        console.log("Fetching GitHub evidence...");

        // Extract username from GitHub URL
        const githubMatch = githubUrl.match(/github\.com\/([^\/]+)\/?$/);
        if (githubMatch) {
          const username = githubMatch[1];

          // Fetch repos
          const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "HumIQ-WorkSession",
            },
          });

          if (reposResponse.ok) {
            const repos = await reposResponse.json();
            const relevantRepos = repos
              .filter((repo: any) => !repo.fork && (repo.description || repo.stargazers_count > 0))
              .slice(0, 5);

            const evidenceBlocks: string[] = [];

            for (const repo of relevantRepos) {
              try {
                const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
                  headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "HumIQ-WorkSession",
                  },
                });

                if (readmeResponse.ok) {
                  const readmeData = await readmeResponse.json();
                  const readmeContent = atob(readmeData.content.replace(/\n/g, ""));

                  const cleanedContent = readmeContent
                    .replace(/!\[.*?\]\(.*?\)/g, "")
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                    .replace(/```[\s\S]*?```/g, "[code block]")
                    .replace(/\n{3,}/g, "\n\n")
                    .trim()
                    .slice(0, 2000);

                  if (cleanedContent.length > 100) {
                    evidenceBlocks.push(
                      `SOURCE: GitHub README — ${repo.name}\n` +
                        `Repository: ${repo.full_name}\n` +
                        `Stars: ${repo.stargazers_count} | Language: ${repo.language || "Not specified"}\n` +
                        `Description: ${repo.description || "No description"}\n\n` +
                        `TEXT:\n${cleanedContent}`,
                    );
                  }
                }
              } catch (e) {
                console.log(`Could not fetch README for ${repo.full_name}`);
              }
            }

            // Add repo metadata
            for (const repo of relevantRepos) {
              if (!evidenceBlocks.some((b) => b.includes(repo.name))) {
                evidenceBlocks.push(
                  `SOURCE: GitHub Repository — ${repo.name}\n` +
                    `Language: ${repo.language || "Not specified"}\n` +
                    `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}\n` +
                    `Description: ${repo.description || "No description"}`,
                );
              }
            }

            rawWorkEvidence = evidenceBlocks.join("\n\n---\n\n");
            hasGitHubData = evidenceBlocks.length > 0;
            console.log(`Fetched ${evidenceBlocks.length} evidence blocks from GitHub`);
          }
        }
      } catch (fetchError) {
        console.warn("GitHub evidence fetch failed:", fetchError);
      }
    }

    // Run GitHub analysis to generate CandidateBrief (if we have evidence)
    let githubBrief = null;
    if (rawWorkEvidence && rawWorkEvidence.length > 100) {
      try {
        console.log("Running GitHub analysis...");
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

        if (LOVABLE_API_KEY) {
          const analysisPrompt = `TASK:
Based ONLY on RAW_WORK_EVIDENCE, generate a Work Evidence Brief that helps a founder decide whether to interview this candidate.

RAW_WORK_EVIDENCE:
<<<
${rawWorkEvidence}
>>>

Generate the candidate brief now. Be specific, cite actual repository names, and note any gaps.`;

          const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
                { role: "user", content: analysisPrompt },
              ],
              tools: [analysisToolSchema],
              tool_choice: { type: "function", function: { name: "generate_candidate_brief" } },
            }),
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];

            if (toolCall && toolCall.function.name === "generate_candidate_brief") {
              githubBrief = JSON.parse(toolCall.function.arguments);
              console.log("GitHub brief generated, verdict:", githubBrief.verdict);
            }
          } else {
            console.warn("GitHub analysis failed:", analysisResponse.status);
          }
        }
      } catch (analysisError) {
        console.warn("GitHub analysis error:", analysisError);
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch job posting data if jobPostingId is provided
    let jobContext = null;
    if (jobPostingId) {
      try {
        const { data: jobPosting, error: jobError } = await supabase
          .from("job_postings")
          .select("*")
          .eq("id", jobPostingId)
          .single();

        if (!jobError && jobPosting) {
          jobContext = {
            id: jobPosting.id,
            title: jobPosting.title,
            description: jobPosting.description,
            requirements: jobPosting.requirements,
            analyzed_data: jobPosting.analyzed_data,
            company_id: jobPosting.company_id,
            interview_request_id: interviewRequestId || null,
          };
          console.log("Job context fetched for interview:", jobPosting.title);
        } else {
          console.warn("Job posting not found:", jobPostingId);
        }
      } catch (error) {
        console.warn("Error fetching job posting:", error);
      }
    }

    // Insert work session with GitHub brief and job context
    const { data: session, error: sessionError } = await supabase
      .from("work_sessions")
      .insert({
        github_url: githubUrl,
        role_track: roleTrack,
        level: level,
        duration: duration,
        status: "active",
        raw_work_evidence: rawWorkEvidence || null,
        github_brief: githubBrief || null,
        job_context: jobContext,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(JSON.stringify({ error: "Failed to create work session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create initial stage (framing)
    const { error: stageError } = await supabase.from("work_session_stages").insert({
      session_id: session.id,
      stage_name: "framing",
      started_at: new Date().toISOString(),
    });

    if (stageError) {
      console.warn("Error creating initial stage:", stageError);
    }

    console.log("Work session created:", session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        githubUrl: githubUrl,
        hasGitHubData: hasGitHubData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in create-work-session:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
