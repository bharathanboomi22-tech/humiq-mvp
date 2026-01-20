import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an AI assistant that creates personalized technical assessment recommendations based on a developer's areas for growth.

Your task is to generate CUSTOM test suggestions that directly address the specific weaknesses mentioned. Do NOT limit yourself to predefined tests - create personalized assessments.

Rules:
- Generate 2-4 personalized test suggestions based on the weaknesses
- Each test should have a unique, descriptive name (e.g., "API Security Fundamentals", "React Performance Optimization", "Database Query Optimization")
- Provide a clear, encouraging reason explaining how this test would help
- Include a category for each test (e.g., "security", "performance", "architecture", "frontend", "backend", "data", "devops")
- Be specific to the actual weaknesses mentioned
- Keep test names professional and actionable
- Reasons should be 1-2 sentences, professional and encouraging`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { areasForGrowth } = await req.json();

    if (!areasForGrowth || !Array.isArray(areasForGrowth) || areasForGrowth.length === 0) {
      return new Response(
        JSON.stringify({ suggestedTests: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fallback to generic suggestions if no API key
      const suggestedTests = generateFallbackTests(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Based on these areas for growth/weaknesses from a developer's profile:

${areasForGrowth.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Generate personalized technical assessment suggestions that would help this developer improve in these specific areas.

Return a JSON object with this exact structure:
{
  "suggestedTests": [
    {
      "id": "unique-slug-id",
      "name": "Descriptive Test Name",
      "reason": "A brief, professional explanation of why this test addresses the weakness",
      "category": "category-name"
    }
  ]
}

Categories can be: "security", "performance", "architecture", "frontend", "backend", "data", "devops", "testing", "communication", "system-design"

Generate 2-4 relevant tests. Be specific and creative with test names - they should directly relate to the weaknesses mentioned.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      const suggestedTests = generateFallbackTests(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      const suggestedTests = generateFallbackTests(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      const suggestedTests = generateFallbackTests(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize the response
    const suggestedTests = (parsed.suggestedTests || [])
      .filter((t: any) => t.id && t.name && t.reason)
      .slice(0, 4)
      .map((t: any) => ({
        id: t.id || generateSlug(t.name),
        name: t.name,
        reason: t.reason,
        category: t.category || "general",
      }));

    return new Response(
      JSON.stringify({ suggestedTests }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-tests-for-weaknesses:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", suggestedTests: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generate a URL-friendly slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Fallback test generation when AI is not available
function generateFallbackTests(areasForGrowth: string[]): Array<{ id: string; name: string; reason: string; category: string }> {
  const text = areasForGrowth.join(" ").toLowerCase();
  const suggestions: Array<{ id: string; name: string; reason: string; category: string }> = [];

  // Keywords to test mapping
  const mappings = [
    {
      keywords: ["api", "rest", "endpoint", "http"],
      test: { id: "api-design", name: "API Design Patterns", reason: "Strengthen your understanding of RESTful API design and best practices.", category: "backend" }
    },
    {
      keywords: ["security", "auth", "authentication", "authorization"],
      test: { id: "security-fundamentals", name: "Security Fundamentals", reason: "Build confidence in implementing secure authentication and authorization.", category: "security" }
    },
    {
      keywords: ["database", "sql", "query", "data model"],
      test: { id: "database-optimization", name: "Database Query Optimization", reason: "Improve your skills in writing efficient database queries.", category: "data" }
    },
    {
      keywords: ["frontend", "ui", "react", "css", "javascript"],
      test: { id: "frontend-architecture", name: "Frontend Architecture", reason: "Develop stronger frontend development and component design skills.", category: "frontend" }
    },
    {
      keywords: ["performance", "optimization", "speed", "latency"],
      test: { id: "performance-optimization", name: "Performance Optimization", reason: "Learn techniques to identify and resolve performance bottlenecks.", category: "performance" }
    },
    {
      keywords: ["testing", "test", "coverage", "unit"],
      test: { id: "testing-strategies", name: "Testing Strategies", reason: "Enhance your testing practices for more reliable code.", category: "testing" }
    },
    {
      keywords: ["architecture", "design", "system", "scalab"],
      test: { id: "system-design", name: "System Design Principles", reason: "Strengthen your ability to design scalable and maintainable systems.", category: "architecture" }
    },
    {
      keywords: ["devops", "deploy", "ci", "cd", "infrastructure"],
      test: { id: "devops-practices", name: "DevOps Best Practices", reason: "Improve your deployment and infrastructure management skills.", category: "devops" }
    },
  ];

  for (const mapping of mappings) {
    if (mapping.keywords.some(kw => text.includes(kw))) {
      suggestions.push(mapping.test);
    }
  }

  // If no specific matches, add a general test
  if (suggestions.length === 0) {
    suggestions.push({
      id: "technical-assessment",
      name: "Technical Skills Assessment",
      reason: "A comprehensive assessment to identify and strengthen your technical skills.",
      category: "general"
    });
  }

  return suggestions.slice(0, 4);
}
