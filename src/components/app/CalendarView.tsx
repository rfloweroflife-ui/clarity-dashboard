import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView = ({ events, onDateSelect, onEventClick }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  const eventsOnSelectedDate = events.filter((event) =>
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const getDatesWithEvents = () => {
    return events.map((event) => new Date(event.start_time));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md"
          modifiers={{
            hasEvents: getDatesWithEvents(),
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
            {eventsOnSelectedDate.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 h-full min-h-[3rem] rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color || '#6366f1' }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(event.start_time), 'h:mm a')} -{' '}
                        {format(new Date(event.end_time), 'h:mm a')}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
