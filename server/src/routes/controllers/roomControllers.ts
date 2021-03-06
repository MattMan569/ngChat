import { Request, Response } from 'express';

import Room from '../../models/roomModel';
import IRoom from 'types/room';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const roomData: IRoom = req.body;
    roomData.owner = req.session?._id as string;
    roomData.authorizedUsers = [];
    roomData.users = [];

    if (!roomData.tags) {
      roomData.tags = [];
    }

    if (roomData.isLocked && !roomData.password) {
      return res.status(400).json('Locked rooms must have a password');
    }

    if (roomData.isLimited && !roomData.capacity) {
      return res.status(400).json('Rooms with limited capacity must specify a capacity');
    }

    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    if (error.name === 'ValidationError') {
      if (error.errors?.name.kind === 'unique') {
        return res.status(400).json(`Room name '${error.errors.name.value}' is taken`);
      }
    }

    console.error(error);
    res.status(500).json('Internal server error');
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const roomData: IRoom = req.body;

    const room = await Room.findOneAndUpdate({
      _id: roomData._id,
      owner: req.session?._id,
    }, roomData, {
      new: true,
    });

    if (!room) {
      return res.status(401).json();
    }

    res.json();
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
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

export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json();
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const getOwnedRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const rooms = await Room.find({ owner: userId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json();
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json('Invalid room id');
    }

    if (!room.isLocked) {
      return res.json('Room is not locked');
    }

    const success = await room.authorizeUser(req.session?._id as string, req.body.password);

    success ? res.json() : res.status(400).json('Incorrect password');
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    if (!req.query.query) {
      return res.status(400).json('No query string provided');
    }

    // Search against room name and tags
    const result = await Room.find().or([
      {
        name: {
          $regex: req.query.query as string,
          $options: 'i',
        },
      }, {
        tags: {
          $regex: req.query.query as string,
          $options: 'i',
        },
      },
    ]);

    if (!result) {
      return res.status(204).json();
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.id,
      owner: req.session?._id,
    });

    if (!room) {
      return res.status(404).json();
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export default {
  createRoom,
  updateRoom,
  getRooms,
  getRoom,
  getOwnedRooms,
  joinRoom,
  search,
  deleteRoom,
};
