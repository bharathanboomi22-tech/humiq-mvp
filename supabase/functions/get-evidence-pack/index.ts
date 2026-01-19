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
    const { shareId, sessionId } = await req.json();

    if (!shareId && !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: shareId or sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching evidence pack:", { shareId, sessionId });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let query = supabase
      .from("evidence_packs")
      .select(`
        *,
        work_sessions (
          id,
          github_url,
          role_track,
          level,
          duration,
          status,
          started_at,
          ended_at
        )
      `);

    if (shareId) {
      query = query.eq("public_share_id", shareId);
    } else {
      query = query.eq("session_id", sessionId);
    }

    const { data: evidencePack, error } = await query.single();

    if (error || !evidencePack) {
      console.error("Evidence pack not found:", error);
      return new Response(
        JSON.stringify({ error: "Evidence pack not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Evidence pack found:", evidencePack.id);

    return new Response(
      JSON.stringify({
        id: evidencePack.id,
        sessionId: evidencePack.session_id,
        shareId: evidencePack.public_share_id,
        summaryJson: evidencePack.summary_json,
        generatedAt: evidencePack.generated_at,
        session: evidencePack.work_sessions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-evidence-pack:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
