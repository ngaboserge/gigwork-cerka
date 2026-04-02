import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { notificationsService } from '@/services/notifications.service';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/lib/database.types';

const NOTIFICATION_ICONS: Record<string, JSX.Element> = {
  shift_confirmed: (
    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shift_standby: (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  application_rejected: (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  new_application: (
    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  shift_reminder: (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  payment_processed: (
    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  message: (
    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;

      try {
        const data = await notificationsService.getNotifications(user.id, {
          limit: 50,
          unreadOnly: filter === 'unread',
        });
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    if (user?.id) {
      const subscription = notificationsService.subscribeToNotifications(user.id, (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationsService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatNotificationDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    let key: string;
    if (isToday(date)) key = 'Today';
    else if (isYesterday(date)) key = 'Yesterday';
    else key = format(date, 'MMMM d, yyyy');
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
                <p className="text-sm text-neutral-500 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1.5 text-sm ${filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    Unread
                  </button>
                </div>
                {unreadCount > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <Card>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-neutral-100 last:border-b-0">
                  <Skeleton height={60} />
                </div>
              ))}
            </Card>
          ) : notifications.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">{date}</h3>
                  <Card padding="none">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors ${
                          !notification.read ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                            {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm ${!notification.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-neutral-600 mt-0.5">{notification.message}</p>
                              </div>
                              <span className="text-xs text-neutral-400 flex-shrink-0">
                                {formatNotificationDate(notification.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              {(notification.data as any)?.link && (
                                <Link 
                                  to={(notification.data as any).link} 
                                  className="text-xs text-primary-600 hover:text-primary-700"
                                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                  View details →
                                </Link>
                              )}
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs text-neutral-500 hover:text-neutral-700"
                                >
                                  Mark as read
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="text-xs text-neutral-400 hover:text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="font-semibold text-neutral-900 mb-2">No notifications</h3>
              <p className="text-neutral-500 text-sm">
                {filter === 'unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
