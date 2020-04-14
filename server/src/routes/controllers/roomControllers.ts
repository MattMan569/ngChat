import { Request, Response } from 'express';

import Room from '../../models/roomModel';
import IRoom from 'types/room';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const roomData: IRoom = req.body;
    roomData.owner = req.session?._id as string;
    roomData.users = [];

    if (roomData.isLocked && !roomData.password) {
      return res.status(401).json('Locked rooms must have a password');
    }

    if (roomData.isLimited && !roomData.capacity) {
      return res.status(401).json('Rooms with limited capacity must specify a capacity');
    }

    console.log(roomData);

    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    // TODO invalid req.session?
    console.error(error);
    res.status(500).json();
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    res.json(await Room.find());
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
  }
};

export default {
  createRoom,
  getRooms,
};
