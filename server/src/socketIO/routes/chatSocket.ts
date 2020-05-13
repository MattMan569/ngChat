import { Server } from 'socket.io';
import { isAuthorized } from './../middleware/isAuthorized';
import { IToken } from 'types/token';
import { Room } from './../../models/roomModel';
import { isUserAuthorized } from './util/isUserAuthorized';
import { createMessage } from './util/createMessage';

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
          createMessage(
            'You are not authorized for this room. Please leave and re-enter the password. To prevent disconnection, do not refresh the page after joining a room.',
            'server',
          ),
        );
        socket.disconnect(true);
        return;
      }

      Room.emit('roomUpdate', room);

      socket.join(roomId);
      socket.emit('message', createMessage(`Welcome, ${auth.username}`, 'server'));
      socket.broadcast.to(roomId).emit('message', createMessage(`${auth.username} has joined`, 'server'));
      chat.to(roomId).emit('userListUpdate', room.users);
    });

    socket.on('sendMessage', (message: string) => {
      chat.to(roomId).emit('message', createMessage(message, auth));
    });

    socket.on('disconnect', async () => {
      const room = await (await Room.removeUserFromRoom(roomId, auth._id)).populate('users.user').execPopulate();
      Room.emit('roomUpdate', room);
      socket.broadcast.to(roomId).emit('message', createMessage(`${auth.username} has left`, 'server'));
      chat.to(roomId).emit('userListUpdate', room.users);
    });
  });
};

export default chatSocket;
