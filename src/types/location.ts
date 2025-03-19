// src/types/location.ts
export interface Location {
    id: string;
    name: string;
    addressId?: string;
    address?: {
      id: string;
      street: {
        id: string;
        name: string;
      };
      number: string;
      complement?: string;
      zipCode: string;
      city: {
        id: string;
        name: string;
        state: {
          id: string;
          name: string;
          uf: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LocationFormData {
    name: string;
    street?: string;
    number?: string;
    complement?: string;
    zipCode?: string;
    city?: string;
    state?: string;
  }