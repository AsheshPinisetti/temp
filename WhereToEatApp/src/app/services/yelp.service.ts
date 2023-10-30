import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class YelpService {
    private readonly baseUrl = 'https://api.yelp.com/v3/businesses/search';
    private readonly proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    private readonly apiKey = environment.YELP_API_KEY;

    constructor(private http: HttpClient) { }

    mapToRestaurantInterface = (businesses: any[]): Restaurant[] => {
      return businesses.map(business => ({
        id: business.id,
        name: business.name,
        url: business.url,
        address: business.location.display_address.join(", "),
        categories: business.categories.map((category: any) => category.title).join(", "),
        img_url: business.image_url
      }));
    };

    getRestaurants(location: string, term: string = 'restaurant'): Observable<Restaurant[]> {
      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.apiKey}`
        })
      };

      const proxiedUrl = `${this.proxyUrl}${this.baseUrl}?term=${term}&location=${location}`;

      return this.http.get(proxiedUrl, httpOptions).pipe(
        map((response: any) => this.mapToRestaurantInterface(response.businesses))
      );
    }
  }
