import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { DialogComponent } from '../dialog/dialog.component';
import IRoom from 'types/room';

const SERVER_URL = `${environment.apiUrl}/room`;

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private rooms: IRoom[] = [];
  private roomsUpdated = new Subject<IRoom[]>();

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) { }

  getRoomsUpdated() {
    return this.roomsUpdated.asObservable();
  }

  createRoom(roomData: IRoom) {
    this.http.post<IRoom>(SERVER_URL, roomData)
      .subscribe(() => {
        // Notify user of success via dialog
        const dialogRef = this.dialog.open(DialogComponent, {
          data: 'Room successfully created',
          hasBackdrop: false,
          position: { top: '2rem' },
        });

        this.router.navigate(['/rooms']);

        // Close the dialog after 2 seconds
        setTimeout(() => {
          dialogRef.close();
        }, 2000);
      }, (error) => {
        // TODO room create error
        console.error(error);
      });
  }

  updateRoom(roomData: IRoom) {
    this.http.patch<IRoom>(`${SERVER_URL}/${roomData._id}`, roomData)
      .subscribe(() => {

      }, (error) => {
        console.error(error);
      });
  }

  getRooms() {
    this.http.get<IRoom[]>(SERVER_URL)
      .subscribe((rooms) => {
        this.rooms = rooms;
        this.emitRooms();
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
  }

  getRoom(id: string) {
    return this.http.get<IRoom>(`${SERVER_URL}/${id}`);
  }

  search(query: string) {
    if (!query) {
      return;
    }

    return new Promise<IRoom[]>((resolve, reject) => {
      this.http.get<IRoom[]>(`${SERVER_URL}/search`, { params: { query } })
        .subscribe((result) => {
          resolve(result);
          console.log(result);
        }, (error) => {
          reject();
          console.error(error);
        });
    });
  }

  private emitRooms = () => {
    this.roomsUpdated.next([...this.rooms]);
  }
}
