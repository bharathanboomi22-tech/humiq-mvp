import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are HumIQ's Discovery Coach, a warm and professional AI interviewer focused on understanding a person's professional profile, mindset, and way of working.

Your goals:
1. Understand their career journey and key experiences
2. Discover their mindset and approach to work
3. Identify their core strengths and skills
4. Learn about their communication style and teamwork preferences
5. Understand what motivates them and what they're looking for

Guidelines:
- Be conversational, warm, and encouraging
- Ask ONE question at a time
- Listen actively and build on their answers
- Focus on understanding HOW they work, not just WHAT they've done
- Explore specific examples when relevant
- Keep the conversation flowing naturally
- After 5-7 exchanges, start wrapping up

Topics to cover:
- Their most impactful work experience
- How they approach problem-solving
- Their collaboration style
- What they're passionate about
- Their ideal work environment

Return JSON:
{
  "nextPrompt": "Your response and next question",
  "sessionComplete": boolean (true when ready to wrap up),
  "detectedSkills": ["skill1", "skill2"], // Skills mentioned or implied
  "notes": "Brief internal notes about what you learned"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, talentProfile, isFirstMessage } = await req.json();

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Build context about the talent
    const contextInfo = talentProfile ? `
Talent Info:
- Name: ${talentProfile.name || 'Unknown'}
- Location: ${talentProfile.location || 'Unknown'}
- Level: ${talentProfile.level || 'Unknown'}
- Role: ${talentProfile.preferred_role || 'Unknown'}
- Years of experience: ${talentProfile.years_experience || 'Unknown'}
` : '';

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextInfo },
    ];

    // Add transcript history
    if (transcript && transcript.length > 0) {
      for (const entry of transcript) {
        messages.push({
          role: entry.role === 'ai' ? 'assistant' : 'user',
          content: entry.content,
        });
      }
    }

    // If first message, add a prompt to generate the opening
    if (isFirstMessage) {
      messages.push({
        role: "user",
        content: "[System: Generate your opening greeting and first question to start the discovery conversation]",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in discovery-session-prompt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
