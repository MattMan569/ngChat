export interface IMessage {
  message: string;
  sender: {
    username: string;
    id: string;
  };
  createdAt: number;
}

export default IMessage;
