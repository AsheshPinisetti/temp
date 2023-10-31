import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  constructor(
    private route: ActivatedRoute,
    private hangoutService: HangoutService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const hangoutId = params['id'];
      console.log(hangoutId)
      this.hangoutService.getHangout(hangoutId).subscribe(hangout => {
        this.hangout = hangout;
        this.participantsNames = hangout.participants.map((user: User) => user.displayName).join(',');
        this.loading = false;
      });
    });
  }

  vote(restaurant: Restaurant) {
    // Voting logic here, maybe an API call to update the state?
    console.log(`Voted for ${restaurant.name}`);
  }
}