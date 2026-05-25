'use client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { incrementUnread, clearUnread } from '@/features/notifications/notificationSlice';
import { useSocket } from './useSocket';

interface NotificationPayload {
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function useNotifications() {
  const dispatch    = useAppDispatch();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  useSocket<NotificationPayload>('notification:new', (data) => {
    dispatch(incrementUnread());
    if (typeof window !== 'undefined') {
      console.info(`[Notification] ${data.title}: ${data.body}`);
    }
  });

  return {
    unreadCount,
    markAllRead: () => dispatch(clearUnread()),
  };
}
