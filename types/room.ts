export interface IRoom {
  name: string;
  description: string;
  isLocked: boolean;
  password: string;
  isLimited: boolean;
  capacity: number;
  owner: string;
  users: Array<{
    socketId: string;
    userId: string;
  }>;
  tags: string[];
}

export default IRoom;
