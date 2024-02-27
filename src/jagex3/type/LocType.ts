import fs from 'fs';

import Packet from '#jagex3/io/Packet.js';
import { OpenRS2 } from '#runewiki/util/OpenRS2.js';

enum LocShape {
    wall_straight = 0,
    wall_diagonalcorner = 1,
    wall_l = 2,
    wall_squarecorner = 3,
    wall_diagonal = 9,
    walldecor_straight_nooffset = 4,
    walldecor_straight_offset = 5,
    walldecor_diagonal_nooffset = 6,
    walldecor_diagonal_offset = 7,
    walldecor_diagonal_both = 8,
    centrepiece_straight = 10,
    centrepiece_diagonal = 11,
    grounddecor = 22,
    roof_straight = 12,
    roof_diagonal_with_roofedge = 13,
    roof_diagonal = 14,
    roof_l_concave = 15,
    roof_l_convex = 16,
    roof_flat = 17,
    roofedge_straight = 18,
    roofedge_diagonalcorner = 19,
    roofedge_l = 20,
    roofedge_squarecorner = 21,
}

// hotkeys in jagex's map editor are used as the extension for loc models so they know which shape to inherit
enum LocShapeHotkey {
    _1 = 0, // 'wall_straight',
    _2 = 1, // 'wall_diagonalcorner',
    _3 = 2, // 'wall_l',
    _4 = 3, // 'wall_squarecorner',
    _5 = 9, // 'wall_diagonal',
    //
    _q = 4, // 'walldecor_straight_nooffset',
    _w = 5, // 'walldecor_straight_offset',
    _e = 6, // 'walldecor_diagonal_nooffset',
    _r = 7, // 'walldecor_diagonal_offset',
    _t = 8, // 'walldecor_diagonal_both',
    //
    _8 = 10, // 'centrepiece_straight',
    _9 = 11, // 'centrepiece_diagonal',
    _0 = 22, // 'grounddecor',
    //
    _a = 12, // 'roof_straight',
    _s = 13, // 'roof_diagonal_with_roofedge',
    _d = 14, // 'roof_diagonal',
    _f = 15, // 'roof_l_concave',
    _g = 16, // 'roof_l_convex',
    _h = 17, // 'roof_flat',
    //
    _z = 18, // 'roofedge_straight',
    _x = 19, // 'roofedge_diagonalcorner',
    _c = 20, // 'roofedge_l',
    _v = 21, // 'roofedge_squarecorner',
}

export default class LocType {
    id: number = -1;
    def: string[] = [];

    models: Int32Array | null = null;
    shapes: Int32Array | null = null;
    highRevModels: Int32Array[] | null = null;
    name: string | null = null;
    ops: string[] | null = null;
    width: number = 1;
    length: number = 1;
    blockwalk: number = 2;
    blockrange: boolean = true;
    active: number = -1;
    hillskew: number = 0;
    sharelight: boolean = false;
    occlude: number = -1;
    anim: number = -1;
    disposeAlpha: boolean = false;
    walloff: number = 16;
    ambient: number = 0;
    contrast: number = 0;
    desc: string | null = null;
    recol_s: Int32Array | null = null;
    recol_d: Int32Array | null = null;
    retex_s: Int32Array | null = null;
    retex_d: Int32Array | null = null;
    mapfunction: number = -1;
    category: number = -1;
    mirror: boolean = false;
    shadow: boolean = true;
    resizex: number = 128;
    resizey: number = 128;
    resizez: number = 128;
    mapscene: number = -1;
    forceapproach: number = -1;
    offsetx: number = 0;
    offsety: number = 0;
    offsetz: number = 0;
    forcedecor: boolean = false;
    breakroutefinding: boolean = false;
    raiseobject: number = -1;
    multiLocVarbit: number = -1;
    multiLocVarp: number = -1;
    multiLocs: Int32Array | null = null;
    bgsound: number = -1;
    bgsoundrange: number = 0;
    bgsoundmin: number = 0;
    bgsoundmax: number = 0;
    bgsounds: Int32Array | null = null;
    hillskewAmount: number = 0;
    code82: boolean = false;
    hardshadow: boolean = true;
    randseq: boolean = true;
    members: boolean = false;
    hasAnimation: boolean = false;
    mapSceneRotated: boolean = false;
    cursor1Op: number = -1;
    cursor1: number = -1;
    cursor2Op: number = -1;
    cursor2: number = -1;
    mapSceneAngleOffset: number = 0;
    soundVolume: number = 255;
    mapSceneFlipVertical: boolean = false;
    seqWeights: Int32Array | null = null;
    seqIds: Int32Array | null = null;
    totalSeqWeight: number = 0;
    mapElement: number = -1;
    params: Map<number, string | number> | null = null;

    constructor(id: number, buf: Packet, openrs2: OpenRS2) {
        this.id = id;
        this.decode(buf, openrs2);
    }

    decode(buf: Packet, openrs2: OpenRS2): void {
        let lastCode: number = -1;

        while (buf.pos < buf.length) {
            const code: number = buf.g1();
            if (code === 0) {
                break;
            }

            // jagex only needs a single model= property and doesn't have to specify the shape
            // as it gets derived from the available model on the filesystem with specific suffixes
            // since we're representing unorganized data, we have to include it in the full definition

            if (code === 1 || code === 5) {
                if (openrs2.rev >= 700) {
                    const count: number = buf.g1();
                    this.shapes = new Int32Array(count);
                    this.highRevModels = new Array(count);

                    for (let i: number = 0; i < count; i++) {
                        this.shapes[i] = buf.g1();

                        const modelCount: number = buf.g1();
                        this.highRevModels[i] = new Int32Array(modelCount);
                        for (let j: number = 0; j < modelCount; j++) {
                            this.highRevModels[i][j] = buf.gSmart2or4();
                            this.def.push(`model=model_${this.highRevModels[i][j]}${LocShapeHotkey[this.shapes[i]]}`);
                        }
                    }
                } else if (openrs2.rev >= 581) {
                    // lowmem
                    if (code == 5) {
                        const count: number = buf.g1();
                        this.shapes = new Int32Array(count);
                        this.highRevModels = new Array(count);

                        for (let i: number = 0; i < count; i++) {
                            this.shapes[i] = buf.g1();

                            const modelCount: number = buf.g1();
                            this.highRevModels[i] = new Int32Array(modelCount);
                            for (let j: number = 0; j < modelCount; j++) {
                                this.highRevModels[i][j] = buf.g2();
                                this.def.push(`ldmodel=model_${this.highRevModels[i][j]}${LocShapeHotkey[this.shapes[i]]}`);
                            }
                        }
                    }

                    // standard
                    {
                        const count: number = buf.g1();
                        this.shapes = new Int32Array(count);
                        this.highRevModels = new Array(count);

                        for (let i: number = 0; i < count; i++) {
                            this.shapes[i] = buf.g1();

                            const modelCount: number = buf.g1();
                            this.highRevModels[i] = new Int32Array(modelCount);
                            for (let j: number = 0; j < modelCount; j++) {
                                this.highRevModels[i][j] = buf.g2();
                                this.def.push(`model=model_${this.highRevModels[i][j]}${LocShapeHotkey[this.shapes[i]]}`);
                            }
                        }
                    }
                } else {
                    const count: number = buf.g1();

                    if (this.models == null) {
                        this.models = new Int32Array(count);
                        this.shapes = new Int32Array(count);

                        for (let i: number = 0; i < count; i++) {
                            this.models[i] = buf.g2();
                            if (code === 1) {
                                this.shapes[i] = buf.g1();
                            } else {
                                this.shapes[i] = 10;
                            }
                            this.def.push(`model=model_${this.models[i]}${LocShapeHotkey[this.shapes[i]]}`);
                        }
                    } else {
                        this.models = new Int32Array(count);
                        this.shapes = new Int32Array(count);

                        for (let i: number = 0; i < count; i++) {
                            this.models[i] = buf.g2();
                            if (code === 1) {
                                this.shapes[i] = buf.g1();
                            } else {
                                this.shapes[i] = 10;
                            }
                            this.def.push(`ldmodel=model_${this.models[i]}${LocShapeHotkey[this.shapes[i]]}`);
                        }
                    }
                }
            } else if (code === 2) {
                if (openrs2.isOldEngine()) {
                    this.name = buf.gjstrn();
                } else {
                    this.name = buf.gjstr();
                }
            } else if (code === 3) {
                if (openrs2.isOldEngine()) {
                    this.desc = buf.gjstrn();
                } else {
                    this.desc = buf.gjstr();
                }
            } else if (code === 14) {
                this.width = buf.g1();
                this.def.push(`width=${this.width}`);
            } else if (code === 15) {
                this.length = buf.g1();
                this.def.push(`length=${this.length}`);
            } else if (code === 17) {
                this.blockwalk = 0;
                this.blockrange = false;
                this.def.push('blockwalk=no');
            } else if (code === 18) {
                this.blockrange = false;
                this.def.push('blockrange=no');
            } else if (code === 19) {
                this.active = buf.g1();
                this.def.push(`active=${this.active ? 'yes' : 'no'}`);
            } else if (code === 21) {
                this.hillskew = 1;
                this.def.push('hillskew=yes');
            } else if (code === 22) {
                this.sharelight = true;
                this.def.push('sharelight=yes');
            } else if (code === 23) {
                this.occlude = 1;
                this.def.push('occlude=yes');
            } else if (code === 24) {
                if (openrs2.rev > 700) {
                    this.anim = buf.gSmart2or4();
                } else {
                    this.anim = buf.g2();

                    if (this.anim === 65535) {
                        this.anim = -1;
                    }
                }

                if (this.anim !== -1) {
                    this.def.push(`anim=seq_${this.anim}`);
                }
            } else if (code === 25) {
                this.disposeAlpha = true;
                this.def.push('hasalpha=yes');
            } else if (code === 27) {
                this.blockwalk = 1;
                this.def.push('blockwalk=yes');
            } else if (code === 28) {
                this.walloff = buf.g1();
                this.def.push(`walloff=${this.walloff}`);
            } else if (code === 29) {
                this.ambient = buf.g1b();
                this.def.push(`ambient=${this.ambient}`);
            } else if (code === 39) {
                this.contrast = buf.g1b();
                this.def.push(`contrast=${this.contrast}`);
            } else if (code >= 30 && code < 39) {
                if (this.ops === null) {
                    this.ops = new Array(5);
                }

                if (openrs2.isOldEngine()) {
                    this.ops[code - 30] = buf.gjstrn();
                } else {
                    this.ops[code - 30] = buf.gjstr();
                }

                this.def.push(`op${code - 29}=${this.ops[code - 30]}`);
            } else if (code === 40) {
                const count: number = buf.g1();

                this.recol_s = new Int32Array(count);
                this.recol_d = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.recol_s[i] = buf.g2();
                    this.recol_d[i] = buf.g2();

                    this.def.push(`recol${i + 1}s=${this.recol_s[i]}`);
                    this.def.push(`recol${i + 1}d=${this.recol_d[i]}`);
                }
            } else if (code === 41) {
                const count: number = buf.g1();

                this.retex_s = new Int32Array(count);
                this.retex_d = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.retex_s[i] = buf.g2();
                    this.retex_d[i] = buf.g2();

                    this.def.push(`retex${i + 1}s=${this.retex_s[i]}`);
                    this.def.push(`retex${i + 1}d=${this.retex_d[i]}`);
                }
            } else if (code === 42) {
                const count: number = buf.g1();

                const array: Uint8Array = new Uint8Array(count);
                for (let i: number = 0; i < count; i++) {
                    array[i] = buf.g1b();
                    this.def.push(`recol${i + 1}dpalette=${array[i]}`);
                }
            } else if (code === 60) {
                this.mapfunction = buf.g2();
                this.def.push(`mapfunction=${this.mapfunction}`);
            } else if (code === 61) {
                this.category = buf.g2();
                this.def.push(`category=category_${this.category}`);
            } else if (code === 62) {
                this.mirror = true;
                this.def.push('mirror=yes');
            } else if (code === 64) {
                this.shadow = false;
                this.def.push('shadow=no');
            } else if (code === 65) {
                this.resizex = buf.g2();
                this.def.push(`resizex=${this.resizex}`);
            } else if (code === 66) {
                this.resizey = buf.g2();
                this.def.push(`resizey=${this.resizey}`);
            } else if (code === 67) {
                this.resizez = buf.g2();
                this.def.push(`resizez=${this.resizez}`);
            } else if (code === 68) {
                this.mapscene = buf.g2();
                this.def.push(`mapscene=${this.mapscene}`);
            } else if (code === 69) {
                this.forceapproach = buf.g1();

                if ((this.forceapproach & 0x1) === 0) {
                    this.def.push('forceapproach=top');
                } else if ((this.forceapproach & 0x2) === 0) {
                    this.def.push('forceapproach=right');
                } else if ((this.forceapproach & 0x4) === 0) {
                    this.def.push('forceapproach=bottom');
                } else if ((this.forceapproach & 0x8) === 0) {
                    this.def.push('forceapproach=left');
                }
            } else if (code === 70) {
                this.offsetx = buf.g2s();
                this.def.push(`offsetx=${this.offsetx}`);
            } else if (code === 71) {
                this.offsety = buf.g2s();
                this.def.push(`offsety=${this.offsety}`);
            } else if (code === 72) {
                this.offsetz = buf.g2s();
                this.def.push(`offsetz=${this.offsetz}`);
            } else if (code === 73) {
                this.forcedecor = true;
                this.def.push('forcedecor=yes');
            } else if (code === 74) {
                this.breakroutefinding = true;
                this.def.push('breakroutefinding=yes');
            } else if (code === 75) {
                this.raiseobject = buf.g1();
                this.def.push(`raiseobject=${this.raiseobject ? 'yes' : 'no'}`);
            } else if (code === 77 || code === 92) {
                this.multiLocVarbit = buf.g2();
                if (this.multiLocVarbit === 65535) {
                    this.multiLocVarbit = -1;
                }

                if (this.multiLocVarbit !== -1) {
                    this.def.push(`multivarbit=varbit_${this.multiLocVarbit}`);
                }

                this.multiLocVarp = buf.g2();
                if (this.multiLocVarp === 65535) {
                    this.multiLocVarp = -1;
                }

                if (this.multiLocVarp !== -1) {
                    this.def.push(`multivar=varp_${this.multiLocVarp}`);
                }

                let defaultMultiLoc: number = -1;
                if (code === 92) {
                    if (openrs2.rev > 700) {
                        defaultMultiLoc = buf.gSmart2or4();
                    } else {
                        defaultMultiLoc = buf.g2();

                        if (defaultMultiLoc === 65535) {
                            defaultMultiLoc = -1;
                        }
                    }
                }

                const count: number = buf.g1();
                this.multiLocs = new Int32Array(count + 1);

                for (let i: number = 0; i <= count; i++) {
                    if (openrs2.rev > 700) {
                        this.multiLocs[i] = buf.gSmart2or4();
                    } else {
                        this.multiLocs[i] = buf.g2();

                        if (this.multiLocs[i] === 65535) {
                            this.multiLocs[i] = -1;
                        }
                    }
                }

                this.multiLocs[count + 1] = defaultMultiLoc;

                if (defaultMultiLoc !== -1) {
                    this.def.push(`defaultloc=loc_${defaultMultiLoc}`);
                }

                for (let i: number = 0; i <= count; i++) {
                    if (this.multiLocs[i] !== -1) {
                        this.def.push(`multiloc=${i},loc_${this.multiLocs[i]}`);
                    }
                }
            } else if (code === 78) {
                this.bgsound = buf.g2();
                this.bgsoundrange = buf.g1();
                this.def.push(`bgsound=sound_${this.bgsound},${this.bgsoundrange}`);
            } else if (code === 79) {
                this.bgsoundmin = buf.g2();
                this.bgsoundmax = buf.g2();
                this.bgsoundrange = buf.g1();
                this.def.push(`randomsound=${this.bgsoundmin},${this.bgsoundmax},${this.bgsoundrange}`);

                const count: number = buf.g1();
                this.bgsounds = new Int32Array(count);
                for (let i: number = 0; i < count; i++) {
                    this.bgsounds[i] = buf.g2();
                    this.def.push(`randomsound${i + 1}=sound_${this.bgsound}`);
                }
            } else if (code === 81) {
                this.hillskew = 2;
                this.hillskewAmount = buf.g1();
                this.def.push(`treeskew=${this.hillskewAmount}`);
            } else if (code === 82) {
                this.code82 = true;
                this.def.push('code82=yes');
            } else if (code === 88) {
                this.hardshadow = false;
                this.def.push('hardshadow=no');
            } else if (code === 89) {
                this.randseq = false;
                this.def.push('randseq=no');
            } else if (code === 90) {
                this.def.push('code90=no');
            } else if (code === 91) {
                this.members = true;
                this.def.push('members=yes');
            } else if (code === 93) {
                this.hillskew = 3;
                this.hillskewAmount = buf.g2();
                this.def.push(`rotateskew=${this.hillskewAmount}`);
            } else if (code === 94) {
                this.hillskew = 4;
                this.def.push('ceilingskew=yes');
            } else if (code === 95) {
                this.hillskew = 5;
                if (openrs2.rev >= 600) {
                    this.hillskewAmount = buf.g2s();
                    this.def.push(`skewtofit=${this.hillskewAmount}`);
                } else {
                    this.def.push('skewtofit=yes');
                }
            } else if (code === 96) {
                this.hasAnimation = true;
                this.def.push('code96=yes');
            } else if (code === 97) {
                this.mapSceneRotated = true;
                this.def.push('mapscenerotates=yes');
            } else if (code === 98) {
                this.def.push('code98=yes');
            } else if (code === 99) {
                this.cursor1Op = buf.g1();
                this.cursor1 = buf.g2();
                this.def.push(`cursor1=op${this.cursor1Op + 1},cursor_${this.cursor1}`);
            } else if (code === 100) {
                this.cursor2Op = buf.g1();
                this.cursor2 = buf.g2();
                this.def.push(`cursor2=op${this.cursor2Op + 1},cursor_${this.cursor2}`);
            } else if (code === 101) {
                this.mapSceneAngleOffset = buf.g1();
                this.def.push(`mapsceneangle=${this.mapSceneAngleOffset}`);
            } else if (code === 102) {
                this.mapscene = buf.g2();
                this.def.push(`mapscene=${this.mapscene}`);
            } else if (code === 103) {
                this.occlude = 0;
                this.def.push('occlude=no');
            } else if (code === 104) {
                this.soundVolume = buf.g1();
                this.def.push(`bgsoundvol=${this.soundVolume}`);
            } else if (code === 105) {
                this.mapSceneFlipVertical = true;
                this.def.push('mapsceneflipy=yes');
            } else if (code === 106) {
                const count: number = buf.g1();
                this.seqWeights = new Int32Array(count);
                this.seqIds = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    if (openrs2.rev > 700) {
                        this.seqIds[i] = buf.gSmart2or4();
                    } else {
                        this.seqIds[i] = buf.g2();
                    }

                    const weight: number = buf.g1();
                    this.seqWeights[i] = weight;
                    this.totalSeqWeight += weight;

                    this.def.push(`anim${i + 1}=${this.seqIds[i]},${weight}`);
                }
            } else if (code === 107) {
                this.mapElement = buf.g2();
                this.def.push(`mel=mel_${this.mapElement}`);
            } else if (code >= 150 && code < 155) {
                if (this.ops === null) {
                    this.ops = new Array(5);
                }

                this.ops[code - 150] = buf.gjstr();
                this.def.push(`memberop${code - 149}=${this.ops[code - 150]}`);
            } else if (code === 160) {
                const count: number = buf.g1();

                const array: Int32Array = new Int32Array(count);
                for (let i: number = 0; i < count; i++) {
                    array[i] = buf.g2();
                    this.def.push(`quest${i + 1}=quest_${array[i]}`);
                }
            } else if (code === 162) {
                this.hillskew = 3;
                this.hillskewAmount = buf.g4();
                this.def.push(`rotateskew=${this.hillskewAmount}`);
            } else if (code === 163) {
                const byte1: number = buf.g1b();
                const byte2: number = buf.g1b();
                const byte3: number = buf.g1b();
                const byte4: number = buf.g1b();
                this.def.push(`tint=${byte1},${byte2},${byte3},${byte4}`);
            } else if (code === 164) {
                const int1: number = buf.g2s();
                this.def.push(`postoffsetx=${int1}`);
            } else if (code === 165) {
                const int1: number = buf.g2s();
                this.def.push(`postoffsety=${int1}`);
            } else if (code === 166) {
                const int1: number = buf.g2s();
                this.def.push(`postoffsetz=${int1}`);
            } else if (code === 167) {
                const int1: number = buf.g2();
                this.def.push(`decorheight=${int1}`);
            } else if (code === 168) {
                this.def.push('code168=yes');
            } else if (code === 169) {
                this.def.push('code169=yes');
            } else if (code === 170) {
                const int1: number = buf.gSmart1or2();
                this.def.push(`occludewidth=${int1}`);
            } else if (code === 171) {
                const int1: number = buf.gSmart1or2();
                this.def.push(`occludeheight=${int1}`);
            } else if (code === 173) {
                const int1: number = buf.g2();
                const int2: number = buf.g2();
                this.def.push(`bgsoundrate=${int1},${int2}`);
            } else if (code === 177) {
                this.def.push('code177=yes');
            } else if (code === 178) {
                const int1: number = buf.g1();
                this.def.push(`bgsounddistance=${int1}`);
            } else if (code === 189) {
                this.def.push('code189=yes');
            } else if (code === 249) {
                const count: number = buf.g1();

                if (this.params === null) {
                    this.params = new Map<number, string | number>();
                }

                for (let i: number = 0; i < count; i++) {
                    const isString: boolean = buf.g1() === 1;
                    const key: number = buf.g3();

                    if (isString) {
                        if (openrs2.isOldEngine()) {
                            this.params.set(key, buf.gjstrn());
                        } else {
                            this.params.set(key, buf.gjstr());
                        }
                    } else {
                        this.params.set(key, buf.g4());
                    }

                    this.def.push(`param=param_${key},${this.params.get(key)}`);
                }
            } else {
                console.error(this.def, buf.pos.toString(16));
                if (fs.existsSync('dump')) {
                    fs.writeFileSync('dump/error.bin', buf.data);
                }
                throw new Error(`Error unrecognized config code ${code} while decoding loc ${this.id}, last code: ${lastCode}`);
            }

            lastCode = code;
        }
    }

    exportDef(out: string[]): void {
        out.push(`[loc_${this.id}]`);

        // these properties won't affect the crc by being moved to the beginning
        if (this.name !== null) {
            out.push(`name=${this.name}`);
        }

        if (this.desc !== null) {
            out.push(`desc=${this.desc}`);
        }

        out.push(...this.def);
        out.push('');
    }
}
