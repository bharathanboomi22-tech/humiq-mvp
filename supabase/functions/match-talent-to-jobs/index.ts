import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple matching algorithm
function calculateMatchScore(
  talentProfile: any,
  jobPosting: any
): { score: number; breakdown: any } {
  const talentSkills = talentProfile.skills || [];
  const talentLevel = talentProfile.level || 'mid';
  const consolidated = talentProfile.consolidated_profile || {};

  const jobData = jobPosting.analyzed_data || {};
  const requiredSkills = jobData.requiredSkills || [];
  const niceToHaveSkills = jobData.niceToHaveSkills || [];
  const jobLevel = jobData.level || 'mid';
  const jobTechStack = jobData.techStack || [];

  // 1. Skills Match (40% weight)
  const talentSkillNames = talentSkills.map((s: any) => s.name.toLowerCase());
  const matchedRequired = requiredSkills.filter((skill: string) =>
    talentSkillNames.some((ts: string) => 
      ts.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ts)
    )
  );
  const matchedNiceToHave = niceToHaveSkills.filter((skill: string) =>
    talentSkillNames.some((ts: string) => 
      ts.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ts)
    )
  );

  const requiredMatchRate = requiredSkills.length > 0 
    ? (matchedRequired.length / requiredSkills.length) * 100 
    : 50;
  const niceToHaveMatchRate = niceToHaveSkills.length > 0 
    ? (matchedNiceToHave.length / niceToHaveSkills.length) * 100 
    : 50;
  const skillsScore = (requiredMatchRate * 0.8) + (niceToHaveMatchRate * 0.2);

  // 2. Level Match (30% weight)
  const levelOrder = { junior: 0, mid: 1, senior: 2 };
  const talentLevelNum = levelOrder[talentLevel as keyof typeof levelOrder] ?? 1;
  const jobLevelNum = levelOrder[jobLevel as keyof typeof levelOrder] ?? 1;
  const levelDiff = Math.abs(talentLevelNum - jobLevelNum);
  
  let levelScore: number;
  if (levelDiff === 0) levelScore = 100;
  else if (levelDiff === 1) levelScore = 70;
  else levelScore = 40;

  // Bonus for being slightly over-qualified (better for hiring)
  if (talentLevelNum > jobLevelNum) {
    levelScore = Math.min(100, levelScore + 10);
  }

  // 3. Tech Stack Match (30% weight)
  const talentSignals = consolidated.signals || [];
  const talentStrengths = consolidated.strengths || [];
  const allTalentContext = [
    ...talentSkillNames,
    ...talentStrengths.map((s: string) => s.toLowerCase()),
  ].join(' ');

  const stackMatches = jobTechStack.filter((tech: string) =>
    allTalentContext.includes(tech.toLowerCase())
  );
  const stackScore = jobTechStack.length > 0 
    ? (stackMatches.length / jobTechStack.length) * 100 
    : 50;

  // Calculate overall score
  const overallScore = Math.round(
    (skillsScore * 0.4) + (levelScore * 0.3) + (stackScore * 0.3)
  );

  // Find missing skills
  const missingSkills = requiredSkills.filter((skill: string) =>
    !talentSkillNames.some((ts: string) => 
      ts.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ts)
    )
  );

  return {
    score: Math.min(100, Math.max(0, overallScore)),
    breakdown: {
      skillsMatch: Math.round(skillsScore),
      levelMatch: levelScore,
      stackMatch: Math.round(stackScore),
      overallFit: Math.round(overallScore),
      matchedSkills: [...matchedRequired, ...matchedNiceToHave],
      missingSkills: missingSkills.slice(0, 5),
      notes: levelDiff > 0 
        ? `Level ${talentLevel > jobLevel ? 'exceeds' : 'below'} requirement (${talentLevel} vs ${jobLevel})` 
        : 'Level matches requirement',
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talentProfileId, jobPostingId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let talents: any[] = [];
    let jobs: any[] = [];

    // Determine what to match
    if (talentProfileId) {
      // Match one talent to all jobs
      const { data: talent } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("id", talentProfileId)
        .single();

      if (!talent) {
        return new Response(
          JSON.stringify({ error: "Talent profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      talents = [talent];

      const { data: allJobs } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true);

      jobs = allJobs || [];
    } else if (jobPostingId) {
      // Match one job to all talents
      const { data: job } = await supabase
        .from("job_postings")
        .select("*")
        .eq("id", jobPostingId)
        .single();

      if (!job) {
        return new Response(
          JSON.stringify({ error: "Job posting not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      jobs = [job];

      const { data: allTalents } = await supabase
        .from("talent_profiles")
        .select("*")
        .not("consolidated_profile", "eq", "{}");

      talents = allTalents || [];
    } else {
      // Match all talents to all jobs
      const [talentsResult, jobsResult] = await Promise.all([
        supabase.from("talent_profiles").select("*").not("consolidated_profile", "eq", "{}"),
        supabase.from("job_postings").select("*").eq("is_active", true),
      ]);

      talents = talentsResult.data || [];
      jobs = jobsResult.data || [];
    }

    // Calculate matches
    const matches: any[] = [];

    for (const talent of talents) {
      for (const job of jobs) {
        const { score, breakdown } = calculateMatchScore(talent, job);

        // Only create match if score is at least 20
        if (score >= 20) {
          matches.push({
            talent_profile_id: talent.id,
            job_posting_id: job.id,
            match_score: score,
            score_breakdown: breakdown,
          });
        }
      }
    }

    // Upsert matches to database
    if (matches.length > 0) {
      // Delete existing matches for the profiles/jobs we're updating
      if (talentProfileId) {
        await supabase.from("matches").delete().eq("talent_profile_id", talentProfileId);
      } else if (jobPostingId) {
        await supabase.from("matches").delete().eq("job_posting_id", jobPostingId);
      }

      // Insert new matches
      const { error } = await supabase.from("matches").upsert(matches, {
        onConflict: "talent_profile_id,job_posting_id",
      });

      if (error) {
        console.error("Error upserting matches:", error);
      }
    }

    return new Response(
      JSON.stringify({
        matches: matches.sort((a, b) => b.match_score - a.match_score),
        totalCount: matches.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in match-talent-to-jobs:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
