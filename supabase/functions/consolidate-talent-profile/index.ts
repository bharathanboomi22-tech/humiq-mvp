import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HumIQ AI consolidating a talent profile from multiple technical assessments.

Your task is to create a unified view of the candidate's skills, strengths, and areas for growth.

CRITICAL RULES:
- Base your analysis ONLY on the evidence provided from completed assessments
- Identify patterns across multiple tests
- Be specific with examples
- Create a fair and accurate profile that will be used for job matching`;

const consolidationToolSchema = {
  type: "function",
  function: {
    name: "consolidate_profile",
    description: "Consolidate multiple assessment results into a unified talent profile",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "2-3 sentence summary of this candidate's technical profile",
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "Key strengths demonstrated across assessments (max 5)",
        },
        areasForGrowth: {
          type: "array",
          items: { type: "string" },
          description: "Areas that could use improvement (max 3)",
        },
        signals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Signal name: Ownership, Judgment, Execution, Communication" },
              level: { type: "string", enum: ["high", "medium", "low"] },
              evidence: { type: "string", description: "Evidence for this signal level" },
            },
            required: ["name", "level", "evidence"],
          },
          description: "Signal synthesis from all assessments",
        },
        overallLevel: {
          type: "string",
          enum: ["junior", "mid", "senior"],
          description: "Overall experience level based on demonstrated skills",
        },
        verdict: {
          type: "string",
          enum: ["pass", "fail"],
          description: "Overall verdict: 'pass' if ready for interviews, 'fail' if needs more development",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence in this assessment based on evidence quantity",
        },
        skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              level: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
              verified: { type: "boolean" },
            },
            required: ["name", "level", "verified"],
          },
          description: "List of demonstrated skills with levels (max 15)",
        },
      },
      required: ["summary", "strengths", "areasForGrowth", "signals", "overallLevel", "verdict", "confidence", "skills"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talentProfileId } = await req.json();

    if (!talentProfileId) {
      return new Response(
        JSON.stringify({ error: "talentProfileId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all linked work sessions
    const { data: links } = await supabase
      .from("talent_work_sessions")
      .select("work_session_id")
      .eq("talent_profile_id", talentProfileId);

    if (!links || links.length === 0) {
      return new Response(
        JSON.stringify({ error: "No assessments found for this profile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionIds = links.map((l) => l.work_session_id);

    // Get evidence packs for all sessions
    const { data: packs } = await supabase
      .from("evidence_packs")
      .select("summary_json, session_id")
      .in("session_id", sessionIds);

    if (!packs || packs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No completed assessments found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get work sessions for context
    const { data: sessions } = await supabase
      .from("work_sessions")
      .select("id, role_track, level, created_at")
      .in("id", sessionIds);

    // Build context for LLM
    const assessmentContext = packs.map((pack, i) => {
      const session = sessions?.find((s) => s.id === pack.session_id);
      const summary = pack.summary_json;
      return `
Assessment ${i + 1}: ${session?.role_track || 'Unknown'} (${session?.level || 'Unknown'} level)
Date: ${session?.created_at || 'Unknown'}
Verdict: ${summary?.verdict || 'Unknown'}
Confidence: ${summary?.confidence || 'Unknown'}
Strengths: ${summary?.strengths?.map((s: any) => s.signal).join(", ") || "None listed"}
Risks/Unknowns: ${summary?.risks_or_unknowns?.map((r: any) => r.signal).join(", ") || "None listed"}
Highlights: ${summary?.highlights?.join("; ") || "None"}
`;
    }).join("\n---\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const userPrompt = `Consolidate the following ${packs.length} technical assessment(s) into a unified talent profile:

${assessmentContext}

Create a comprehensive profile that:
1. Synthesizes findings across all assessments
2. Identifies consistent strengths and patterns
3. Notes any areas for growth
4. Provides an overall level estimate
5. Lists specific skills that were demonstrated with their levels
`;

    const llmResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [consolidationToolSchema],
        tool_choice: { type: "function", function: { name: "consolidate_profile" } },
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error("LLM API error:", errorText);
      throw new Error(`LLM API error: ${llmResponse.status}`);
    }

    const llmData = await llmResponse.json();
    const toolCall = llmData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No consolidation generated");
    }

    const consolidatedData = JSON.parse(toolCall.function.arguments);

    // Update the talent profile
    const { data: profile, error } = await supabase
      .from("talent_profiles")
      .update({
        consolidated_profile: {
          summary: consolidatedData.summary,
          strengths: consolidatedData.strengths,
          areasForGrowth: consolidatedData.areasForGrowth,
          signals: consolidatedData.signals,
          overallLevel: consolidatedData.overallLevel,
          verdict: consolidatedData.verdict,
          confidence: consolidatedData.confidence,
          totalTestsTaken: packs.length,
          lastTestDate: sessions?.[0]?.created_at,
        },
        skills: consolidatedData.skills,
        level: consolidatedData.overallLevel,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", talentProfileId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ profile }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in consolidate-talent-profile:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
