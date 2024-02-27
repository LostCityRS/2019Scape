import Js5Index from '#jagex3/js5/Js5Index.js';
import Js5Compression from '#jagex3/js5/Js5Compression.js';
import StringUtils from '#jagex3/util/StringUtils.js';
import Packet from '#jagex3/io/Packet.js';

import { OpenRS2, CacheInfo } from '#runewiki/util/OpenRS2.js';
import DiskStore from '#jagex3/io/DiskStore.js';

export default class Js5 {
    static RAISE_EXCEPTIONS: boolean = false;

    static async create(archive: number, openrs2: OpenRS2, prefetchAll: boolean = false): Promise<Js5> {
        if (archive > openrs2.info.valid_indexes) {
            throw new Error('Index does not exist for this cache');
        }

        const src: Uint8Array | null = await openrs2.getGroup(255, archive);
        if (src === null || src.length == 0) {
            throw new Error(`Failed to download idx255 for archive ${archive}`);
        }

        const index: Js5Index = new Js5Index(Js5Compression.uncompress(src));
        const js5: Js5 = new Js5(index, archive, openrs2);
        if (prefetchAll) {
            await js5.fetchAll();
        }
        return js5;
    }

    static createRaw(store: DiskStore, masterIndex: Uint8Array, archive: number, prefetchAll: boolean = false): Js5 {
        const index: Js5Index = new Js5Index(Js5Compression.uncompress(masterIndex));
        const js5: Js5 = new Js5(index, archive, null);
        js5.store = store;
        if (prefetchAll) {
            js5.fetchAll();
        }
        return js5;
    }

    index: Js5Index;
    private archive: number;
    unpacked: (Uint8Array[] | null)[] = [];
    packed: (Uint8Array | null)[] = [];
    private openrs2: OpenRS2 | null = null;
    private store: DiskStore | null = null;

    constructor(index: Js5Index, archive: number, openrs2: OpenRS2 | null) {
        this.index = index;
        this.archive = archive;
        this.openrs2 = openrs2;

        this.packed = new Array(this.index.capacity).fill(null);
        this.unpacked = new Array(this.index.capacity).fill(null);
    }

    capacity(): number {
        return this.index.capacity;
    }

    discardUnpacked(group?: number): void {
        if (typeof group === 'undefined') {
            if (this.unpacked !== null) {
                for (let i: number = 0; i < this.unpacked.length; i++) {
                    this.unpacked[i] = null;
                }
            }
        } else {
            if (this.isGroupValid(group) && this.unpacked !== null) {
                this.unpacked[group] = null;
            }
        }
    }

    discardNames(groups: boolean): void {
        this.index.fileNameHashTables = null;
        this.index.fileNameHashes = null;

        if (groups) {
            this.index.groupNameHashTable = null;
            this.index.groupNameHashes = null;
        }
    }

    async fetchAll(): Promise<boolean> {
        if (this.index.groupIds == null) {
            return false;
        }

        let success: boolean = true;
        for (let i: number = 0; i < this.index.groupIds.length; i++) {
            const groupId: number = this.index.groupIds[i];

            if (this.packed[groupId] == null) {
                await this.fetchGroup(groupId);

                if (this.packed[groupId] == null) {
                    success = false;
                }
            }
        }

        return success;
    }

    async fetchGroup(group: number): Promise<void> {
        if (this.openrs2) {
            this.packed[group] = await this.openrs2.getGroup(this.archive, group);
        }
    }

    async readGroup(group: number = 0, key: number[] | null = null): Promise<Uint8Array | null> {
        if (!this.isGroupValid(group) || !this.index.fileIds) {
            return null;
        }

        const fileIds: Int32Array | null = this.index.fileIds[group];
        let fileId: number = 0;
        if (fileIds === null) {
            fileId = 0;
        } else {
            fileId = fileIds[0];
        }

        if (this.unpacked[group] == null || this.unpacked[group]![fileId] == null) {
            let success: boolean = this.unpackGroup(group, key);
            if (!success) {
                await this.fetchGroup(group);

                success = this.unpackGroup(group, key);
                if (!success) {
                    return null;
                }
            }
        }

        return this.unpacked[group]![fileId];
    }

    // preferred name is fetchFile but we can't overload in JS, and readGroup/readFile would be overloads...
    async readFile(file: number, group: number = 0, key: number[] | null = null): Promise<Uint8Array | null> {
        if (!this.isFileValid(group, file)) {
            return null;
        }

        if (this.unpacked[group] == null || this.unpacked[group]![file] == null) {
            let success: boolean = this.unpackGroup(group, key);
            if (!success) {
                await this.fetchGroup(group);

                success = this.unpackGroup(group, key);
                if (!success) {
                    return null;
                }
            }
        }

        return this.unpacked[group]![file];
    }

    getGroupId(group: string | number): number {
        if (!this.index.groupNameHashes) {
            return -1;
        }

        if (typeof group === 'string') {
            group = group.toLowerCase();

            const groupId: number = this.index.groupNameHashes?.indexOf(StringUtils.hashCode(group));
            return this.isGroupValid(groupId) ? groupId : -1;
        } else if (typeof group === 'number') {
            const groupId: number = this.index.groupNameHashes?.indexOf(group);
            return this.isGroupValid(groupId) ? groupId : -1;
        }

        return -1;
    }

    getFileIds(group: number): Int32Array | null {
        if (!this.isGroupValid(group) || !this.index.groupSizes || !this.index.fileIds) {
            return null;
        }

        let fileIds: Int32Array | null = this.index.fileIds[group];
        if (fileIds === null) {
            fileIds = new Int32Array(this.index.groupSizes[group]);

            for (let i: number = 0; i < fileIds.length; i++) {
                fileIds[i] = i;
            }
        }

        return fileIds;
    }

    getGroupCapacity(group: number): number {
        if (!this.isGroupValid(group) || !this.index.groupCapacities) {
            return 0;
        }

        return this.index.groupCapacities[group];
    }

    isGroupValid(group: number): boolean {
        if (!this.index.groupCapacities) {
            return false;
        }

        if (group >= 0 && group < this.index.groupCapacities.length && this.index.groupCapacities[group] !== 0) {
            return true;
        } else if (Js5.RAISE_EXCEPTIONS) {
            throw new Error('IllegalArgumentException: ' + group);
        } else {
            return false;
        }
    }

    isGroupNameValid(group: string): boolean {
        if (!this.index.groupNameHashTable) {
            return false;
        }

        group = group.toLowerCase();

        const groupId: number | undefined = this.index.groupNameHashTable.get(StringUtils.hashCode(group));
        return typeof groupId !== 'undefined' && groupId >= 0;
    }

    async isGroupReady(group: number): Promise<boolean> {
        if (!this.isGroupValid(group)) {
            return false;
        } else if (this.packed[group] == null) {
            await this.fetchGroup(group);
            return this.packed[group] != null;
        } else {
            return true;
        }
    }

    isFileValid(group: number, file: number): boolean {
        if (!this.index.groupCapacities) {
            return false;
        }

        if (group >= 0 && file >= 0 && group < this.index.groupCapacities.length && file < this.index.groupCapacities[group]) {
            return true;
        } else if (Js5.RAISE_EXCEPTIONS) {
            throw new Error('IllegalArgumentException: ' + group + ',' + file);
        } else {
            return false;
        }
    }

    async isFileReady(group: number, file: number): Promise<boolean> {
        if (!this.isFileValid(group, file)) {
            return false;
        } else if (this.unpacked[group] != null && this.unpacked[group]![file] != null) {
            return true;
        } else if (this.packed[group] == null) {
            await this.fetchGroup(group);
            return this.packed[group] != null;
        } else {
            return false;
        }
    }

    unpackGroup(group: number, key: number[] | null = null): boolean {
        if (!this.isGroupValid(group) || !this.index.fileIds || !this.index.groupSizes || !this.index.groupCapacities) {
            return false;
        }

        if (!this.packed || !this.packed[group]) {
            return false;
        }

        const fileIds: Int32Array | null = this.index.fileIds[group];
        const groupSize: number = this.index.groupSizes[group];

        let valid: boolean = true;
        if (this.unpacked[group] === null) {
            this.unpacked[group] = new Array(this.index.groupCapacities[group]).fill(null);
        }

        for (let i: number = 0; i < groupSize; i++) {
            let fileId: number = 0;
            if (fileIds === null) {
                fileId = i;
            } else {
                fileId = fileIds[i];
            }

            if (this.unpacked[group]![fileId] === null) {
                valid = false;
                break;
            }
        }

        if (valid) {
            return true;
        }

        let compressed: Uint8Array = new Uint8Array();
        if (key == null || key[0] == 0 && key[1] == 0 && key[2] == 0 && key[3] == 0) {
            compressed = Packet.unwrap(this.packed[group]!, false);
        } else {
            compressed = Packet.unwrap(this.packed[group]!, true);
            const buf: Packet = Packet.wrap(compressed);
            buf.tinydec(key, 5, buf.length);
            compressed = buf.data;
        }

        let uncompressed: Uint8Array = new Uint8Array();
        try {
            uncompressed = Js5Compression.uncompress(compressed);
        } catch (err) {
            // console.error('T3 - ' + (key != null) + ',' + group + ',' + compressed.length);
            // console.error(err);
            return false;
        }

        this.packed[group] = null;

        if (groupSize > 1) {
            let position: number = uncompressed.length;
            const lens: Int32Array = new Int32Array(groupSize);
            position--;

            const stripes: number = uncompressed[position] & 0xFF;
            position -= groupSize * stripes * 4;

            const buf: Packet = new Packet(uncompressed);
            buf.pos = position;

            for (let i: number = 0; i < stripes; i++) {
                let len: number = 0;

                for (let j: number = 0; j < groupSize; j++) {
                    len += buf.g4();
                    lens[j] += len;
                }
            }

            const extracted: Uint8Array[] = new Array(groupSize);
            for (let i: number = 0; i < groupSize; i++) {
                extracted[i] = new Uint8Array(lens[i]);
                lens[i] = 0;
            }

            buf.pos = position;
            let off: number = 0;
            for (let i: number = 0; i < stripes; i++) {
                let len: number = 0;

                for (let j: number = 0; j < groupSize; j++) {
                    len += buf.g4();

                    extracted[j]!.set(uncompressed.subarray(off, off + len));

                    off += len;
                    lens[j] += len;
                }
            }

            for (let i: number = 0; i < groupSize; i++) {
                let fileId: number = 0;
                if (fileIds === null) {
                    fileId = i;
                } else {
                    fileId = fileIds[i];
                }

                this.unpacked[group]![fileId] = extracted[i];
            }
        } else {
            let fileId: number = 0;
            if (fileIds === null) {
                fileId = 0;
            } else {
                fileId = fileIds[0];
            }

            this.unpacked[group]![fileId] = uncompressed;
        }

        return true;
    }
}
