import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class AuthService {
    // ... Other authentication methods
    isLoggedIn(): boolean {
      return false
    }
  }