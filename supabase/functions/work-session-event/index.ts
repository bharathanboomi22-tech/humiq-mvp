import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, eventType, content } = await req.json();

    // Validate inputs
    if (!sessionId || !eventType || content === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sessionId, eventType, content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["PROMPT", "RESPONSE", "CODE_SNAPSHOT", "SYSTEM"].includes(eventType)) {
      return new Response(
        JSON.stringify({ error: "eventType must be PROMPT, RESPONSE, CODE_SNAPSHOT, or SYSTEM" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Adding event to session:", { sessionId, eventType });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from("work_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Session is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from("work_session_events")
      .insert({
        session_id: sessionId,
        event_type: eventType,
        content: content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to create event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Event created:", event.id);

    return new Response(
      JSON.stringify({ success: true, eventId: event.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in work-session-event:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
