import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomService } from './room.service';
import { Subscription } from 'rxjs';

import IRoom from 'types/room';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: IRoom[] = [];
  isLoading = false;
  private roomsSub: Subscription;

  constructor(private roomService: RoomService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.roomsSub = this.roomService.getRoomsUpdated().subscribe((rooms) => {
      this.rooms = rooms;
      this.isLoading = false;
    });
    this.roomService.getRooms();
  }

  ngOnDestroy() {
    this.roomsSub.unsubscribe();
  }
}
