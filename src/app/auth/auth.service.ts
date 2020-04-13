import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { environment } from './../../environments/environment';
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

  constructor(private http: HttpClient, private router: Router) { }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }

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

  login(username: string, password: string) {
    const loginData = {
      username,
      password,
    };

    this.http.post<ILoginResponse>(`${SERVER_URL}/login`, loginData)
      .subscribe((response) => {
        this.token = response.token;
        this.authData = response.payload;
        this.authStatus.next(true);
        this.saveAuthData();
        this.router.navigate(['/']);
      }, () => {
        this.authStatus.next(false);
      });
  }

  logout() {
    this.token = null;
    this.authData = null;
    this.authStatus.next(false);
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  // Automatically authenticate the user, if possible
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
    }
  }

  // Save user's auth data to local storage
  private saveAuthData() {
    localStorage.setItem('token', this.token);
    localStorage.setItem('username', this.authData.username);
    localStorage.setItem('email', this.authData.email);
    localStorage.setItem('_id', this.authData._id);
    localStorage.setItem('expires', this.authData.expires);
  }

  // Retrieve the user's auth data from local storage
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

  // Remove the user's authorization data from localstorage
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('_id');
    localStorage.removeItem('expires');
  }
}
