import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const AI_MODEL_URL = Deno.env.get("AI_MODEL_URL");
    const AI_MODEL_KEY = Deno.env.get("AI_MODEL_KEY");

    if (!AI_MODEL_URL) {
      return new Response(
        JSON.stringify({ error: "AI_MODEL_URL is not configured. Please add your model's API endpoint." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the payload to send to your external model
    // Adjust this structure to match your model's expected input format
    const lastMessage = messages[messages.length - 1];
    const payload = {
      messages: messages,
      // If your model expects a single "prompt" field instead, use:
      // prompt: lastMessage.content,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth header if key is configured
    if (AI_MODEL_KEY) {
      headers["Authorization"] = `Bearer ${AI_MODEL_KEY}`;
    }

    const response = await fetch(AI_MODEL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI model error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Model returned error (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Adjust this based on your model's response format
    // Common patterns:
    //   data.response
    //   data.choices[0].message.content
    //   data.output
    //   data.generated_text
    const reply =
      data.response ||
      data.output ||
      data.generated_text ||
      data.choices?.[0]?.message?.content ||
      data.result ||
      JSON.stringify(data);

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-pc-builder error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
