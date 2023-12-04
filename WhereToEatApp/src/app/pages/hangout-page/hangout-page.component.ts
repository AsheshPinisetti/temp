import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

  private subscriptions = new Subscription();
  loading = false;
  hangout: HangoutWithUsers;
  participantsNames: string;
  winnerRestaurant: Restaurant | null | undefined;
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

    this.subscriptions.add(    this.route.params.subscribe(params => {
      const hangoutId = params['id'];
      this.hangoutService.getHangout(hangoutId).subscribe(hangout => {
      this.hangout = hangout;
      // First, find the maximum number of votes
      const maxVotes = Math.max(...this.hangout.restaurants?.map(r => r.votes?.length || 0) || [0]);

      // Then, filter the restaurants that have this number of votes
      const winners = this.hangout.restaurants?.filter(r => (r.votes?.length || 0) === maxVotes);

      // Assign the winner if and only if there is exactly one restaurant with the maximum votes
      this.winnerRestaurant = winners && winners.length === 1 ? winners[0] : null;
        this.participantsNames = hangout.participants.map((user: User) => user.displayName).join(', ');
        this.loading = false;
      });
    }));

    this.subscriptions.add(this.authService.user$.subscribe(user => {
      this.user = user;
    }));
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}