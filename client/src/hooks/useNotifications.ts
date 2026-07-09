'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setNotifications, 
  prependNotification, 
  markOneRead as markOneReadAction, 
  markAllRead as markAllReadAction,
  INotification
} from '@/features/notifications/notificationSlice';
import { useSocket } from './useSocket';
import axiosInstance from '@/lib/axios';

export function useNotifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications via REST API
  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications?limit=50');
        if (mounted && res.data?.success) {
          dispatch(setNotifications(res.data.data));
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => { mounted = false; };
  }, [dispatch]);

  // Listen for live updates via Socket.io
  useSocket<INotification>('notification:new', (data) => {
    dispatch(prependNotification(data));
  });

  const markAsRead = async (id: string) => {
    dispatch(markOneReadAction(id));
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    dispatch(markAllReadAction());
    try {
      await axiosInstance.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
