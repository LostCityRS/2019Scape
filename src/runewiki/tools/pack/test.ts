import fs from 'fs';

import Js5 from '#jagex3/js5/Js5.js';
import Js5Archive from '#jagex3/js5/Js5Archive.js';
import Packet from '#jagex3/io/Packet.js';
import Js5Compression from '#jagex3/js5/Js5Compression.js';

for (let i: number = 0; i < Js5Archive.getMaxId(); i++) {
    const type: Js5Archive | null = Js5Archive.forId(i);
    if (!type) {
        continue;
    }

    const js5: Js5 = await Js5.create(`data/pack/client.${type.name}.js5`, i);

    const oldIndex: Uint8Array = await Js5Compression.decompress(js5.masterIndex);
    const expected: number = Packet.getcrc(oldIndex);

    const newIndex: Uint8Array = js5.index.encodeIndex();
    const checksum: number = Packet.getcrc(newIndex);

    if (expected != checksum) {
        console.log(type.name, js5.index.format, expected, checksum);
    }
}
