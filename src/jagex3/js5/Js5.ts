import Js5Compression from '#jagex3/js5/Js5Compression.js';
import Js5Index from '#jagex3/js5/Js5Index.js';
import Packet from '#jagex3/io/Packet.js';
import StringUtils from '#jagex3/util/StringUtils.js';
import RandomAccessFile from '#jagex3/io/RandomAccessFile.js';

export default class Js5 {
    index: Js5Index;
    archive: number;

    packed: (Uint8Array | null)[] = [];
    unpacked: (Uint8Array[] | null)[] = [];

    store: RandomAccessFile;
    masterIndex: Uint8Array;
    groupPos: number[] = [];

    static async create(file: string, archive: number): Promise<Js5> {
        const store: RandomAccessFile = new RandomAccessFile(file, 'r');

        const header: Packet = Packet.alloc(5);
        store.read(header, 0, 5);

        const compression: number = header.g1();
        const length: number = header.g4();
        let masterIndexLength: number = 5 + length;
        if (compression > 0) {
            masterIndexLength += 4;
        }

        const masterIndex: Packet = Packet.alloc(masterIndexLength);
        store.seek(0);
        store.read(masterIndex, 0, masterIndexLength);

        const index: Js5Index = await Js5Index.from(masterIndex.data);
        return new Js5(store, index, archive, masterIndex.data);
    }

    constructor(store: RandomAccessFile, index: Js5Index, archive: number, masterIndex: Uint8Array) {
        this.store = store;
        this.index = index;
        this.archive = archive;
        this.masterIndex = masterIndex;

        const bytesLen = this.index.size * 4;
        const offsets = Packet.alloc(bytesLen);
        this.store.seek(this.store.length - bytesLen);
        this.store.read(offsets, 0, bytesLen);

        if (this.index.groupIds) {
            this.groupPos = new Array(this.index.capacity);

            // generating pos
            // const header = Packet.alloc(5);
            // let offset: number = masterIndex.length;
            // for (let i = 0; i < this.index.size; i++) {
            //     this.groupPos[this.index.groupIds[i]] = offset;

            //     this.store.seek(offset);
            //     this.store.read(header, 0, 5);

            //     const compression: number = header.g1();
            //     let length: number = header.g4();
            //     if (compression > 0) {
            //         length += 4;
            //     }
            //     offset += 5 + length;
            // }

            // storing pos
            // for (let i = 0; i < this.index.size; i++) {
            //     this.groupPos[this.index.groupIds[i]] = Number(offsets.g8());
            // }

            // storing size
            let offset: number = masterIndex.length;
            for (let i = 0; i < this.index.size; i++) {
                this.groupPos[this.index.groupIds[i]] = offset;
                offset += offsets.g4();
            }
        }

        this.packed = new Array(this.index.capacity).fill(null);
        this.unpacked = new Array(this.index.capacity).fill(null);
    }

    getPrefetchArchive(): number {
        if (!this.index.groupIds) {
            return 0;
        }

        let total: number = 0;

        for (let i: number = 0; i < this.index.size; i++) {
            const id: number = this.index.groupIds[i];
            if (this.isGroupValid(id)) {
                const data: Uint8Array | null = this.readRaw(id);
                total += data ? data.length : 0;
            }
        }

        if (this.masterIndex) {
            total += this.masterIndex.length;
        }

        return total;
    }

    getPrefetchGroup(group: string | number): number {
        const id: number = typeof group === 'string' ? this.getGroupId(group) : group;
        if (id === -1) {
            return 0;
        }

        const data: Uint8Array | null = this.readRaw(id);
        if (!data) {
            return 0;
        }

        return data.length;
    }

    capacity(): number {
        return this.index.capacity;
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

    isFileValid(group: number, file: number): boolean {
        if (!this.index.groupCapacities) {
            return false;
        }

        if (group >= 0 && file >= 0 && group < this.index.groupCapacities.length && file < this.index.groupCapacities[group]) {
            return true;
        } else {
            return false;
        }
    }

    readRaw(group: number): Uint8Array | null{
        if (!this.isGroupValid(group)) {
            return null;
        }

        const pos: number = this.groupPos[group];
        const header = Packet.alloc(5);
        this.store.seek(pos);
        this.store.read(header, 0, 5);

        const compression: number = header.g1();
        const length: number = header.g4();
        let totalLength: number = 5 + length;
        if (compression > 0) {
            totalLength += 4;
        }

        const data: Uint8Array = new Uint8Array(totalLength);
        this.store.seek(pos);
        this.store.read(data, 0, totalLength);
        return data;
    }

    fetchAll(): boolean {
        if (this.index.groupIds == null) {
            return false;
        }

        let success: boolean = true;
        for (let i: number = 0; i < this.index.groupIds.length; i++) {
            const groupId: number = this.index.groupIds[i];

            if (this.packed[groupId] == null) {
                this.fetchGroup(groupId);

                if (this.packed[groupId] == null) {
                    success = false;
                }
            }
        }

        return success;
    }

    fetchGroup(group: number): void {
        this.packed[group] = this.readRaw(group);
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
            let success: boolean = await this.unpackGroup(group, key);
            if (!success) {
                this.fetchGroup(group);

                success = await this.unpackGroup(group, key);
                if (!success) {
                    return null;
                }
            }
        }

        return this.unpacked[group]![fileId];
    }

    async readFile(group: number, file: number, key: number[] | null = null): Promise<Uint8Array | null> {
        if (!this.isFileValid(group, file)) {
            return null;
        }

        if (this.unpacked[group] == null || this.unpacked[group]![file] == null) {
            let success: boolean = await this.unpackGroup(group, key);
            if (!success) {
                this.fetchGroup(group);

                success = await this.unpackGroup(group, key);
                if (!success) {
                    return null;
                }
            }
        }

        return this.unpacked[group]![file];
    }

    async unpackGroup(group: number, key: number[] | null = null): Promise<boolean> {
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
            uncompressed = await Js5Compression.decompress(compressed);
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
