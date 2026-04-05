import api from './index';

export const getPaymentList = (params?: any) =>
  api.get('/payment/list', { params });

export const createPayment = (data: any) =>
  api.post('/payment', data);

export const updatePayment = (id: number, data: any) =>
  api.put(`/payment/${id}`, data);

export const deletePayment = (id: number) =>
  api.delete(`/payment/${id}`);