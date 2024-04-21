import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Packet from '#jagex/bytepacking/Packet.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';
import {ConfigType} from '#jagex/config/ConfigType.js';
import {ParamHelper, ParamMap} from '#jagex/config/ParamHelper.js';
import {LocShape} from '@2004scape/rsmod-pathfinder';

export default class LocType extends ConfigType {
    private static readonly cached: Map<number, LocType> = new Map();

    static async list(id: number, js5: Js5[]): Promise<LocType> {
        const cached: LocType | undefined = this.cached.get(id);
        if (cached) {
            return cached;
        }

        const type: LocType = new LocType(id);

        const group: Js5ConfigGroup = Js5ConfigGroup.LOCTYPE;
        const buf: Uint8Array | null = await js5[Js5Archive.ConfigLoc.id].readFile(group.getGroupId(id), group.getFileId(id));
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        type.postDecode();
        this.cached.set(id, type);
        return type;
    }

    shapes: Int8Array | null = null;
    models: (Int32Array | null)[] | null = null;
    name: string = 'null';
    width: number = 1;
    length: number = 1;
    blockwalk: number = 2;
    blockrange: boolean = true;
    active: number = -1;
    hillchange: number = 0;
    hillchange_value: number = -1;
    sharelight: boolean = false;
    occlude: number = -1;
    anim: Int32Array | null = null;
    anim_weight: Int32Array | null = null;
    walloff: number = 64;
    ambient: number = 0;
    contrast: number = 0;
    op: (string | null)[] | null = [null, null, null, null, null, 'Examine'];
    recol_s: Uint16Array | null = null;
    recol_d: Uint16Array | null = null;
    recol_d_palette: Int8Array | null = null;
    retex_s: Uint16Array | null = null;
    retex_d: Uint16Array | null = null;
    recolindices: Int8Array | null = null;
    retexindices: Int8Array | null = null;
    mirror: boolean = false;
    shadow: boolean = true;
    resizex: number = 128;
    resizey: number = 128;
    resizez: number = 128;
    forceapproach: number = 0;
    xoff: number = 0;
    yoff: number = 0;
    zoff: number = 0;
    forcedecor: boolean = false;
    breakroutefinding: boolean = false;
    raiseobject: number = -1;
    multivarbit: number = -1;
    multivarp: number = -1;
    multiloc: Int32Array | null = null;
    bgsound_sound: number = -1;
    bgsound_range: number = 0;
    bgsound_size: number = 0;
    bgsound_volume: number = 255;
    bgsound_mindelay: number = 0;
    bgsound_maxdelay: number = 0;
    bgsound_random: Uint16Array | null = null;
    istexture: boolean = false;
    hardshadow: boolean = true;
    randomanimframe: boolean = true;
    members: boolean = false;
    mapsceneiconrotate: boolean = false;
    code98: boolean = false;
    code99_1: number = 0;
    code99_2: number = 0;
    code100_1: number = 0;
    code100_2: number = 0;
    code101: number = 0;
    mapsceneicon: number = -1;
    mapsceneiconmirror: boolean = false;
    mapelement: number = -1;
    quests: Uint16Array | null = null;
    tint_hue: number = 0;
    tint_saturation: number = 0;
    tint_luminence: number = 0;
    tint_weight: number = 0;
    post_xoff: number = 0;
    post_yoff: number = 0;
    post_zoff: number = 0;
    code167: number = 0;
    code170: number = 960;
    code171: number = 0;
    bgsound_minrate: number = 256;
    bgsound_maxrate: number = 256;
    code177: boolean = false;
    code186: number = 1;
    code196: number = 0;
    code197: number = 0;
    antimacro: boolean = false;
    cursor: Int32Array | null = null;
    code200: boolean = false;
    clickbox_minX: number = 0;
    clickbox_minY: number = 0;
    clickbox_minZ: number = 0;
    clickbox_maxX: number = 0;
    clickbox_maxY: number = 0;
    clickbox_maxZ: number = 0;
    params: ParamMap = new Map();

    decode = (buf: Packet, code: number): void => {
        if (code === 1) {
            const shapes: number = buf.g1();
            this.shapes = new Int8Array(shapes);
            this.models = new Array(shapes).fill(null);
            for (let s: number = 0; s < shapes; s++) {
                this.shapes[s] = buf.g1b();
                const models: number = buf.g1();
                this.models[s] = new Int32Array(models);
                for (let m: number = 0; m < models; m++) {
                    const model: Int32Array | null = this.models[s];
                    if (model) {
                        model[m] = buf.gSmart2or4null();
                    }
                }
            }
        } else if (code === 2) {
            this.name = buf.gjstr(); // java client caches names in memory
        } else if (code === 14) {
            this.width = buf.g1();
        } else if (code === 15) {
            this.length = buf.g1();
        } else if (code === 17) {
            this.blockwalk = 0;
        } else if (code === 18) {
            this.blockrange = false;
        } else if (code === 19) {
            this.active = buf.g1();
        } else if (code === 21) {
            this.hillchange = 1;
        } else if (code === 22) {
            this.sharelight = true;
        } else if (code === 23) {
            this.occlude = 1;
        } else if (code === 24) {
            const defaultId: number = buf.gSmart2or4null();
            if (defaultId !== -1) {
                this.anim = new Int32Array([defaultId]);
            }
        } else if (code === 27) {
            this.blockwalk = 1;
        } else if (code === 28) {
            this.walloff = buf.g1() << 2;
        } else if (code === 29) {
            this.ambient = buf.g1b();
        } else if (code === 39) {
            this.contrast = buf.g1b();
        } else if (code >= 30 && code < 35) {
            this.op![code - 30] = buf.gjstr();
        } else if (code === 40) {
            const length: number = buf.g1();
            this.recol_s = new Uint16Array(length);
            this.recol_d = new Uint16Array(length);
            for (let index: number = 0; index < length; index++) {
                this.recol_s[index] = buf.g2();
                this.recol_d[index] = buf.g2();
            }
        } else if (code === 41) {
            const length: number = buf.g1();
            this.retex_s = new Uint16Array(length);
            this.retex_d = new Uint16Array(length);
            for (let index: number = 0; index < length; index++) {
                this.retex_s[index] = buf.g2();
                this.retex_d[index] = buf.g2();
            }
        } else if (code === 42) {
            const length: number = buf.g1();
            this.recol_d_palette = new Int8Array(length);
            for (let index: number = 0; index < length; index++) {
                this.recol_d_palette[index] = buf.g1b();
            }
        } else if (code === 44) {
            const info: number = buf.g2();
            let length: number = 0;
            for (let num: number = info; num > 0; num >>= 0x1) {
                length++;
            }
            this.recolindices = new Int8Array(length);
            let recolIndex: number = 0;
            for (let index: number = 0; index < length; index++) {
                if ((info & 0x1 << index) > 0) {
                    this.recolindices[index] = recolIndex++;
                } else {
                    this.recolindices[index] = -1;
                }
            }
        } else if (code === 45) {
            const info: number = buf.g2();
            let length: number = 0;
            for (let num: number = info; num > 0; num >>= 0x1) {
                length++;
            }
            this.retexindices = new Int8Array(length);
            let retexIndex: number = 0;
            for (let index: number = 0; index < length; index++) {
                if ((info & 0x1 << index) > 0) {
                    this.retexindices[index] = retexIndex++;
                } else {
                    this.retexindices[index] = -1;
                }
            }
        } else if (code === 62) {
            this.mirror = true;
        } else if (code === 64) {
            this.shadow = false;
        } else if (code === 65) {
            this.resizex = buf.g2();
        } else if (code === 66) {
            this.resizey = buf.g2();
        } else if (code === 67) {
            this.resizez = buf.g2();
        } else if (code === 69) {
            this.forceapproach = buf.g1();
        } else if (code === 70) {
            this.xoff = buf.g2s() << 2;
        } else if (code === 71) {
            this.yoff = buf.g2s() << 2;
        } else if (code === 72) {
            this.zoff = buf.g2s() << 2;
        } else if (code === 73) {
            this.forcedecor = true;
        } else if (code === 74) {
            this.breakroutefinding = true;
        } else if (code === 75) {
            this.raiseobject = buf.g1();
        } else if (code === 77 || code === 92) {
            this.multivarbit = buf.g2();
            if (this.multivarbit === 65535) {
                this.multivarbit = -1;
            }
            this.multivarp = buf.g2();
            if (this.multivarp === 65535) {
                this.multivarp = -1;
            }
            let defaultId: number = -1;
            if (code === 92) {
                defaultId = buf.gSmart2or4null();
            }
            const length: number = buf.gSmart1or2();
            this.multiloc = new Int32Array(length + 2);
            for (let index: number = 0; index <= length; index++) {
                this.multiloc[index] = buf.gSmart2or4null();
            }
            this.multiloc[length + 1] = defaultId;
        } else if (code === 78) {
            this.bgsound_sound = buf.g2();
            this.bgsound_range = buf.g1();
        } else if (code === 79) {
            this.bgsound_mindelay = buf.g2();
            this.bgsound_maxdelay = buf.g2();
            this.bgsound_range = buf.g1();
            const var24: number = buf.g1();
            this.bgsound_random = new Uint16Array(var24);
            for (let index: number = 0; index < var24; index++) {
                this.bgsound_random[index] = buf.g2();
            }
        } else if (code === 81) {
            this.hillchange = 2;
            this.hillchange_value = buf.g1() * 256;
        } else if (code === 82) {
            this.istexture = true;
        } else if (code === 88) {
            this.hardshadow = false;
        } else if (code === 89) {
            this.randomanimframe = false;
        } else if (code === 91) {
            this.members = true;
        } else if (code === 93) {
            this.hillchange = 3;
            this.hillchange_value = buf.g2();
        } else if (code === 94) {
            this.hillchange = 4;
        } else if (code === 95) {
            this.hillchange = 5;
            this.hillchange_value = buf.g2s();
        } else if (code === 97) {
            this.mapsceneiconrotate = true;
        } else if (code === 98) {
            this.code98 = true;
        } else if (code === 99) {
            this.code99_1 = buf.g1();
            this.code99_2 = buf.g2();
        } else if (code === 100) {
            this.code100_1 = buf.g1();
            this.code100_2 = buf.g2();
        } else if (code === 101) {
            this.code101 = buf.g1();
        } else if (code === 102) {
            this.mapsceneicon = buf.g2();
        } else if (code === 103) {
            this.occlude = 0;
        } else if (code === 104) {
            this.bgsound_volume = buf.g1();
        } else if (code === 105) {
            this.mapsceneiconmirror = true;
        } else if (code === 106) {
            const length: number = buf.g1();
            let weight: number = 0;
            this.anim = new Int32Array(length);
            this.anim_weight = new Int32Array(length);
            for (let index: number = 0; index < length; index++) {
                this.anim[index] = buf.gSmart2or4null();
                weight += this.anim_weight[index] = buf.g1();
            }
            for (let index: number = 0; index < length; index++) {
                this.anim_weight[index] = ((this.anim_weight[index] * 65535) / weight) | 0;
            }
        } else if (code === 107) {
            this.mapelement = buf.g2();
        } else if (code >= 150 && code < 155) {
            this.op![code - 150] = buf.gjstr();
            /*if (!this.factory.allowMembers) {
                this.op[code - 150] = null;
            }*/
        } else if (code === 160) {
            const length: number = buf.g1();
            this.quests = new Uint16Array(length);
            for (let index: number = 0; index < length; index++) {
                this.quests[index] = buf.g2();
            }
        } else if (code === 162) {
            this.hillchange = 3;
            this.hillchange_value = buf.g4();
        } else if (code === 163) {
            this.tint_hue = buf.g1b();
            this.tint_saturation = buf.g1b();
            this.tint_luminence = buf.g1b();
            this.tint_weight = buf.g1b();
        } else if (code === 164) {
            this.post_xoff = buf.g2s();
        } else if (code === 165) {
            this.post_yoff = buf.g2s();
        } else if (code === 166) {
            this.post_zoff = buf.g2s();
        } else if (code === 167) {
            this.code167 = buf.g2();
        } else if (code === 170) {
            this.code170 = buf.gSmart1or2();
        } else if (code === 171) {
            this.code171 = buf.gSmart1or2();
        } else if (code === 173) {
            this.bgsound_minrate = buf.g2();
            this.bgsound_maxrate = buf.g2();
        } else if (code === 177) {
            this.code177 = true;
        } else if (code === 178) {
            this.bgsound_size = buf.g1();
        } else if (code === 186) {
            this.code186 = buf.g1();
        } else if (code === 189) {
            this.antimacro = true;
        } else if (code >= 190 && code < 196) {
            if (!this.cursor) {
                this.cursor = new Int32Array(6).fill(-1);
            }
            this.cursor[code - 190] = buf.g2();
        } else if (code === 196) {
            this.code196 = buf.g1();
        } else if (code === 197) {
            this.code197 = buf.g1();
        } else if (code === 200) {
            this.code200 = true;
        } else if (code === 201) {
            this.clickbox_minX = buf.gSmart1or2s();
            this.clickbox_minY = buf.gSmart1or2s();
            this.clickbox_minZ = buf.gSmart1or2s();
            this.clickbox_maxX = buf.gSmart1or2s();
            this.clickbox_maxY = buf.gSmart1or2s();
            this.clickbox_maxZ = buf.gSmart1or2s();
        } else if (code === 249) {
            this.params = ParamHelper.decode(buf);
        }
    }
    
    private postDecode = (): void => {
        this.postDecodeActive();
        if (this.breakroutefinding) {
            this.blockwalk = 0;
        }
        /*if (!this.factory.allowMembers && this.members) {
            this.op = null;
            this.quests = null;
        }*/
    }
    
    private postDecodeActive = (): void => {
        if (this.active === -1) {
            this.active = 0;
            if (this.shapes && this.shapes.length === 1 && LocShape.CENTREPIECE_STRAIGHT === this.shapes[0]) {
                this.active = 1;
            }
            for (let index: number = 0; index < 5; index++) {
                if (this.op && this.op[index] !== null) {
                    this.active = 1;
                    break;
                }
            }
        }
        if (this.raiseobject === -1) {
            this.raiseobject = this.blockwalk === 0 ? 0 : 1;
        }
        if (this.hasAnim() || this.code98 || this.multiloc) {
            this.code177 = true;
        }
        if (this.active <= 0 && this.code186 === 0) { /* empty */ }
    }
    
    private hasAnim = (): boolean => {
        return this.anim !== null;
    }
}