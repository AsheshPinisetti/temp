import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user.model';
import { HangoutService } from 'src/app/services/hangout.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-join-hangout',
  templateUrl: './join-hangout.component.html',
  styleUrls: ['./join-hangout.component.scss']
})
export class JoinHangoutComponent {
  hangoutForm: FormGroup;
  loading: boolean = false;

  user: User | undefined | null
  constructor(
    private fb: FormBuilder,
    private hangoutService: HangoutService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService){ }

  ngOnInit(): void {
    this.hangoutForm = this.fb.group({
      hangoutId: ['', [Validators.required]]
    });

    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  joinHangout() {
    if(this.user)
    {

      this.hangoutService.joinHangout(this.hangoutForm?.value['hangoutId'], this.user?.uid)
        .then(hangoutId => {
          if (hangoutId) {
            this.router.navigate(['/hangout', hangoutId]);
            this.notificationService.showNotification('success',`Successfully joined hangout with ID: ${this.hangoutForm?.value['hangoutId']}`);
          } else {
            this.notificationService.showNotification('error',`Failed to join hangout.`);
          }
        })
        .catch(err => {
          console.error(`Error: ${err}`);
        });

    }
  }
}
