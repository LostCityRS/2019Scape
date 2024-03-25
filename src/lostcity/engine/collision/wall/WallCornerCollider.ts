import { CollisionFlag, CollisionFlagMap } from '@2004scape/rsmod-pathfinder';

import LocAngle from '#jagex/config/loctype/LocAngle.js';

export default class WallCornerCollider {
    private readonly flags: CollisionFlagMap;

    constructor(flags: CollisionFlagMap) {
        this.flags = flags;
    }

    change = (x: number, z: number, level: number, angle: number, blockrange: boolean, breakroutefinding: boolean, add: boolean): void => {
        const northWest: number = breakroutefinding ? CollisionFlag.WALL_NORTH_WEST_ROUTE_BLOCKER : blockrange ? CollisionFlag.WALL_NORTH_WEST_PROJ_BLOCKER : CollisionFlag.WALL_NORTH_WEST;
        const southEast: number = breakroutefinding ? CollisionFlag.WALL_SOUTH_EAST_ROUTE_BLOCKER : blockrange ? CollisionFlag.WALL_SOUTH_EAST_PROJ_BLOCKER : CollisionFlag.WALL_SOUTH_EAST;
        const northEast: number = breakroutefinding ? CollisionFlag.WALL_NORTH_EAST_ROUTE_BLOCKER : blockrange ? CollisionFlag.WALL_NORTH_EAST_PROJ_BLOCKER : CollisionFlag.WALL_NORTH_EAST;
        const southWest: number = breakroutefinding ? CollisionFlag.WALL_SOUTH_WEST_ROUTE_BLOCKER : blockrange ? CollisionFlag.WALL_SOUTH_WEST_PROJ_BLOCKER : CollisionFlag.WALL_SOUTH_WEST;

        if (angle === LocAngle.WEST) {
            if (add) {
                this.flags.add(x, z, level, northWest);
                this.flags.add(x - 1, z + 1, level, southEast);
            } else {
                this.flags.remove(x, z, level, northWest);
                this.flags.remove(x - 1, z + 1, level, southEast);
            }
        } else if (angle === LocAngle.NORTH) {
            if (add) {
                this.flags.add(x, z, level, northEast);
                this.flags.add(x + 1, z + 1, level, southWest);
            } else {
                this.flags.remove(x, z, level, northEast);
                this.flags.remove(x + 1, z + 1, level, southWest);
            }
        } else if (angle === LocAngle.EAST) {
            if (add) {
                this.flags.add(x, z, level, southEast);
                this.flags.add(x + 1, z - 1, level, northWest);
            } else {
                this.flags.remove(x, z, level, southEast);
                this.flags.remove(x + 1, z - 1, level, northWest);
            }
        } else if (angle === LocAngle.SOUTH) {
            if (add) {
                this.flags.add(x, z, level, southWest);
                this.flags.add(x - 1, z - 1, level, northEast);
            } else {
                this.flags.remove(x, z, level, southWest);
                this.flags.remove(x - 1, z - 1, level, northEast);
            }
        }
        if (breakroutefinding) {
            return this.change(x, z, level, angle, blockrange, false, add);
        }
        if (blockrange) {
            // If just blocked projectiles, then block normally next.
            return this.change(x, z, level, angle, false, false, add);
        }
    }
}
