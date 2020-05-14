import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import IRoom from 'types/room';
import { RoomService } from '../services/room.service';
import { AuthService } from '../services/auth.service';
import IUser from 'types/user';
import { PasswordComponent } from '../dialogs/password/password.component';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: IRoom[] = [];
  isLoading = false;
  isAuthenticated = false;
  userId: string = null;
  search = '';
  @ViewChild('inputEl') input: ElementRef;
  private roomsSub: Subscription;

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private passwordDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.authService.getAuthStatus().subscribe((authStatus) => {
      this.isAuthenticated = authStatus;
    });
    this.roomsSub = this.roomService.getRoomsUpdated().subscribe((rooms) => {
      this.rooms = rooms;
      this.isLoading = false;
    });
    this.roomService.getRooms();

    // TODO remove
    const userId = this.authService.getUserId();
    this.roomService.joinRoom('5eb36bcf37a93744143d51ba', 'pass');
  }

  async onSearch() {
    this.search = (this.input.nativeElement as HTMLInputElement).value;

    // TODO search mode based on if search el has focus

    // Empty search by user deletion
    // Repopulate rooms by default get-all
    if (!this.search) {
      // FIXME re-renders search bar, removing focus
      // probably a problem with the ngIf condition
      this.isLoading = true;
      return this.roomService.getRooms();
    }

    this.isLoading = true;
    this.rooms = await this.roomService.search(this.search);
    this.isLoading = false;
  }

  onJoin(event: Event) {
    const roomId = (event.target as HTMLElement).closest('button').id;
    const room = this.rooms.find(r => r._id === roomId);

    // If the room is locked, open a dialog to get the room's password from the user
    // Otherwise, just navigate into the room
    if (room.isLocked) {
      const dialogRef = this.passwordDialog.open(PasswordComponent, {
        data: roomId,
        position: { top: '25vh' },
      });

      // If the correct password has been entered, navigate into the room
      // Failure case is handled via an error message in the dialog itself
      dialogRef.afterClosed().subscribe((success) => {
        if (success) {
          this.router.navigate(['chat', roomId], { relativeTo: this.route });
        }
      });
    } else {
      this.router.navigate(['chat', roomId], { relativeTo: this.route });
    }
  }

  onClear() {
    this.isLoading = true;
    this.roomService.getRooms();
    this.search = '';
    (this.input.nativeElement as HTMLInputElement).value = '';
  }

  asIUser(obj: any) {
    return obj as IUser;
  }

  ngOnDestroy() {
    this.roomsSub.unsubscribe();
  }
}
