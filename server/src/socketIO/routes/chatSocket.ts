import { Server } from 'socket.io';
import { isAuthorized } from './../middleware/isAuthorized';
import { IToken } from 'types/token';
import Room from './../../models/roomModel';

export const chatSocket = (io: Server) => {
  const chat = io.of('/api/chat');

  chat.use(isAuthorized);

  chat.on('connection', async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const auth = socket.request.jwtPayload as IToken;

    socket.on('join', async () => {
      const room = await (await Room.addUserToRoom(roomId, auth._id, socket.id)).populate('users.user').execPopulate();
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

export default chatSocket;
