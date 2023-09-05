import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
  ) { }
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
  });
  }

  get f() { return this.registerForm?.controls; }
  register(){
    this.loading = true;
    this.authService.SignUp(this.f?.['username']?.value, this.f?.['password']?.value)
      .finally(() => {
        this.loading = false;
      });
  }
}
