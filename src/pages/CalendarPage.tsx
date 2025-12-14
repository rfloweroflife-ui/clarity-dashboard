import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarView } from '@/components/app/CalendarView';
import { CreateEventDialog } from '@/components/app/CreateEventDialog';

const CalendarPage = () => {
  const { currentWorkspace } = useWorkspace();
  const { events, createEvent } = useCalendarEvents(currentWorkspace?.id || null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your events</p>
          </div>
          <CreateEventDialog onCreateEvent={createEvent} />
        </div>
        <CalendarView events={events} />
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
