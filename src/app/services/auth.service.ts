import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';
import IUser from 'types/user';
import ISignupData from 'types/signupData';
import ITokenPayload from 'types/tokenPayload';
import ILoginResponse from 'types/loginResponse';

const SERVER_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private authData: ITokenPayload;
  private authStatus = new BehaviorSubject<boolean>(false);
  private logoutTimer: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Returns an observable for the user's current auth status.
   * The observable will be updated whenever that status changes,
   * such as on login.
   */
  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  /**
   * Get the user's most recent access token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get the user's id
   */
  getUserId() {
    return this.authData?._id;
  }

  // TODO error popup
  /**
   * Create a new user account
   */
  signup(username: string, email: string, password: string, avatar?: File) {
    const signupData: ISignupData = {
      username,
      email,
      password,
      avatar,
    };

    this.http.post<IUser>(`${SERVER_URL}/signup`, signupData)
      .subscribe(() => {
        this.router.navigate(['/auth/login']);
      }, () => {
        this.authStatus.next(false);
      });
  }

  /**
   * Login to an existing account.
   * The promise resolves without a value on success,
   * otherwise it resolves with the error message.
   */
  login(username: string, password: string) {
    const loginData = {
      username,
      password,
    };

    // Attempt to login
    // On success, set auth info and redirect to room listing
    // On failure, resolve the promise with the error message
    return new Promise<string>((resolve, reject) => {
      this.http.post<ILoginResponse>(`${SERVER_URL}/login`, loginData)
        .subscribe((response) => {
          resolve();
          this.token = response.token;
          this.authData = response.payload;
          this.authStatus.next(true);
          this.saveAuthData();
          this.setLogoutTimer();
          this.router.navigate(['/']);
        }, (error: HttpErrorResponse) => {
          resolve(error.error);
          console.error(error);
          this.authStatus.next(false);
        });
    });
  }

  /**
   * Logout and clear client-side auth data
   */
  logout() {
    this.token = null;
    this.authData = null;
    this.authStatus.next(false);
    this.router.navigate(['/auth/login']);
    this.clearAuthData();
    clearTimeout(this.logoutTimer);
  }

  /**
   * Automatically authenticate the user,
   * if their auth data is present
   */
  autoAuthUser() {
    const authData = this.getAuthData();

    if (!authData) {
      return;
    }

    const expiresIn = new Date(authData.payload.expires).getTime() - Date.now();

    // If the token has not yet expires, authenticate
    if (expiresIn > 0) {
      this.token = authData.token;
      this.authData = authData.payload;
      this.authStatus.next(true);
      this.setLogoutTimer();
    }
  }

  /**
   * Save the user's auth data to local storage
   */
  private saveAuthData() {
    localStorage.setItem('token', this.token);
    localStorage.setItem('username', this.authData.username);
    localStorage.setItem('email', this.authData.email);
    localStorage.setItem('_id', this.authData._id);
    localStorage.setItem('expires', this.authData.expires);
  }

  /**
   * Retrieve the user's auth data from local storage
   */
  private getAuthData(): ILoginResponse {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('_id');
    const expires = localStorage.getItem('expires');

    // Ensure all values were retrieved
    if (!token || !username || !email || !id || !expires) {
      return;
    }

    const payload: ITokenPayload = {
      username,
      email,
      _id: id,
      expires,
    };

    return {
      token,
      payload,
    };
  }

  /**
   * Removes the user's auth data from local storage
   */
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('_id');
    localStorage.removeItem('expires');
  }

  // TODO refresh tokens
  /**
   * Logout when the user's access token expires
   */
  private setLogoutTimer() {
    const expiresIn = new Date(this.authData.expires).getTime() - Date.now();

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, expiresIn);
  }
}
