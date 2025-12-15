import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Legend,
} from 'recharts';
import { Clock, FolderKanban, CheckSquare, TrendingUp } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const Reports = () => {
  const { currentWorkspace } = useWorkspace();
  const { entries, loading: entriesLoading } = useTimeTracking(currentWorkspace?.id || null);
  const { projects, loading: projectsLoading } = useProjects(currentWorkspace?.id || null);
  const { tasks, loading: tasksLoading } = useTasks(currentWorkspace?.id || null);

  const loading = entriesLoading || projectsLoading || tasksLoading;

  // Calculate time per task
  const taskTimeData = tasks
    .map((task) => {
      const totalSeconds = entries
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

  // Calculate time per project
  const projectTimeData = projects
    .map((project) => {
      const projectTaskIds = tasks.filter((t) => t.project_id === project.id).map((t) => t.id);
      const totalSeconds = entries
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
  const unassignedSeconds = entries
    .filter((e) => unassignedTaskIds.includes(e.task_id) && e.duration_seconds)
    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  
  if (unassignedSeconds > 0) {
    projectTimeData.push({
      name: 'No Project',
      fullName: 'No Project',
      seconds: unassignedSeconds,
      hours: Math.round((unassignedSeconds / 3600) * 100) / 100,
      color: '#6b7280',
    });
  }

  // Total stats
  const totalSeconds = entries
    .filter((e) => e.duration_seconds)
    .reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  const totalTasks = new Set(entries.map((e) => e.task_id)).size;
  const totalProjects = new Set(
    entries
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Time Reports</h1>
          <p className="text-muted-foreground mt-1">Track your productivity and time allocation</p>
        </div>

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
