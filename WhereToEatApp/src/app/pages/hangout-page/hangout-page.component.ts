import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Hangout, HangoutWithUsers } from 'src/app/models/hangout.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { User } from 'src/app/models/user.model';
import { HangoutService } from 'src/app/services/hangout.service';

@Component({
  selector: 'app-hangout',
  templateUrl: './hangout-page.component.html',
  styleUrls: ['./hangout-page.component.scss']
})
export class HangoutPageComponent {

  loading = false;
  hangout: HangoutWithUsers;
  participantsNames: string;
  user: User | null | undefined;
  constructor(
    private route: ActivatedRoute,
    private hangoutService: HangoutService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const hangoutId = params['id'];
      this.hangoutService.getHangout(hangoutId).subscribe(hangout => {
        this.hangout = hangout;
        this.participantsNames = hangout.participants.map((user: User) => user.displayName).join(', ');
        this.loading = false;
      });
    });

    this.authService.user$.subscribe(user => {
      this.user = user
      console.log(this.user?.uid)
    });
  }

  isCreator(){
    return this.user?.uid === this.hangout.createdBy.uid
  }

  vote(restaurant: Restaurant) {
    if(this.user && this.hangout.id){
      this.hangoutService.castVote(this.user?.uid, this.hangout?.id, restaurant?.id)
    }
  }

  getEncodedAddress(address: string): string {
    return encodeURIComponent(address);
  }

  async endHangout(){
    if(this.hangout.id){
      const result = await this.hangoutService.deactivateHangout(this.hangout.id);
      if(result){
        this.notificationService.showNotification('success', `Hangout has been deactivated.`)
        this.router.navigate(['home']);
        return
      }
    }

    this.notificationService.showNotification('error', `Failed to deactivate hangout.`)
  }
}