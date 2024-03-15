import fs from 'fs';

import CacheProvider from '#lostcity/server/CacheProvider.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Js5 from '#jagex/js5/Js5.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';

function generateVarpPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_PLAYER.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varp_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varp.pack', txt);
}

function generateVarbitPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_BIT.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varbit_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varbit.pack', txt);
}

function generateVarcPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_CLIENT.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varc_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varc.pack', txt);
}

function generateVarnPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_NPC.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varn_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varn.pack', txt);
}

function generateVarWorldPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_WORLD.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'vars_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/vars.pack', txt);
}

function generateVarRegionPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_REGION.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varregion_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varregion.pack', txt);
}

function generateVarObjectPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_OBJECT.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varobj_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varobj.pack', txt);
}

function generateVarControllerPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_CONTROLLER.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varcon_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varcon.pack', txt);
}

function generateVarGlobalPack(js5: Js5): void {
    const total: number = js5.getGroupCapacity(Js5ConfigGroup.VAR_GLOBAL.id);
    const pack: Map<string, string> = new Map();

    for (let i: number = 0; i < total; i++) {
        pack.set(i.toString(), 'varglobal_' + i);
    }

    let txt: string = '';

    for (const [k, v] of pack) {
        txt += `${k}=${v}\n`;
    }

    fs.writeFileSync('data/src/pack/varglobal.pack', txt);
}

export function generateVarPack(): void {
    const js5: Js5 = CacheProvider.js5[Js5Archive.Config.id];

    generateVarpPack(js5);
    generateVarbitPack(js5);
    generateVarcPack(js5);
    generateVarnPack(js5);
    generateVarWorldPack(js5);
    generateVarRegionPack(js5);
    generateVarObjectPack(js5);
    generateVarControllerPack(js5);
    generateVarGlobalPack(js5);
}
