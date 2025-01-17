import { Injectable, NgZone } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { NotificationService } from '../core/services/notification.service';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { FirebaseError } from 'firebase/app';

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {

    userData: any; // Save logged in user data
    user$: Observable<User| null | undefined>;
    authStateSubscription: Subscription | undefined;
    constructor(
      public afs: AngularFirestore, // Inject Firestore service
      public afAuth: AngularFireAuth, // Inject Firebase auth service
      public router: Router,
      public ngZone: NgZone,
      public notificationService: NotificationService
    ) {

      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          JSON.parse(localStorage.getItem('user')!);
        } else {
          localStorage.setItem('user', 'null');
          JSON.parse(localStorage.getItem('user')!);
        }
      });

      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
          if(user) {
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          }
          else{
            return of(null);
          }
        })
      );
    }

    // Sign in with email/password
    SignIn(email: string, password: string) {
      return this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then((result) => {
          if (!result.user?.emailVerified) {
            this.unsubscribeAuthState(); // Unsubscribe if already subscribed
            const customError = new FirebaseError('auth/user-disabled', 'This account has not been verified.');
            throw customError;
          }
          this.handleSuccessfulLogin();
        })
        .catch((error) => {
          this.unsubscribeAuthState(); // Unsubscribe if already subscribed
          const errorMessage = this.getErrorMessageForCode(error.code);
          this.SignOut();
          this.notificationService.showNotification('error', errorMessage);
        });
    }

    handleSuccessfulLogin() {
      this.unsubscribeAuthState(); // Unsubscribe if already subscribed
      this.authStateSubscription = this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.notificationService.showNotification('success', 'Welcome back!');
          this.router.navigate(['home']);
        }
      });
    }

    unsubscribeAuthState() {
      if (this.authStateSubscription) {
        this.authStateSubscription.unsubscribe();
      }
    }

    // Sign up with email/password
    SignUp(email: string, password: string, name: string) {
      return this.afAuth
        .createUserWithEmailAndPassword(email, password)
        .then((result) => {
          if (this.authStateSubscription) {
            this.authStateSubscription.unsubscribe();
          }
          this.notificationService.showNotification('success', 'Account registered successfully. Check your inbox to verify your email.');
          this.SendVerificationEmail();
          this.SetUserData(result.user, name);
        })
        .catch((error) => {
          const errorMessage = this.getErrorMessageForCode(error.code);
          this.notificationService.showNotification('error', errorMessage);
        });
    }
    // Send email verification when new user sign up
    SendVerificationEmail() {
      return this.afAuth.currentUser
        .then((u: any) => u.sendEmailVerification())
        .then(() => {
          this.router.navigate(['verify-email-address']);
        });
    }
    // Forgot password
    ForgotPassword(passwordResetEmail: string) {
      return this.afAuth
        .sendPasswordResetEmail(passwordResetEmail)
        .then(() => {
          this.notificationService.showNotification('success', 'Password reset email sent, check your inbox.');
        })
        .catch((error) => {
          this.notificationService.showNotification('error', error?.message);
        });
    }
    // Returns true when user is looged in and email is verified
    get isLoggedIn(): boolean {
      const user = JSON.parse(localStorage.getItem('user')!);
      return user !== null && user.emailVerified !== false ? true : false;
    }
    /* Setting up user data when sign in with username/password,
    sign up with username/password and sign in with social auth
    provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
    SetUserData(user: any, name: string) {
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(
        `users/${user.uid}`
      );
      const userData: User = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      return userRef.set(userData, {
        merge: true,
      });
    }
    // Sign out
    SignOut() {
      return this.afAuth.signOut().then(() => {
        localStorage.removeItem('user');
        this.router.navigate(['sign-in']);
      });
    }

    private getErrorMessageForCode(errorCode: string): string {
      switch (errorCode) {
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/user-disabled':
          return 'This account has not been verified.';
        case 'auth/user-not-found':
          return 'User not found. Please check your email and password.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/weak-password':
          return 'Password is too weak. Please choose a stronger password.';
        case 'auth/email-already-in-use':
          return 'The email address is already in use by another account.'
        // Add more cases for other error codes as needed
        default:
          return 'An error occurred. Please try again later.';
      }
    }
  }