import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

import { environment } from './../../environments/environment';
import IRoom from 'types/room';

const SERVER_URL = `${environment.apiUrl}/room`;

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private rooms: IRoom[] = [];
  private roomsUpdated = new Subject<IRoom[]>();

  constructor(private http: HttpClient) { }

  getRoomsUpdated() {
    return this.roomsUpdated.asObservable();
  }

  createRoom(roomData: IRoom) {
    this.http.post<IRoom>(SERVER_URL, roomData)
      .subscribe(() => {

      }, (error) => {

      });
  }

  getRooms() {
    this.http.get<IRoom[]>(SERVER_URL)
      .subscribe((rooms) => {
        this.rooms = rooms;
        console.log(rooms);
        this.emitRooms();
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
  }

  getRoom(id: string) {
    return this.http.get<IRoom>(`${SERVER_URL}/${id}`);
  }

  private emitRooms = () => {
    this.roomsUpdated.next([...this.rooms]);
  }
}
