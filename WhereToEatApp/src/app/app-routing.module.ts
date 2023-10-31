import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AuthGuard } from './auth/auth-guard';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { AutoLogin } from './auth/auto-login';
import { HangoutPageComponent } from './pages/hangout-page/hangout-page.component';


const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [AutoLogin]
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    canActivate: [AutoLogin]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
    canActivate: [AutoLogin]
  },
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'hangout/:id',
    component: HangoutPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
