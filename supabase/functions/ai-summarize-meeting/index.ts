import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummarizeRequest {
  meetingId: string;
  notes: string;
  title: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AI meeting summarization requested by user: ${user.id}`);

    const { meetingId, notes, title } = await req.json() as SummarizeRequest;
    
    if (!notes || notes.trim().length === 0) {
      return new Response(JSON.stringify({ error: "No notes provided to summarize" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Summarizing notes for meeting: ${title}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional meeting notes assistant. Your job is to analyze meeting notes and provide a clear, actionable summary.

Generate a summary that includes:
1. Key Discussion Points - Main topics covered
2. Decisions Made - Any decisions or agreements reached
3. Action Items - Tasks that need to be done, with owners if mentioned
4. Follow-ups - Items that need future attention

Be concise but comprehensive. Use bullet points for clarity.`
          },
          {
            role: "user",
            content: `Please summarize the following meeting notes for "${title}":\n\n${notes}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "meeting_summary",
              description: "Return structured meeting summary",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Overall summary of the meeting in 2-3 sentences"
                  },
                  key_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of key discussion points"
                  },
                  decisions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Decisions made during the meeting"
                  },
                  action_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task: { type: "string" },
                        owner: { type: "string" }
                      },
                      required: ["task"]
                    },
                    description: "Action items with optional owners"
                  },
                  follow_ups: {
                    type: "array",
                    items: { type: "string" },
                    description: "Items needing future attention"
                  }
                },
                required: ["summary", "key_points"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "meeting_summary" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Summary generated successfully");

    // Format the summary for storage
    const formattedSummary = formatSummaryForStorage(result);

    // Update the meeting with the AI summary
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: updateError } = await adminClient
      .from('meetings')
      .update({ 
        ai_summary: formattedSummary,
        ai_notes: JSON.stringify(result)
      })
      .eq('id', meetingId);

    if (updateError) {
      console.error("Error updating meeting:", updateError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      summary: result,
      formatted: formattedSummary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ai-summarize-meeting:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatSummaryForStorage(result: {
  summary: string;
  key_points?: string[];
  decisions?: string[];
  action_items?: Array<{ task: string; owner?: string }>;
  questions?: string[];
}): string {
  let formatted = `## Summary\n${result.summary}\n\n`;
  
  if (result.key_points?.length > 0) {
    formatted += `## Key Points\n${result.key_points.map((p: string) => `- ${p}`).join('\n')}\n\n`;
  }
  
  if (result.decisions?.length > 0) {
    formatted += `## Decisions\n${result.decisions.map((d: string) => `- ${d}`).join('\n')}\n\n`;
  }
  
  if (result.action_items?.length > 0) {
    formatted += `## Action Items\n${result.action_items.map((a: { task: string; owner?: string }) => 
      `- ${a.task}${a.owner ? ` (Owner: ${a.owner})` : ''}`
    ).join('\n')}\n\n`;
  }
  
  if (result.follow_ups?.length > 0) {
    formatted += `## Follow-ups\n${result.follow_ups.map((f: string) => `- ${f}`).join('\n')}`;
  }
  
  return formatted.trim();
}
