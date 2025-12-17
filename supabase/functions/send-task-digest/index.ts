import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Aura Lift Essentials <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

interface TaskDigestRequest {
  userId?: string;
  email?: string;
  userName?: string;
  scheduled?: boolean;
  currentHour?: number;
}

interface Task {
  id: string;
  title: string;
  due_date?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  status?: string;
}

interface WorkspaceMembership {
  workspace_id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendDigestForUser(
  supabase: any,
  userId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Generating task digest for user ${userId} (${email})`);

  // Get user's workspaces
  const { data: memberships, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);

  if (membershipError) {
    console.error("Error fetching memberships:", membershipError);
    throw membershipError;
  }

  const workspaceIds = memberships?.map((m: WorkspaceMembership) => m.workspace_id) || [];

  if (workspaceIds.length === 0) {
    return { success: true, message: "No workspaces found" };
  }

  // Get tasks due today, tomorrow, and overdue
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, due_date, priority, status, project_id")
    .in("workspace_id", workspaceIds)
    .not("status", "eq", "completed")
    .not("due_date", "is", null)
    .lte("due_date", dayAfterTomorrow.toISOString())
    .order("due_date", { ascending: true });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    throw tasksError;
  }

  if (!tasks || tasks.length === 0) {
    return { success: true, message: "No upcoming tasks" };
  }

  // Categorize tasks
  const overdueTasks = tasks.filter((t: Task) => t.due_date && new Date(t.due_date) < today);
  const dueToday = tasks.filter((t: Task) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return dueDate >= today && dueDate < tomorrow;
  });
  const dueTomorrow = tasks.filter((t: Task) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
  });

  console.log(`Found ${overdueTasks.length} overdue, ${dueToday.length} due today, ${dueTomorrow.length} due tomorrow`);

  // Build email HTML
  const priorityColors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  };

  const formatTaskList = (taskList: Task[], sectionTitle: string, color: string) => {
    if (taskList.length === 0) return "";
    return `
      <div style="margin-bottom: 24px;">
        <h2 style="color: ${color}; margin-bottom: 12px; font-size: 18px;">${sectionTitle} (${taskList.length})</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${taskList
            .map(
              (t) => `
            <li style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${priorityColors[t.priority || "medium"]};">
              <strong style="color: #111827;">${t.title}</strong>
              <span style="color: #6b7280; font-size: 12px; margin-left: 8px; text-transform: capitalize;">${t.priority || "medium"} priority</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #111827; margin-bottom: 8px;">📋 Your Daily Task Digest</h1>
          <p style="color: #6b7280; margin: 0;">Here's what needs your attention today</p>
        </div>
        
        ${formatTaskList(overdueTasks, "⚠️ Overdue Tasks", "#ef4444")}
        ${formatTaskList(dueToday, "📅 Due Today", "#f59e0b")}
        ${formatTaskList(dueTomorrow, "🔜 Due Tomorrow", "#3b82f6")}
        
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Stay productive with <strong>Aura Lift Essentials</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(
    [email],
    `📋 Daily Digest: ${overdueTasks.length > 0 ? `${overdueTasks.length} overdue, ` : ""}${dueToday.length} due today`,
    emailHtml
  );

  return { success: true, message: "Email sent" };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: TaskDigestRequest = await req.json();

    // Scheduled cron job call - process all users with matching digest hour in their timezone
    if (body.scheduled) {
      const now = new Date();
      console.log(`Processing scheduled digests at UTC: ${now.toISOString()}`);

      // Get all users with digest enabled
      const { data: preferences, error: prefError } = await supabase
        .from("email_preferences")
        .select("user_id, digest_hour, timezone")
        .eq("digest_enabled", true);

      if (prefError) {
        console.error("Error fetching preferences:", prefError);
        throw prefError;
      }

      console.log(`Found ${preferences?.length || 0} users with digest enabled`);

      let sentCount = 0;
      for (const pref of preferences || []) {
        try {
          // Calculate current hour in user's timezone
          const userTimezone = pref.timezone || 'UTC';
          const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
          const userCurrentHour = userLocalTime.getHours();
          
          console.log(`User ${pref.user_id}: timezone=${userTimezone}, localHour=${userCurrentHour}, digestHour=${pref.digest_hour}`);
          
          if (pref.digest_hour === userCurrentHour) {
            // Get user email from auth.users
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id);
            
            if (userError || !userData?.user?.email) {
              console.log(`Could not get email for user ${pref.user_id}`);
              continue;
            }

            await sendDigestForUser(supabase, pref.user_id, userData.user.email);
            sentCount++;
            console.log(`Sent digest to user ${pref.user_id}`);
          }
        } catch (err) {
          console.error(`Failed to send digest to user ${pref.user_id}:`, err);
        }
      }

      return new Response(
        JSON.stringify({ success: true, sentCount }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Manual single-user call
    const { userId, email } = body;
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await sendDigestForUser(supabase, userId, email);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-task-digest function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
