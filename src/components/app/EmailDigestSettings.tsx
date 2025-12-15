import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { useEmailDigest } from '@/hooks/useEmailDigest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Clock, Globe } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? '12:00 AM' : i === 12 ? '12:00 PM' : i > 12 ? `${i - 12}:00 PM` : `${i}:00 AM`,
}));

const TIMEZONES = [
  { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii' },
  { value: 'America/Anchorage', label: '(GMT-09:00) Alaska' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time' },
  { value: 'America/Denver', label: '(GMT-07:00) Mountain Time' },
  { value: 'America/Chicago', label: '(GMT-06:00) Central Time' },
  { value: 'America/New_York', label: '(GMT-05:00) Eastern Time' },
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) São Paulo' },
  { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
  { value: 'Europe/London', label: '(GMT+00:00) London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris' },
  { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin' },
  { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo' },
  { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai' },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai' },
  { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok' },
  { value: 'Asia/Shanghai', label: '(GMT+08:00) Shanghai' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo' },
  { value: 'Australia/Sydney', label: '(GMT+10:00) Sydney' },
  { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland' },
];

export function EmailDigestSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useEmailPreferences();
  const { sendDigestNow, isSending } = useEmailDigest();

  const handleToggle = (enabled: boolean) => {
    updatePreferences({ digest_enabled: enabled });
  };

  const handleHourChange = (hour: string) => {
    updatePreferences({ digest_hour: parseInt(hour) });
  };

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences({ timezone });
  };

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="digest-timezone" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </Label>
              <Select
                value={preferences?.timezone ?? detectedTimezone}
                onValueChange={handleTimezoneChange}
                disabled={isUpdating}
              >
                <SelectTrigger id="digest-timezone" className="w-[280px]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="digest-hour" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Delivery Time
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
                You'll receive your digest at {HOURS.find(h => h.value === (preferences?.digest_hour ?? 8).toString())?.label} in your selected timezone.
              </p>
            </div>
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
