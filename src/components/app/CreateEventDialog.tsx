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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Repeat } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import {
  RecurrenceType,
  RecurrenceRule,
  stringifyRecurrenceRule,
  getRecurrenceLabel,
} from '@/lib/recurrence';

interface CreateEventDialogProps {
  onCreateEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  defaultDate?: Date;
}

const colors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#3b82f6',
];

export const CreateEventDialog = ({ onCreateEvent, defaultDate }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState(colors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Recurrence state
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    const recurrenceRule: RecurrenceRule = {
      type: recurrenceType,
      interval: recurrenceInterval,
      endDate: recurrenceEndDate || undefined,
    };

    setIsSubmitting(true);
    const result = await onCreateEvent({
      title: title.trim(),
      description: description.trim() || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      location: location.trim() || null,
      is_all_day: isAllDay,
      color,
      recurrence_rule: stringifyRecurrenceRule(recurrenceRule),
    });

    if (result) {
      resetForm();
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setIsAllDay(false);
    setColor(colors[0]);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEndDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add event details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="allDay" checked={isAllDay} onCheckedChange={setIsAllDay} />
            <Label htmlFor="allDay">All day event</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start</Label>
              <Input
                id="startTime"
                type={isAllDay ? 'date' : 'datetime-local'}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End</Label>
              <Input
                id="endTime"
                type={isAllDay ? 'date' : 'datetime-local'}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Repeat className="h-4 w-4" />
              Repeat
            </div>

            <div className="space-y-2">
              <Select
                value={recurrenceType}
                onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Does not repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrenceType !== 'none' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="interval" className="text-xs">
                      Every
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="interval"
                        type="number"
                        min={1}
                        max={30}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                        className="w-16"
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrenceType === 'daily' && 'day(s)'}
                        {recurrenceType === 'weekly' && 'week(s)'}
                        {recurrenceType === 'monthly' && 'month(s)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs">
                      Until (optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {getRecurrenceLabel({ type: recurrenceType, interval: recurrenceInterval })}
                  {recurrenceEndDate && ` until ${new Date(recurrenceEndDate).toLocaleDateString()}`}
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="Conference Room A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-6 w-6 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
