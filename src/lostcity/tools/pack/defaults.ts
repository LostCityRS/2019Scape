import fs from 'fs';

import Js5 from '#jagex/js5/Js5.js';
import { Js5ArchiveType } from '#jagex/config/Js5Archive.js';
import Js5Index from '#jagex/js5/index/Js5Index.js';
import Packet from '#jagex/bytepacking/Packet.js';

import { saveFile } from '#lostcity/util/FileUtils.js';
import AudioDefaults from '#jagex/config/defaults/AudioDefaults.js';

export default async function packDefaults(): Promise<void> {
    if (fs.existsSync(`data/pack/patch/${Js5ArchiveType.Defaults}/4.dat`) &&
        fs.statSync('data/src/defaults/audio.defaults').mtimeMs < fs.statSync(`data/pack/patch/${Js5ArchiveType.Defaults}/4.dat`).mtimeMs
    ) {
        return;
    }

    const src: string[] = fs.readFileSync('data/src/defaults/audio.defaults', 'utf-8')
        .replaceAll('\r', '').split('\n')
        .filter((x): boolean => x.length > 0 && !x.startsWith('//'));

    const buf: Uint8Array = AudioDefaults.encode(src);

    const packed: Uint8Array = Js5.packGroup(buf);
    saveFile(`data/pack/patch/${Js5ArchiveType.Defaults}/4.dat`, packed);

    // ----

    const index: Js5Index = new Js5Index();
    index.format = 7;
    index.version = 1;
    index.addGroup(4, Packet.getcrc(packed, 0, packed.length), Packet.getcrc(buf, 0, buf.length), packed.length, buf.length, 1574159676);

    // ----

    const packedIndex: Uint8Array = Js5.packGroup(index.encode(), 2);
    saveFile(`data/pack/patch/${Js5ArchiveType.ArchiveSet}/${Js5ArchiveType.Defaults}.dat`, packedIndex);

    await Js5.packArchive('data/pack/patch', 'data/pack', 'defaults', Js5ArchiveType.Defaults, true, true);
}
