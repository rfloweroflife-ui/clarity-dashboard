import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Video, Link as LinkIcon } from 'lucide-react';

interface CreateMeetingDialogProps {
  onCreateMeeting: (meeting: {
    title: string;
    meeting_link?: string;
  }) => Promise<unknown>;
}

export const CreateMeetingDialog = ({ onCreateMeeting }: CreateMeetingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const result = await onCreateMeeting({
      title: title.trim(),
      meeting_link: meetingLink.trim() || undefined,
    });

    if (result !== null) {
      setTitle('');
      setMeetingLink('');
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Team Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink" className="flex items-center gap-2">
              <LinkIcon className="h-3 w-3" />
              Meeting Link (optional)
            </Label>
            <Input
              id="meetingLink"
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              type="url"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
