import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';

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
  // TODO true if current value is different from initial fetched from server
  // set after content from server has been fetched
  disableAboutSave = true;
  @ViewChild('avatar') avatar: ElementRef;
  @ViewChild('avatarInput') avatarInput: ElementRef;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;

  constructor(private userService: UserService, private authService: AuthService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchAvatar();
  }

  ngAfterViewInit() {
    this.avatarSpinnerDiameter = (this.spinnerDiv.nativeElement as HTMLDivElement).offsetHeight;
    this.cdRef.detectChanges();
  }

  onSaveBio() {

  }

  async onAvatarChange(event: Event) {
    const file = (this.avatarInput.nativeElement as HTMLInputElement).files[0];
    if (file) {
      this.isLoadingAvatar = true;
      const result = await this.userService.uploadAvatar(file);
      this.isLoadingAvatar = false;

      if (result.error) {
        // TODO popup
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
      // TODO popup
      console.error('Cannot get avatar of unauthenticated user');
    } else if (result.error) {
      // TODO popup
      console.error(result.error);
    } else {
      (this.avatar.nativeElement as HTMLImageElement).src = `data:image/png;base64,${result.base64Img}`;
      this.isLoadingAvatar = false;
    }
  }
}
