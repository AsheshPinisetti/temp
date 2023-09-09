import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {
  passwordForm: FormGroup;
  loading = false;
  constructor(
    public authService: AuthService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.passwordForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
    });
  }
  get f() { return this.passwordForm?.controls; }

  resetPassword(){
    this.loading = true;
    this.authService.ForgotPassword(this.f?.['username']?.value)
    .finally(() =>{
      this.loading = false;
    });
  }
}
