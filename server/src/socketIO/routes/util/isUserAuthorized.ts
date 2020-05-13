import { IRoomDocument } from './../../../models/roomModel';

export const isUserAuthorized = (room: IRoomDocument, userId: string) => {
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

export default isUserAuthorized;
