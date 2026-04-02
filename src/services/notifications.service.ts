import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export const notificationsService = {
  // Get user notifications with pagination
  async getNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<DbNotification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DbNotification[];
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() } as any)
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() } as any)
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Create notification
  async createNotification(notification: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification as any)
      .select()
      .single();

    if (error) throw error;
    return data as DbNotification;
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: DbNotification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as DbNotification);
        }
      )
      .subscribe();
  },
};
