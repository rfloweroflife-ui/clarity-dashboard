import { Task } from '@/hooks/useTasks';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { useEmailDigest } from '@/hooks/useEmailDigest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Bell, BellOff, AlertTriangle, Calendar, Clock, Mail, Loader2 } from 'lucide-react';

interface TaskRemindersProps {
  tasks: Task[];
}

export const TaskReminders = ({ tasks }: TaskRemindersProps) => {
  const { 
    getTasksDueToday, 
    getTasksDueTomorrow, 
    getOverdueTasks,
    requestPermission,
    hasPermission 
  } = useTaskNotifications(tasks);
  const { sendDigestNow, isSending } = useEmailDigest();

  const overdue = getOverdueTasks();
  const dueToday = getTasksDueToday();
  const dueTomorrow = getTasksDueTomorrow();

  const hasReminders = overdue.length > 0 || dueToday.length > 0 || dueTomorrow.length > 0;

  if (!hasReminders) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Task Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Task Reminders
          </CardTitle>
          <div className="flex items-center gap-1">
            {!hasPermission && (
              <Button variant="ghost" size="sm" onClick={requestPermission} className="gap-1 text-xs">
                <BellOff className="h-3 w-3" />
                Enable
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={sendDigestNow} 
              disabled={isSending}
              className="gap-1 text-xs"
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Mail className="h-3 w-3" />
              )}
              Email Digest
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Tasks */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive uppercase">Overdue</span>
              <Badge variant="destructive" className="text-xs px-1.5 py-0">{overdue.length}</Badge>
            </div>
            <div className="space-y-1">
              {overdue.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-md bg-destructive/5 border border-destructive/20"
                >
                  <span className="text-sm font-medium truncate">{task.title}</span>
                  <span className="text-xs text-destructive shrink-0">
                    {format(new Date(task.due_date!), 'MMM d')}
                  </span>
                </div>
              ))}
              {overdue.length > 3 && (
                <p className="text-xs text-muted-foreground pl-2">+{overdue.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Due Today */}
        {dueToday.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning uppercase">Due Today</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-warning/50 text-warning">
                {dueToday.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {dueToday.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-md bg-warning/5 border border-warning/20"
                >
                  <span className="text-sm font-medium truncate">{task.title}</span>
                  <span className="text-xs text-warning shrink-0">
                    {task.due_date && format(new Date(task.due_date), 'h:mm a')}
                  </span>
                </div>
              ))}
              {dueToday.length > 3 && (
                <p className="text-xs text-muted-foreground pl-2">+{dueToday.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Due Tomorrow */}
        {dueTomorrow.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-500 uppercase">Due Tomorrow</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-500/50 text-blue-500">
                {dueTomorrow.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {dueTomorrow.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-md bg-blue-500/5 border border-blue-500/20"
                >
                  <span className="text-sm font-medium truncate">{task.title}</span>
                  <span className="text-xs text-blue-500 shrink-0">Tomorrow</span>
                </div>
              ))}
              {dueTomorrow.length > 3 && (
                <p className="text-xs text-muted-foreground pl-2">+{dueTomorrow.length - 3} more</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
