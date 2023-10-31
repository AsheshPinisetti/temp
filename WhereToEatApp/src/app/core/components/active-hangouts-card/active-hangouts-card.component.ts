import { Component } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Hangout } from 'src/app/models/hangout.model';
import { HangoutService } from 'src/app/services/hangout.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-active-hangouts-card',
  templateUrl: './active-hangouts-card.component.html',
  styleUrls: ['./active-hangouts-card.component.scss']
})
export class ActiveHangoutsCardComponent {
  loading = false;
  private subs: Subscription[] = [];
  activeHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private hangoutService: HangoutService,
              public notificationService: NotificationService){}


  ngOnInit(): void {
    this.loading = true;
    const authSub = this.authService.user$.subscribe(user => {
      this.activeHangouts$ = this.hangoutService.getActiveHangoutsForUser(user?.uid);
      this.loading = false;
    });
    this.subs.push(authSub);

  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
