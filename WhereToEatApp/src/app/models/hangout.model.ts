import { Restaurant } from './restaurant.model';

export interface Hangout {
    id?: string;
    active: boolean;
    name: string;
    location: string;
    description?: string;
    createdBy: string;
    participants: string[];
    restaurants?: Restaurant[];
  }
