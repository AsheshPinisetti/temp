import { Restaurant } from './restaurant.model';
import { User } from './user.model';

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

export interface HangoutWithUsers {
  id?: string;
  active: boolean;
  name: string;
  location: string;
  description?: string;
  createdBy: User;
  participants: User[];
  restaurants?: Restaurant[];
}
