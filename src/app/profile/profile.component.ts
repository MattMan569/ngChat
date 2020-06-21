import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  isLoading = false;
  isLoadingAvatar = true;
  username: string;
  avatarSpinnerDiameter: number;
  @ViewChild('avatar') avatar: ElementRef;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) { }

  async ngOnInit() {
    this.getUser();
  }

  private async getUser() {
    this.isLoadingAvatar = true;
    let userId = this.route.snapshot.queryParams.id;

    // If no user id in the query params,
    // then the user is viewing their own profile
    if (!userId) {
      // No id and not logged in, cannot load a profile
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.username = this.authService.getUsername();
      userId = this.authService.getUserId(); // Get the id for the avatar call
    } else {
      const result = await this.userService.getUsername(userId);

      if (!result) {
        // TODO popup, invalid id
        return console.error('invalid id');
      }

      this.username = result;
    }

    const avatarResult = await this.userService.getAvatar(userId);

    if (!avatarResult) {
      // TODO popup
      console.error('Cannot get avatar of unauthenticated user');
    } else if (avatarResult.error) {
      // TODO popup
      console.error(avatarResult.error);
    } else {
      (this.avatar.nativeElement as HTMLImageElement).src = `data:image/png;base64,${avatarResult.base64Img}`;
      this.isLoadingAvatar = false;
    }
  }
}
