import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

const SERVER_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private base64Avatar: string; // TODO clear on logout to prevent wrong avatar when logging in as a different user
  private avatarUpdated = new Subject<null>();

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
          this.base64Avatar = base64Img;
          resolve({ base64Img });
          this.avatarUpdated.next();
        }, (error: HttpErrorResponse) => {
          resolve({ error: error.error });
        });
    });
  }

  /**
   * Updates the user's bio.
   * Returns true on success, false otherwise.
   */
  async updateBio(bio: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post(`${SERVER_URL}/bio`, { bio })
        .subscribe(() => {
          resolve(true);
        }, (error: HttpErrorResponse) => {
          console.error(error);
          resolve(false);
        });
    });
  }

  /**
   * Get the avatar of the specified user.
   * If no user is specified, uses the currently logged in user instead
   * and will return false if the user is not currently logged in.
   */
  async getAvatar(userId?: string): Promise<false | { error?: string, base64Img?: string }> {
    let updateThisAvatar = false;

    return new Promise((resolve) => {
      if (!userId) {
        // Return the avatar if it has previously been retrieved
        if (this.base64Avatar) {
          return resolve({ base64Img: this.base64Avatar });
        }

        if (!this.authService.isLoggedIn()) {
          return resolve(false);
        }

        userId = this.authService.getUserId();
        updateThisAvatar = true;
      }

      this.http.get(`${SERVER_URL}/avatar/${userId}`)
        .subscribe((base64Img: string) => {
          if (updateThisAvatar) {
            this.base64Avatar = base64Img;
          }
          resolve({ base64Img });
        }, (error: HttpErrorResponse) => {
          resolve({ error: error.error });
        });
    });
  }

  /**
   * Clear the client-side stored avatar
   */
  clearAvatar() {
    this.base64Avatar = null;
  }

  /**
   * Get an observable that will update
   * the user's avatar has been updated
   */
  getAvatarUpdated(): Observable<null> {
    return this.avatarUpdated.asObservable();
  }

  /**
   * Get the username for a user id.
   * Returns the username on success, false otherwise.
   */
  async getUsername(userId: string): Promise<false | string> {
    return new Promise((resolve) => {
      if (!userId) {
        resolve(false);
      }

      this.http.get(`${SERVER_URL}/${userId}`)
        .subscribe((username: string) => {
          resolve(username);
        }, () => {
          resolve(false);
        });
    });
  }

  /**
   * Get the username and bio for a user id.
   * Returns the info on success, false otherwise.
   */
  async getUser(userId: string): Promise<false | { username: string, bio: string }> {
    return new Promise((resolve) => {
      if (!userId) {
        resolve(false);
      }

      this.http.get<{ username: string, bio: string }>(`${SERVER_URL}/${userId}`)
        .subscribe((data) => {
          resolve({
            username: data.username,
            bio: data.bio,
          });
        }, () => {
          resolve(false);
        });
    });
  }
}
