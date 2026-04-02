import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'system' | 'file';
  file_url?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface DbConversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  shift_id?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  // Enriched data
  participants?: {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
  }[];
  unread_count?: number;
}

export const messagesService = {
  // =====================================================
  // CONVERSATIONS
  // =====================================================

  async getConversations(userId: string): Promise<DbConversation[]> {
    try {
      // Get conversations where user is participant 1 or 2
      const { data: conv1, error: error1 } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_1_id', userId)
        .order('last_message_at', { ascending: false });

      const { data: conv2, error: error2 } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_2_id', userId)
        .order('last_message_at', { ascending: false });

      if (error1) {
        console.error('Error fetching conversations (participant 1):', error1);
        throw error1;
      }
      if (error2) {
        console.error('Error fetching conversations (participant 2):', error2);
        throw error2;
      }

      const allConversations = [...(conv1 || []), ...(conv2 || [])] as DbConversation[];
      
      // Remove duplicates and sort
      const uniqueConversations = allConversations.filter((conv, index, self) =>
        index === self.findIndex(c => c.id === conv.id)
      ).sort((a, b) => 
        new Date(b.last_message_at || b.created_at).getTime() - 
        new Date(a.last_message_at || a.created_at).getTime()
      );

      console.log('Found conversations:', uniqueConversations.length);

      // Enrich with participant info
      const enrichedConversations = await Promise.all(
        uniqueConversations.map(async (conv) => {
          const otherParticipantId = conv.participant_1_id === userId 
            ? conv.participant_2_id 
            : conv.participant_1_id;
          
          let participant = { id: otherParticipantId, name: 'Unknown User', role: 'unknown' };

          try {
            // Try profiles table first (for suppliers/buyers with business_name)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, business_name, role, avatar_url')
              .eq('id', otherParticipantId)
              .maybeSingle();

            if (profile && !profileError && profile.business_name) {
              participant = {
                id: profile.id,
                name: profile.business_name,
                avatar_url: profile.avatar_url,
                role: profile.role || 'user',
              };
            } else {
              // Get avatar_url from profiles table
              const { data: profileData } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', otherParticipantId)
                .maybeSingle();

              // Try worker profile
              const { data: workerProfile, error: wpError } = await supabase
                .from('worker_profiles')
                .select('user_id, first_name, last_name')
                .eq('user_id', otherParticipantId)
                .maybeSingle();

              if (workerProfile && !wpError) {
                const wp = workerProfile as any;
                participant = {
                  id: wp.user_id,
                  name: `${wp.first_name} ${wp.last_name}`,
                  avatar_url: profileData?.avatar_url,
                  role: 'worker',
                };
              } else {
                // Try employer profile
                const { data: employerProfile, error: epError } = await supabase
                  .from('employer_profiles')
                  .select('user_id, company_name')
                  .eq('user_id', otherParticipantId)
                  .maybeSingle();

                if (employerProfile && !epError) {
                  const ep = employerProfile as any;
                  participant = {
                    id: ep.user_id,
                    name: ep.company_name,
                    avatar_url: profileData?.avatar_url,
                    role: 'employer',
                  };
                }
              }
            }
          } catch (profileError) {
            console.error('Error fetching participant profile:', profileError);
          }

          // Get unread count
          let unreadCount = 0;
          try {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', userId)
              .eq('read', false);
            unreadCount = count || 0;
          } catch (countError) {
            console.error('Error counting unread messages:', countError);
          }

          return {
            ...conv,
            participants: [participant],
            unread_count: unreadCount,
          };
        })
      );

      console.log('Enriched conversations:', enrichedConversations);
      return enrichedConversations;
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  },

  async getOrCreateConversation(
    userId: string, 
    otherUserId: string, 
    shiftId?: string
  ): Promise<DbConversation> {
    // Check if conversation exists (either direction)
    const { data: existing1 } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_1_id', userId)
      .eq('participant_2_id', otherUserId)
      .maybeSingle();

    if (existing1) return existing1 as DbConversation;

    const { data: existing2 } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_1_id', otherUserId)
      .eq('participant_2_id', userId)
      .maybeSingle();

    if (existing2) return existing2 as DbConversation;

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: userId,
        participant_2_id: otherUserId,
        shift_id: shiftId,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as DbConversation;
  },

  // =====================================================
  // MESSAGES
  // =====================================================

  async getMessages(conversationId: string, options?: {
    limit?: number;
    before?: string;
  }): Promise<DbMessage[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.before) {
      query = query.lt('created_at', options.before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as DbMessage[]).reverse();
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    _messageType: 'text' | 'system' | 'file' = 'text',
    _fileUrl?: string
  ): Promise<DbMessage> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
      } as any)
      .eq('id', conversationId);

    // Get conversation to find recipient
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_1_id, participant_2_id')
      .eq('id', conversationId)
      .single();

    if (conversation) {
      const recipientId = conversation.participant_1_id === senderId 
        ? conversation.participant_2_id 
        : conversation.participant_1_id;

      // Get sender name
      let senderName = 'Someone';
      try {
        // Try profiles table first (for suppliers/buyers with business_name)
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', senderId)
          .maybeSingle();

        if (profile && profile.business_name) {
          senderName = profile.business_name;
        } else {
          // Try worker profile
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('first_name, last_name')
            .eq('user_id', senderId)
            .maybeSingle();

          if (workerProfile) {
            senderName = `${workerProfile.first_name} ${workerProfile.last_name}`;
          } else {
            // Try employer profile
            const { data: employerProfile } = await supabase
              .from('employer_profiles')
              .select('company_name')
              .eq('user_id', senderId)
              .maybeSingle();

            if (employerProfile) {
              senderName = employerProfile.company_name;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching sender name:', err);
      }

      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          title: `New message from ${senderName}`,
          message: 'sent you a message',
          data: {
            conversation_id: conversationId,
            sender_id: senderId,
            link: '/messages/' + conversationId,
          },
        } as any);
    }

    return data as DbMessage;
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() } as any)
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Subscribe to new messages
  subscribeToMessages(conversationId: string, callback: (message: DbMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as DbMessage);
        }
      )
      .subscribe();
  },

  // Subscribe to conversation updates
  subscribeToConversations(userId: string, callback: (conversation: DbConversation) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const conv = payload.new as DbConversation;
          if (conv.participant_1_id === userId || conv.participant_2_id === userId) {
            callback(conv);
          }
        }
      )
      .subscribe();
  },
};
