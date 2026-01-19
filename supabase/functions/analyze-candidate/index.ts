import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CRITICAL SYSTEM PROMPT - Exact format from spec
const SYSTEM_PROMPT = `You are HumIQ AI.

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
    description: "Generate a structured candidate brief for a founding engineer candidate based ONLY on provided Raw Work Evidence. Never infer from links.",
    parameters: {
      type: "object",
      properties: {
        candidateName: {
          type: "string",
          description: "The candidate's name ONLY if it appears in Raw Work Evidence. Otherwise empty string."
        },
        verdict: {
          type: "string",
          enum: ["pass", "fail"],
          description: "'pass' if strong signals to proceed, 'fail' if insufficient evidence"
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Confidence level. Use 'low' if evidence is insufficient."
        },
        rationale: {
          type: "string",
          description: "One calm, specific sentence. If evidence is insufficient: 'There is not enough verified public work evidence to evaluate ownership or execution.'"
        },
        workArtifacts: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string", description: "Short artifact title from evidence" },
              url: { type: "string", description: "Optional link to the artifact" },
              whatItIs: { type: "string", description: "One plain-language sentence. No jargon." },
              whyItMatters: { type: "string", description: "Founder lens - why this matters for a founding engineer role" },
              signals: {
                type: "array",
                maxItems: 2,
                items: { type: "string", enum: ["Shipping", "Ownership", "Judgment", "Product Sense", "Communication"] },
                description: "Choose 1-2 ONLY. Over-tagging destroys trust."
              }
            },
            required: ["id", "title", "whatItIs", "whyItMatters", "signals"]
          },
          description: "Empty array if evidence is insufficient. Max 3 artifacts from Raw Work Evidence ONLY."
        },
        signalSynthesis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", enum: ["Ownership", "Judgment", "Execution", "Communication"] },
              level: { type: "string", enum: ["high", "medium", "low"] },
              evidence: { type: "string", description: "Short justification grounded in Raw Work Evidence only" }
            },
            required: ["name", "level", "evidence"]
          },
          description: "Empty array if evidence is insufficient. Four rows: Ownership, Judgment, Execution, Communication."
        },
        risksUnknowns: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string", description: "Specific, honest risk or unknown. Missing evidence = explicit unknown." }
            },
            required: ["id", "description"]
          },
          description: "Empty array if evidence is insufficient. Max 3 items."
        },
        validationPlan: {
          type: "object",
          properties: {
            riskToValidate: { type: "string", description: "The biggest risk (one clear sentence)" },
            question: { type: "string", description: "One interview question that forces reasoning. No tech trivia." },
            strongAnswer: { type: "string", description: "What a strong answer sounds like (one sentence)" }
          },
          required: ["riskToValidate", "question", "strongAnswer"],
          description: "ALWAYS required. Even for insufficient evidence, provide a reasoning-based question."
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["pass", "fail"] },
            reasons: {
              type: "array",
              maxItems: 2,
              items: { type: "string" },
              description: "Plain-language recommendation. Max 2 bullets. Empty array if evidence is insufficient."
            }
          },
          required: ["verdict", "reasons"]
        }
      },
      required: ["candidateName", "verdict", "confidence", "rationale", "workArtifacts", "signalSynthesis", "risksUnknowns", "validationPlan", "recommendation"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, githubUrl, websiteUrl, context, rawWorkEvidence } = await req.json();
    
    console.log("Analyzing candidate:", { linkedinUrl, githubUrl, websiteUrl });
    console.log("Context provided:", !!context);
    console.log("Raw Work Evidence provided:", !!rawWorkEvidence);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct the analysis prompt with exact format from spec
    const userPrompt = `TASK:
Based ONLY on RAW_WORK_EVIDENCE, generate a Work Evidence Brief that helps a founder decide whether to interview this candidate.

RAW_WORK_EVIDENCE:
<<<
${rawWorkEvidence || ""}
>>>

OUTPUT FORMAT (FOLLOW EXACTLY):

Verdict: <Pass | Fail>
Confidence: <High | Medium | Low>
Rationale: <1 calm sentence tied directly to evidence or explicit gaps>

1) Real Work Evidence (max 3 artifacts)
- Artifact: <Title>
  What it is: <1 sentence>
  Why it matters (founder lens): <1 sentence>
  Signals: <choose 1–2 only from Shipping, Ownership, Judgment, Product Sense, Communication>

2) What this evidence suggests
Ownership: <High/Medium/Low> — <1 short justification>
Execution: <High/Medium/Low> — <1 short justification>
Judgment: <High/Medium/Low> — <1 short justification>
Communication: <High/Medium/Low> — <1 short justification>

3) Key risks & unknowns (max 3 bullets)
- <specific risk or unknown; if missing evidence, say Unknown>

4) Fastest way to validate the biggest risk
To validate <biggest risk>, ask: <one precise interview question>
Strong answer sounds like: <1 sentence>

Generate the candidate brief now.`;

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
    console.log("Brief generated, verdict:", brief.verdict, "confidence:", brief.confidence);

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
