import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  lastUpdated: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  lastUpdated: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    prependNotification(state, action: PayloadAction<INotification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.lastUpdated = Date.now();
    },
    markOneRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      const notif = state.notifications.find(n => n._id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  prependNotification,
  markOneRead,
  markAllRead,
  setUnreadCount,
  incrementUnread,
  clearUnread
} = notificationSlice.actions;

export default notificationSlice.reducer;
