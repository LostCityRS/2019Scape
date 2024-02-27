import Server from './server/Server.js';
import './web/app.js';

const server: Server = new Server();
await server.start();
