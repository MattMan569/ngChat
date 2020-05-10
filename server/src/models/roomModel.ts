import mongoose, { Document, Model, Schema, HookNextFunction } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import User from './userModel';
import IRoom from 'types/room';

// Define document methods
export interface IRoomDocument extends Document, IRoom {
  addUserToRoom(userId: string, socketId: string): Promise<IRoomDocument>;
  removeUserFromRoom(userId: string): Promise<IRoomDocument>;
  authorizeUser(userId: string, password: string): Promise<boolean>;
}

// Define model statics
interface IRoomModel extends Model<IRoomDocument> {
  addUserToRoom(roomId: string, userId: string, socketId: string): Promise<IRoomDocument>;
  removeUserFromRoom(roomId: string, userId: string): Promise<IRoomDocument>;
  authorizeUser(roomId: string, userId: string, password: string): Promise<boolean>; // TODO auth user static
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
  authorizedUsers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    time: Number,
  }],
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

roomSchema.methods.authorizeUser = async function(this: IRoomDocument, userId: string, password: string) {
  // Correct password
  if (this.password === password) {
    // Check if the user has been authorized for this room before
    // Is ObjectId type in db
    // tslint:disable-next-line: triple-equals
    const index = this.authorizedUsers.findIndex(o => o.user == userId);

    // Been authorized before, update auth timestamp
    if (index >= 0) {
      this.authorizedUsers[index].time = new Date().getTime();
      await this.save();
      return true;
    }

    // Never been authorized before, push new object
    await this.updateOne({
      $push: {
        authorizedUsers: {
          user: userId,
          time: (new Date().getTime()),
        },
      },
    }).exec();

    return true;
  }

  // Incorrect password
  return false;
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

// Always populate the owner and room's users fields
const autoPopulate = function(this: IRoomDocument, next: HookNextFunction) {
  this.populate('owner').populate('users.user');
  next();
};
roomSchema.pre('find', autoPopulate);
roomSchema.pre('findOne', autoPopulate);

export const Room = mongoose.model<IRoomDocument, IRoomModel>('Room', roomSchema);

export default Room;
