import socketio from 'socket.io';
import server from './../app/server';
import chatSocket from './routes/chatSocket';

export const socketIOConnect = () => {
  const io = socketio(server);
  chatSocket(io);
};

export default socketIOConnect;
