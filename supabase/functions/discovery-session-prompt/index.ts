import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, talentProfileId, userResponse } = await req.json();

    if (!sessionId || !talentProfileId) {
      throw new Error("sessionId and talentProfileId are required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get talent profile
    const { data: profile, error: profileError } = await supabase
      .from("talent_profiles")
      .select("*")
      .eq("id", talentProfileId)
      .single();

    if (profileError || !profile) {
      throw new Error("Talent profile not found");
    }

    // Get session with transcript
    const { data: session, error: sessionError } = await supabase
      .from("discovery_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Discovery session not found");
    }

    const transcript = session.transcript || [];
    const messageCount = transcript.length;

    // Determine if conversation should end (after ~5-6 exchanges)
    const shouldComplete = messageCount >= 10; // 5 AI + 5 user messages

    // Build system prompt
    const systemPrompt = `You are a friendly, professional career coach AI having a discovery conversation with a tech professional. Your goal is to understand:
1. Their mindset and approach to work
2. Their working style and preferences
3. Key experiences and achievements
4. Technical and soft skills
5. What they're looking for in their next role

Guidelines:
- Be warm, conversational, and encouraging
- Ask ONE question at a time
- Build on their previous answers
- Show genuine interest in their experiences
- Keep questions open-ended but focused
- Don't be too formal - this should feel like a friendly chat
- Aim for 5-6 exchanges total

Current profile info:
- Name: ${profile.name || "Unknown"}
- Location: ${profile.location || "Unknown"}
- Experience: ${profile.years_experience || "Unknown"} years
- Level: ${profile.level || "Unknown"}
- Preferred Role: ${profile.preferred_role || "Unknown"}
- Languages: ${(profile.languages || []).join(", ") || "Unknown"}

${transcript.length === 0 ? "This is the START of the conversation. Introduce yourself briefly and ask your first question about their work experience." : ""}
${shouldComplete ? "This is the FINAL exchange. Thank them for the conversation, give a brief positive summary of what you learned, and let them know their profile is being updated." : ""}`;

    // Build messages for API
    const messages = [
      { role: "system", content: systemPrompt },
      ...transcript.map((m: { role: string; content: string }) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    // Add user response if provided
    if (userResponse) {
      messages.push({ role: "user", content: userResponse });
    }

    // Call AI
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI API error: ${error}`);
    }

    const aiData = await aiResponse.json();
    const prompt = aiData.choices[0]?.message?.content;

    if (!prompt) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({
        prompt,
        isComplete: shouldComplete,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in discovery-session-prompt:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
