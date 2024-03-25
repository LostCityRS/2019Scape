import { CollisionFlagMap } from '@2004scape/rsmod-pathfinder';

import WallStraightCollider from '#lostcity/engine/collision/wall/WallStraightCollider.js';
import WallCornerCollider from '#lostcity/engine/collision/wall/WallCornerCollider.js';
import WallCornerLCollider from '#lostcity/engine/collision/wall/WallCornerLCollider.js';
import {LocShape} from '#jagex/config/loctype/LocShape.js';

export default class WallCollider {
    private readonly wallStraightCollider: WallStraightCollider;
    private readonly wallCornerCollider: WallCornerCollider;
    private readonly wallCornerLCollider: WallCornerLCollider;

    constructor(flags: CollisionFlagMap) {
        this.wallStraightCollider = new WallStraightCollider(flags);
        this.wallCornerCollider = new WallCornerCollider(flags);
        this.wallCornerLCollider = new WallCornerLCollider(flags);
    }

    change = (x: number, z: number, level: number, angle: number, shape: number, blockrange: boolean, breakroutefinding: boolean, add: boolean): void => {
        if (shape === LocShape.WALL_STRAIGHT.id) {
            this.wallStraightCollider.change(x, z, level, angle, blockrange, breakroutefinding, add);
        } else if (shape === LocShape.WALL_DIAGONAL_CORNER.id || shape === LocShape.WALL_SQUARE_CORNER.id) {
            this.wallCornerCollider.change(x, z, level, angle, blockrange, breakroutefinding, add);
        } else if (shape === LocShape.WALL_L.id) {
            this.wallCornerLCollider.change(x, z, level, angle, blockrange, breakroutefinding, add);
        } else {
            throw new Error(`Invalid loc shape for wall collider. Shape was: ${shape}.`);
        }
    }
}
