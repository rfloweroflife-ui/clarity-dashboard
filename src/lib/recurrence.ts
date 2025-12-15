import {
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from 'date-fns';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // Every X days/weeks/months
  endDate?: string; // Optional end date
  count?: number; // Optional max occurrences
}

export const parseRecurrenceRule = (rule: string | null): RecurrenceRule => {
  if (!rule) return { type: 'none', interval: 1 };
  
  try {
    return JSON.parse(rule) as RecurrenceRule;
  } catch {
    return { type: 'none', interval: 1 };
  }
};

export const stringifyRecurrenceRule = (rule: RecurrenceRule): string | null => {
  if (rule.type === 'none') return null;
  return JSON.stringify(rule);
};

export const getRecurrenceLabel = (rule: RecurrenceRule): string => {
  if (rule.type === 'none') return 'Does not repeat';
  
  const intervalText = rule.interval === 1 ? '' : `every ${rule.interval} `;
  
  switch (rule.type) {
    case 'daily':
      return rule.interval === 1 ? 'Daily' : `Every ${rule.interval} days`;
    case 'weekly':
      return rule.interval === 1 ? 'Weekly' : `Every ${rule.interval} weeks`;
    case 'monthly':
      return rule.interval === 1 ? 'Monthly' : `Every ${rule.interval} months`;
    default:
      return 'Does not repeat';
  }
};

export const expandRecurringEvents = (
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] => {
  const expandedEvents: CalendarEvent[] = [];
  const maxOccurrences = 52; // Safety limit

  for (const event of events) {
    const rule = parseRecurrenceRule(event.recurrence_rule);
    
    if (rule.type === 'none') {
      // Non-recurring event - include if in range
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      if (
        (isAfter(eventStart, rangeStart) || isAfter(eventEnd, rangeStart)) &&
        isBefore(eventStart, rangeEnd)
      ) {
        expandedEvents.push(event);
      }
      continue;
    }

    // Calculate event duration
    const originalStart = new Date(event.start_time);
    const originalEnd = new Date(event.end_time);
    const durationMinutes = differenceInMinutes(originalEnd, originalStart);

    // Generate recurring instances
    let currentStart = originalStart;
    let occurrenceCount = 0;
    const ruleEndDate = rule.endDate ? new Date(rule.endDate) : null;
    const maxCount = rule.count || maxOccurrences;

    while (occurrenceCount < maxCount) {
      // Check if we've passed the range end
      if (isAfter(currentStart, rangeEnd)) break;
      
      // Check if we've passed the rule end date
      if (ruleEndDate && isAfter(currentStart, ruleEndDate)) break;

      const currentEnd = new Date(currentStart.getTime() + durationMinutes * 60000);

      // Include if this occurrence is within the range
      if (
        (isAfter(currentStart, rangeStart) || isAfter(currentEnd, rangeStart)) &&
        isBefore(currentStart, rangeEnd)
      ) {
        expandedEvents.push({
          ...event,
          id: `${event.id}_${occurrenceCount}`, // Unique ID for this occurrence
          start_time: currentStart.toISOString(),
          end_time: currentEnd.toISOString(),
        });
      }

      // Calculate next occurrence
      switch (rule.type) {
        case 'daily':
          currentStart = addDays(currentStart, rule.interval);
          break;
        case 'weekly':
          currentStart = addWeeks(currentStart, rule.interval);
          break;
        case 'monthly':
          currentStart = addMonths(currentStart, rule.interval);
          break;
      }

      occurrenceCount++;
    }
  }

  return expandedEvents.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
};
