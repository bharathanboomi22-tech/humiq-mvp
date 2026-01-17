import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HumIQ AI.

You evaluate Founding Engineers for early-stage startups (Seed–Series B).

Your job is NOT to summarize resumes, repeat claims, or be polite.

Your job is to help founders decide whether they can trust this person with outcomes, ambiguity, and ownership — before interviews.

You think like a startup founder who has been burned by bad hires.

You value:
- Real shipped work
- Ownership under ambiguity
- Judgment and tradeoffs
- Execution over polish
- Clear communication that reduces founder load

You distrust:
- Buzzwords
- Titles without evidence
- Over-engineering
- Vague claims without artifacts

You must:
- Prefer evidence over claims
- Explicitly call out unknowns
- Avoid numeric scores or rankings
- Avoid hype, fluff, or "AI language"
- If evidence is missing, say so clearly
- Absence of evidence ≠ negative — it is an explicit risk

When reviewing candidate links, follow this reasoning order:
1. Identify real work artifacts (things that exist, ship, or were used)
2. Discard vanity signals (titles, buzzwords, empty portfolios)
3. Look for end-to-end ownership loops
4. Look for decision points (tradeoffs, constraints, reasoning)
5. Identify missing signals that matter for a Founding Engineer
6. Synthesize judgment conservatively

Never invent certainty.
Never assume collaboration or leadership unless proven.`;

const analysisToolSchema = {
  type: "function",
  function: {
    name: "generate_candidate_brief",
    description: "Generate a structured candidate brief for a founding engineer candidate based on their work evidence.",
    parameters: {
      type: "object",
      properties: {
        candidateName: {
          type: "string",
          description: "The candidate's full name extracted from their profiles"
        },
        verdict: {
          type: "string",
          enum: ["interview", "caution", "pass"],
          description: "interview = Interview Now, caution = Proceed with Caution, pass = Do Not Advance"
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level in the verdict based on available evidence"
        },
        rationale: {
          type: "string",
          description: "One calm, specific sentence explaining the verdict using evidence and/or gaps"
        },
        workArtifacts: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string", description: "Short artifact title" },
              url: { type: "string", description: "Link to the artifact" },
              whatItIs: { type: "string", description: "One plain-language sentence. No jargon." },
              whyItMatters: { type: "string", description: "Tie explicitly to Shipping, Ownership, Judgment, Product Sense, or Communication" },
              signals: {
                type: "array",
                maxItems: 2,
                items: { type: "string", enum: ["Shipping", "Ownership", "Judgment", "Product Sense", "Communication"] }
              }
            },
            required: ["id", "title", "url", "whatItIs", "whyItMatters", "signals"]
          }
        },
        signalSynthesis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", enum: ["Ownership Signal", "Judgment Signal", "Execution Signal", "Communication Signal"] },
              level: { type: "string", enum: ["high", "medium", "low"] },
              evidence: { type: "string", description: "Short justification based on evidence" }
            },
            required: ["name", "level", "evidence"]
          }
        },
        risksUnknowns: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string", description: "Specific, honest risk or unknown. Do NOT soften language." }
            },
            required: ["id", "description"]
          }
        },
        validationPlan: {
          type: "object",
          properties: {
            riskToValidate: { type: "string", description: "The biggest risk to validate" },
            question: { type: "string", description: "One precise question that forces reasoning, tradeoffs, or ownership" },
            strongAnswer: { type: "string", description: "What a strong answer sounds like (one sentence)" },
            weakAnswer: { type: "string", description: "What a weak answer sounds like (one sentence)" }
          },
          required: ["riskToValidate", "question", "strongAnswer", "weakAnswer"]
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["interview", "caution", "pass"] },
            reasons: {
              type: "array",
              maxItems: 2,
              items: { type: "string" },
              description: "Max 2 bullets: one tied to evidence, one tied to risk profile"
            }
          },
          required: ["verdict", "reasons"]
        },
        actionLayer: {
          type: "object",
          properties: {
            outreachMessage: { type: "string", description: "Draft founder outreach message grounded in the candidate's real work. Tone: respectful, direct, specific. No flattery." },
            roleFraming: { type: "string", description: "Suggested role framing" },
            first30Days: { type: "string", description: "Suggested expectations for first 30 days" }
          },
          required: ["outreachMessage", "roleFraming", "first30Days"]
        }
      },
      required: ["candidateName", "verdict", "confidence", "rationale", "workArtifacts", "signalSynthesis", "risksUnknowns", "validationPlan", "recommendation", "actionLayer"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, githubUrl, websiteUrl, founderContext } = await req.json();
    
    console.log("Analyzing candidate:", { linkedinUrl, githubUrl, websiteUrl });
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct the analysis prompt
    const userPrompt = `Analyze this Founding Engineer candidate based on their public profiles and work evidence.

CANDIDATE LINKS:
- LinkedIn: ${linkedinUrl}
- GitHub: ${githubUrl}
${websiteUrl ? `- Personal Site: ${websiteUrl}` : ""}

${founderContext ? `FOUNDER CONTEXT: ${founderContext}` : ""}

IMPORTANT INSTRUCTIONS:
1. Visit and analyze each link to understand the candidate's real work
2. Focus on shipped products, open-source contributions, technical writing, and demonstrable ownership
3. Extract the candidate's name from their profiles
4. Identify 1-3 concrete work artifacts that demonstrate capability
5. Evaluate signals: Ownership, Judgment, Execution, Communication
6. Identify specific risks and unknowns (not generic concerns)
7. Provide a validation question that targets the biggest risk
8. Generate a personalized outreach message based on their actual work

Be conservative. If evidence is weak, say so. Absence of evidence is an explicit unknown, not a negative.

Generate a complete candidate brief using the generate_candidate_brief function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        tools: [analysisToolSchema],
        tool_choice: { type: "function", function: { name: "generate_candidate_brief" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze candidate. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_candidate_brief") {
      console.error("Unexpected AI response format:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Failed to generate brief. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brief = JSON.parse(toolCall.function.arguments);
    console.log("Brief generated for:", brief.candidateName);

    return new Response(JSON.stringify({ brief }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-candidate:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
