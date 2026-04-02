import { create } from 'zustand';
import { messagesService } from '@/services/messages.service';
import { useAuthStore } from './authStore';
import type { Conversation, Message, MessageTemplate } from '@/types';
import { mockConversations, mockMessages } from '@/data/mock';

interface MessageState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  templates: MessageTemplate[];
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>;
  unsubscribeMessages: (() => void) | null;
  unsubscribeConversations: (() => void) | null;
  
  // Conversations
  fetchConversations: () => Promise<void>;
  getConversationById: (id: string) => Conversation | undefined;
  startConversation: (participantId: string, participantName: string, participantRole: 'employer' | 'employee', jobId?: string, jobTitle?: string) => Promise<Conversation>;
  archiveConversation: (id: string) => Promise<void>;
  unarchiveConversation: (id: string) => Promise<void>;
  muteConversation: (id: string) => Promise<void>;
  unmuteConversation: (id: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Messages
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, attachments?: File[]) => Promise<Message>;
  editMessage: (conversationId: string, messageId: string, content: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'usageCount'>) => Promise<MessageTemplate>;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (templateId: string, variables?: Record<string, string>) => string;
  
  // Typing indicators
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  // Active conversation
  setActiveConversation: (id: string | null) => void;
  
  // Realtime
  subscribeToRealtime: (conversationId: string) => void;
  cleanup: () => void;
  
  // Unread count
  getTotalUnreadCount: () => number;
}

// Map database conversation to app type
const mapDbConversation = (dbConv: any, userId: string): Conversation => {
  const otherParticipant = dbConv.participants?.[0] || { id: '', name: 'Unknown', role: 'worker' };
  const userRole = useAuthStore.getState().user?.role;
  return {
    id: dbConv.id,
    participants: [
      { id: userId, name: 'You', role: (userRole === 'worker' ? 'employee' : 'employer') as 'employer' | 'employee' },
      { id: otherParticipant.id, name: otherParticipant.name, role: (otherParticipant.role === 'worker' ? 'employee' : 'employer') as 'employer' | 'employee' },
    ],
    jobId: dbConv.shift_id,
    type: dbConv.shift_id ? 'job_inquiry' : 'direct',
    lastMessage: dbConv.last_message,
    lastMessageAt: dbConv.last_message_at,
    unreadCount: dbConv.unread_count || 0,
    archived: false,
    muted: false,
    createdAt: dbConv.created_at,
  };
};

// Map database message to app type
const mapDbMessage = (dbMsg: any): Message => ({
  id: dbMsg.id,
  conversationId: dbMsg.conversation_id,
  senderId: dbMsg.sender_id,
  senderName: '', // Will be filled from context
  content: dbMsg.content,
  contentType: dbMsg.message_type || 'text',
  attachments: dbMsg.file_url ? [{ id: '1', name: 'file', url: dbMsg.file_url, type: 'file', size: 0 }] : [],
  readBy: dbMsg.read ? [{ userId: dbMsg.sender_id, readAt: dbMsg.read_at || dbMsg.created_at }] : [],
  edited: false,
  deleted: false,
  createdAt: dbMsg.created_at,
});

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messages: {},
  templates: [],
  activeConversation: null,
  loading: false,
  error: null,
  typingUsers: {},
  unsubscribeMessages: null,
  unsubscribeConversations: null,

  fetchConversations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ conversations: mockConversations, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await messagesService.getConversations(user.id);
      set({ 
        conversations: data.map(c => mapDbConversation(c, user.id)), 
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ conversations: mockConversations, loading: false, error: 'Failed to load conversations' });
    }
  },

  getConversationById: (id) => get().conversations.find(c => c.id === id),

  startConversation: async (participantId, participantName, participantRole, jobId, jobTitle) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    // Check if conversation already exists locally
    const existing = get().conversations.find(c => 
      c.participants.some(p => p.id === participantId) &&
      (!jobId || c.jobId === jobId)
    );
    if (existing) return existing;
    
    try {
      const dbConv = await messagesService.getOrCreateConversation(user.id, participantId, jobId);
      const conversation: Conversation = {
        id: dbConv.id,
        participants: [
          { id: user.id, name: user.name, role: (user.role === 'worker' ? 'employee' : 'employer') as 'employer' | 'employee' },
          { id: participantId, name: participantName, role: participantRole },
        ],
        jobId,
        jobTitle,
        type: jobId ? 'job_inquiry' : 'direct',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        archived: false,
        muted: false,
        createdAt: dbConv.created_at,
      };
      
      set(state => ({ conversations: [conversation, ...state.conversations] }));
      return conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Fallback to local creation
      const conversation: Conversation = {
        id: `conv_${Date.now()}`,
        participants: [
          { id: user.id, name: user.name, role: (user.role === 'worker' ? 'employee' : 'employer') as 'employer' | 'employee' },
          { id: participantId, name: participantName, role: participantRole },
        ],
        jobId,
        jobTitle,
        type: jobId ? 'job_inquiry' : 'direct',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        archived: false,
        muted: false,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({ conversations: [conversation, ...state.conversations] }));
      return conversation;
    }
  },

  archiveConversation: async (id) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, archived: true } : c
      ),
    }));
  },

  unarchiveConversation: async (id) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, archived: false } : c
      ),
    }));
  },

  muteConversation: async (id) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, muted: true } : c
      ),
    }));
  },

  unmuteConversation: async (id) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, muted: false } : c
      ),
    }));
  },

  markAsRead: async (conversationId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Optimistic update
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m => ({
          ...m,
          readBy: m.readBy.some(r => r.userId === user.id)
            ? m.readBy
            : [...m.readBy, { userId: user.id, readAt: new Date().toISOString() }],
        })),
      },
    }));

    try {
      await messagesService.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const data = await messagesService.getMessages(conversationId, { limit: 50 });
      set(state => ({ 
        messages: { 
          ...state.messages, 
          [conversationId]: data.map(mapDbMessage) 
        } 
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      const msgs = mockMessages.filter(m => m.conversationId === conversationId);
      set(state => ({ messages: { ...state.messages, [conversationId]: msgs } }));
    }
  },

  sendMessage: async (conversationId, content, _attachments) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: user.name,
      content,
      contentType: 'text',
      attachments: [],
      readBy: [],
      edited: false,
      deleted: false,
      createdAt: new Date().toISOString(),
    };
    
    // Optimistic update
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), optimisticMessage],
      },
      conversations: state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: content, lastMessageAt: optimisticMessage.createdAt, lastMessageBy: user.id }
          : c
      ),
    }));
    
    try {
      const dbMessage = await messagesService.sendMessage(conversationId, user.id, content);
      // Update with real message
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map(m =>
            m.id === optimisticMessage.id ? { ...mapDbMessage(dbMessage), senderName: user.name } : m
          ),
        },
      }));
      return { ...mapDbMessage(dbMessage), senderName: user.name };
    } catch (error) {
      console.error('Failed to send message:', error);
      return optimisticMessage;
    }
  },

  editMessage: async (conversationId, messageId, content) => {
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m =>
          m.id === messageId ? { ...m, content, edited: true, editedAt: new Date().toISOString() } : m
        ),
      },
    }));
  },

  deleteMessage: async (conversationId, messageId) => {
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m =>
          m.id === messageId ? { ...m, deleted: true, content: 'This message was deleted' } : m
        ),
      },
    }));
  },

  fetchTemplates: async () => {
    set({ templates: [] });
  },

  createTemplate: async (templateData) => {
    const template: MessageTemplate = {
      ...templateData,
      id: `tmpl_msg_${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ templates: [template, ...state.templates] }));
    return template;
  },

  updateTemplate: async (id, updates) => {
    set(state => ({
      templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  deleteTemplate: async (id) => {
    set(state => ({ templates: state.templates.filter(t => t.id !== id) }));
  },

  useTemplate: (templateId, variables = {}) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) return '';
    
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    get().updateTemplate(templateId, { usageCount: template.usageCount + 1 });
    return content;
  },

  setTyping: (conversationId, isTyping) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping
          ? [...(state.typingUsers[conversationId] || []).filter(id => id !== user.id), user.id]
          : (state.typingUsers[conversationId] || []).filter(id => id !== user.id),
      },
    }));
  },

  setActiveConversation: (id) => set({ activeConversation: id }),

  subscribeToRealtime: (conversationId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Subscribe to messages
    const msgSubscription = messagesService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        if (newMessage.sender_id !== user.id) {
          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [...(state.messages[conversationId] || []), mapDbMessage(newMessage)],
            },
          }));
        }
      }
    );

    // Subscribe to conversations
    const convSubscription = messagesService.subscribeToConversations(
      user.id,
      (updatedConv) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === updatedConv.id ? { ...c, ...mapDbConversation(updatedConv, user.id) } : c
          ),
        }));
      }
    );

    set({ 
      unsubscribeMessages: () => msgSubscription.unsubscribe(),
      unsubscribeConversations: () => convSubscription.unsubscribe(),
    });
  },

  cleanup: () => {
    const { unsubscribeMessages, unsubscribeConversations } = get();
    if (unsubscribeMessages) unsubscribeMessages();
    if (unsubscribeConversations) unsubscribeConversations();
    set({ unsubscribeMessages: null, unsubscribeConversations: null });
  },

  getTotalUnreadCount: () => get().conversations.reduce((sum, c) => sum + c.unreadCount, 0),
}));
