import http from 'http2';
import app from './app';

export const server = http.createServer(app);

export default server;
