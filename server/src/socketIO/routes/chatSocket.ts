import { Server } from 'socket.io';

export const chatSocket = (io: Server) => {
  const chat = io.of('/api/chat');

  chat.on('connection', async (socket) => {
    console.log('connection');
  });
};

export default chatSocket;
