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

You MUST return valid JSON with this exact structure:
{
  "skills": [{ "name": "skill name", "level": "beginner" | "intermediate" | "advanced" }],
  "workStyle": "brief description of work style",
  "mindset": "brief description of mindset",
  "strengths": ["strength 1", "strength 2"],
  "summary": "2-3 sentence summary"
}

Return ONLY the JSON object, no other text.`;

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
    const messages = conversation.messages as Array<{ role: string; content: string }> || [];
    const conversationSummary = messages
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'Talent'}: ${m.content}`)
      .join('\n\n');

    const answersArray = answers as Array<{ question: string; answer: string }> || [];
    const answersSummary = answersArray
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    const consolidatedProfile = profile.consolidated_profile as Record<string, unknown> || {};
    const userPrompt = `Analyze this discovery conversation and extract the talent's profile:

Conversation:
${conversationSummary || 'No conversation data'}

Answers Summary:
${answersSummary || 'No answers data'}

Current profile data:
- Role: ${consolidatedProfile?.primaryRole || 'Not set'}
- Experience: ${consolidatedProfile?.experienceRange || 'Not set'}
- Work Context: ${JSON.stringify(profile.work_context || [])}

Extract skills, work style, mindset, and strengths. Return ONLY valid JSON.`;

    console.log('Calling Lovable AI for profile analysis...');

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).substring(0, 200));

    const messageContent = data.choices?.[0]?.message?.content;
    
    if (!messageContent) {
      console.error('No content in AI response:', JSON.stringify(data));
      // Provide fallback analysis instead of throwing
      const fallbackAnalysis = {
        skills: [],
        workStyle: 'To be determined through further discovery',
        mindset: 'To be determined through further discovery',
        strengths: [],
        summary: 'Profile analysis pending. Complete more discovery questions to generate insights.',
      };

      // Update profile with fallback
      const updatedConsolidatedProfile = {
        ...consolidatedProfile,
        workStyle: fallbackAnalysis.workStyle,
        mindset: fallbackAnalysis.mindset,
        strengths: fallbackAnalysis.strengths,
        summary: fallbackAnalysis.summary,
        discoveryCompleted: true,
      };

      const { error: updateError } = await supabase
        .from('talent_profiles')
        .update({
          consolidated_profile: updatedConsolidatedProfile,
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
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let analysis;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown)
      let jsonStr = messageContent.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();
      
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', messageContent);
      // Provide fallback analysis
      analysis = {
        skills: [],
        workStyle: 'Not determined',
        mindset: 'Not determined',
        strengths: [],
        summary: 'Profile analysis could not be completed.',
      };
    }

    // Update profile with discovery insights
    const updatedConsolidatedProfile = {
      ...consolidatedProfile,
      primaryRole: consolidatedProfile?.primaryRole || analysis.primaryRole,
      experienceRange: consolidatedProfile?.experienceRange || analysis.experienceRange,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Update profile error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
