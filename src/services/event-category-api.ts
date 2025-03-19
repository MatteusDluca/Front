// src/services/event-category-api.ts
import api from '@/lib/api';
import { EventCategory, EventCategoryFormData } from '@/types/event-category';

export const eventCategoryApi = {
  getAll: async (): Promise<EventCategory[]> => {
    const response = await api.get('/event-categories');
    return response.data;
  },

  getById: async (id: string): Promise<EventCategory> => {
    const response = await api.get(`/event-categories/${id}`);
    return response.data;
  },

  create: async (data: EventCategoryFormData): Promise<EventCategory> => {
    const response = await api.post('/event-categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<EventCategoryFormData>): Promise<EventCategory> => {
    const response = await api.put(`/event-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/event-categories/${id}`);
  },
};