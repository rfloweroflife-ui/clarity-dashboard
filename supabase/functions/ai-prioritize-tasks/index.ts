import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  do_date?: string;
  status?: string;
  duration_minutes?: number;
  project_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks } = await req.json() as { tasks: Task[] };
    
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ error: "No tasks provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Prioritizing ${tasks.length} tasks`);

    const taskSummary = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      priority: t.priority || "medium",
      due_date: t.due_date,
      do_date: t.do_date,
      status: t.status,
      duration_minutes: t.duration_minutes || 30,
    }));

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
            content: `You are a productivity expert AI that helps prioritize tasks. Analyze the given tasks and return an optimal ordering based on:
1. Urgency (due dates approaching)
2. Priority level (high > medium > low)
3. Dependencies and logical sequencing
4. Time blocking efficiency (group similar duration tasks)
5. Impact and importance

Return a JSON object with:
- "prioritized_ids": array of task IDs in optimal order
- "insights": brief explanation of the prioritization logic (2-3 sentences)
- "quick_wins": array of task IDs that are quick wins (< 15 min, high impact)
- "urgent": array of task IDs that need immediate attention

Be concise and actionable.`
          },
          {
            role: "user",
            content: `Prioritize these tasks:\n${JSON.stringify(taskSummary, null, 2)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prioritize_tasks",
              description: "Return prioritized task ordering with insights",
              parameters: {
                type: "object",
                properties: {
                  prioritized_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "Task IDs in optimal priority order"
                  },
                  insights: {
                    type: "string",
                    description: "Brief explanation of prioritization logic"
                  },
                  quick_wins: {
                    type: "array",
                    items: { type: "string" },
                    description: "Task IDs that are quick wins"
                  },
                  urgent: {
                    type: "array",
                    items: { type: "string" },
                    description: "Task IDs needing immediate attention"
                  }
                },
                required: ["prioritized_ids", "insights"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "prioritize_tasks" } }
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
    console.log("Prioritization complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ai-prioritize-tasks:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
