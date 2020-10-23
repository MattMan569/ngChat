import express from 'express';
import cors from 'cors';

import session from './../middleware/session';

import userRouter from './../routes/userRouter';
import roomRouter from './../routes/roomRouter';

export const app = express();
app.use(cors({ origin: new RegExp(process.env.CLIENT_ORIGIN), credentials: true }));
app.use(express.json());
app.use(session);

app.use('/api/user', userRouter);
app.use('/api/room', roomRouter);

export default app;
