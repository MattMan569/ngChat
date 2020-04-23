import { Injectable } from '@angular/core';
import { connect } from 'socket.io-client';
import { environment } from './../../../environments/environment';
import { AuthService } from './../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: SocketIOClient.Socket;

  constructor(private authService: AuthService) {
    this.socket = connect(`${environment.apiUrl}/chat`, {
      query: {
        token: this.authService.getToken(),
      },
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}
