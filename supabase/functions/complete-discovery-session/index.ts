import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANALYSIS_PROMPT = `You are an expert at analyzing professional conversations to create comprehensive talent profiles.

Given the transcript of a discovery conversation, analyze and extract:

1. **Mindset**: Their overall approach to work and challenges
2. **Work Style**: How they prefer to work (independently, collaboratively, structured, flexible)
3. **Strengths**: Key professional strengths demonstrated
4. **Experiences**: Notable experiences with context and impact
5. **Identified Skills**: Technical and soft skills mentioned or implied
6. **Communication Style**: How they communicate (direct, thoughtful, enthusiastic, etc.)
7. **Summary**: A brief professional summary

Return JSON matching this exact structure:
{
  "mindset": "Description of their mindset...",
  "workStyle": "Description of how they work...",
  "strengths": ["strength1", "strength2", ...],
  "experiences": [
    { "role": "Job title/role", "context": "Company/situation", "impact": "Key achievement or contribution" }
  ],
  "identifiedSkills": ["skill1", "skill2", ...],
  "communicationStyle": "Description of communication style...",
  "summary": "A 2-3 sentence professional summary..."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the discovery session
    const { data: session, error: sessionError } = await supabase
      .from("discovery_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Discovery session not found");
    }

    const transcript = session.transcript || [];

    // Format transcript for analysis
    const transcriptText = transcript
      .map((entry: { role: string; content: string }) => 
        `${entry.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${entry.content}`
      )
      .join("\n\n");

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: `Analyze this discovery conversation:\n\n${transcriptText}` },
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const discoveryProfile = JSON.parse(data.choices[0].message.content);

    // Update discovery session
    const { error: updateError } = await supabase
      .from("discovery_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        discovery_profile: discoveryProfile,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Error updating session:", updateError);
    }

    // Update talent profile
    const { error: profileError } = await supabase
      .from("talent_profiles")
      .update({
        discovery_completed: true,
        discovery_profile: discoveryProfile,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", session.talent_profile_id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        discoveryProfile,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in complete-discovery-session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
