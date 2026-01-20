import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROFILE_UPDATE_SYSTEM_PROMPT = `You are an AI assistant analyzing a discovery conversation to extract key insights about a talent's profile.

Based on the conversation, extract:
1. Key skills/competencies mentioned or implied
2. Work style and mindset
3. Strengths and approach to work
4. Estimated skill levels (beginner/intermediate/advanced) for each skill
5. Overall profile summary (2-3 sentences)

Return structured JSON with:
- skills: array of { name: string, level: "beginner" | "intermediate" | "advanced" }
- workStyle: string (brief description)
- mindset: string (brief description)
- strengths: array of strings
- summary: string (2-3 sentences)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talentProfileId, conversationId, answers } = await req.json();

    if (!talentProfileId || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get conversation messages
    const { data: conversation } = await supabase
      .from('discovery_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current profile
    const { data: profile } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', talentProfileId)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation summary
    const conversationSummary = conversation.messages
      .map((m: any) => `${m.role === 'assistant' ? 'AI' : 'Talent'}: ${m.content}`)
      .join('\n\n');

    const answersSummary = answers
      .map((a: any) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    const userPrompt = `Analyze this discovery conversation and extract the talent's profile:

Conversation:
${conversationSummary}

Answers Summary:
${answersSummary}

Current profile data:
- Role: ${profile.consolidated_profile?.primaryRole || 'Not set'}
- Experience: ${profile.consolidated_profile?.experienceRange || 'Not set'}
- Work Context: ${JSON.stringify(profile.work_context || [])}

Extract skills, work style, mindset, and strengths. Return as JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: PROFILE_UPDATE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Update profile with discovery insights
    const updatedConsolidatedProfile = {
      ...(profile.consolidated_profile || {}),
      primaryRole: profile.consolidated_profile?.primaryRole || analysis.primaryRole,
      experienceRange: profile.consolidated_profile?.experienceRange || analysis.experienceRange,
      workStyle: analysis.workStyle,
      mindset: analysis.mindset,
      strengths: analysis.strengths,
      summary: analysis.summary,
      discoveryCompleted: true,
    };

    // Update skills
    const updatedSkills = analysis.skills || [];

    const { error: updateError } = await supabase
      .from('talent_profiles')
      .update({
        consolidated_profile: updatedConsolidatedProfile,
        skills: updatedSkills,
        discovery_completed: true,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', talentProfileId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          ...profile,
          consolidated_profile: updatedConsolidatedProfile,
          skills: updatedSkills,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
