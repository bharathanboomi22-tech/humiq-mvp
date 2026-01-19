import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HumIQ AI analyzing a job posting for talent matching.

Your task is to extract structured information about the job requirements to match with candidate profiles.

CRITICAL RULES:
- Extract specific, actionable skills
- Differentiate between required and nice-to-have skills
- Be specific about the level and role type
- Focus on what can be matched with candidate evidence`;

const analysisToolSchema = {
  type: "function",
  function: {
    name: "analyze_job",
    description: "Analyze a job posting and extract structured requirements for matching",
    parameters: {
      type: "object",
      properties: {
        requiredSkills: {
          type: "array",
          items: { type: "string" },
          description: "Must-have skills for this role (max 10)",
        },
        niceToHaveSkills: {
          type: "array",
          items: { type: "string" },
          description: "Nice-to-have skills that are a bonus (max 5)",
        },
        level: {
          type: "string",
          enum: ["junior", "mid", "senior"],
          description: "Experience level required",
        },
        roleType: {
          type: "string",
          enum: ["backend", "frontend", "fullstack", "devops", "data", "mobile", "other"],
          description: "Primary type of engineering role",
        },
        techStack: {
          type: "array",
          items: { type: "string" },
          description: "Specific technologies, frameworks, and tools mentioned (max 15)",
        },
        responsibilities: {
          type: "array",
          items: { type: "string" },
          description: "Key responsibilities of the role (max 5)",
        },
        summary: {
          type: "string",
          description: "1-2 sentence summary of what this role involves",
        },
      },
      required: ["requiredSkills", "niceToHaveSkills", "level", "roleType", "techStack", "responsibilities", "summary"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, title, description, requirements } = await req.json();

    if (!companyId || !title || !description) {
      return new Response(
        JSON.stringify({ error: "companyId, title, and description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get company info for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: company } = await supabase
      .from("companies")
      .select("analyzed_data")
      .eq("id", companyId)
      .single();

    // Build the user prompt
    let userPrompt = `Analyze this job posting for talent matching.\n\nJob Title: ${title}\n\nJob Description:\n${description}`;
    
    if (requirements) {
      userPrompt += `\n\nRequirements:\n${requirements}`;
    }

    if (company?.analyzed_data) {
      userPrompt += `\n\nCompany Context:\n- Sector: ${company.analyzed_data.sector}\n- Tech Stack: ${company.analyzed_data.techStack?.join(", ") || "Unknown"}`;
    }

    // Call LLM for analysis
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
        tools: [analysisToolSchema],
        tool_choice: { type: "function", function: { name: "analyze_job" } },
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
      throw new Error("No analysis generated");
    }

    const analyzedData = JSON.parse(toolCall.function.arguments);

    // Store in database
    const { data: jobPosting, error } = await supabase
      .from("job_postings")
      .insert({
        company_id: companyId,
        title,
        description,
        requirements: requirements || null,
        analyzed_data: analyzedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ jobPosting }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in analyze-job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
