import fs from 'fs';

import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '#jagex/config/Js5Archive.js';

console.time('js5');
for (let i: number = 0; i < Js5Archive.values.length; i++) {
    const type: Js5Archive = Js5Archive.values[i];

    if (fs.existsSync(`data/cache/dump/${type.id}`) && !fs.existsSync(`data/pack/client.${type.name}.js5`)) {
        await Js5.packArchive('data/cache/dump', 'data/pack', type.name, type.id, false, false, true);
    }
}
console.timeEnd('js5');
