import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Repeat } from 'lucide-react';
import { expandRecurringEvents, parseRecurrenceRule, getRecurrenceLabel } from '@/lib/recurrence';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView = ({ events, onDateSelect, onEventClick }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Expand recurring events for the visible month range (plus buffer)
  const expandedEvents = useMemo(() => {
    const rangeStart = startOfMonth(addMonths(currentMonth, -1));
    const rangeEnd = endOfMonth(addMonths(currentMonth, 2));
    return expandRecurringEvents(events, rangeStart, rangeEnd);
  }, [events, currentMonth]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const eventsOnSelectedDate = useMemo(
    () => expandedEvents.filter((event) => isSameDay(new Date(event.start_time), selectedDate)),
    [expandedEvents, selectedDate]
  );

  const getDatesWithEvents = useMemo(() => {
    const dates = new Set<string>();
    expandedEvents.forEach((event) => {
      dates.add(format(new Date(event.start_time), 'yyyy-MM-dd'));
    });
    return Array.from(dates).map((d) => new Date(d));
  }, [expandedEvents]);

  const isRecurringEvent = (event: CalendarEvent) => {
    // Check if the original event has a recurrence rule (ID contains underscore for expanded events)
    const originalId = event.id.includes('_') ? event.id.split('_')[0] : event.id;
    const originalEvent = events.find((e) => e.id === originalId);
    return originalEvent?.recurrence_rule !== null;
  };

  const getOriginalEvent = (event: CalendarEvent): CalendarEvent => {
    if (!event.id.includes('_')) return event;
    const originalId = event.id.split('_')[0];
    return events.find((e) => e.id === originalId) || event;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          className="rounded-md pointer-events-auto"
          modifiers={{
            hasEvents: getDatesWithEvents,
          }}
          modifiersStyles={{
            hasEvents: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary))',
            },
          }}
        />
      </div>

      {/* Events for selected date */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">
          Events for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>

        {eventsOnSelectedDate.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsOnSelectedDate.map((event) => {
              const originalEvent = getOriginalEvent(event);
              const recurrence = parseRecurrenceRule(originalEvent.recurrence_rule);
              const isRecurring = recurrence.type !== 'none';

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => onEventClick?.(originalEvent)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 h-full min-h-[3rem] rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || '#6366f1' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        {isRecurring && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Repeat className="h-3 w-3" />
                            {getRecurrenceLabel(recurrence)}
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.is_all_day ? (
                            'All day'
                          ) : (
                            <>
                              {format(new Date(event.start_time), 'h:mm a')} -{' '}
                              {format(new Date(event.end_time), 'h:mm a')}
                            </>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
