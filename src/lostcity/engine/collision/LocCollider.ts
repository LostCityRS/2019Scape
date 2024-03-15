import { CollisionFlag, CollisionFlagMap } from '@2004scape/rsmod-pathfinder';

export default class LocCollider {
    private readonly flags: CollisionFlagMap;

    constructor(flags: CollisionFlagMap) {
        this.flags = flags;
    }

    change = (x: number, z: number, level: number, width: number, length: number, blockrange: boolean, breakroutefinding: boolean, add: boolean): void => {
        let mask: number = CollisionFlag.LOC;
        if (blockrange) {
            mask |= CollisionFlag.LOC_PROJ_BLOCKER;
        }
        if (breakroutefinding) {
            mask |= CollisionFlag.LOC_ROUTE_BLOCKER;
        }
        for (let index: number = 0; index < width * length; index++) {
            const deltaX: number = x + (index % width);
            const deltaZ: number = z + index / width;
            if (add) {
                this.flags.add(deltaX, deltaZ, level, mask);
            } else {
                this.flags.remove(deltaX, deltaZ, level, mask);
            }
        }
    }
}
