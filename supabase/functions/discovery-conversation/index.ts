import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCOVERY_SYSTEM_PROMPT = `You are a friendly AI assistant helping to understand a talent's profile, mindset, and skills through a short conversation.

CRITICAL RULES:
- Ask exactly 1 question at a time
- Keep questions SHORT and conversational (1-2 sentences max)
- This is a DISCOVERY conversation, not a test - be warm and supportive
- Focus on understanding: work style, mindset, approach to problems, key skills
- Maximum 2 questions total (DEMO MODE)
- Questions should build on previous answers
- Use the onboarding data to personalize questions

QUESTION TOPICS (cover 2 of these):
1. Work approach/style - How do they like to work?
2. Problem-solving mindset - How do they approach challenges?
3. Key skills/strengths - What are they best at?
4. Collaboration style - How do they work with others?

After 2 questions, mark complete: true`;

const questionToolSchema = {
  type: 'function',
  function: {
    name: 'generate_question',
    description: 'Generate the next discovery question',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The next question to ask (1-2 sentences, conversational)',
        },
        questionId: {
          type: 'string',
          description: 'Unique identifier for this question',
        },
        complete: {
          type: 'boolean',
          description: 'Whether the discovery is complete (after 2 questions)',
        },
        completionMessage: {
          type: 'string',
          description: 'Message to show when discovery is complete',
        },
      },
      required: ['question', 'questionId', 'complete'],
    },
  },
};

const validateResponseToolSchema = {
  type: 'function',
  function: {
    name: 'validate_response',
    description: 'Validate if the user response is meaningful and on-topic',
    parameters: {
      type: 'object',
      properties: {
        isValid: {
          type: 'boolean',
          description: 'Whether the response is valid (meaningful, not gibberish, somewhat on-topic)',
        },
        clarificationRequest: {
          type: 'string',
          description: 'If invalid, a friendly message asking for clarification (keep it short and encouraging)',
        },
        reason: {
          type: 'string',
          description: 'Brief reason for the validation result',
        },
      },
      required: ['isValid', 'reason'],
    },
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, onboardingData, conversationId, answer, questionIndex } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action' }),
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

    if (action === 'start') {
      // Generate intro and first question
      const onboardingSummary = `
Name: ${onboardingData.fullName || 'Not provided'}
Role: ${onboardingData.primaryRole || 'Not specified'}
Experience: ${onboardingData.experienceRange || 'Not specified'}
Work Context: ${onboardingData.workContext?.length || 0} entries
Work Links: ${onboardingData.workLinks?.length || 0} links
How I Work: ${onboardingData.howIWork || 'Not provided'}
      `.trim();

      const userPrompt = `Start a discovery conversation with this talent. 

Onboarding data:
${onboardingSummary}

Generate:
1. A warm, brief intro message (2-3 sentences)
2. The first discovery question

Keep it conversational and friendly. This is about understanding them, not testing them.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          max_tokens: 300,
          messages: [
            { role: 'system', content: DISCOVERY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          tools: [questionToolSchema],
          tool_choice: { type: 'function', function: { name: 'generate_question' } },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${error}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No tool call in response');
      }

      const result = JSON.parse(toolCall.function.arguments);

      return new Response(
        JSON.stringify({
          intro: 'Hi! I\'m here to get to know you better and understand your work style. I\'ll ask a few questions to help determine your profile and skills.',
          question: result.question,
          questionId: result.questionId,
          totalQuestions: 2,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'continue') {
      // Get conversation history
      const { data: conversation } = await supabase
        .from('discovery_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      const messages = conversation?.messages || [];
      
      // Get the last question asked
      const lastAssistantMessage = [...messages].reverse().find((m: any) => m.role === 'assistant');
      const lastQuestion = lastAssistantMessage?.content || 'previous question';

      // STEP 1: Validate the user's response
      const validationPrompt = `You are validating a user's response in a discovery conversation.

The question asked was: "${lastQuestion}"

The user's response was: "${answer}"

Determine if this response is:
1. VALID: Meaningful text that attempts to answer the question (even if brief or imperfect)
2. INVALID: Gibberish, random characters, completely off-topic, or empty/meaningless

Be LENIENT - accept responses that show any genuine attempt to communicate, even if:
- They're short
- They have typos
- They're not perfectly on-topic

Mark as INVALID only if the response is:
- Random characters/gibberish (e.g., "asdfghjkl", "zoifddklfdk")
- Completely meaningless (e.g., ".", "???", "123456")
- Clearly not an attempt to answer

If invalid, provide a SHORT, friendly clarification request (1 sentence).`;

      const validationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          max_tokens: 150,
          messages: [
            { role: 'system', content: 'You validate user responses. Be lenient and friendly.' },
            { role: 'user', content: validationPrompt },
          ],
          tools: [validateResponseToolSchema],
          tool_choice: { type: 'function', function: { name: 'validate_response' } },
        }),
      });

      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        const validationToolCall = validationData.choices[0].message.tool_calls?.[0];
        
        if (validationToolCall) {
          const validation = JSON.parse(validationToolCall.function.arguments);
          
          if (!validation.isValid) {
            // Response is invalid - ask for clarification without advancing
            return new Response(
              JSON.stringify({
                needsClarification: true,
                clarificationMessage: validation.clarificationRequest || "I didn't quite catch that. Could you try rephrasing your answer?",
                question: lastQuestion, // Re-ask the same question
                questionId: `clarify-${Date.now()}`,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // STEP 2: Response is valid - proceed with next question
      const questionCount = questionIndex + 1;

      // Check if we should complete (2 questions for demo)
      if (questionCount >= 2) {
        return new Response(
          JSON.stringify({
            complete: true,
            completionMessage: 'Thank you! I have everything I need to understand your profile. Let me update your profile with this information.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate next question based on conversation
      const conversationHistory = messages
        .slice(-4) // Last 4 messages for context
        .map((m: any) => `${m.role === 'assistant' ? 'AI' : 'Talent'}: ${m.content}`)
        .join('\n');

      const userPrompt = `Continue the discovery conversation. 

Previous conversation:
${conversationHistory}

Talent's last answer: ${answer}

Generate the next question (question ${questionCount + 1} of 2). Build on their previous answers. Keep it conversational.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          max_tokens: 300,
          messages: [
            { role: 'system', content: DISCOVERY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          tools: [questionToolSchema],
          tool_choice: { type: 'function', function: { name: 'generate_question' } },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${error}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No tool call in response');
      }

      const result = JSON.parse(toolCall.function.arguments);

      return new Response(
        JSON.stringify({
          question: result.question,
          questionId: result.questionId,
          complete: result.complete || questionCount >= 2,
          completionMessage: result.completionMessage,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Discovery conversation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
