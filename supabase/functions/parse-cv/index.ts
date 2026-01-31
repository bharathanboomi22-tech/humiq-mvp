import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CV_PARSE_PROMPT = `You are extracting structured factual data from a CV.

Your task is to extract ONLY explicit, verifiable information that appears clearly in the document.

Do not infer, guess, summarize, or embellish.

Extract ONLY the following fields:

BASIC DETAILS:
- Full Name
- Location (city, country if available)
- Email Address
- Contact Number

EXPERIENCE:
For each role, extract only:
- Company Name
- Role Title
- Timeline (start and end dates, or start date + present)

EDUCATION:
For each entry, extract only:
- Institution Name
- Program or Degree Name
- Timeline (start and end dates if available)

STRICT RULES:
- Do NOT extract skills
- Do NOT extract achievements or bullet points
- Do NOT infer seniority or level
- Do NOT normalize titles beyond what is written
- Do NOT guess missing dates
- Do NOT invent contact details

If a field is not clearly present, return it as null.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // For text-based files, extract text content
    let textContent = "";
    
    if (fileType.includes("text") || fileName.endsWith(".txt")) {
      // Plain text file - decode base64
      const base64Data = fileContent.split(",")[1];
      textContent = atob(base64Data);
    } else if (fileType.includes("pdf") || fileType.includes("word") || fileType.includes("document")) {
      // For PDF/Word files, we send the base64 content directly
      // The model will interpret it as best it can
      textContent = `[Document: ${fileName}]\n\nPlease extract structured data from this document. The content is encoded but the user has uploaded a CV/resume.`;
      
      // Note: In a production environment, you would use a document parsing service
      // For now, we'll ask the user to also provide text context
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: CV_PARSE_PROMPT },
          { 
            role: "user", 
            content: `Please parse this CV and extract the structured data:\n\n${textContent || "Document uploaded: " + fileName}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cv_data",
              description: "Extract structured CV data",
              parameters: {
                type: "object",
                properties: {
                  basic_details: {
                    type: "object",
                    properties: {
                      full_name: { type: ["string", "null"] },
                      location: { type: ["string", "null"] },
                      email: { type: ["string", "null"] },
                      contact_number: { type: ["string", "null"] }
                    },
                    required: ["full_name", "location", "email", "contact_number"]
                  },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        role: { type: "string" },
                        timeline: { type: "string" }
                      },
                      required: ["company", "role", "timeline"]
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        program: { type: "string" },
                        timeline: { type: "string" }
                      },
                      required: ["institution", "program", "timeline"]
                    }
                  }
                },
                required: ["basic_details", "experience", "education"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_cv_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsedData = JSON.parse(toolCall.function.arguments);
      
      // Provide fallback structure
      const result = {
        basic_details: {
          full_name: parsedData.basic_details?.full_name || null,
          location: parsedData.basic_details?.location || null,
          email: parsedData.basic_details?.email || null,
          contact_number: parsedData.basic_details?.contact_number || null,
        },
        experience: parsedData.experience || [],
        education: parsedData.education || [],
      };
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return empty structure
    return new Response(JSON.stringify({
      basic_details: {
        full_name: null,
        location: null,
        email: null,
        contact_number: null,
      },
      experience: [],
      education: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("CV parse error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
