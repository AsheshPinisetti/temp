import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private http: HttpClient) {}

  getUserLocation(): Observable<any> {
    return new Observable(observer => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            observer.next(position.coords);
            observer.complete();
          },
          error => observer.error(error)
        );
      } else {
        observer.error('Geolocation is not available in this browser.');
      }
    });
  }
}
