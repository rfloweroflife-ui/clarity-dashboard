import { Meeting } from '@/hooks/useMeetings';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Video,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const statusColors = {
  scheduled: 'bg-primary/10 text-primary',
  in_progress: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export const MeetingCard = ({ meeting, onDelete, onClick }: MeetingCardProps) => {
  return (
    <div
      className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              statusColors[meeting.status as keyof typeof statusColors] || statusColors.scheduled
            )}
          >
            {meeting.status}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meeting.id);
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-foreground text-lg">{meeting.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Created {format(new Date(meeting.created_at), 'MMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        {meeting.meeting_link && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              window.open(meeting.meeting_link!, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3" />
            Join
          </Button>
        )}

        {meeting.user_notes && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Has notes
          </div>
        )}

        {meeting.ai_summary && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" />
            AI Summary
          </div>
        )}
      </div>
    </div>
  );
};
