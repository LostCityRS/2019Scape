import { spawnSync } from 'child_process';

import CacheProvider from '#lostcity/server/CacheProvider.js';
import packDefaults from '#lostcity/tools/pack/defaults.js';
import Js5Archive from '#jagex/config/Js5Archive.js';

// custom content

await packDefaults();

// scripts

// await CacheProvider.load('data/pack');

// spawnSync('java', ['-jar', 'RuneScriptCompiler.jar'], { stdio: 'inherit' });
