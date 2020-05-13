import IMessage from 'types/message';
import IToken from 'types/token';

export function createMessage(message: string, token: IToken): IMessage;
export function createMessage(message: string, username: string, userId?: string): IMessage;

// Create a message object using one of the above signatures
export function createMessage(message: string, tokenOrUsername: IToken | string, userId?: any): IMessage {
  let sender;

  if (typeof tokenOrUsername === 'string') {
    sender = {
      id: userId,
      username: tokenOrUsername,
    };
  } else {
    sender = {
      id: tokenOrUsername._id,
      username: tokenOrUsername.username,
    };
  }

  return {
    message,
    createdAt: new Date().getTime(),
    sender,
  };
}

export default createMessage;
