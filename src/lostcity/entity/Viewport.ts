import Player from '#lostcity/entity/Player.js';

export default class Viewport {
    // constructor
    readonly nsnFlags: Int32Array;
    readonly positions: Int32Array;
    readonly high: Int32Array;
    readonly low: Int32Array;

    // persisted high players.
    readonly players: (Player | undefined)[];

    // runtime
    highCount: number = 0;
    lowCount: number = 0;

    // for tracking high/low changes per tick.
    updates: Set<number> = new Set();

    constructor() {
        this.nsnFlags = new Int32Array(2048);
        this.positions = new Int32Array(2048);
        this.high = new Int32Array(2048);
        this.low = new Int32Array(2048);
        this.players = new Array(2048);
    }

    reset(): void {
        this.highCount = 0;
        this.lowCount = 0;
        for (let i: number = 1; i < 2048; i++) {
            if (!this.players[i]) {
                this.low[this.lowCount++] = i;
            } else {
                this.high[this.highCount++] = i;
            }
            this.nsnFlags[i] >>= 1;
        }
    }
}