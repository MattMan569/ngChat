import server from './app/server';
import database from './db/mongoose';
import socketIOConnect from './socketIO/io';

socketIOConnect();

database.connect().then((success) => {
  if (success) {
    console.log('Connected to database');
  } else {
    console.error('Connection to database failed: ', database.getError());
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up on port ${process.env.PORT}`);
});
