import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CRITICAL SYSTEM PROMPT - Enforces evidence-only reasoning
const SYSTEM_PROMPT = `You are HumIQ AI.

You evaluate Founding Engineers for early-stage startups (Seed–Series B).

CRITICAL RULE (NON-NEGOTIABLE):
You may ONLY reason over verified work evidence explicitly provided in "RAW WORK EVIDENCE" section.
Candidate links are reference only — NEVER use them for reasoning or evaluation.
If Raw Work Evidence is empty or insufficient, you MUST output the insufficient evidence response.

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
- ONLY use text inside Raw Work Evidence for evaluation
- Prefer evidence over claims
- Explicitly call out unknowns
- Avoid numeric scores or rankings
- Avoid hype, fluff, or "AI language"
- If evidence is missing, say so clearly
- Absence of evidence ≠ negative — it is an explicit risk

INSUFFICIENT EVIDENCE RESPONSE:
If Raw Work Evidence is empty or contains no concrete work artifacts, output EXACTLY:
- verdict: "caution"
- confidence: "low"
- rationale: "There is not enough verified public work evidence to evaluate ownership or execution."
- workArtifacts: [] (empty array)
- signalSynthesis: [] (empty array)
- risksUnknowns: [] (empty array)
- validationPlan: Must include one reasoning-based question (no tech trivia, no invented details)
- recommendation.reasons: [] (empty array)
- actionLayer: Empty strings

NEVER:
- Guess or infer skills from links
- Invent projects, companies, or technologies
- Mention technologies or skills not explicitly in Raw Work Evidence
- Use candidate name unless it appears in Raw Work Evidence

When evidence IS provided, follow this reasoning order:
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
          enum: ["interview", "caution", "pass"],
          description: "interview = Interview Now, caution = Proceed with Caution, pass = Do Not Advance. Use 'caution' with 'low' confidence if evidence is insufficient."
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
              url: { type: "string", description: "Link to the artifact" },
              whatItIs: { type: "string", description: "One plain-language sentence. No jargon." },
              whyItMatters: { type: "string", description: "Tie explicitly to Ownership, Judgment, Execution, or Communication" },
              signals: {
                type: "array",
                maxItems: 2,
                items: { type: "string", enum: ["Ownership", "Judgment", "Execution", "Communication"] },
                description: "Choose 1-2 ONLY. Over-tagging destroys trust."
              }
            },
            required: ["id", "title", "url", "whatItIs", "whyItMatters", "signals"]
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
          description: "Empty array if evidence is insufficient."
        },
        risksUnknowns: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string", description: "Specific, honest risk or unknown. Do NOT soften language. Missing evidence = explicit unknown." }
            },
            required: ["id", "description"]
          },
          description: "Empty array if evidence is insufficient."
        },
        validationPlan: {
          type: "object",
          properties: {
            riskToValidate: { type: "string", description: "The biggest risk to validate" },
            question: { type: "string", description: "One precise question that forces reasoning. No tech trivia. No invented details." },
            strongAnswer: { type: "string", description: "What a strong answer sounds like (one sentence)" },
            weakAnswer: { type: "string", description: "What a weak answer sounds like (one sentence)" }
          },
          required: ["riskToValidate", "question", "strongAnswer"],
          description: "ALWAYS required. Even for insufficient evidence, provide a reasoning-based question."
        },
        recommendation: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["interview", "caution", "pass"] },
            reasons: {
              type: "array",
              maxItems: 2,
              items: { type: "string" },
              description: "Max 2 bullets. Empty array if evidence is insufficient."
            }
          },
          required: ["verdict", "reasons"]
        },
        actionLayer: {
          type: "object",
          properties: {
            outreachMessage: { type: "string", description: "Draft outreach grounded in Raw Work Evidence. Empty string if evidence is insufficient." },
            roleFraming: { type: "string", description: "Role framing. Empty string if evidence is insufficient." },
            first30Days: { type: "string", description: "First 30 days expectations. Empty string if evidence is insufficient." }
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
    const { linkedinUrl, githubUrl, websiteUrl, rawWorkEvidence } = await req.json();
    
    console.log("Analyzing candidate:", { linkedinUrl, githubUrl, websiteUrl });
    console.log("Raw Work Evidence provided:", !!rawWorkEvidence);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct the analysis prompt with strict separation
    const userPrompt = `Evaluate this Founding Engineer candidate.

CANDIDATE LINKS (Reference Only — DO NOT use for reasoning):
${linkedinUrl ? `- LinkedIn: ${linkedinUrl}` : "- LinkedIn: Not provided"}
${githubUrl ? `- GitHub: ${githubUrl}` : "- GitHub: Not provided"}
${websiteUrl ? `- Portfolio: ${websiteUrl}` : ""}

---

RAW WORK EVIDENCE (ONLY source of truth for evaluation):
${rawWorkEvidence || "(No evidence provided)"}

---

CRITICAL INSTRUCTION:
If "RAW WORK EVIDENCE" above is empty, contains only "(No evidence provided)", or lacks concrete work artifacts, you MUST:
1. Set verdict to "caution" with confidence "low"
2. Set rationale to "There is not enough verified public work evidence to evaluate ownership or execution."
3. Return empty arrays for workArtifacts, signalSynthesis, risksUnknowns
4. Provide a validationPlan with a reasoning-based question (no tech trivia)
5. Return empty recommendation.reasons and actionLayer fields

If evidence IS provided, extract real artifacts and reason conservatively.

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