// src/services/location-api.ts
import api from '@/lib/api';
import { Location, LocationFormData } from '@/types/location';

export const locationApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.get('/locations');
    return response.data;
  },

  getById: async (id: string): Promise<Location> => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  create: async (data: LocationFormData): Promise<Location> => {
    const response = await api.post('/locations', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LocationFormData>): Promise<Location> => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },
};