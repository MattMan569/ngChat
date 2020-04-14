export interface IRoom {
  name: string;
  isLocked: boolean;
  password: string;
  isLimited: boolean;
  capacity: number;
  owner: string;
  users: Array<{
    socketId: string;
    userId: string;
  }>;
}

export default IRoom;
