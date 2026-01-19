import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubUrl, roleTrack, level, duration } = await req.json();

    // Validate inputs
    if (!githubUrl || !roleTrack || !level || !duration) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: githubUrl, roleTrack, level, duration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["backend", "frontend"].includes(roleTrack)) {
      return new Response(
        JSON.stringify({ error: "roleTrack must be 'backend' or 'frontend'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["junior", "mid", "senior"].includes(level)) {
      return new Response(
        JSON.stringify({ error: "level must be 'junior', 'mid', or 'senior'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (![15, 30, 45].includes(duration)) {
      return new Response(
        JSON.stringify({ error: "duration must be 15, 30, or 45 minutes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          const reposResponse = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
            {
              headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "HumIQ-WorkSession",
              },
            }
          );

          if (reposResponse.ok) {
            const repos = await reposResponse.json();
            const relevantRepos = repos
              .filter((repo: any) => !repo.fork && (repo.description || repo.stargazers_count > 0))
              .slice(0, 5);

            const evidenceBlocks: string[] = [];

            for (const repo of relevantRepos) {
              try {
                const readmeResponse = await fetch(
                  `https://api.github.com/repos/${repo.full_name}/readme`,
                  {
                    headers: {
                      "Accept": "application/vnd.github.v3+json",
                      "User-Agent": "HumIQ-WorkSession",
                    },
                  }
                );

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
                      `TEXT:\n${cleanedContent}`
                    );
                  }
                }
              } catch (e) {
                console.log(`Could not fetch README for ${repo.full_name}`);
              }
            }

            // Add repo metadata
            for (const repo of relevantRepos) {
              if (!evidenceBlocks.some(b => b.includes(repo.name))) {
                evidenceBlocks.push(
                  `SOURCE: GitHub Repository — ${repo.name}\n` +
                  `Language: ${repo.language || "Not specified"}\n` +
                  `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}\n` +
                  `Description: ${repo.description || "No description"}`
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert work session
    const { data: session, error: sessionError } = await supabase
      .from("work_sessions")
      .insert({
        github_url: githubUrl,
        role_track: roleTrack,
        level: level,
        duration: duration,
        status: "active",
        raw_work_evidence: rawWorkEvidence || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create work session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create initial stage (framing)
    const { error: stageError } = await supabase
      .from("work_session_stages")
      .insert({
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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-work-session:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
