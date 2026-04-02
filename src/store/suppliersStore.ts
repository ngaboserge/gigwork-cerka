import { create } from 'zustand';
import type { SupplierListing, ListingAnalytics, SearchFilters, ListingForm } from '../types/materials.types';
import { suppliersService } from '../services/suppliers.service';

interface SuppliersState {
  listings: SupplierListing[];
  searchResults: SupplierListing[];
  selectedListing: SupplierListing | null;
  analytics: ListingAnalytics | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createListing: (formData: ListingForm, supplierId: string) => Promise<SupplierListing>;
  updateListing: (id: string, updates: Partial<ListingForm>) => Promise<SupplierListing>;
  deleteListing: (id: string) => Promise<void>;
  fetchSupplierListings: (supplierId: string) => Promise<void>;
  searchListings: (filters: SearchFilters) => Promise<void>;
  fetchListing: (id: string) => Promise<void>;
  fetchListingAnalytics: (listingId: string) => Promise<void>;
  recordView: (listingId: string) => Promise<void>;
  reset: () => void;
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  listings: [],
  searchResults: [],
  selectedListing: null,
  analytics: null,
  loading: false,
  error: null,

  createListing: async (formData, supplierId) => {
    set({ loading: true, error: null });
    try {
      const listing = await suppliersService.createListing(formData, supplierId);
      set((state) => ({
        listings: [listing, ...state.listings],
        loading: false
      }));
      return listing;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateListing: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const listing = await suppliersService.updateListing(id, updates);
      set((state) => ({
        listings: state.listings.map(l => l.id === id ? listing : l),
        selectedListing: state.selectedListing?.id === id ? listing : state.selectedListing,
        loading: false
      }));
      return listing;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ loading: true, error: null });
    try {
      await suppliersService.deleteListing(id);
      set((state) => ({
        listings: state.listings.filter(l => l.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSupplierListings: async (supplierId) => {
    set({ loading: true, error: null });
    try {
      const listings = await suppliersService.getSupplierListings(supplierId);
      set({ listings, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchListings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const results = await suppliersService.searchListings(filters);
      set({ searchResults: results, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchListing: async (id) => {
    set({ loading: true, error: null });
    try {
      const listing = await suppliersService.getListing(id);
      set({ selectedListing: listing, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchListingAnalytics: async (listingId) => {
    try {
      const analytics = await suppliersService.getListingAnalytics(listingId);
      set({ analytics });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  recordView: async (listingId) => {
    try {
      await suppliersService.recordView(listingId);
      // Optionally refresh analytics
      await get().fetchListingAnalytics(listingId);
    } catch (error: any) {
      console.error('Failed to record view:', error);
    }
  },

  reset: () => {
    set({
      listings: [],
      searchResults: [],
      selectedListing: null,
      analytics: null,
      loading: false,
      error: null
    });
  }
}));
