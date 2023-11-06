import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class YelpService {
  private readonly baseUrl = '/api/yelp';

  constructor(private http: HttpClient) { }

  mapToRestaurantInterface = (businesses: any[]): Restaurant[] => {
    return businesses.map(business => ({
      id: business.id,
      name: business.name,
      url: business.url,
      address: business.location.display_address.join(", "),
      categories: business.categories.map((category: any) => category.title).join(", "),
      img_url: business.image_url,
      added: false,
    }));
  };

  getRestaurants(location: string, term: string = 'restaurant'): Observable<Restaurant[]> {
    const url = `${this.baseUrl}?endpoint=businesses/search&term=${term}&location=${location}&limit=50`;

    return this.http.get(url).pipe(
      map((response: any) => this.mapToRestaurantInterface(response.businesses))
    );
  }
}
