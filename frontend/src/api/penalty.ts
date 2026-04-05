import api from './index';

export const getPenaltyList = (params?: any) =>
  api.get('/penalty/list', { params });

export const createPenalty = (data: any) =>
  api.post('/penalty', data);

export const updatePenalty = (id: number, data: any) =>
  api.put(`/penalty/${id}`, data);

export const deletePenalty = (id: number) =>
  api.delete(`/penalty/${id}`);