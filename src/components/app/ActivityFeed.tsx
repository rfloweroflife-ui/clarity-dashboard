import { Activity } from '@/hooks/useActivityFeed';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Plus, 
  FolderKanban, 
  Video, 
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
  maxHeight?: string;
}

const activityConfig: Record<Activity['type'], { icon: typeof CheckCircle2; color: string; bg: string }> = {
  task_completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  task_created: { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  task_updated: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  project_created: { icon: FolderKanban, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  meeting_created: { icon: Video, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  comment_added: { icon: MessageSquare, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
};

export const ActivityFeed = ({ activities, loading, maxHeight = '400px' }: ActivityFeedProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const isLast = index === activities.length - 1;

          return (
            <div key={activity.id} className="relative flex items-start gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-border -translate-x-1/2" />
              )}

              {/* Icon */}
              <div className={cn('relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{activity.title}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {activity.user_name && (
                    <>
                      <User className="h-3 w-3" />
                      <span>{activity.user_name}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
