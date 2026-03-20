// Service API pour les produits
import api from './api';
import { Product, ProductFormData } from '@/types/product';
import { AxiosResponse } from 'axios';

export const productApiService = {
  async getAll(): Promise<Product[]> {
    console.log('📦 Fetching products from API...');
    const response: AxiosResponse<Product[]> = await api.get('/api/products');
    console.log(`✅ Retrieved ${response.data.length} products from API`);
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response: AxiosResponse<Product> = await api.get(`/api/products/${id}`);
    return response.data;
  },

  async create(data: ProductFormData): Promise<Product> {
    console.log('📝 Adding new product:', data);
    const response: AxiosResponse<Product> = await api.post('/api/products', data);
    console.log('✅ Product added successfully with code:', response.data.code, response.data);
    return response.data;
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    console.log('📝 Updating product:', id, data);
    const response: AxiosResponse<Product> = await api.put(`/api/products/${id}`, data);
    console.log('✅ Product updated successfully:', response.data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    console.log('🗑️ Deleting product with ID:', id);
    await api.delete(`/api/products/${id}`);
    console.log('✅ Product deleted successfully');
    return true;
  },

  // Générer les codes pour les produits existants qui n'en ont pas
  async generateCodesForExistingProducts(): Promise<{ message: string; updatedCount: number }> {
    console.log('🔧 Generating codes for existing products...');
    const response = await api.post('/api/products/generate-codes');
    console.log('✅ Codes generated:', response.data);
    return response.data;
  },
};

export default productApiService;
