import { Server } from 'socket.io';
import { isAuthorized } from './../middleware/isAuthorized';
import { IToken } from 'types/token';

export const chatSocket = (io: Server) => {
  const chat = io.of('/api/chat');

  chat.use(isAuthorized);

  chat.on('connection', async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const auth = socket.request.jwtPayload as IToken;

    socket.on('join', () => {
      socket.join(roomId);
      socket.emit('message', `Welcome, ${auth.username}`);
      socket.broadcast.to(roomId).emit('message', `${auth.username} has joined`);
    });

    socket.on('sendMessage', (message: string) => {
      chat.to(roomId).emit('message', message);
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('message', `${auth.username} has left`);
    });
  });
};

export default chatSocket;
