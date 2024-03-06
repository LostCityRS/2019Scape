import Js5Archive from '#jagex3/js5/Js5Archive.js';
import Js5 from '#jagex3/js5/Js5.js';

console.time('js5');
for (let i: number = 0; i < Js5Archive.values.length; i++) {
    const type: Js5Archive = Js5Archive.values[i];
    Js5.packArchive('data/cache/1730', 'data/pack', type.name, type.id, false, false, true);
}
console.timeEnd('js5');
