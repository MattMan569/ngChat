import mongoose, { Document, Model, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import User from './userModel';
import IRoom from 'types/room';

// Define document methods
interface IRoomDocument extends Document, IRoom {
  addUserToRoom(userId: string, socketId: string): Promise<IRoomDocument>;
  removeUserFromRoom(userId: string): Promise<IRoomDocument>;
}

// Define model statics
interface IRoomModel extends Model<IRoomDocument> {
  addUserToRoom(roomId: string, userId: string, socketId: string): Promise<IRoomDocument>;
  removeUserFromRoom(roomId: string, userId: string): Promise<IRoomDocument>;
}

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isLocked: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    required(this: IRoomDocument) {
      return this.isLocked;
    },
    trim: true,
  },
  isLimited: {
    type: Boolean,
    required: true,
  },
  capacity: {
    type: Number,
    required(this: IRoomDocument) {
      return this.isLimited;
    },
    max: 100,
    min: 1,
  },
  owner: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: User,
  },
  users: [{
    socketId: String,
    user: {
      ref: User,
      type: Schema.Types.ObjectId,
    },
  }],
  tags: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

roomSchema.methods.addUserToRoom = async function(this: IRoomDocument, userId: string, socketId: string) {
  return this.updateOne({
    $push: { users: { user: userId, socketId } },
  }, {
    new: true, // TODO check if new actually works here, or just returns query
  }).exec();
};

roomSchema.methods.removeUserFromRoom = async function(this: IRoomDocument, userId: string) {
  return this.updateOne({
    $pull: { users: { user: userId } },
  }, {
    new: true,
  }).exec();
};

roomSchema.statics.addUserToRoom = async (roomId: string, userId: string, socketId: string) => {
  return Room.findByIdAndUpdate(roomId, {
    $push: { users: { user: userId, socketId } },
  }, {
    new: true,
  }).exec();
};

roomSchema.statics.removeUserFromRoom = async (roomId: string, userId: string) => {
  return Room.findByIdAndUpdate(roomId, {
    $pull: { users: { user: userId } },
  }, {
    new: true,
  }).exec();
};

roomSchema.plugin(mongooseUniqueValidator);

export const Room = mongoose.model<IRoomDocument, IRoomModel>('Room', roomSchema);

export default Room;
