import api from './index';

export const getCustomerList = (params?: any) =>
  api.get('/admin/customer/list', { params });

export const createCustomer = (data: any) =>
  api.post('/admin/customer', data);

export const updateCustomer = (id: number, data: any) =>
  api.put(`/admin/customer/${id}`, data);

export const deleteCustomer = (id: number) =>
  api.delete(`/admin/customer/${id}`);

export const searchCustomer = (keyword: string) =>
  api.get('/admin/customer/search', { params: { keyword } });

export const getAllCustomers = () =>
  api.get('/common/customers');