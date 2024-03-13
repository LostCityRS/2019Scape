import LobbyProvider from '#lostcity/server/LobbyProvider.js';
import WorldProvider from '#lostcity/server/WorldProvider.js';

import startWeb from '#lostcity/web/app.js';

LobbyProvider.postMessage('start');
WorldProvider.postMessage('start');

await startWeb();
