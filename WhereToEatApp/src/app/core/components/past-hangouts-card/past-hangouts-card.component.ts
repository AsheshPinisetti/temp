import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/auth/auth.service';
import { Hangout } from 'src/app/models/hangout.model';
import { HangoutService } from 'src/app/services/hangout.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-past-hangouts-card',
  templateUrl: './past-hangouts-card.component.html',
  styleUrls: ['./past-hangouts-card.component.scss']
})
export class PastHangoutsCardComponent {
  loading = false;
  private subs: Subscription[] = [];
  pastHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private hangoutService: HangoutService,
              public notificationService: NotificationService){}


  ngOnInit(): void {
    this.loading = true;

    const authSub = this.authService.user$.subscribe(user => {
      this.pastHangouts$ = this.hangoutService.getPastHangoutsForUser(user?.uid);
      this.loading = false;
    });
    this.subs.push(authSub);

  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
