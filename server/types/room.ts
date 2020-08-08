import IUser from './user';

export interface IRoom {
  _id: string | any;
  name: string;
  description: string;
  isLocked: boolean;
  password: string;
  authorizedUsers: Array<{
    user: string;
    time: number;
  }>;
  isLimited: boolean;
  capacity: number;
  owner: string | IUser;
  users: Array<{
    socketId: string;
    user: string | IUser;
  }>;
  tags: string[];
}

export default IRoom;
