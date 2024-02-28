import Server from './server/Server.js';
import startWeb from './web/app.js';

await Server.start();
startWeb();
