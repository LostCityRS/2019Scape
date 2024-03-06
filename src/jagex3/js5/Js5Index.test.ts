import Js5 from '#jagex3/js5/Js5.js';
import Js5Archive, { Js5ArchiveType } from '#jagex3/js5/Js5Archive.js';
import Packet from '#jagex3/io/Packet.js';
import Js5Compression from '#jagex3/js5/Js5Compression.js';
import Js5Index from './Js5Index.js';

for (let i: number = 0; i < Js5Archive.getMaxId(); i++) {
    const type: Js5Archive | null = Js5Archive.forId(i);
    if (!type) {
        continue;
    }

    const js5: Js5 = await Js5.load(`data/pack/client.${type.name}.js5`, i, false);

    const oldIndex: Uint8Array = await Js5Compression.decompress(js5.masterIndex);
    const expected: number = Packet.getcrc(oldIndex);

    const newIndex: Uint8Array = js5.index.encode();
    const checksum: number = Packet.getcrc(newIndex);

    if (expected != checksum) {
        console.log(type.name, js5.index.format, expected, checksum);
    }
}

// const js5: Js5 = await Js5.load('data/pack/client.defaults.js5', Js5ArchiveType.Defaults, false);
// const index: Js5Index = await Js5Index.from(js5.masterIndex);
// console.log(index);
