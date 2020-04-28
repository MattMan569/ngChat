import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { connect } from 'socket.io-client';
import { environment } from './../../../environments/environment';
import { AuthService } from './../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: SocketIOClient.Socket;
  private messages: string[] = [];
  private messagesOb = new Subject<string[]>();

  constructor(private authService: AuthService) { }

  // Set up socket connection and return an observable of the incoming messages
  connect(roomId: string) {
    this.socket = connect(`${environment.apiUrl}/chat`, {
      query: {
        token: this.authService.getToken(),
        roomId,
      },
    });

    this.eventHandler();
    this.socket.emit('join');
    return this.messagesOb.asObservable();
  }

  sendMessage(message: string) {
    this.socket.emit('sendMessage', message);
  }

  disconnect() {
    this.messages = [];
    this.socket.disconnect();
  }

  private eventHandler() {
    this.socket.on('message', (message: string) => {
      this.messages.push(message);
      this.messagesOb.next([...this.messages]);
    });

    this.socket.on('error', (error: any) => {
      console.error('error: ', error);
    });
  }
}
