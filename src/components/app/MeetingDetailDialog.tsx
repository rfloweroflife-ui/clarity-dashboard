import { useState, useEffect } from 'react';
import { Meeting } from '@/hooks/useMeetings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Save,
  Sparkles,
  FileText,
  ListChecks,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAIMeetingSummary } from '@/hooks/useAIMeetingSummary';
import { format } from 'date-fns';

interface MeetingDetailDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
}

export const MeetingDetailDialog = ({
  meeting,
  open,
  onOpenChange,
  onUpdateMeeting,
}: MeetingDetailDialogProps) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { summarizeMeeting, isLoading: isSummarizing, result } = useAIMeetingSummary();

  useEffect(() => {
    if (meeting) {
      setNotes(meeting.user_notes || '');
    }
  }, [meeting]);

  if (!meeting) return null;

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onUpdateMeeting(meeting.id, { user_notes: notes });
    setIsSaving(false);
  };

  const handleGenerateSummary = async () => {
    if (!notes.trim()) return;
    await summarizeMeeting(meeting.id, notes, meeting.title);
  };

  const parsedSummary = meeting.ai_notes ? JSON.parse(meeting.ai_notes) : result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle>{meeting.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {format(new Date(meeting.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="notes" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4 space-y-4">
            {meeting.meeting_link && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(meeting.meeting_link!, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Join Meeting
              </Button>
            )}

            <Textarea
              placeholder="Take notes during your meeting..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[300px] resize-none"
            />

            <div className="flex items-center justify-between">
              <Button onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Notes
              </Button>

              <Button
                variant="secondary"
                onClick={handleGenerateSummary}
                disabled={isSummarizing || !notes.trim()}
                className="gap-2"
              >
                {isSummarizing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate AI Summary
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            {parsedSummary ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Summary</h3>
                  <p className="text-muted-foreground">{parsedSummary.summary}</p>
                </div>

                {parsedSummary.key_points?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Points</h3>
                    <ul className="space-y-1">
                      {parsedSummary.key_points.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedSummary.decisions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Decisions Made</h3>
                    <ul className="space-y-1">
                      {parsedSummary.decisions.map((decision: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-success">✓</span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedSummary.action_items?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Action Items
                    </h3>
                    <ul className="space-y-2">
                      {parsedSummary.action_items.map((item: { owner?: string; task: string }, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">
                            {item.owner || 'Unassigned'}
                          </Badge>
                          <span className="text-muted-foreground">{item.task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedSummary.follow_ups?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Follow-ups</h3>
                    <ul className="space-y-1">
                      {parsedSummary.follow_ups.map((followUp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-warning">→</span>
                          {followUp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No AI summary yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add notes and click "Generate AI Summary" to create one
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
