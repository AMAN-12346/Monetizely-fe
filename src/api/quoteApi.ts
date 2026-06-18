import axiosClient from './axiosClient';
import type { ApiResponse, Quote, CreateQuotePayload } from '@/types';

/**
 * Quote API — all quote-related HTTP calls.
 */
export const quoteApi = {
  /**
   * Fetch all quotes (summary fields only).
   */
  getAll: async (): Promise<Quote[]> => {
    const res = await axiosClient.get<ApiResponse<Quote[]>>('/quotes');
    return res.data.data;
  },

  /**
   * Fetch a single quote by its human-readable ID (e.g. "Q-2026-0001").
   * This endpoint is public — no auth required.
   */
  getByQuoteId: async (quoteId: string): Promise<Quote> => {
    const res = await axiosClient.get<ApiResponse<Quote>>(`/quotes/${quoteId}`);
    return res.data.data;
  },

  /**
   * Create and save a new quote.
   * The backend runs the pricing engine and returns the full saved quote.
   */
  create: async (payload: CreateQuotePayload): Promise<Quote> => {
    const res = await axiosClient.post<ApiResponse<Quote>>('/quotes', payload);
    return res.data.data;
  },
};
