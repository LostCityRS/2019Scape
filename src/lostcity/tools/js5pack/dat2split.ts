import fs from 'fs';

import DiskStore from '#jagex3/io/DiskStore.js';

import Js5 from '#jagex3/js5/Js5.js';
import Js5Archive from '#jagex3/js5/Js5Archive.js';

console.time('dump');
if (!fs.existsSync('data/cache/dump')) {
    const master: DiskStore = new DiskStore('data/cache/main_file_cache.dat255', 'data/cache/main_file_cache.idx255', 255);
    fs.mkdirSync('data/cache/dump/255', { recursive: true });

    for (let group: number = 0; group < master.count; group++) {
        const data: Uint8Array | null = master.read(group);

        if (data !== null) {
            fs.writeFileSync(`data/cache/dump/255/${group}.dat`, data);
        }
    }

    for (let i: number = 0; i < Js5Archive.values.length; i++) {
        const type: Js5Archive = Js5Archive.values[i];
        console.log(type);

        const store: DiskStore = new DiskStore(`data/cache/main_file_cache.dat${type.id}`, `data/cache/main_file_cache.idx${type.id}`, type.id);
        fs.mkdirSync(`data/cache/dump/${type.id}`, { recursive: true });

        const count: number = store.count;
        for (let group: number = 0; group < count; group++) {
            const data: Uint8Array | null = store.read(group);

            if (data !== null) {
                fs.writeFileSync(`data/cache/dump/${type.id}/${group}.dat`, data);
            }
        }
    }
}
console.timeEnd('dump');

console.time('js5');
for (let i: number = 0; i < Js5Archive.values.length; i++) {
    const type: Js5Archive = Js5Archive.values[i];
    console.log(type);

    await Js5.packArchive('data/cache/dump', 'data/pack', type.name, type.id, false, false, true);
}
console.timeEnd('js5');
