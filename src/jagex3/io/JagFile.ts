import Packet from '#jagex3/io/Packet.js';
import StringUtils from '#jagex3/util/StringUtils.js';
import Bzip2Decompressor from '#jagex3/io/Bzip2Decompressor.js';

export default class JagFile {
    data: Uint8Array;
    fileCount = 0;
    fileHash: number[] = [];
    fileUnpackedSize: number[] = [];
    filePackedSize: number[] = [];
    filePos: number[] = [];
    unpacked = false;

    constructor(src: Packet) {
        const unpackedSize: number = src.g3();
        const packedSize: number = src.g3();

        if (unpackedSize === packedSize) {
            this.data = Packet.unwrap(src, true);
            this.unpacked = false;
        } else {
            const temp: Uint8Array = new Uint8Array(unpackedSize);
            Bzip2Decompressor.bunzip(src, temp);
            this.data = temp;
            src = new Packet(this.data);
            this.unpacked = true;
        }

        this.fileCount = src.g2();

        let pos: number = src.pos + this.fileCount * 10;
        for (let i: number = 0; i < this.fileCount; i++) {
            this.fileHash[i] = src.g4();
            this.fileUnpackedSize[i] = src.g3();
            this.filePackedSize[i] = src.g3();

            this.filePos[i] = pos;
            pos += this.filePackedSize[i];
        }
    }

    get(index: number): Uint8Array | null {
        if (index < 0 || index >= this.fileCount) {
            return null;
        }

        if (this.unpacked) {
            return this.data.subarray(this.filePos[index], this.filePos[index] + this.filePackedSize[index]);
        } else {
            const temp: Uint8Array = new Uint8Array(this.fileUnpackedSize[index]);
            Bzip2Decompressor.bunzip(new Packet(this.data.subarray(this.filePos[index], this.filePos[index] + this.filePackedSize[index])), temp);
            return temp;
        }
    }

    read(name: string): Uint8Array | null {
        const hash: number = StringUtils.hashCodeOld(name);

        for (let i: number = 0; i < this.fileCount; i++) {
            if (this.fileHash[i] === hash) {
                return this.get(i);
            }
        }

        return null;
    }
}