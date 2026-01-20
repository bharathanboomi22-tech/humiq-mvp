import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AVAILABLE_TESTS = [
  {
    id: "backend",
    name: "Backend Engineering",
    description: "APIs, databases, system design, scalability",
    keywords: ["backend", "api", "database", "server", "infrastructure", "scalability", "system design", "devops", "deployment", "security", "authentication"],
  },
  {
    id: "frontend",
    name: "Frontend Engineering", 
    description: "UI/UX, React, performance, accessibility",
    keywords: ["frontend", "ui", "ux", "react", "css", "javascript", "typescript", "web", "responsive", "accessibility", "performance", "design"],
  },
  {
    id: "fullstack",
    name: "Full-Stack Engineering",
    description: "End-to-end development, architecture decisions",
    keywords: ["fullstack", "full-stack", "architecture", "end-to-end", "integration", "deployment", "testing", "ci/cd"],
  },
];

const SYSTEM_PROMPT = `You are an AI assistant helping to match technical skill weaknesses to appropriate assessment tests.

Given a list of areas for growth/weaknesses from a developer's profile, suggest which technical assessments would help them improve.

Available tests:
- backend: APIs, databases, system design, scalability, server-side development
- frontend: UI/UX, React, CSS, JavaScript, web performance, accessibility  
- fullstack: End-to-end development, architecture decisions, integration

Rules:
- Only suggest tests that directly address the weaknesses mentioned
- Provide a clear, concise reason for each suggestion
- Maximum 2 test suggestions
- If no tests clearly match the weaknesses, return an empty array
- Reasons should be professional and encouraging`;

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
      // Fallback to keyword matching if no API key
      const suggestedTests = keywordMatch(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Based on these areas for growth/weaknesses from a developer's profile:

${areasForGrowth.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Suggest which technical assessments would help address these weaknesses.

Return a JSON object with this exact structure:
{
  "suggestedTests": [
    {
      "testId": "backend" | "frontend" | "fullstack",
      "testName": "Backend Engineering" | "Frontend Engineering" | "Full-Stack Engineering",
      "reason": "A brief, professional explanation of why this test would help"
    }
  ]
}

Only include tests that are clearly relevant. Maximum 2 suggestions. Return empty array if no tests match well.`;

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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      // Fallback to keyword matching
      const suggestedTests = keywordMatch(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      const suggestedTests = keywordMatch(areasForGrowth);
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
      const suggestedTests = keywordMatch(areasForGrowth);
      return new Response(
        JSON.stringify({ suggestedTests }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize the response
    const suggestedTests = (parsed.suggestedTests || [])
      .filter((t: any) => 
        t.testId && 
        ["backend", "frontend", "fullstack"].includes(t.testId) &&
        t.reason
      )
      .slice(0, 2)
      .map((t: any) => ({
        testId: t.testId,
        testName: AVAILABLE_TESTS.find(test => test.id === t.testId)?.name || t.testName,
        reason: t.reason,
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

// Fallback keyword matching when AI is not available
function keywordMatch(areasForGrowth: string[]): Array<{ testId: string; testName: string; reason: string }> {
  const text = areasForGrowth.join(" ").toLowerCase();
  const suggestions: Array<{ testId: string; testName: string; reason: string }> = [];

  for (const test of AVAILABLE_TESTS) {
    const matchedKeywords = test.keywords.filter(kw => text.includes(kw.toLowerCase()));
    if (matchedKeywords.length > 0) {
      suggestions.push({
        testId: test.id,
        testName: test.name,
        reason: `This test covers ${matchedKeywords.slice(0, 2).join(" and ")} skills mentioned in your profile.`,
      });
    }
  }

  return suggestions.slice(0, 2);
}
