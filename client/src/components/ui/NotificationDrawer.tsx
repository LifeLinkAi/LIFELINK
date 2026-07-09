'use client';
import { useEffect } from 'react';
import { X, Check, Bell, Activity, Droplet, FileText, HeartPulse, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { INotification } from '@/features/notifications/notificationSlice';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

interface NotificationDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  notifications: INotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'organ_interest_received':
    case 'organ_interest_declined':
    case 'surgery_approved':
    case 'surgery_scheduled':
    case 'transplant_outcome':
      return <HeartPulse className="h-5 w-5 text-rose-500" />;
    case 'blood_request_match':
    case 'donor_pledge_response':
    case 'blood_donation_complete':
      return <Droplet className="h-5 w-5 text-red-500" />;
    case 'wellness_reminder':
    case 'wellness_log_received':
      return <Activity className="h-5 w-5 text-emerald-500" />;
    case 'legal_deed_ready':
    case 'donor_deed_signed':
      return <FileText className="h-5 w-5 text-indigo-500" />;
    case 'hospital_registration':
    case 'hospital_status_changed':
      return <Building2 className="h-5 w-5 text-blue-500" />;
    case 'emergency_broadcast':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'new_login_alert':
      return <ShieldCheck className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-400" />;
  }
};

export default function NotificationDrawer({ open, setOpen, notifications, markAsRead, markAllAsRead }: NotificationDrawerProps) {
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />

          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="pointer-events-auto w-screen max-w-md flex flex-col h-screen bg-white shadow-2xl"
                >
                  <div className="px-4 py-6 sm:px-6 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div className="flex items-start justify-between">
                      <h2 className="text-base font-semibold leading-6 text-slate-900">
                        Notifications
                      </h2>
                      <div className="ml-3 flex h-7 items-center space-x-4">
                        <button
                          type="button"
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                        <button
                          type="button"
                          className="relative rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          onClick={() => setOpen(false)}
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-1 bg-white overflow-y-auto min-h-0">
                    {(!notifications || notifications.length === 0) ? (
                      <div className="flex flex-col items-center justify-center min-h-[300px] h-full text-slate-500 p-8 text-center">
                        <Bell className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-base font-medium text-slate-900">You're all caught up</p>
                        <p className="text-sm mt-1">No new notifications at this time.</p>
                      </div>
                    ) : (
                      <ul role="list" className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                          <li
                            key={notification._id || Math.random().toString()}
                            className={`relative p-4 sm:p-6 transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-emerald-50/30' : ''}`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 mt-1">
                                {getIconForType(notification.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-semibold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    {!notification.isRead && (
                                      <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="text-slate-400 hover:text-emerald-500"
                                        title="Mark as read"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    )}
                                    <p className="text-xs text-slate-500 whitespace-nowrap">
                                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                                <p className={`mt-1 text-sm ${!notification.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                                  {notification.message}
                                </p>
                                {notification.actionUrl && (
                                  <Link
                                    href={notification.actionUrl}
                                    onClick={() => {
                                      if (!notification.isRead) markAsRead(notification._id);
                                      setOpen(false);
                                    }}
                                    className="mt-2 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                  >
                                    View details &rarr;
                                  </Link>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
