import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { InfoComponent } from '../dialogs/info/info.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, AfterViewInit {
  isLoading = false;
  isLoadingAvatar = false;
  avatarSpinnerDiameter: number;
  disableBioSave = true;
  bio: string;
  @ViewChild('avatar') avatar: ElementRef;
  @ViewChild('avatarInput') avatarInput: ElementRef;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;
  @ViewChild('bioInput') bioInput: ElementRef;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchAvatar();
    this.getUser();
  }

  ngAfterViewInit() {
    this.avatarSpinnerDiameter = (this.spinnerDiv.nativeElement as HTMLDivElement).offsetHeight;
    this.cdRef.detectChanges();
  }

  onBioChange() {
    const bioText = (this.bioInput.nativeElement as HTMLTextAreaElement).value;
    this.disableBioSave = this.bio !== bioText ? false : true;
  }

  async onSaveBio() {
    const bioText = (this.bioInput.nativeElement as HTMLTextAreaElement).value;
    const success =  await this.userService.updateBio(bioText);

    if (success) {
      this.openDialog('Your bio has been successfully updated');
    } else {
      this.openDialog('Could not update bio');
    }
  }

  async onAvatarChange(event: Event) {
    const file = (this.avatarInput.nativeElement as HTMLInputElement).files[0];
    if (file) {
      this.isLoadingAvatar = true;
      const result = await this.userService.uploadAvatar(file);
      this.isLoadingAvatar = false;

      if (result.error) {
        this.openDialog('Could not upload new avatar');
        console.error(result.error);
      } else {
        (this.avatar.nativeElement as HTMLImageElement).src = `data:image/png;base64,${result.base64Img}`;
      }
    }
  }

  private async fetchAvatar() {
    this.isLoadingAvatar = true;
    const result = await this.userService.getAvatar(this.authService.getUserId());

    if (!result) {
      this.openDialog('Could not get user avatar');
      console.error('Cannot get avatar of unauthenticated user');
    } else if (result.error) {
      this.openDialog(result.error);
      console.error(result.error);
    } else {
      (this.avatar.nativeElement as HTMLImageElement).src = `data:image/png;base64,${result.base64Img}`;
      this.isLoadingAvatar = false;
    }
  }

  private async getUser() {
    const user = await this.userService.getUser(this.authService.getUserId());

    if (!user) {
      console.error('Unable to get user');
      return;
    }

    // Ensure the bio is not undefined for proper equality checking
    this.bio = user.bio || '';
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
