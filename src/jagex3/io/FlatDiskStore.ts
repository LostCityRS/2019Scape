import fs from 'fs';

import DiskStore from '#jagex3/io/DiskStore.js';

export default class FlatDiskStore extends DiskStore {
    dir: string;
    _count: number;

    constructor(dir: string, archive: number) {
        super('', '', archive);

        this.dir = dir;

        const groups = fs.readdirSync(`${this.dir}/${this.archive}`);
        const highest = groups.map((group) => parseInt(group.replace('.dat', ''))).sort((a, b) => a - b).pop();

        if (typeof highest === 'undefined') {
            this._count = 0;
        } else {
            this._count = highest + 1;
        }
    }

    get count(): number {
        return this._count;
    }

    read(group: number): Uint8Array | null {
        if (!fs.existsSync(`${this.dir}/${this.archive}/${group}.dat`)) {
            return null;
        }

        return fs.readFileSync(`${this.dir}/${this.archive}/${group}.dat`);
    }
}
