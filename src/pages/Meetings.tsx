import { AppLayout } from '@/components/app/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingCard } from '@/components/app/MeetingCard';
import { CreateMeetingDialog } from '@/components/app/CreateMeetingDialog';

const Meetings = () => {
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const { meetings, loading, createMeeting, deleteMeeting } = useMeetings(
    currentWorkspace?.id ?? null
  );

  const scheduledMeetings = meetings.filter((m) => m.status === 'scheduled');
  const completedMeetings = meetings.filter((m) => m.status === 'completed');
  const inProgressMeetings = meetings.filter((m) => m.status === 'in_progress');

  if (workspaceLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Schedule, track, and review your meetings with AI-powered notes
            </p>
          </div>
          <CreateMeetingDialog onCreateMeeting={createMeeting} />
        </div>

        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList>
            <TabsTrigger value="scheduled" className="gap-2">
              Scheduled
              {scheduledMeetings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 rounded-full">
                  {scheduledMeetings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              In Progress
              {inProgressMeetings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-success/20 rounded-full">
                  {inProgressMeetings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
              {completedMeetings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                  {completedMeetings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="mt-6">
            {scheduledMeetings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No scheduled meetings</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a new meeting to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={deleteMeeting}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            {inProgressMeetings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No meetings in progress</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={deleteMeeting}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedMeetings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed meetings yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={deleteMeeting}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Meetings;
