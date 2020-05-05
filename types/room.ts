import IUser from './user';

export interface IRoom {
  _id: string | any;
  name: string;
  description: string;
  isLocked: boolean;
  password: string;
  isLimited: boolean;
  capacity: number;
  owner: string;
  users: Array<{
    socketId: string;
    user: string | IUser; // string for _id, IUser when populated
  }>;
  tags: string[];
}

export default IRoom;
