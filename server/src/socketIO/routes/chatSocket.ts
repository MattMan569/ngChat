import { Server } from 'socket.io';
import { isAuthorized } from './../middleware/isAuthorized';
import { IToken } from 'types/token';
import Room from './../../models/roomModel';
import { IRoomDocument } from './../../models/roomModel';

export const chatSocket = (io: Server) => {
  const chat = io.of('/api/chat');

  chat.use(isAuthorized);

  chat.on('connection', async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const auth = socket.request.jwtPayload as IToken;

    socket.on('join', async () => {
      const room = await (await Room.addUserToRoom(roomId, auth._id, socket.id)).populate('users.user').execPopulate();

      // Reject the connection if the user is not authorized
      if (room.isLocked && !isUserAuthorized(room, auth._id)) {
        socket.emit(
          'message',
          'You are not authorized for this room. Please leave and re-enter the password. To prevent disconnection, do not refresh the page after joining a room.',
        );
        socket.disconnect(true);
        return;
      }

      Room.emit('roomUpdate', room);

      socket.join(roomId);
      socket.emit('message', `Welcome, ${auth.username}`);
      socket.broadcast.to(roomId).emit('message', `${auth.username} has joined`);
      chat.to(roomId).emit('userListUpdate', room.users);
    });

    socket.on('sendMessage', (message: string) => {
      chat.to(roomId).emit('message', message);
    });

    socket.on('disconnect', async () => {
      const room = await (await Room.removeUserFromRoom(roomId, auth._id)).populate('users.user').execPopulate();
      Room.emit('roomUpdate', room);
      socket.broadcast.to(roomId).emit('message', `${auth.username} has left`);
      chat.to(roomId).emit('userListUpdate', room.users);
    });
  });
};

const isUserAuthorized = (room: IRoomDocument, userId: string) => {
  if (!process.env.ROOM_AUTH_EXPIRES_IN) {
    throw new Error('Environment variable ROOM_AUTH_EXPIRES_IN is undefined.');
  }

  // tslint:disable-next-line: triple-equals
  const authObj = room.authorizedUsers.find(o => o.user == userId);

  if (!authObj) {
    return false;
  }

  return (new Date().getTime() - authObj.time < Number(process.env.ROOM_AUTH_EXPIRES_IN));
};

export default chatSocket;
