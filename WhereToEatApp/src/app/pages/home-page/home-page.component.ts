import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  hangoutForm: FormGroup;
  loading = false;

  constructor(public afAuth: AngularFireAuth, public authService: AuthService, private formBuilder: UntypedFormBuilder,){}

  createNewHangout(){}
}
