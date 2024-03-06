import fs from 'fs';

import Js5 from '#jagex3/js5/Js5.js';
import Packet from '#jagex3/io/Packet.js';
import { Js5ArchiveType } from '#jagex3/js5/Js5Archive.js';
import Js5Index from '#jagex3/js5/Js5Index.js';

const src: string[] = fs.readFileSync('data/src/defaults/audio.defaults', 'utf-8')
    .replaceAll('\r', '').split('\n')
    .filter((x): boolean => x.length > 0 && !x.startsWith('//'));
const buf: Packet = new Packet();
for (let i: number = 0; i < src.length; i++) {
    const line: string = src[i];
    const [key, value] = line.split('=');

    switch (key) {
        case 'loginmusic':
            buf.p1(1);
            buf.p2(parseInt(value));
            break;
        default:
            console.error(`Unknown property: ${key}`);
            process.exit(1);
            break;
    }
}
buf.p1(0);

const packed: Packet = Js5.packGroup(buf);
packed.save(`data/pack/patch/${Js5ArchiveType.Defaults}/4.dat`);

// ----

const index: Js5Index = new Js5Index();
index.format = 7;
index.version = 1;
index.addGroup(4, Packet.getcrc(packed), Packet.getcrc(buf), packed.length, buf.length, 1574159676);

// ----

const packedIndex: Packet = Js5.packGroup(index.encode(), 2);
packedIndex.save(`data/pack/patch/${Js5ArchiveType.ArchiveSet}/${Js5ArchiveType.Defaults}.dat`);

Js5.packArchive('data/pack/patch', 'data/pack', 'defaults', Js5ArchiveType.Defaults, true, true);

const test: Js5 = await Js5.load('data/pack/client.defaults.js5', Js5ArchiveType.Defaults);
console.log(await test.readGroup(4));
