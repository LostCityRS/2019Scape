import Packet from '#jagex3/io/Packet.js';

export default class Js5Index {
    checksum: number = 0;
    size: number = 0;
    version: number = 0;
    capacity: number = 0;

    groupCapacities: Int32Array | null = null;
    groupChecksums: Int32Array | null = null;
    groupUncompressedChecksums: Int32Array | null = null;
    groupDigests: Uint8Array[] | null = null;
    groupSizes: Int32Array | null = null;
    groupNameHashes: Int32Array | null = null;
    groupNameHashTable: Map<number, number> | null = null;
    groupIds: Int32Array | null = null;
    groupVersions: Int32Array | null = null;
    fileIds: (Int32Array | null)[] | null = null;
    fileNameHashes: (Int32Array | null)[] | null = null;
    fileNameHashTables: Map<number, number>[] | null = null;

    constructor(bytes: Uint8Array) {
        this.checksum = Packet.crc32(bytes);
        this.decode(bytes);
    }

    decode(bytes: Uint8Array): void {
        // console.time('buf');
        const buf: Packet = new Packet(bytes);
        // console.timeEnd('buf');

        // console.time('read');
        const protocol: number = buf.g1();

        if (protocol < 5 || protocol > 8) {
            throw new Error('Unsupported protocol: ' + protocol);
        }

        if (protocol >= 6) {
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
        if (protocol >= 7) {
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
            if (protocol >= 7) {
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
        this.groupUncompressedChecksums = new Int32Array(this.capacity);
        this.groupDigests = new Array(this.capacity).fill(null);
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
            for (let i: number = 0; i < this.size; i++) {
                this.groupUncompressedChecksums[this.groupIds[i]] = buf.g4();
            }
        }
        // console.timeEnd('groupUncompressedChecksum');

        // console.time('groupDigests');
        if (hasDigests) {
            for (let i: number = 0; i < this.size; i++) {
                this.groupDigests[this.groupIds[i]] = buf.gdata(64);
            }
        }
        // console.timeEnd('groupDigests');

        // console.time('groupLengths');
        if (hasLengths) {
            for (let i: number = 0; i < this.size; i++) {
                buf.g4();
                buf.g4();
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
            this.groupSizes[this.groupIds[i]] = buf.g2();
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
                if (protocol >= 7) {
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

                this.fileNameHashes[groupId] = new Int32Array(this.groupCapacities[groupSize]);
                this.fileNameHashTables[groupId] = new Map();

                for (let fileId: number = 0; fileId < this.groupCapacities[groupId]; fileId++) {
                    this.fileNameHashes[groupId]![fileId] = -1;
                }

                for (let j: number = 0; j < groupSize; j++) {
                    let fileId: number = -1;
                    if (this.fileIds[groupId] !== null) {
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
}
