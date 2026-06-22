import api from '../../services/api';
import { Product, CreateProductPayload } from '../types/product.types';

export const productService = {
  async getAll(search?: string, category?: string): Promise<Product[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get<{ data: Product[]; total: number }>(
      '/products',
      { params },
    );
    return data.data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<CreateProductPayload>,
  ): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
