import { Component, OnInit } from '@angular/core';
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
  username: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) { }

  async ngOnInit() {
    this.getUsername();
  }

  private getUsername = async () => {
    const routeSnapshot = this.route.snapshot;

    if (!routeSnapshot.queryParams.id) {
      // No id and not logged in, cannot load a profile
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.username = this.authService.getUsername();
    } else {
      const result = await this.userService.getUsername(routeSnapshot.queryParams.id);

      if (!result) {
        // TODO popup, invalid id
        return console.error('invalid id');
      }

      this.username = result;
    }
  }
}
