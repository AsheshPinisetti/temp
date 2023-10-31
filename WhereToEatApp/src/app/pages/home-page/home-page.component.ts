import { Component, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LocationService } from 'src/app/core/services/location.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Hangout } from 'src/app/models/hangout.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { HangoutService } from 'src/app/services/hangout.service';
import { YelpService } from 'src/app/services/yelp.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  restaurants: Restaurant[] = [];
  selectedRestaurants: Restaurant[] = [];
  hangoutForm: FormGroup;
  loading = false;

  activeHangouts$: Observable<Hangout[]>
  pastHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private formBuilder: UntypedFormBuilder,
              private hangoutService: HangoutService,
              public notificationService: NotificationService,
              private yelpService: YelpService,
              private locationService: LocationService){}


  ngOnInit(): void {
    // this.loading = true;
    this.hangoutForm = this.formBuilder.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });


    this.authService.user$.subscribe(user => {
      this.activeHangouts$ = this.hangoutService.getActiveHangoutsForUser(user?.uid);
      this.pastHangouts$ = this.hangoutService.getPastHangoutsForUser(user?.uid);
    });


    // this.locationService.getUserLocation().subscribe({
    //   next: (coords: any) => {
    //     const location = `${coords.latitude},${coords.longitude}`;
    //     this.search(location);
    //   },
    //   error: (error) => {
    //     console.error('Error getting user location: ', error);
    //     this.notificationService.showNotification('error', 'Error getting user location.');
    //   }
    // });

  }

  async createNewHangout(){
    if (this.hangoutForm.valid) {
      this.loading = true;
      const hangout = {
        ...this.hangoutForm?.value,
        createdBy: this.authService?.userData?.uid,
        active: true,
        participants: [this.authService?.userData?.uid],
        restaurants: this.selectedRestaurants
      } as Hangout;

      const wasSuccessful = await this.hangoutService.createHangout(hangout);
      this.notificationService.showNotification(wasSuccessful ? 'success' : 'error', wasSuccessful ? 'Hangout created successfully!' : 'Failed to create hangout.');

      this.selectedRestaurants = [];
      this.restaurants = [];
      this.hangoutForm.reset();
      this.loading = false;
    }
  }

  search(location: string){
    this.loading = true;
    this.yelpService.getRestaurants(location).subscribe({
      next: (restaurants) =>{
        this.restaurants = restaurants;
        this.loading = false;
      },
      error: ()=>{
        this.notificationService.showNotification('error', 'No restaurants found.');
        this.loading = false;
      }
    })
  }

  addRestaurant(restaurant: Restaurant) {
    const updatedRestaurant = {...restaurant, added: true};
    this.selectedRestaurants.push(updatedRestaurant);
    this.restaurants = this.restaurants.map(r => (r.id === restaurant.id ? updatedRestaurant : r));
  }


  removeRestaurant(restaurant: Restaurant) {
    this. selectedRestaurants = this.selectedRestaurants.filter(r => r.id != restaurant.id);
    this.restaurants = this.restaurants.map(r =>
      r.id === restaurant.id ? {...r, added: false} : r
    );
  }
}
