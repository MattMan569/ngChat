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
  private accessToken: string;
  private authData: ITokenPayload;
  private authStatus = new BehaviorSubject<boolean>(false);
  private refreshTimer: ReturnType<typeof setTimeout>;

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
   * Get the user's most recent access token with its expiry time
   */
  getToken(): { accessToken: string, expires: string } {
    return {
      accessToken: this.accessToken,
      expires: this.authData?.expires,
    };
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

    return new Promise<string>((resolve) => {
      this.http.post<IUser>(`${SERVER_URL}/signup`, signupData)
        .subscribe(() => {
          resolve();
          this.router.navigate(['/auth/login']);
        }, (error: HttpErrorResponse) => {
          resolve(error.error);
          this.authStatus.next(false);
        });
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
      this.http.post<ILoginResponse>(`${SERVER_URL}/login`, loginData, { withCredentials: true })
        .subscribe((response) => {
          resolve();
          this.accessToken = response.accessToken;
          this.authData = response.payload;
          this.authStatus.next(true);
          this.saveAuthData();
          this.setRefreshTimer();
          this.router.navigate(['/']);
        }, (error: HttpErrorResponse) => {
          resolve(error.error);
          this.authStatus.next(false);
        });
    });
  }

  /**
   * Logout and clear client-side auth data
   */
  logout() {
    this.accessToken = null;
    this.authData = null;
    this.authStatus.next(false);
    this.router.navigate(['/auth/login']);
    this.clearAuthData();
    clearTimeout(this.refreshTimer);
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

    this.accessToken = authData.accessToken;
    this.authData = authData.payload;
    this.authStatus.next(true);
    this.setRefreshTimer();
  }

  /**
   * Get a new access token from the server.
   */
  refreshAccessToken() {
    const httpOb = this.http.post<{ accessToken: string, expires: string }>(`${SERVER_URL}/token`, null, { withCredentials: true });

    httpOb.subscribe((response) => {
      this.accessToken = response.accessToken;
      this.authData.expires = response.expires;
      this.saveAuthData();
      this.setRefreshTimer();
    });

    return httpOb;
  }

  /**
   * Save the user's auth data to local storage
   */
  private saveAuthData() {
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('username', this.authData.username);
    localStorage.setItem('email', this.authData.email);
    localStorage.setItem('_id', this.authData._id);
    localStorage.setItem('expires', this.authData.expires);
  }

  /**
   * Retrieve the user's auth data from local storage
   */
  private getAuthData(): ILoginResponse {
    const accessToken = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('_id');
    const expires = localStorage.getItem('expires');

    // Ensure all values were retrieved
    if (!accessToken || !username || !email || !id || !expires) {
      return;
    }

    const payload: ITokenPayload = {
      username,
      email,
      _id: id,
      expires,
    };

    return {
      accessToken,
      payload,
    };
  }

  /**
   * Removes the user's auth data from local storage
   */
  private clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('_id');
    localStorage.removeItem('expires');
  }

  /**
   * Automatically refresh the access token shortly before it expires
   */
  private setRefreshTimer() {
    // If the token has already expired, refresh it immediately
    if (this.tokenNeedsToBeRefreshed()) {
      this.refreshAccessToken();
      return;
    }

    // Get the timer value by subtracting the current time with the margin from the expiry time
    const refreshTime = new Date(this.authData.expires).getTime() - (new Date().getTime() + environment.autoRefreshTokenTimeMargin);

    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  /**
   * Returns true if the tokens expiry time has already passed
   * or is within the auto refresh margin
   */
  private tokenNeedsToBeRefreshed = () => {
    const now = new Date().getTime();
    const expiry = new Date(this.authData.expires).getTime();

    return expiry <= now - environment.autoRefreshTokenTimeMargin;
  }
}
