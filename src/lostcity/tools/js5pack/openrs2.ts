import Js5 from '#jagex3/js5/Js5.js';
import Js5Archive from '#jagex3/js5/Js5Archive.js';

import { OpenRS2 } from '#lostcity/util/OpenRS2.js';

console.time('openrs2');
const openrs2: OpenRS2 = await OpenRS2.find({ openrs2: 1730 });
await openrs2.extractFlatFiles();
console.timeEnd('openrs2');

console.time('js5');
for (let i: number = 0; i < Js5Archive.values.length; i++) {
    const type: Js5Archive = Js5Archive.values[i];
    await Js5.packArchive(`data/cache/${openrs2.id}`, 'data/pack', type.name, type.id, false, false, true);
}
console.timeEnd('js5');
