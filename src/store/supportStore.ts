import { create } from 'zustand';
import { supportService, type SupportTicket, type TicketMessage, type HelpArticle } from '@/services/support.service';
import { useAuthStore } from './authStore';
import { mockHelpArticles } from '@/data/mock';

interface SupportState {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  ticketMessages: TicketMessage[];
  helpArticles: HelpArticle[];
  helpCategories: string[];
  loading: boolean;
  error: string | null;
  
  // Tickets
  fetchTickets: (status?: string) => Promise<void>;
  createTicket: (ticket: {
    subject: string;
    description: string;
    category: SupportTicket['category'];
    priority?: SupportTicket['priority'];
  }) => Promise<SupportTicket>;
  getTicket: (ticketId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, feedback?: string) => Promise<void>;
  
  // Messages
  fetchTicketMessages: (ticketId: string) => Promise<void>;
  sendTicketMessage: (ticketId: string, messageText: string, attachments?: any) => Promise<void>;
  
  // Help Articles
  fetchHelpArticles: (category?: string, searchQuery?: string) => Promise<void>;
  getHelpArticle: (slug: string) => Promise<HelpArticle | null>;
  fetchHelpCategories: () => Promise<void>;
  markArticleHelpful: (articleId: string, isHelpful: boolean) => Promise<void>;
  searchHelp: (query: string) => Promise<Partial<HelpArticle>[]>;
  
  // UI
  setSelectedTicket: (ticket: SupportTicket | null) => void;
  clearError: () => void;
}

export const useSupportStore = create<SupportState>((set) => ({
  tickets: [],
  selectedTicket: null,
  ticketMessages: [],
  helpArticles: [],
  helpCategories: [],
  loading: false,
  error: null,

  // =====================================================
  // TICKETS
  // =====================================================

  fetchTickets: async (status) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ tickets: [], loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const tickets = await supportService.getUserTickets(user.id, status);
      set({ tickets, loading: false });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      set({ tickets: [], loading: false, error: 'Failed to load tickets' });
    }
  },

  createTicket: async (ticketData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const ticket = await supportService.createTicket(ticketData, user.id);
      set(state => ({
        tickets: [ticket, ...state.tickets],
        loading: false,
      }));
      return ticket;
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      set({ loading: false, error: error.message || 'Failed to create ticket' });
      throw error;
    }
  },

  getTicket: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const ticket = await supportService.getTicket(ticketId);
      set({ selectedTicket: ticket, loading: false });
    } catch (error) {
      console.error('Failed to get ticket:', error);
      set({ loading: false, error: 'Failed to load ticket' });
    }
  },

  updateTicketStatus: async (ticketId, status, resolutionNotes) => {
    set({ loading: true, error: null });
    try {
      const ticket = await supportService.updateTicketStatus(ticketId, status, resolutionNotes);
      set(state => ({
        tickets: state.tickets.map(t => t.id === ticketId ? ticket : t),
        selectedTicket: state.selectedTicket?.id === ticketId ? ticket : state.selectedTicket,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to update ticket status:', error);
      set({ loading: false, error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  rateTicket: async (ticketId, rating, feedback) => {
    set({ loading: true, error: null });
    try {
      const ticket = await supportService.rateTicket(ticketId, rating, feedback);
      set(state => ({
        tickets: state.tickets.map(t => t.id === ticketId ? ticket : t),
        selectedTicket: state.selectedTicket?.id === ticketId ? ticket : state.selectedTicket,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to rate ticket:', error);
      set({ loading: false, error: error.message || 'Failed to rate ticket' });
      throw error;
    }
  },

  // =====================================================
  // MESSAGES
  // =====================================================

  fetchTicketMessages: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const messages = await supportService.getTicketMessages(ticketId);
      set({ ticketMessages: messages, loading: false });
    } catch (error) {
      console.error('Failed to fetch ticket messages:', error);
      set({ ticketMessages: [], loading: false, error: 'Failed to load messages' });
    }
  },

  sendTicketMessage: async (ticketId, messageText, attachments) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const message = await supportService.sendTicketMessage(ticketId, user.id, messageText, attachments);
      set(state => ({
        ticketMessages: [...state.ticketMessages, message],
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      set({ loading: false, error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  // =====================================================
  // HELP ARTICLES
  // =====================================================

  fetchHelpArticles: async (category, searchQuery) => {
    set({ loading: true, error: null });
    try {
      const articles = await supportService.getHelpArticles(category, searchQuery);
      set({ helpArticles: articles, loading: false });
    } catch (error) {
      console.error('Failed to fetch help articles:', error);
      set({ helpArticles: mockHelpArticles as any, loading: false, error: 'Failed to load articles' });
    }
  },

  getHelpArticle: async (slug) => {
    set({ loading: true, error: null });
    try {
      const article = await supportService.getHelpArticle(slug);
      set({ loading: false });
      return article;
    } catch (error) {
      console.error('Failed to get help article:', error);
      set({ loading: false, error: 'Failed to load article' });
      return null;
    }
  },

  fetchHelpCategories: async () => {
    try {
      const categories = await supportService.getHelpCategories();
      set({ helpCategories: categories });
    } catch (error) {
      console.error('Failed to fetch help categories:', error);
      set({ helpCategories: [] });
    }
  },

  markArticleHelpful: async (articleId, isHelpful) => {
    try {
      await supportService.markArticleHelpful(articleId, isHelpful);
      
      // Optimistically update the count
      set(state => ({
        helpArticles: state.helpArticles.map(a => {
          if (a.id === articleId) {
            return {
              ...a,
              helpful_count: isHelpful ? a.helpful_count + 1 : a.helpful_count,
              not_helpful_count: !isHelpful ? a.not_helpful_count + 1 : a.not_helpful_count,
            };
          }
          return a;
        }),
      }));
    } catch (error) {
      console.error('Failed to mark article helpful:', error);
    }
  },

  searchHelp: async (query) => {
    try {
      return await supportService.searchHelp(query);
    } catch (error) {
      console.error('Failed to search help:', error);
      return [];
    }
  },

  // =====================================================
  // UI
  // =====================================================

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  
  clearError: () => set({ error: null }),
}));
