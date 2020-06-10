import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  avatar: string;
  private authSub: Subscription;

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit(): void {
    this.authSub = this.authService.getAuthStatus().subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
    });

    this.userService.getAvatar().then((avatar) => {
      if (avatar) {
        this.avatar = `data:image/png;base64,${avatar.base64Img}`;
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
