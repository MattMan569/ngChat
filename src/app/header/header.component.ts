import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authSub = this.authService.getAuthStatus().subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
