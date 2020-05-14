import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { connect } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

import IUser from 'types/user';
import IMessage from 'types/message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: SocketIOClient.Socket;
  private messages: IMessage[] = [];
  private messagesOb = new Subject<IMessage[]>();
  private users: Array<{ socketId: string, user: IUser}>;
  private usersOb = new Subject<Array<{ socketId: string, user: IUser}>>();

  constructor(private authService: AuthService) { }

  /**
   * Set up the socket connection and return an object
   * containing the observables for changes in the room's
   * list of users and new messages.
   */
  connect(roomId: string) {
    this.socket = connect(`${environment.apiUrl}/chat`, {
      query: {
        token: this.authService.getToken(),
        roomId,
      },
    });

    this.eventHandler();
    this.socket.emit('join');
    return {
      messagesOb: this.messagesOb.asObservable(),
      usersOb: this.usersOb.asObservable(),
    };
  }

  /**
   * Send a message to the user's current room
   */
  sendMessage(message: string) {
    this.socket.emit('sendMessage', message);
  }

  /**
   * Disconnect the user's socket
   */
  disconnect() {
    this.messages = [];
    this.socket.disconnect();
  }

  /**
   * Setup all chat related socketIO event handlers
   */
  private eventHandler() {
    this.socket.on('message', (message: IMessage) => {
      this.messages.push(message);
      this.messagesOb.next([...this.messages]);
    });

    this.socket.on('userListUpdate', (users: Array<{ socketId: string, user: IUser }>) => {
      this.users = users;
      this.usersOb.next([...this.users]);
    });

    this.socket.on('error', (error: any) => {
      console.error('error: ', error);
    });
  }
}
