import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, retryWhen, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Sources:
// https://angular-academy.com/angular-jwt/#http-interceptor
// https://www.intertech.com/Blog/angular-4-tutorial-handling-refresh-token-with-new-httpinterceptor/

// Set the request's Authorization header with the user's token
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private accessTokenSubject = new BehaviorSubject<string>(null);

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    const authReq = this.addAuthHeader(req, token.accessToken);

    return next.handle(authReq).pipe(catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            return this.handle401(authReq, next);
          default:
            return throwError(error);
        }
      } else {
        return throwError(error);
      }
    }));
  }

  /** Creates a clone of the passed request with the authorization header added */
  private addAuthHeader(req: HttpRequest<any>, token: string) {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler) {
    // Do not handle login errors
    if (req.url.includes('/api/user/login')) {
      return next.handle(req);
    }

    // Wait for the token to refresh then add it to the req's header
    if (this.isRefreshingToken) {
      return this.accessTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token: string) => {
          const refreshedReq = this.addAuthHeader(req, token);
          return next.handle(refreshedReq);
        }),
      );
    }

    // Request for the token to be refreshed

    this.isRefreshingToken = true;
    this.accessTokenSubject.next(null);

    return this.authService.refreshAccessToken().pipe(
      switchMap((response) => {
        this.isRefreshingToken = false;
        this.accessTokenSubject.next(response.accessToken);
        const unauthorizedReq = this.addAuthHeader(req, response.accessToken);
        return next.handle(unauthorizedReq);
      }),
    );
  }
}
