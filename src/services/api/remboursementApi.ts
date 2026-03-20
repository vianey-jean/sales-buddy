import api from './api';

export const remboursementApiService = {
  async getAll() {
    const response = await api.get('/api/remboursements');
    return response.data;
  },

  async getByMonth(month: number, year: number) {
    const response = await api.get(`/api/remboursements/by-month?month=${month}&year=${year}`);
    return response.data;
  },

  async searchSalesByClient(clientName: string) {
    const response = await api.get(`/api/remboursements/search-sales?clientName=${encodeURIComponent(clientName)}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/api/remboursements', data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/remboursements/${id}`);
    return response.data;
  }
};

export default remboursementApiService;
