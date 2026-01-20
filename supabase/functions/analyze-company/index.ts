import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HumIQ AI analyzing a company for talent matching.

Your task is to extract structured information about the company based on their website content and/or description.

CRITICAL RULES:
- Only use information explicitly provided
- Be concise and specific
- Focus on what matters for talent matching: culture, tech stack, values
- If information is missing, say "Unknown" rather than guessing`;

const analysisToolSchema = {
  type: "function",
  function: {
    name: "analyze_company",
    description: "Analyze a company and extract structured data for talent matching",
    parameters: {
      type: "object",
      properties: {
        sector: {
          type: "string",
          description: "The company's industry sector (e.g., 'Fintech', 'Healthcare', 'SaaS', 'E-commerce')",
        },
        size: {
          type: "string",
          description: "Estimated company size (e.g., 'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (200+)')",
        },
        culture: {
          type: "array",
          items: { type: "string" },
          description: "Key cultural traits (max 5)",
        },
        techStack: {
          type: "array",
          items: { type: "string" },
          description: "Technologies used or mentioned (max 10)",
        },
        values: {
          type: "array",
          items: { type: "string" },
          description: "Core company values (max 5)",
        },
        summary: {
          type: "string",
          description: "2-3 sentence summary of what the company does and what makes it unique",
        },
      },
      required: ["sector", "size", "culture", "techStack", "values", "summary"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, description } = await req.json();

    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ error: "Website URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the user prompt with available information
    let userPrompt = `Analyze this company for talent matching purposes.\n\nWebsite: ${websiteUrl}`;
    
    if (description) {
      userPrompt += `\n\nCompany Description provided:\n${description}`;
    } else {
      userPrompt += `\n\nNo additional description provided. Analyze based on the website URL and common knowledge about this domain.`;
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
        tool_choice: { type: "function", function: { name: "analyze_company" } },
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        website_url: websiteUrl,
        description: description || null,
        analyzed_data: analyzedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ company }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in analyze-company:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
