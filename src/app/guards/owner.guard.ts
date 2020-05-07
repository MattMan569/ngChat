import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { RoomService } from '../services/room.service';
import IRoom from 'types/room';
import IUser from 'types/user';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private authService: AuthService, private roomService: RoomService, private router: Router) { }

  // Only allow the owner of the room to access its configuration page
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const userId = this.authService.getUserId();
    const roomId = state.url.split('/').pop();

    const allowed = new Promise<boolean>(async (resolve, reject) => {
      const room = await (this.roomService.getRoom(roomId).pipe(first()).toPromise() as Promise<IRoom>);
      if ((room.owner as IUser)._id === userId) {
        resolve(true);
      } else {
        this.router.navigate(['/rooms']);
        resolve(false);
      }
    });

    return allowed;
  }
}
