// src/types/event.ts
import { EventCategory } from './event-category';

export interface Event {
  id: string;
  name: string;
  date?: string;
  time?: string;
  eventCategoryId?: string;
  eventCategory?: EventCategory;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  name: string;
  date?: string;
  time?: string;
  eventCategoryId?: string;
}