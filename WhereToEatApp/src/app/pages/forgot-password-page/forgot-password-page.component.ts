import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {
  email: string = '';
  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  resetPassword(){
    this.authService.ForgotPassword(this.email);
  }
}
