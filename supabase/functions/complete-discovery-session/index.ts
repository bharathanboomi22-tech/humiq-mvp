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
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("sessionId is required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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

    // Build the full conversation for analysis
    const conversationText = transcript
      .map((m: { role: string; content: string }) => 
        `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`
      )
      .join('\n\n');

    // Analyze the conversation
    const analysisPrompt = `Analyze this discovery conversation with a tech professional and extract a structured profile.

Conversation:
${conversationText}

Based on this conversation, generate a JSON profile with the following structure:
{
  "mindset": "A 2-3 sentence description of their mindset and approach to work",
  "workStyle": "A 2-3 sentence description of how they work and collaborate",
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "experiences": [
    {"role": "Role title", "context": "Brief context of the work", "impact": "Key achievement or impact"}
  ],
  "identifiedSkills": ["skill1", "skill2", "skill3", ...],
  "communicationStyle": "A brief description of how they communicate",
  "summary": "A 2-3 sentence overall summary of this candidate"
}

Be specific and base everything on what was actually said in the conversation. Extract 3-6 experiences and 5-10 skills. Return ONLY valid JSON, no markdown.`;

    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert at analyzing conversations and extracting structured insights about candidates." },
          { role: "user", content: analysisPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI API error: ${error}`);
    }

    const aiData = await aiResponse.json();
    let profileText = aiData.choices[0]?.message?.content;

    if (!profileText) {
      throw new Error("No response from AI");
    }

    // Clean up the response
    profileText = profileText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let discoveryProfile;
    try {
      discoveryProfile = JSON.parse(profileText);
    } catch (e) {
      console.error("Failed to parse discovery profile:", profileText);
      throw new Error("Failed to parse discovery profile");
    }

    // Update the session as completed
    const { error: updateSessionError } = await supabase
      .from("discovery_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        discovery_profile: discoveryProfile,
      })
      .eq("id", sessionId);

    if (updateSessionError) {
      throw new Error(`Failed to update session: ${updateSessionError.message}`);
    }

    // Update the talent profile with discovery data
    const { error: updateProfileError } = await supabase
      .from("talent_profiles")
      .update({
        discovery_completed: true,
        discovery_profile: discoveryProfile,
        skills: discoveryProfile.identifiedSkills.map((skill: string) => ({
          name: skill,
          level: 'intermediate',
          verified: false,
        })),
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", session.talent_profile_id);

    if (updateProfileError) {
      throw new Error(`Failed to update profile: ${updateProfileError.message}`);
    }

    return new Response(
      JSON.stringify({
        discoveryProfile,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in complete-discovery-session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
