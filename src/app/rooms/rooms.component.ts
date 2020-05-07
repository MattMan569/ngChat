import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import IRoom from 'types/room';
import { RoomService } from '../services/room.service';
import { AuthService } from '../services/auth.service';
import IUser from 'types/user';

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

  constructor(private authService: AuthService, private roomService: RoomService) { }

  ngOnInit(): void {
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
