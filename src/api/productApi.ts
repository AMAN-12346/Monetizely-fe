import axiosClient from './axiosClient';
import type { ApiResponse, Product } from '@/types';

/**
 * Product API — all product-related HTTP calls.
 *
 * Components never call axiosClient directly — they always go
 * through this module. This keeps HTTP logic out of UI components.
 */
export const productApi = {
  /**
   * Fetch all products (name, tiers, createdAt only — lightweight list).
   */
  getAll: async (): Promise<Product[]> => {
    const res = await axiosClient.get<ApiResponse<Product[]>>('/products');
    return res.data.data;
  },

  /**
   * Fetch a single product with all tiers and features.
   */
  getById: async (productId: string): Promise<Product> => {
    const res = await axiosClient.get<ApiResponse<Product>>(`/products/${productId}`);
    return res.data.data;
  },

  /**
   * Create a new product by name.
   */
  create: async (name: string): Promise<Product> => {
    const res = await axiosClient.post<ApiResponse<Product>>('/products', { name });
    return res.data.data;
  },

  /**
   * Update a product's name.
   */
  updateName: async (productId: string, name: string): Promise<Product> => {
    const res = await axiosClient.put<ApiResponse<Product>>(`/products/${productId}`, { name });
    return res.data.data;
  },

  /**
   * Add a tier to a product.
   */
  addTier: async (
    productId: string,
    tier: { name: string; basePricePerSeat: number }
  ): Promise<Product> => {
    const res = await axiosClient.post<ApiResponse<Product>>(
      `/products/${productId}/tiers`,
      tier
    );
    return res.data.data;
  },

  /**
   * Update an existing tier's name and/or base price.
   */
  updateTier: async (
    productId: string,
    tierId: string,
    update: { name?: string; basePricePerSeat?: number }
  ): Promise<Product> => {
    const res = await axiosClient.put<ApiResponse<Product>>(`/products/${productId}/tiers`, {
      tierId,
      ...update,
    });
    return res.data.data;
  },

  /**
   * Add a feature to a product.
   * The backend auto-seeds 'not_available' configs for all existing tiers.
   */
  addFeature: async (productId: string, name: string): Promise<Product> => {
    const res = await axiosClient.post<ApiResponse<Product>>(
      `/products/${productId}/features`,
      { name }
    );
    return res.data.data;
  },

  /**
   * Update a feature's name and/or all its tier availability configs.
   */
  updateFeature: async (
    productId: string,
    featureId: string,
    update: { name?: string; tierConfigs?: unknown[] }
  ): Promise<Product> => {
    const res = await axiosClient.put<ApiResponse<Product>>(
      `/products/${productId}/features`,
      { featureId, ...update }
    );
    return res.data.data;
  },
};
