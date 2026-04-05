import api from './index';

export const getProductList = (params?: any) =>
  api.get('/admin/product/list', { params });

export const createProduct = (data: any) =>
  api.post('/admin/product', data);

export const updateProduct = (id: number, data: any) =>
  api.put(`/admin/product/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete(`/admin/product/${id}`);

export const searchProduct = (keyword: string) =>
  api.get('/admin/product/search', { params: { keyword } });

export const getAllProducts = () =>
  api.get('/common/products');