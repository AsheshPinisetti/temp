import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Hangout } from 'src/app/models/hangout.model';
import { HangoutService } from 'src/app/services/hangout.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  hangoutForm: FormGroup;
  loading = false;
  activeHangouts$: Observable<Hangout[]>
  pastHangouts$: Observable<Hangout[]>
  constructor(
              public authService: AuthService,
              private formBuilder: UntypedFormBuilder,
              private hangoutService: HangoutService){}

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
  createNewHangout(){
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

      this.hangoutService.createHangout(hangout)
      this.loading = false;
    }
  }
}
