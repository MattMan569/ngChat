import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import session from './../middleware/session';

import userRouter from './../routes/userRouter';
import roomRouter from './../routes/roomRouter';

export const app = express();

// TODO check if CORS works
app.use(cors({ origin: /.*\.herokuapp\.com.*/, credentials: true }));
app.set('trust proxy', true);
app.use(express.json());
app.use(session);
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.use('/api/user', userRouter);
app.use('/api/room', roomRouter);

export default app;
