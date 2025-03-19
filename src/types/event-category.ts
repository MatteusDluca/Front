// src/types/event-category.ts
export enum EventCategoryStatus {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
  }
  
  export interface EventCategory {
    id: string;
    name: string;
    status: EventCategoryStatus;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface EventCategoryFormData {
    name: string;
    status: EventCategoryStatus;
  }