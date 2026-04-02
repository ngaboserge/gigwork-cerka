import { create } from 'zustand';
import { notificationsService } from '@/services/notifications.service';
import { useAuthStore } from './authStore';
import type { Notification, NotificationType } from '@/types';
import { mockNotifications } from '@/data/mock';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => void;
  subscribeToRealtime: () => void;
  cleanup: () => void;
  
  getUnreadCount: () => number;
  getByType: (type: NotificationType) => Notification[];
}

// Map database notification to app notification type
const mapDbNotification = (dbNotif: any): Notification => ({
  id: dbNotif.id,
  userId: dbNotif.user_id,
  type: dbNotif.type as NotificationType,
  title: dbNotif.title,
  message: dbNotif.message,
  data: dbNotif.data,
  read: dbNotif.read,
  readAt: dbNotif.read_at,
  priority: 'normal',
  createdAt: dbNotif.created_at,
});

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  unsubscribe: null,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ notifications: mockNotifications, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await notificationsService.getNotifications(user.id, { limit: 50 });
      set({ 
        notifications: data.map(mapDbNotification), 
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to mock data
      set({ notifications: mockNotifications, loading: false, error: 'Failed to load notifications' });
    }
  },

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      read: false,
      priority: notificationData.priority || 'normal',
      createdAt: new Date().toISOString(),
    };
    set(state => ({ notifications: [notification, ...state.notifications] }));
  },

  markAsRead: async (id) => {
    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ),
    }));

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    
    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n => ({
        ...n,
        read: true,
        readAt: n.readAt || new Date().toISOString(),
      })),
    }));

    if (user) {
      try {
        await notificationsService.markAllAsRead(user.id);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  },

  deleteNotification: async (id) => {
    // Optimistic update
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));

    try {
      await notificationsService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  subscribeToRealtime: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const subscription = notificationsService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        set(state => ({
          notifications: [mapDbNotification(newNotification), ...state.notifications],
        }));
      }
    );

    set({ unsubscribe: () => subscription.unsubscribe() });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  getUnreadCount: () => get().notifications.filter(n => !n.read).length,

  getByType: (type) => get().notifications.filter(n => n.type === type),
}));
