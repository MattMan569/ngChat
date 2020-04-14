import mongoose, { Document, Model, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import User from './userModel';
import IRoom from 'types/room';

// Define document methods
interface IRoomDocument extends Document, IRoom {
}

// Define model statics
interface IRoomModel extends Model<IRoomDocument> {
}

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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
    userId: {
      ref: User,
      type: Schema.Types.ObjectId,
    },
  }],
}, {
  timestamps: true,
});

roomSchema.plugin(mongooseUniqueValidator);

export const Room = mongoose.model<IRoomDocument, IRoomModel>('Room', roomSchema);

export default Room;
