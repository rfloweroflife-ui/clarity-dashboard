import { useState } from 'react';
import { WorkspaceMember } from '@/hooks/useWorkspaceMembers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssigneeSelectProps {
  members: WorkspaceMember[];
  assigneeId: string | null;
  onAssign: (userId: string | null) => void;
  compact?: boolean;
}

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const AssigneeSelect = ({
  members,
  assigneeId,
  onAssign,
  compact = false,
}: AssigneeSelectProps) => {
  const [open, setOpen] = useState(false);
  const assignee = members.find((m) => m.user_id === assigneeId);

  const handleSelect = (userId: string | null) => {
    onAssign(userId);
    setOpen(false);
  };

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          {assignee ? (
            <button className="group relative">
              <Avatar className="h-6 w-6 border border-border hover:border-primary transition-colors">
                <AvatarImage src={assignee.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-muted">
                  {getInitials(assignee.profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
            >
              <UserPlus className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-2 bg-popover border border-border shadow-lg z-50"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
              Assign to
            </p>
            {assigneeId && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm text-destructive"
              >
                <X className="h-4 w-4" />
                Unassign
              </button>
            )}
            {members.map((member) => (
              <button
                key={member.user_id}
                onClick={() => handleSelect(member.user_id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm',
                  assigneeId === member.user_id && 'bg-muted'
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10">
                    {getInitials(member.profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left truncate">
                  {member.profile?.full_name || 'Unknown'}
                </span>
                {assigneeId === member.user_id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-2">
                No team members found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm" className="gap-2">
          {assignee ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={assignee.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(assignee.profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate">
                {assignee.profile?.full_name || 'Unknown'}
              </span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Assign
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2 bg-popover border border-border shadow-lg z-50"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
            Assign to
          </p>
          {assigneeId && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm text-destructive"
            >
              <X className="h-4 w-4" />
              Unassign
            </button>
          )}
          {members.map((member) => (
            <button
              key={member.user_id}
              onClick={() => handleSelect(member.user_id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm',
                assigneeId === member.user_id && 'bg-muted'
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {getInitials(member.profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left truncate">
                {member.profile?.full_name || 'Unknown'}
              </span>
              {assigneeId === member.user_id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
