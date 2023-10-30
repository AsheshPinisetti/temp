import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription, catchError, debounceTime, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
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
  hangoutForm: FormGroup;
  loading = false;

  activeHangouts$: Observable<Hangout[]>
  pastHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private formBuilder: UntypedFormBuilder,
              private hangoutService: HangoutService,
              public notificationService: NotificationService,
              private yelpService: YelpService){}


  ngOnInit(): void {
    this.hangoutForm = this.formBuilder.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });


    this.authService.user$.subscribe(user => {
      this.activeHangouts$ = this.hangoutService.getActiveHangoutsForUser(user?.uid);
      this.pastHangouts$ = this.hangoutService.getPastHangoutsForUser(user?.uid);
    });

  }

  async createNewHangout(){
    console.log('Form values:', this.hangoutForm.value);
    if (this.hangoutForm.valid) {
      this.loading = true;
      const hangout = {
        ...this.hangoutForm?.value,
        createdBy: this.authService?.userData?.uid,
        active: true,
        participants: [this.authService?.userData?.uid],
        restaurants: []
      } as Hangout;

      const wasSuccessful = await this.hangoutService.createHangout(hangout);
      if (wasSuccessful) {
        this.hangoutForm.reset();
        this.notificationService.showNotification('success', 'Hangout created successfully!');
        this.loading = false;
      } else {
        this.hangoutForm.reset();
        this.notificationService.showNotification('error', 'Failed to create hangout.');
        this.loading = false;
      }
    }
  }

  search(location: string){
    this.yelpService.getRestaurants(location).subscribe({
      next: (restaurants) =>{
        this.restaurants = restaurants;
      },
      error: ()=>{
        console.log('error')
      }
    })
  }
}
