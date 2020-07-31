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

  /**
   * Return an observable of the list of rooms
   */
  getRoomsUpdated() {
    return this.roomsUpdated.asObservable();
  }

  /**
   * Create a new room.
   * On success the observable resolves to true.
   * On failure the observable resolves to false
   * and a dialog with the error message is created.
   */
  createRoom(roomData: IRoom) {
    return new Promise<boolean>((resolve) => {
      this.http.post<IRoom>(SERVER_URL, roomData)
        .subscribe(() => {
          this.openDialog('Room successfully created');
          this.router.navigate(['/rooms']);
          resolve(true);
        }, (error: HttpErrorResponse) => {
          resolve(false);
          this.openDialog(error.error);
          console.error(error);
        });
    });
  }

  /**
   * Update an existing room.
   * On success the observalbe resolves to true.
   * On failure the observable resolves to false
   * and a dialog with the error message is created.
   */
  updateRoom(roomData: IRoom) {
    return new Promise<boolean>((resolve) => {
      this.http.patch<IRoom>(`${SERVER_URL}/${roomData._id}`, roomData)
        .subscribe(() => {
          this.openDialog('Room successfully updated');
          this.router.navigate(['/rooms']);
          resolve(true);
        }, (error) => {
          resolve(false);
          this.openDialog(error.error);
          console.error(error);
        });
    });
  }

  /**
   * Delete an existing room.
   */
  deleteRoom(roomId: string) {
    this.http.delete<IRoom>(`${SERVER_URL}/${roomId}`)
      .subscribe((room) => {
        this.openDialog(`Room '${room.name}' successfully deleted`);
        this.router.navigate(['/rooms']);
      }, (error) => {
        console.error(error);
      });
  }

  /**
   * Update this service's list of rooms from the
   * full room list from the server.
   * The updated list will be emitted from the room observable.
   */
  getRooms() {
    this.http.get<IRoom[]>(SERVER_URL)
      .subscribe((rooms) => {
        this.rooms = rooms;
        this.emitRooms();
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
  }

  /**
   * Get a specific room
   */
  getRoom(id: string) {
    return this.http.get<IRoom>(`${SERVER_URL}/${id}`);
  }

  /**
   * Join a locked room
   */
  joinRoom(roomId: string, password: string) {
    return this.http.post<boolean>(`${SERVER_URL}/join/${roomId}`, { password });
  }

  /**
   * Send a search query to the server.
   * The server searches against room's names and tags.
   */
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

  /**
   * Emit the room list
   */
  private emitRooms = () => {
    this.roomsUpdated.next([...this.rooms]);
  }

  /**
   * Create a dialog
   */
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
