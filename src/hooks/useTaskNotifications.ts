import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';
import { differenceInMinutes, differenceInHours, isPast, isToday, isTomorrow, format } from 'date-fns';

interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderMinutes: [60, 30, 15], // 1 hour, 30 min, 15 min before
};

export const useTaskNotifications = (tasks: Task[], settings = DEFAULT_SETTINGS) => {
  const notifiedTasks = useRef<Set<string>>(new Set());
  const permissionGranted = useRef<boolean>(false);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === 'granted';
      return permission === 'granted';
    }

    return false;
  }, []);

  // Send a notification
  const sendNotification = useCallback((title: string, body: string, taskId: string) => {
    // Always show in-app toast
    toast({
      title,
      description: body,
    });

    // Also send browser notification if permitted
    if (permissionGranted.current && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: taskId,
          requireInteraction: true,
        });
      } catch (error) {
        console.log('Failed to send browser notification:', error);
      }
    }
  }, []);

  // Check tasks for upcoming deadlines
  const checkDeadlines = useCallback(() => {
    if (!settings.enabled) return;

    const now = new Date();

    tasks.forEach((task) => {
      if (!task.due_date || task.status === 'completed') return;

      const dueDate = new Date(task.due_date);
      const notificationKey = `${task.id}-${task.due_date}`;

      // Skip if already notified for this specific due date
      if (notifiedTasks.current.has(notificationKey)) return;

      const minutesUntilDue = differenceInMinutes(dueDate, now);
      const hoursUntilDue = differenceInHours(dueDate, now);

      // Check if overdue
      if (isPast(dueDate)) {
        notifiedTasks.current.add(notificationKey);
        sendNotification(
          '⚠️ Task Overdue',
          `"${task.title}" is past due!`,
          task.id
        );
        return;
      }

      // Check for reminder thresholds
      for (const reminderMinute of settings.reminderMinutes) {
        const reminderKey = `${task.id}-${reminderMinute}`;
        if (notifiedTasks.current.has(reminderKey)) continue;

        if (minutesUntilDue <= reminderMinute && minutesUntilDue > 0) {
          notifiedTasks.current.add(reminderKey);
          
          let timeText = '';
          if (minutesUntilDue < 60) {
            timeText = `${minutesUntilDue} minute${minutesUntilDue !== 1 ? 's' : ''}`;
          } else {
            const hours = Math.floor(minutesUntilDue / 60);
            timeText = `${hours} hour${hours !== 1 ? 's' : ''}`;
          }

          sendNotification(
            '⏰ Task Reminder',
            `"${task.title}" is due in ${timeText}`,
            task.id
          );
          break;
        }
      }
    });
  }, [tasks, settings, sendNotification]);

  // Get tasks due today
  const getTasksDueToday = useCallback(() => {
    return tasks.filter((task) => {
      if (!task.due_date || task.status === 'completed') return false;
      return isToday(new Date(task.due_date));
    });
  }, [tasks]);

  // Get tasks due tomorrow
  const getTasksDueTomorrow = useCallback(() => {
    return tasks.filter((task) => {
      if (!task.due_date || task.status === 'completed') return false;
      return isTomorrow(new Date(task.due_date));
    });
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    return tasks.filter((task) => {
      if (!task.due_date || task.status === 'completed') return false;
      return isPast(new Date(task.due_date));
    });
  }, [tasks]);

  // Request permission on mount and set up interval
  useEffect(() => {
    requestPermission();

    // Check every minute
    const interval = setInterval(checkDeadlines, 60000);
    
    // Initial check
    checkDeadlines();

    return () => clearInterval(interval);
  }, [requestPermission, checkDeadlines]);

  return {
    requestPermission,
    getTasksDueToday,
    getTasksDueTomorrow,
    getOverdueTasks,
    checkDeadlines,
    hasPermission: permissionGranted.current,
  };
};
