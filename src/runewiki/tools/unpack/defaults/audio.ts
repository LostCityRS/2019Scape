import fs from 'fs';

import Js5 from '#jagex3/js5/Js5.js';
import { Js5ArchiveType } from '#jagex3/js5/Js5Archive.js';
import Packet from '#jagex3/io/Packet.js';

const js5: Js5 = await Js5.create('data/pack/client.defaults.js5', Js5ArchiveType.Defaults);

const def: string[] = [];

const buf: Packet = new Packet(await js5.readGroup(4));
while (buf.available > 0) {
    const opcode: number = buf.g1();
    if (opcode === 0) {
        break;
    }

    if (opcode === 1) {
        const track: number = buf.g2();
        def.push(`loginmusic=${track}`);
    }
}

fs.writeFileSync('data/src/defaults/audio.defaults', def.join('\n') + '\n');
