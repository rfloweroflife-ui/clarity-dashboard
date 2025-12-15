import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { useEmailDigest } from '@/hooks/useEmailDigest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Clock } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: `${i.toString().padStart(2, '0')}:00 ${i < 12 ? 'AM' : 'PM'}`.replace(/^(\d{2}):00 (AM|PM)$/, (_, h, p) => {
    const hour = parseInt(h);
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    return `${hour > 12 ? hour - 12 : hour}:00 ${p}`;
  }),
}));

export function EmailDigestSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useEmailPreferences();
  const { sendDigestNow, isSending } = useEmailDigest();

  const handleToggle = (enabled: boolean) => {
    updatePreferences({ digest_enabled: enabled });
  };

  const handleHourChange = (hour: string) => {
    updatePreferences({ digest_hour: parseInt(hour) });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Digest
        </CardTitle>
        <CardDescription>
          Receive a daily email summary of your upcoming and overdue tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="digest-enabled">Daily Digest Emails</Label>
            <p className="text-sm text-muted-foreground">
              Get a summary of tasks due today, tomorrow, and overdue
            </p>
          </div>
          <Switch
            id="digest-enabled"
            checked={preferences?.digest_enabled ?? false}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>

        {(preferences?.digest_enabled ?? false) && (
          <div className="space-y-2">
            <Label htmlFor="digest-hour" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Delivery Time (UTC)
            </Label>
            <Select
              value={(preferences?.digest_hour ?? 8).toString()}
              onValueChange={handleHourChange}
              disabled={isUpdating}
            >
              <SelectTrigger id="digest-hour" className="w-[180px]">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Time is in UTC. Your local time may differ.
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={sendDigestNow}
            disabled={isSending}
            className="gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Test Digest Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
