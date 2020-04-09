import server from './src/app/server';

server.listen(process.env.PORT, () => {
  console.log(`Server is up on port ${process.env.PORT}`);
});
