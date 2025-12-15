import { useState } from 'react';
import { useComments, CommentWithProfile } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Edit2, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCommentsProps {
  workspaceId: string;
  taskId: string;
}

export const TaskComments = ({ workspaceId, taskId }: TaskCommentsProps) => {
  const { user } = useAuth();
  const { comments, loading, createComment, updateComment, deleteComment } = useComments(
    workspaceId,
    taskId
  );
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await createComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleEdit = (comment: CommentWithProfile) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateComment(editingId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Comments ({comments.length})</h4>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No comments yet. Start the discussion!
        </p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {comments.map((comment) => {
            const isOwner = comment.user_id === user?.id;
            const isEditing = editingId === comment.id;
            const displayName = comment.profile?.full_name || 'Unknown User';

            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="h-7">
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7">
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group">
                      <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      {isOwner && (
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEdit(comment)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting || !newComment.trim()}
          className="flex-shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">Press ⌘+Enter to send</p>
    </div>
  );
};
