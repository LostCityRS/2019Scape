import Server from './network/Server.js';
import startWeb from './web/app.js';

await Server.start();
startWeb();
