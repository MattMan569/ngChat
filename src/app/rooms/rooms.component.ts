import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { RoomService } from './room.service';
import IRoom from 'types/room';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: IRoom[] = [];
  isLoading = false;
  search = '';
  @ViewChild('inputEl') input: ElementRef;
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

  onSearch() {
    this.search = (this.input.nativeElement as HTMLInputElement).value;
  }

  onClear() {
    this.search = '';
    (this.input.nativeElement as HTMLInputElement).value = '';
  }

  ngOnDestroy() {
    this.roomsSub.unsubscribe();
  }
}
