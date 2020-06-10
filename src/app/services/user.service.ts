import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

const SERVER_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private authService: AuthService, private http: HttpClient) { }

  /**
   * Uploads the provided file to AWS S3 as the user's new avatar.
   * Resolves to an object with the error and base64Img fields.
   * Error is only populated if an error occurred, likewise base64Img
   * is only populated on success.
   */
  async uploadAvatar(file: File): Promise<{ error?: string, base64Img?: string }> {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return new Promise((resolve) => {
      this.http.post(`${SERVER_URL}/avatar`, formData)
        .subscribe((base64Img: string) => {
          resolve({ base64Img });
        }, (error: HttpErrorResponse) => {
          resolve({ error: error.error });
        });
    });
  }

  /**
   * Get the avatar of the specified user.
   * If no user is specified, uses the currently logged in user instead.
   */
  async getAvatar(userId?: string): Promise<{ error?: string, base64Img?: string }> {
    return new Promise((resolve) => {
      if (!userId) {
        userId = this.authService.getUserId();
      }

      this.http.get(`${SERVER_URL}/avatar/${userId}`)
        .subscribe((base64Img: string) => {
          resolve({ base64Img });
        }, (error: HttpErrorResponse) => {
          resolve({ error: error.error });
        });
    });
  }
}
