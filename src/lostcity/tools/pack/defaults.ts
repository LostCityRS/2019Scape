import fs from 'fs';

import DefaultsAudio from '#jagex3/config/DefaultsAudio.js';

import Js5 from '#jagex3/js5/Js5.js';
import { Js5ArchiveType } from '#jagex3/js5/Js5Archive.js';
import Js5Index from '#jagex3/js5/Js5Index.js';
import Packet from '#jagex3/io/Packet.js';

import { saveFile } from '#lostcity/util/FileUtils.js';

const src: string[] = fs.readFileSync('data/src/defaults/audio.defaults', 'utf-8')
    .replaceAll('\r', '').split('\n')
    .filter((x): boolean => x.length > 0 && !x.startsWith('//'));

const buf: Uint8Array = DefaultsAudio.encode(src);

const packed: Uint8Array = Js5.packGroup(buf);
saveFile(`data/pack/patch/${Js5ArchiveType.Defaults}/4.dat`, packed);

// ----

const index: Js5Index = new Js5Index();
index.format = 7;
index.version = 1;
index.addGroup(4, Packet.getcrc(packed), Packet.getcrc(buf), packed.length, buf.length, 1574159676);

// ----

const packedIndex: Uint8Array = Js5.packGroup(index.encode(), 2);
saveFile(`data/pack/patch/${Js5ArchiveType.ArchiveSet}/${Js5ArchiveType.Defaults}.dat`, packedIndex);

await Js5.packArchive('data/pack/patch', 'data/pack', 'defaults', Js5ArchiveType.Defaults, true, true);
