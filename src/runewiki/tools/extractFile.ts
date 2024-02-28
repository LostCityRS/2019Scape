import fs from 'fs';

import Cache from '#jagex3/js5/Cache.js';

const cache: Cache = new Cache();
await cache.load('data/cache');

const args: string[] = process.argv.slice(2);
if (args.length < 3) {
    process.exit(1);
}

const archive: number = parseInt(args[0]);
const group: number = parseInt(args[1]);
const file: number = parseInt(args[2]);

fs.writeFileSync(`data/${archive}.${group}.${file}.dat`, cache.js5[archive].readFile(group, file)!);
