import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Clock, FolderKanban, CheckSquare, TrendingUp, CalendarIcon, Download } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type DateRange = 'today' | 'week' | 'month' | 'custom' | 'all';

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const getDateRange = (range: DateRange, customStart?: Date, customEnd?: Date) => {
  const now = new Date();
  switch (range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'custom':
      return { 
        start: customStart ? startOfDay(customStart) : startOfDay(now), 
        end: customEnd ? endOfDay(customEnd) : endOfDay(now) 
      };
    case 'all':
    default:
      return null;
  }
};

const Reports = () => {
  const { currentWorkspace } = useWorkspace();
  const { entries, loading: entriesLoading } = useTimeTracking(currentWorkspace?.id || null);
  const { projects, loading: projectsLoading } = useProjects(currentWorkspace?.id || null);
  const { tasks, loading: tasksLoading } = useTasks(currentWorkspace?.id || null);

  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const loading = entriesLoading || projectsLoading || tasksLoading;

  // Filter entries by date range
  const filteredEntries = useMemo(() => {
    const range = getDateRange(dateRange, customStartDate, customEndDate);
    if (!range) return entries;
    
    return entries.filter((entry) => {
      const entryDate = new Date(entry.start_time);
      return isWithinInterval(entryDate, { start: range.start, end: range.end });
    });
  }, [entries, dateRange, customStartDate, customEndDate]);

  // Calculate time per task
  const taskTimeData = useMemo(() => {
    return tasks
      .map((task) => {
        const totalSeconds = filteredEntries
          .filter((e) => e.task_id === task.id && e.duration_seconds)
          .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
        return {
          name: task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title,
          fullName: task.title,
          seconds: totalSeconds,
          hours: Math.round((totalSeconds / 3600) * 100) / 100,
        };
      })
      .filter((t) => t.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10);
  }, [tasks, filteredEntries]);

  // Calculate time per project
  const projectTimeData = useMemo(() => {
    const data = projects
      .map((project) => {
        const projectTaskIds = tasks.filter((t) => t.project_id === project.id).map((t) => t.id);
        const totalSeconds = filteredEntries
          .filter((e) => projectTaskIds.includes(e.task_id) && e.duration_seconds)
          .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
        return {
          name: project.name.length > 15 ? project.name.slice(0, 15) + '...' : project.name,
          fullName: project.name,
          seconds: totalSeconds,
          hours: Math.round((totalSeconds / 3600) * 100) / 100,
          color: project.color,
        };
      })
      .filter((p) => p.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);

    // Unassigned project time
    const unassignedTaskIds = tasks.filter((t) => !t.project_id).map((t) => t.id);
    const unassignedSeconds = filteredEntries
      .filter((e) => unassignedTaskIds.includes(e.task_id) && e.duration_seconds)
      .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    
    if (unassignedSeconds > 0) {
      data.push({
        name: 'No Project',
        fullName: 'No Project',
        seconds: unassignedSeconds,
        hours: Math.round((unassignedSeconds / 3600) * 100) / 100,
        color: '#6b7280',
      });
    }

    return data;
  }, [projects, tasks, filteredEntries]);

  // Total stats
  const totalSeconds = filteredEntries
    .filter((e) => e.duration_seconds)
    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  const totalTasks = new Set(filteredEntries.map((e) => e.task_id)).size;
  const totalProjects = new Set(
    filteredEntries
      .map((e) => tasks.find((t) => t.id === e.task_id)?.project_id)
      .filter(Boolean)
  ).size;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload[0].payload.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {formatDuration(payload[0].payload.seconds)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getDateRangeLabel = () => {
    const range = getDateRange(dateRange, customStartDate, customEndDate);
    if (!range) return 'All Time';
    return `${format(range.start, 'MMM d, yyyy')} - ${format(range.end, 'MMM d, yyyy')}`;
  };

  const exportToCSV = () => {
    // Build CSV content
    const rows: string[][] = [];
    
    // Header
    rows.push(['Time Tracking Report']);
    rows.push(['Date Range:', getDateRangeLabel()]);
    rows.push(['Generated:', format(new Date(), 'MMM d, yyyy HH:mm')]);
    rows.push([]);
    
    // Summary
    rows.push(['Summary']);
    rows.push(['Total Time', formatDuration(totalSeconds)]);
    rows.push(['Tasks Tracked', totalTasks.toString()]);
    rows.push(['Projects', totalProjects.toString()]);
    rows.push(['Total Entries', filteredEntries.length.toString()]);
    rows.push([]);
    
    // Time by Task
    rows.push(['Time by Task']);
    rows.push(['Task', 'Duration', 'Hours']);
    taskTimeData.forEach((t) => {
      rows.push([t.fullName, formatDuration(t.seconds), t.hours.toFixed(2)]);
    });
    rows.push([]);
    
    // Time by Project
    rows.push(['Time by Project']);
    rows.push(['Project', 'Duration', 'Hours']);
    projectTimeData.forEach((p) => {
      rows.push([p.fullName, formatDuration(p.seconds), p.hours.toFixed(2)]);
    });
    rows.push([]);
    
    // Detailed entries
    rows.push(['Detailed Time Entries']);
    rows.push(['Task', 'Start Time', 'End Time', 'Duration']);
    filteredEntries.forEach((entry) => {
      const task = tasks.find((t) => t.id === entry.task_id);
      rows.push([
        task?.title || 'Unknown',
        format(new Date(entry.start_time), 'MMM d, yyyy HH:mm'),
        entry.end_time ? format(new Date(entry.end_time), 'MMM d, yyyy HH:mm') : 'In Progress',
        entry.duration_seconds ? formatDuration(entry.duration_seconds) : '-',
      ]);
    });

    // Convert to CSV string
    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `time-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: 'Export Complete',
      description: 'Your time tracking report has been downloaded.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Time Reports</h1>
            <p className="text-muted-foreground mt-1">Track your productivity and time allocation</p>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-muted/50 p-1">
              {(['all', 'today', 'week', 'month'] as DateRange[]).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className="text-xs"
                >
                  {range === 'all' ? 'All' : range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                </Button>
              ))}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateRange === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange === 'custom' && customStartDate && customEndDate
                    ? `${format(customStartDate, 'MMM d')} - ${format(customEndDate, 'MMM d')}`
                    : 'Custom'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Start Date</p>
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={(date) => {
                        setCustomStartDate(date);
                        if (date) setDateRange('custom');
                      }}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">End Date</p>
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={(date) => {
                        setCustomEndDate(date);
                        if (date) setDateRange('custom');
                      }}
                      disabled={(date) => customStartDate ? date < customStartDate : false}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredEntries.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {dateRange !== 'all' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>Showing data for: {getDateRangeLabel()}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(totalSeconds)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <CheckSquare className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Tracked</p>
                  <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <FolderKanban className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <TrendingUp className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entries</p>
                  <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">By Task</TabsTrigger>
            <TabsTrigger value="projects">By Project</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Time by Task (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : taskTimeData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No time entries yet. Start tracking time on your tasks!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={taskTimeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : projectTimeData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      No time entries yet. Start tracking time on your tasks!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={projectTimeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="hours"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {projectTimeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : projectTimeData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projectTimeData.map((project, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.color || COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium text-foreground">{project.fullName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDuration(project.seconds)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Reports;
