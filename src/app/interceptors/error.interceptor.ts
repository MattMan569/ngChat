import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DialogComponent } from './../dialog/dialog.component';

// Set the request's Authorization header with the user's token
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(catchError((error: HttpErrorResponse) => {
      const message = error.error || 'An unknown error has occurred';

      // TODO popup for errors, but not form errors; display those in the forms themselves
      // const dialogRef = this.dialog.open(ErrorComponent, { data: message, hasBackdrop: false, position: { top: '2rem' } });

      // setTimeout(() => {
      //   dialogRef.close();
      // }, 1000);

      return throwError(error);
    }));
  }
}
