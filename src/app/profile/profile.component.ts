import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { InfoComponent } from '../dialogs/info/info.component';
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
  bio: string;
  avatarSpinnerDiameter: number;
  @ViewChild('avatar') avatar: ElementRef;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog) { }

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

      // this.username = this.authService.getUsername();
      userId = this.authService.getUserId(); // Get the id for the avatar call
    }

    const result = await this.userService.getUser(userId);

    if (!result) {
      return this.openDialog('Invalid user ID');
    }

    this.username = result.username;
    this.bio = result.bio;

    const avatarResult = await this.userService.getAvatar(userId);

    if (!avatarResult) {
      this.openDialog('Cannot get avatar of unauthenticated user');
    } else if (avatarResult.error) {
      this.openDialog(avatarResult.error);
    } else {
      (this.avatar.nativeElement as HTMLImageElement).src = `data:image/png;base64,${avatarResult.base64Img}`;
      this.isLoadingAvatar = false;
    }
  }

  /**
   * Create a dialog
   */
  private openDialog = (message: string, durationMs: number = 3000) => {
    const dialogRef = this.dialog.open(InfoComponent, {
      data: message,
      hasBackdrop: false,
      panelClass: 'custom-dialog',
      position: { top: '2rem' },
    });

    setTimeout(() => {
      dialogRef.close();
    }, durationMs);
  }
}
