import { CollisionFlag, CollisionFlagMap } from '@2004scape/rsmod-pathfinder';

export default class NpcCollider {
    private readonly flags: CollisionFlagMap;

    constructor(flags: CollisionFlagMap) {
        this.flags = flags;
    }

    change = (x: number, z: number, level: number, size: number, add: boolean): void => {
        const mask: number = CollisionFlag.NPC;
        for (let index: number = 0; index < size * size; index++) {
            const deltaX: number = x + (index % size);
            const deltaZ: number = z + index / size;
            if (add) {
                this.flags.add(deltaX, deltaZ, level, mask);
            } else {
                this.flags.remove(deltaX, deltaZ, level, mask);
            }
        }
    }
}
