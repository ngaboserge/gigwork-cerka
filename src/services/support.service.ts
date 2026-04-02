import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'account' | 'payment' | 'technical' | 'shift' | 'safety' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to?: string;
  assigned_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message_text: string;
  is_internal: boolean;
  attachments?: any;
  created_at: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  meta_title?: string;
  meta_description?: string;
  author_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const supportService = {
  // =====================================================
  // SUPPORT TICKETS
  // =====================================================

  async createTicket(ticket: {
    subject: string;
    description: string;
    category: SupportTicket['category'];
    priority?: SupportTicket['priority'];
  }, userId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...ticket,
        user_id: userId,
        priority: ticket.priority || 'normal',
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async getUserTickets(userId: string, status?: string) {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as SupportTicket[];
  },

  async getTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) {
    const updates: any = { status };
    
    if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();
      if (resolutionNotes) {
        updates.resolution_notes = resolutionNotes;
      }
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async rateTicket(ticketId: string, rating: number, feedback?: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        satisfaction_rating: rating,
        satisfaction_feedback: feedback,
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  // =====================================================
  // TICKET MESSAGES
  // =====================================================

  async getTicketMessages(ticketId: string) {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .select(`
        *,
        sender:profiles!support_ticket_messages_sender_id_fkey(
          id,
          worker_profiles(first_name, last_name),
          employer_profiles(company_name)
        )
      `)
      .eq('ticket_id', ticketId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as TicketMessage[];
  },

  async sendTicketMessage(ticketId: string, senderId: string, messageText: string, attachments?: any) {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        message_text: messageText,
        attachments,
        is_internal: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket status to waiting_user if sent by support
    // For now, just update the ticket's updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data as TicketMessage;
  },

  // =====================================================
  // HELP ARTICLES
  // =====================================================

  async getHelpArticles(category?: string, searchQuery?: string) {
    let query = supabase
      .from('help_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as HelpArticle[];
  },

  async getHelpArticle(slug: string) {
    const { data, error } = await supabase
      .from('help_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('help_articles')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);

    return data as HelpArticle;
  },

  async getHelpCategories() {
    const { data, error } = await supabase
      .from('help_articles')
      .select('category')
      .eq('status', 'published');

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set((data || []).map((a: any) => a.category))];
    return categories;
  },

  async markArticleHelpful(articleId: string, isHelpful: boolean) {
    const field = isHelpful ? 'helpful_count' : 'not_helpful_count';
    
    const { data, error } = await supabase
      .from('help_articles')
      .select('helpful_count, not_helpful_count')
      .eq('id', articleId)
      .single();

    if (error) throw error;

    const currentCount = isHelpful ? (data.helpful_count || 0) : (data.not_helpful_count || 0);
    
    await supabase
      .from('help_articles')
      .update({ [field]: currentCount + 1 })
      .eq('id', articleId);
  },

  // =====================================================
  // SEARCH
  // =====================================================

  async searchHelp(query: string) {
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, excerpt, category, slug')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data || []) as Partial<HelpArticle>[];
  },
};
