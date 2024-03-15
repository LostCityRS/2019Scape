import {CollisionFlagMap, LineValidator, NaivePathFinder, PathFinder, StepValidator} from '@2004scape/rsmod-pathfinder';
import {Js5ArchiveType} from '#jagex/config/Js5Archive.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import Js5 from '#jagex/js5/Js5.js';
import Js5MapFile from '#jagex/js5/Js5MapFile.js';
import Packet from '#jagex/bytepacking/Packet.js';
import RoofCollider from '#lostcity/engine/collision/RoofCollider.js';
import FloorCollider from '#lostcity/engine/collision/FloorCollider.js';
import {LocShapes} from '#lostcity/engine/collision/LocShape.js';
import LocLayer from '#lostcity/engine/collision/LocLayer.js';
import LocAngle from '#lostcity/engine/collision/LocAngle.js';
import WallCollider from '#lostcity/engine/collision/WallCollider.js';
import LocCollider from '#lostcity/engine/collision/LocCollider.js';
import NpcCollider from '#lostcity/engine/collision/NpcCollider.js';
import PlayerCollider from '#lostcity/engine/collision/PlayerCollider.js';
import * as console from 'console';

export default class CollisionManager {
    private static readonly SHIFT_25: number = Math.pow(2, 25);

    readonly flags: CollisionFlagMap;
    readonly stepValidator: StepValidator;
    readonly pathFinder: PathFinder;
    readonly naivePathFinder: NaivePathFinder;
    readonly lineValidator: LineValidator;

    private readonly floorCollider: FloorCollider;
    private readonly wallCollider: WallCollider;
    private readonly locCollider: LocCollider;
    private readonly npcCollider: NpcCollider;
    private readonly roofCollider: RoofCollider;
    private readonly playerCollider: PlayerCollider;

    constructor() {
        this.flags = new CollisionFlagMap();
        this.stepValidator = new StepValidator(this.flags);
        this.floorCollider = new FloorCollider(this.flags);
        this.wallCollider = new WallCollider(this.flags);
        this.locCollider = new LocCollider(this.flags);
        this.npcCollider = new NpcCollider(this.flags);
        this.roofCollider = new RoofCollider(this.flags);
        this.playerCollider = new PlayerCollider(this.flags);
        this.pathFinder = new PathFinder(this.flags);
        this.naivePathFinder = new NaivePathFinder(this.stepValidator);
        this.lineValidator = new LineValidator(this.flags);
    }

    init = async (): Promise<void> => {
        console.time('Loading collision');

        const maps: Js5 = CacheProvider.js5[Js5ArchiveType.Maps];
        const groups: Int32Array | null = maps.getGroupIds();
        if (groups === null) {
            throw new Error('[CollisionManager] Unable to find Js5 Maps group ids.')
        }
        for (let index: number = 0; index < groups.length; index++) {
            const groupId: number = groups[index];
            // land is required for anything else.
            if (!maps.isFileValid(groupId, Js5MapFile.LAND)) {
                continue;
            }

            const lands: Int8Array = new Int8Array(4 * 64 * 64); // 4 * 64 * 64 size is guaranteed for lands
            const locs: number[] = []; // dynamically grow locs

            this.decodeLands(lands, Packet.wrap(await maps.readFile(groupId, Js5MapFile.LAND), false));
            this.decodeLocs(locs, Packet.wrap(await maps.readFile(groupId, Js5MapFile.LOC), false));

            const mapsquareX: number = (groupId & 0x7f) << 6;
            const mapsquareZ: number = (groupId >> 7) << 6;

            this.applyLandCollision(mapsquareX, mapsquareZ, lands);
            this.applyLocCollision(locs, mapsquareX, mapsquareZ, lands);
        }

        console.timeEnd('Loading collision');
    }

    changeLandCollision = (x: number, z: number, level: number, add: boolean): void => {
        this.floorCollider.change(x, z, level, add);
    }

    changeLocCollision = (shape: number, angle: number, blockrange: boolean, breakroutefinding: boolean, length: number, width: number, active: number, x: number, z: number, level: number, add: boolean): void => {
        const locLayer: LocLayer = LocShapes.layer(shape);
        if (locLayer === LocLayer.WALL) {
            this.wallCollider.change(x, z, level, angle, shape, blockrange, breakroutefinding, add);
        } else if (locLayer === LocLayer.GROUND) {
            if (angle === LocAngle.NORTH || angle === LocAngle.SOUTH) {
                this.locCollider.change(x, z, level, length, width, blockrange, breakroutefinding, add);
            } else {
                this.locCollider.change(x, z, level, width, length, blockrange, breakroutefinding, add);
            }
        } else if (locLayer === LocLayer.GROUND_DECOR) {
            if (active === 1) {
                this.floorCollider.change(x, z, level, add);
            }
        }
    }

    changeNpcCollision = (size: number, x: number, z: number, level: number, add: boolean): void => {
        this.npcCollider.change(x, z, level, size, add);
    }

    changePlayerCollision = (size: number, x: number, z: number, level: number, add: boolean): void => {
        this.playerCollider.change(x, z, level, size, add);
    }

    changeRoofCollision = (x: number, z: number, level: number, add: boolean): void => {
        this.roofCollider.change(x, z, level, add);
    }

    private applyLandCollision = (mapsquareX: number, mapsquareZ: number, lands: Int8Array): void => {
        for (let level: number = 0; level < 4; level++) {
            for (let x: number = 0; x < 64; x++) {
                const absoluteX: number = x + mapsquareX;

                for (let z: number = 0; z < 64; z++) {
                    const absoluteZ: number = z + mapsquareZ;

                    if (x % 7 === 0 && z % 7 === 0) { // allocate per zone
                        this.flags.allocateIfAbsent(absoluteX, absoluteZ, level);
                    }

                    const land: number = lands[this.packCoord(x, z, level)];
                    if ((land & 0x4) !== 0) {
                        this.changeRoofCollision(absoluteX, absoluteZ, level, true);
                    }
                    if ((land & 0x1) !== 1) {
                        continue;
                    }

                    const adjustedLevel: number = (lands[this.packCoord(x, z, 1)] & 0x2) === 2 ? level - 1 : level;
                    if (adjustedLevel < 0) {
                        continue;
                    }

                    this.changeLandCollision(absoluteX, absoluteZ, adjustedLevel, true);
                }
            }
        }
    }

    private applyLocCollision = (locs: number[], mapsquareX: number, mapsquareZ: number, lands: Int8Array): void => {
        for (let index: number = 0; index < locs.length; index++) {
            const packed: number = locs[index];
            const {id, shape, coord, angle} = this.unpackLoc(packed);
            const {x, z, level} = this.unpackCoord(coord);

            const absoluteX: number = x + mapsquareX;
            const absoluteZ: number = z + mapsquareZ;

            const adjustedLevel: number = (lands[this.packCoord(x, z, 1)] & 0x2) === 2 ? level - 1 : level;
            if (adjustedLevel < 0) {
                continue;
            }

            // TODO LocType config
            this.changeLocCollision(shape, angle, false, false, 1, 1, 1, absoluteX, absoluteZ, level, true);
        }
    }

    private groupId = (mx: number, mz: number): number => {
        return mx | mz << 7;
    }

    private decodeLands = (lands: Int8Array, buf: Packet): void => {
        for (let level: number = 0; level < 4; level++) {
            for (let x: number = 0; x < 64; x++) {
                for (let z: number = 0; z < 64; z++) {
                    lands[this.packCoord(x, z, level)] = this.decodeLand(buf);
                }
            }
        }
    }

    private decodeLand = (buf: Packet): number => {
        const opcode: number = buf.g1();
        if ((opcode & 0x1) !== 0) {
            buf.g1();
            buf.gSmart1or2();
        }
        let collision: number = 0;
        if ((opcode & 0x2) !== 0) {
            collision = buf.g1b();
        }
        if ((opcode & 0x4) !== 0) {
            buf.gSmart1or2();
        }
        if ((opcode & 0x8) !== 0) {
            buf.g1();
        }
        return collision;
    }

    private decodeLocs = (locs: number[], buf: Packet): void => {
        let locId: number = -1;
        let locIdOffset: number = buf.gExtended1or2();

        while (locIdOffset !== 0) {
            locId += locIdOffset;

            let coord: number = 0;
            let coordOffset: number = buf.gSmart1or2();

            while (coordOffset !== 0) {
                coord += coordOffset - 1;

                const attributes: number = buf.g1();
                if ((attributes & 0x80) !== 0) {
                    const scalerottrans: number = buf.g1();
                    if ((scalerottrans & 0x1) !== 0) {
                        buf.pos += 8;
                    }
                    if ((scalerottrans & 0x2) !== 0) {
                        buf.pos += 2;
                    }
                    if ((scalerottrans & 0x4) !== 0) {
                        buf.pos += 2;
                    }
                    if ((scalerottrans & 0x8) !== 0) {
                        buf.pos += 2;
                    }
                    if ((scalerottrans & 0x10) === 0) {
                        if ((scalerottrans & 0x20) !== 0) {
                            buf.pos += 2;
                        }
                        if ((scalerottrans & 0x40) !== 0) {
                            buf.pos += 2;
                        }
                        if ((scalerottrans & 0x80) !== 0) {
                            buf.pos += 2;
                        }
                    } else {
                        buf.pos += 2;
                    }
                }
                locs.push(this.packLoc(locId, attributes >> 2, attributes & 0x3, coord));

                coordOffset = buf.gSmart1or2();
            }
            locIdOffset = buf.gExtended1or2();
        }
    }

    private packCoord = (x: number, z: number, level: number): number => {
        return (z & 0x3f) | ((x & 0x3f) << 6) | ((level & 0x3) << 12);
    }

    private unpackCoord = (packed: number): { level: number; x: number; z: number } => {
        const z: number = packed & 0x3f;
        const x: number = (packed >> 6) & 0x3f;
        const level: number = (packed >> 12) & 0x3;
        return { x, z, level };
    }

    private packLoc = (id: number, shape: number, angle: number, coord: number): number => {
        const lowBits: number = (id & 0x3ffff) | ((shape & 0x1f) << 18) | ((angle & 0x3) << 23);
        const highBits: number = coord & 0x3fff;
        return lowBits + highBits * CollisionManager.SHIFT_25;
    }

    private unpackLoc = (packed: number): { coord: number; shape: number; angle: number; id: number } => {
        const id: number = packed & 0x3ffff;
        const shape: number = (packed >> 18) & 0x1f;
        const angle: number = (packed >> 23) & 0x3;
        const coord: number = (packed / CollisionManager.SHIFT_25) & 0x3fff;
        return { id, shape, angle, coord };
    }
}