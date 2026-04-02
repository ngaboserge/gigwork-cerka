import { supabase } from '../lib/supabase';
import type { QuoteRequest } from '../types/materials.types';
import { notificationsService } from './notifications.service';

export const quoteRequestsService = {
  async createQuoteRequest(data: {
    buyer_id: string;
    supplier_id: string;
    listing_id: string;
    quantity: number;
    delivery_location: string;
    notes?: string;
  }): Promise<QuoteRequest> {
    const { data: quoteRequest, error } = await supabase
      .from('quote_requests')
      .insert({
        ...data,
        status: 'pending'
      })
      .select(`
        *,
        supplier_listings(*, materials(*)),
        profiles!quote_requests_supplier_id_fkey(id, full_name, business_name)
      `)
      .single();

    if (error) throw error;

    // Send notification to supplier
    await notificationsService.createNotification({
      user_id: data.supplier_id,
      type: 'quote_request',
      title: 'New Quote Request',
      message: `You have received a new quote request for ${quoteRequest.supplier_listings?.materials?.name}`,
      data: { quote_request_id: quoteRequest.id }
    });

    return quoteRequest;
  },

  async getBuyerRequests(buyerId: string): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        supplier_listings(*, materials(*)),
        profiles!quote_requests_supplier_id_fkey(id, full_name, business_name)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSupplierRequests(supplierId: string): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        supplier_listings(*, materials(*)),
        profiles!quote_requests_buyer_id_fkey(id, full_name)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateRequestStatus(id: string, status: QuoteRequest['status']): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        supplier_listings(*, materials(*)),
        profiles!quote_requests_supplier_id_fkey(id, full_name, business_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};
