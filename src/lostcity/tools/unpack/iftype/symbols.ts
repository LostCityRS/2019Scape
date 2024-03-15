import fs from 'fs';

import CacheProvider from '#lostcity/server/CacheProvider.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Js5 from '#jagex/js5/Js5.js';

export function generateInterfacePack(): void {
    const pack: Map<string, string> = new Map();

    const js5: Js5 = CacheProvider.js5[Js5Archive.Interfaces.id];
    for (let i: number = 0; i < js5.index.size; i++) {
        const groupId: number = js5.index.groupIds![i];
        pack.set(groupId.toString(), 'interface_' + groupId);

        for (let j: number = 0; j < js5.index.groupSizes![groupId]; j++) {
            pack.set(groupId + ':' + j, j.toString());
        }
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/interface.pack', txt);
}
