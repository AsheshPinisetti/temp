import { Component, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
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
export class HomePageComponent implements OnDestroy{

  loading = false;
  private subs: Subscription[] = [];
  activeHangouts$: Observable<Hangout[]>
  pastHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private hangoutService: HangoutService,
              public notificationService: NotificationService){}


  ngOnInit(): void {
    // this.loading = true;

    const authSub = this.authService.user$.subscribe(user => {
      this.activeHangouts$ = this.hangoutService.getActiveHangoutsForUser(user?.uid);
      this.pastHangouts$ = this.hangoutService.getPastHangoutsForUser(user?.uid);
    });
    this.subs.push(authSub);

  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
