import Packet from '#jagex/bytepacking/Packet.js';

import Whirlpool from '#jagex/encryption/Whirlpool.js';

import Js5Compression from '#jagex/js5//Js5Compression.js';

export default class Js5Index {
    format: number = 0;
    checksum: number = 0;
    size: number = 0;
    version: number = 0;
    capacity: number = 0;
    digest: Uint8Array | null = null;
    totalLength: number = 0;
    totalUncompressedLength: number = 0;

    groupCapacities: Int32Array | null = null;
    groupChecksums: Int32Array | null = null;
    groupUncompressedChecksums: Int32Array | null = null;
    groupDigests: Uint8Array[] | null = null;
    groupSizes: Int32Array | null = null;
    groupLengths: Int32Array | null = null;
    groupUncompressedLengths: Int32Array | null = null;
    groupNameHashes: Int32Array | null = null;
    groupNameHashTable: Map<number, number> | null = null;
    groupIds: Int32Array | null = null;
    groupVersions: Int32Array | null = null;
    fileIds: (Int32Array | null)[] | null = null;
    fileNameHashes: (Int32Array | null)[] | null = null;
    fileNameHashTables: Map<number, number>[] | null = null;

    static async from(bytes: Uint8Array): Promise<Js5Index> {
        const index: Js5Index = new Js5Index();
        index.checksum = Packet.getcrc(bytes);
        index.digest = await Whirlpool.compute(bytes);
        await index.decode(bytes);
        return index;
    }

    async decode(bytes: Uint8Array): Promise<void> {
        // console.time('buf');
        const buf: Packet = new Packet(await Js5Compression.decompress(bytes));
        // console.timeEnd('buf');

        // console.time('read');
        const format: number = buf.g1();
        this.format = format;

        if (format < 5 || format > 8) {
            throw new Error('Unsupported format: ' + format);
        }

        if (format >= 6) {
            this.version = buf.g4();
        } else {
            this.version = 0;
        }

        const flags: number = buf.g1();
        const hasNames: number = flags & 0x1;
        const hasDigests: number = flags & 0x2;
        const hasLengths: number = flags & 0x4;
        const hasUncompressedChecksums: number = flags & 0x8;
        // console.timeEnd('read');

        // console.time('size');
        this.size = 0;
        if (format >= 7) {
            this.size = buf.gSmart2or4();
        } else {
            this.size = buf.g2();
        }
        // console.timeEnd('size');

        // console.time('groupIds');
        let prevGroupId: number = 0;
        let maxGroupId: number = -1;
        this.groupIds = new Int32Array(this.size);

        for (let i: number = 0; i < this.size; i++) {
            if (format >= 7) {
                this.groupIds[i] = prevGroupId += buf.gSmart2or4();
            } else {
                this.groupIds[i] = prevGroupId += buf.g2();
            }

            if (this.groupIds[i] > maxGroupId) {
                maxGroupId = this.groupIds[i];
            }
        }
        // console.timeEnd('groupIds');

        // console.time('groupAlloc');
        this.capacity = maxGroupId + 1;
        this.groupSizes = new Int32Array(this.capacity);
        this.groupChecksums = new Int32Array(this.capacity);
        this.groupCapacities = new Int32Array(this.capacity);
        this.groupVersions = new Int32Array(this.capacity);
        this.fileIds = new Array(this.capacity).fill(null);
        // console.timeEnd('groupAlloc');

        // console.time('groupNames');
        if (hasNames) {
            this.groupNameHashes = new Int32Array(this.capacity);
            this.groupNameHashTable = new Map();

            for (let i: number = 0; i < this.capacity; i++) {
                this.groupNameHashes[i] = -1;
            }

            for (let i: number = 0; i < this.size; i++) {
                this.groupNameHashes[this.groupIds[i]] = buf.g4();
                this.groupNameHashTable.set(this.groupNameHashes[this.groupIds[i]], this.groupIds[i]);
            }
        }
        // console.timeEnd('groupNames');

        // console.time('groupChecksums');
        for (let i: number = 0; i < this.size; i++) {
            this.groupChecksums[this.groupIds[i]] = buf.g4();
        }
        // console.timeEnd('groupChecksums');

        // console.time('groupUncompressedChecksum');
        if (hasUncompressedChecksums) {
            this.groupUncompressedChecksums = new Int32Array(this.capacity);

            for (let i: number = 0; i < this.size; i++) {
                this.groupUncompressedChecksums[this.groupIds[i]] = buf.g4();
            }
        }
        // console.timeEnd('groupUncompressedChecksum');

        // console.time('groupDigests');
        if (hasDigests) {
            this.groupDigests = new Array(this.capacity).fill(null);

            for (let i: number = 0; i < this.size; i++) {
                this.groupDigests[this.groupIds[i]] = buf.gdata(64);
            }
        }
        // console.timeEnd('groupDigests');

        // console.time('groupLengths');
        if (hasLengths) {
            this.groupLengths = new Int32Array(this.capacity);
            this.groupUncompressedLengths = new Int32Array(this.capacity);

            this.totalLength = 0;
            this.totalUncompressedLength = 0;
            for (let i: number = 0; i < this.size; i++) {
                this.groupLengths[this.groupIds[i]] = buf.g4();
                this.totalLength += this.groupLengths[this.groupIds[i]];

                this.groupUncompressedLengths[this.groupIds[i]] = buf.g4();
                this.totalUncompressedLength += this.groupUncompressedLengths[this.groupIds[i]];
            }
        }
        // console.timeEnd('groupLengths');

        // console.time('groupVersions');
        for (let i: number = 0; i < this.size; i++) {
            this.groupVersions[this.groupIds[i]] = buf.g4();
        }
        // console.timeEnd('groupVersions');

        // console.time('groupSizes');
        for (let i: number = 0; i < this.size; i++) {
            if (format >= 7) {
                this.groupSizes[this.groupIds[i]] = buf.gSmart2or4();
            } else {
                this.groupSizes[this.groupIds[i]] = buf.g2();
            }
        }
        // console.timeEnd('groupSizes');

        // console.time('fileIds');
        for (let i: number = 0; i < this.size; i++) {
            let prevFileId: number = 0;
            let maxFileId: number = -1;

            const groupId: number = this.groupIds[i];
            const groupSize: number = this.groupSizes[groupId];
            this.fileIds[groupId] = new Int32Array(groupSize);

            for (let j: number = 0; j < groupSize; j++) {
                let fileId: number = 0;
                if (format >= 7) {
                    fileId = prevFileId += buf.gSmart2or4();
                } else {
                    fileId = prevFileId += buf.g2();
                }
                this.fileIds[groupId]![j] = prevFileId;

                if (fileId > maxFileId) {
                    maxFileId = fileId;
                }
            }

            this.groupCapacities[groupId] = maxFileId + 1;
            if (maxFileId + 1 === groupSize) {
                this.fileIds[groupId] = null;
            }
        }
        // console.timeEnd('fileIds');

        // console.time('fileNames');
        if (hasNames) {
            this.fileNameHashes = new Array(this.capacity).fill(null);
            this.fileNameHashTables = new Array(this.capacity).fill(null);

            for (let i: number = 0; i < this.size; i++) {
                const groupId: number = this.groupIds[i];
                const groupSize: number = this.groupSizes[groupId];

                this.fileNameHashes[groupId] = new Int32Array(this.groupCapacities[groupId]);
                this.fileNameHashTables[groupId] = new Map();

                for (let fileId: number = 0; fileId < this.groupCapacities[groupId]; fileId++) {
                    this.fileNameHashes[groupId]![fileId] = -1;
                }

                for (let j: number = 0; j < groupSize; j++) {
                    let fileId: number = -1;
                    if (this.fileIds[groupId]) {
                        fileId = this.fileIds[groupId]![j];
                    } else {
                        fileId = j;
                    }

                    this.fileNameHashes[groupId]![fileId] = buf.g4();
                    this.fileNameHashTables[groupId]!.set(this.fileNameHashes[groupId]![fileId], fileId);
                }
            }
        }
        // console.timeEnd('fileNames');
    }

    encode(): Uint8Array {
        const buf: Packet = Packet.alloc(10);
        buf.p1(this.format);

        if (this.format >= 6) {
            buf.p4(this.version);
        }

        let flags: number = 0;

        if (this.groupNameHashes) {
            flags |= 0x1;
        }

        if (this.groupDigests) {
            flags |= 0x2;
        }

        if (this.groupLengths) {
            flags |= 0x4;
        }

        if (this.groupUncompressedChecksums) {
            flags |= 0x8;
        }

        buf.p1(flags);

        if (this.format >= 7) {
            buf.pSmart2or4(this.size);
        } else {
            buf.p2(this.size);
        }

        if (this.groupIds) {
            let prevGroupId: number = 0;

            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                if (this.format >= 7) {
                    buf.pSmart2or4(this.groupIds[i] - prevGroupId);
                } else {
                    buf.p2(this.groupIds[i] - prevGroupId);
                }

                prevGroupId = this.groupIds[i];
            }
        }

        if (this.groupNameHashes && this.groupIds) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                buf.p4(this.groupNameHashes[this.groupIds[i]]);
            }
        }

        if (this.groupChecksums && this.groupIds) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                buf.p4(this.groupChecksums[this.groupIds[i]]);
            }
        }

        if (this.groupUncompressedChecksums && this.groupIds) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                buf.p4(this.groupUncompressedChecksums[this.groupIds[i]]);
            }
        }

        if (this.groupDigests && this.groupIds) {
            buf.ensure(this.size * 64);
            for (let i: number = 0; i < this.size; i++) {
                buf.pdata(this.groupDigests[this.groupIds[i]]);
            }
        }

        if (this.groupLengths && this.groupUncompressedLengths && this.groupIds) {
            buf.ensure(this.size * 8);
            for (let i: number = 0; i < this.size; i++) {
                buf.p4(this.groupLengths[this.groupIds[i]]);
                buf.p4(this.groupUncompressedLengths[this.groupIds[i]]);
            }
        }

        if (this.groupVersions && this.groupIds) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                buf.p4(this.groupVersions[this.groupIds[i]]);
            }
        }

        if (this.groupSizes && this.groupIds) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                if (this.format >= 7) {
                    buf.pSmart2or4(this.groupSizes[this.groupIds[i]]);
                } else {
                    buf.p2(this.groupSizes[this.groupIds[i]]);
                }
            }
        }

        if (this.fileIds && this.groupIds && this.groupSizes) {
            let totalFiles: number = 0;
            for (let i: number = 0; i < this.size; i++) {
                totalFiles += this.groupSizes[this.groupIds[i]];
            }
            buf.ensure(totalFiles * 4);

            for (let i: number = 0; i < this.size; i++) {
                let prevFileId: number = 0;

                const groupId: number = this.groupIds[i];
                const groupSize: number = this.groupSizes[groupId];

                for (let j: number = 0; j < groupSize; j++) {
                    if (!this.fileIds[groupId]) {
                        const fileId: number = j;

                        if (this.format >= 7) {
                            buf.pSmart2or4(fileId - prevFileId);
                        } else {
                            buf.p2(fileId - prevFileId);
                        }

                        prevFileId = fileId;
                    } else {
                        const fileId: number = this.fileIds[groupId]![j];

                        if (this.format >= 7) {
                            buf.pSmart2or4(fileId - prevFileId);
                        } else {
                            buf.p2(fileId - prevFileId);
                        }

                        prevFileId = fileId;
                    }
                }
            }
        }

        if (this.fileIds && this.fileNameHashes && this.groupIds && this.groupSizes) {
            buf.ensure(this.size * 4);
            for (let i: number = 0; i < this.size; i++) {
                const groupId: number = this.groupIds[i];
                const groupSize: number = this.groupSizes[groupId];

                for (let j: number = 0; j < groupSize; j++) {
                    let fileId: number = -1;
                    if (this.fileIds[groupId]) {
                        fileId = this.fileIds[groupId]![j];
                    } else {
                        fileId = j;
                    }

                    buf.p4(this.fileNameHashes[groupId]![fileId]);
                }
            }
        }

        return buf.data.subarray(0, buf.pos);
    }

    encodeForMasterIndex(): Uint8Array {
        const buf: Packet = new Packet();
        buf.p4(this.checksum);

        if (this.format >= 6) {
            buf.p4(this.version);
        }

        if (this.format >= 7) {
            buf.p4(this.size);
            buf.p4(this.totalUncompressedLength);

            if (!this.digest) {
                throw new Error('Need digest to create master index!');
            }

            buf.pdata(this.digest);
        }

        return buf.data;
    }

    addGroup(groupId: number, checksum: number, uncompressedChecksum: number, length: number, uncompressedLength: number, version: number): void {
        // todo extend logic
        this.size = 1;
        this.capacity = groupId + 1;

        this.groupIds = new Int32Array(this.size);
        this.groupSizes = new Int32Array(this.capacity);
        this.groupChecksums = new Int32Array(this.capacity);
        this.groupCapacities = new Int32Array(this.capacity);
        this.groupVersions = new Int32Array(this.capacity);
        this.fileIds = new Array(this.capacity).fill(null);

        this.groupUncompressedChecksums = new Int32Array(this.capacity);
        this.groupLengths = new Int32Array(this.capacity);
        this.groupUncompressedLengths = new Int32Array(this.capacity);

        this.groupIds[0] = groupId;
        this.groupSizes[groupId] = 1;
        this.groupChecksums[groupId] = checksum;
        this.groupUncompressedChecksums[groupId] = uncompressedChecksum;
        this.groupLengths[groupId] = length;
        this.groupUncompressedLengths[groupId] = uncompressedLength;
        this.groupVersions[groupId] = version;
    }
}
