import fs from 'fs';

import CacheProvider from '#lostcity/server/CacheProvider.js';
import { generateInterfacePack } from './iftype/symbols.js';
import { generateVarPack } from './vartype/symbols.js';

await CacheProvider.load('data/pack');

fs.mkdirSync('data/src/pack', { recursive: true });

generateInterfacePack();
generateVarPack();
