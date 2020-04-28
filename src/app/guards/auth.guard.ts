import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  // Allow activation if the user is authenticated.
  // If not authenticated, redirect to login page.
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    // pipe(first()) to complete the observable on the first value, allowing the promise to complete
    // https://github.com/ReactiveX/rxjs/issues/2536
    return this.authService.getAuthStatus().pipe(first()).toPromise().then((authStatus) => {
      if (!authStatus) {
        this.router.navigate(['/auth/login']);
      }
      return authStatus;
    });
  }
}
