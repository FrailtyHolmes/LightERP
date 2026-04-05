import api from './index';

export const getInvoiceList = (params?: any) =>
  api.get('/sale/invoice/list', { params });

export const getInvoiceDetail = (id: string) =>
  api.get(`/sale/invoice/${id}/detail`);

export const createInvoice = (data: any) =>
  api.post('/sale/invoice', data);

export const updateInvoice = (id: string, data: any) =>
  api.put(`/sale/invoice/${id}`, data);

export const deleteInvoice = (id: string) =>
  api.delete(`/sale/invoice/${id}`);

export const getProductPrice = (customerId: number, productId: number) =>
  api.get('/common/price', { params: { customerId, productId } });