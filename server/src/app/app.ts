import express from 'express';
import cors from 'cors';

import session from './../middleware/session';
import userRouter from './../routes/userRouter';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(session);

app.use('/api/user', userRouter);

export default app;
