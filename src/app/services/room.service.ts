import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { InfoComponent } from '../dialogs/info/info.component';
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
        this.openDialog('Room successfully created');
        this.router.navigate(['/rooms']);
      }, (error: HttpErrorResponse) => {
        this.openDialog(error.error);
        console.error(error);
      });
  }

  updateRoom(roomData: IRoom) {
    this.http.patch<IRoom>(`${SERVER_URL}/${roomData._id}`, roomData)
      .subscribe(() => {
        this.openDialog('Room successfully updated');
        this.router.navigate(['/rooms']);
      }, (error) => {
        console.error(error);
      });
  }

  deleteRoom(roomId: string) {
    this.http.delete<IRoom>(`${SERVER_URL}/${roomId}`)
      .subscribe((room) => {
        this.openDialog(`Room '${room.name}' successfully deleted`);
        this.router.navigate(['/rooms']);
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

  joinRoom(roomId: string, password: string) {
    return this.http.post<boolean>(`${SERVER_URL}/join/${roomId}`, { password });
  }

  search(query: string) {
    if (!query) {
      return;
    }

    return new Promise<IRoom[]>((resolve, reject) => {
      this.http.get<IRoom[]>(`${SERVER_URL}/search`, { params: { query } })
        .subscribe((result) => {
          resolve(result);
        }, (error) => {
          reject();
          console.error(error);
        });
    });
  }

  private emitRooms = () => {
    this.roomsUpdated.next([...this.rooms]);
  }

  private openDialog = (message: string, durationMs: number = 3000) => {
    const dialogRef = this.dialog.open(InfoComponent, {
      data: message,
      hasBackdrop: false,
      panelClass: 'custom-dialog',
      position: { top: '2rem' },
    });

    setTimeout(() => {
      dialogRef.close();
    }, durationMs);
  }
}
