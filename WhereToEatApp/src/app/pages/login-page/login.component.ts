import { Component } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent {


  loginForm: FormGroup;
  loading = false;

  constructor(
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
        username: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm?.controls; }

  login() {
    this.loading = true;
    this.authService.SignIn(this.f?.['username']?.value, this.f?.['password']?.value)
      .finally(() => {
        this.loading = false;
      });
  }
}
