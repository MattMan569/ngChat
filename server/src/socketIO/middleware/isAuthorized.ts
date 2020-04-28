import { Socket } from 'socket.io';
import { decodeAccessToken } from './../../util/jwt';

// Verify the validity of the token
export const isAuthorized = (socket: Socket, next: (err?: any) => void) => {
  const payload = decodeAccessToken(socket.handshake.query.token);

  if (!payload) {
    return next(new Error('401: Invalid token'));
  }

  socket.request.jwtPayload = payload;
  next();
};

export default isAuthorized;
