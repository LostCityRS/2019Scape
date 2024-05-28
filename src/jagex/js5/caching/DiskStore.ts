import Packet from '#jagex/bytepacking/Packet.js';
import RandomAccessFile from '#jagex/util/RandomAccessFile.js';

export default class DiskStore {
    static buffer: Packet = new Packet(new Uint8Array(520));

    data: RandomAccessFile | null = null;
    index: RandomAccessFile | null = null;
    archive: number;

    constructor(data: string, index: string, archive: number) {
        this.archive = archive;

        if (data.length && index.length) {
            this.data = new RandomAccessFile(data, 'r');
            this.index = new RandomAccessFile(index, 'r');
        }
    }

    get count(): number {
        if (!this.index) {
            return 0;
        }

        return this.index.length / 6;
    }

    read(group: number): Uint8Array | null {
        if (!this.data || !this.index) {
            return null;
        }

        if ((group * 6) + 6 > this.index.length) {
            return null;
        }

        this.index.seek(group * 6);
        this.index.read(DiskStore.buffer, 0, 6);

        DiskStore.buffer.pos = 0;
        const len: number = DiskStore.buffer.g3();
        let block: number = DiskStore.buffer.g3();

        if (len <= 0 || len > 1_000_000_000) {
            return null;
        }

        const data: Uint8Array = new Uint8Array(len);
        let blockNum: number = 0;
        let off: number = 0;

        while (off < len) {
            if (block === 0) {
                return null;
            }

            this.data.seek(block * 520);

            let blockSize: number = len - off;

            let headerSize: number;
            let actualGroup: number;
            let actualBlockNum: number;
            let nextBlock: number;
            let archive: number;
            if (group > 0xFFFF) {
                if (blockSize > 510) {
                    blockSize = 510;
                }

                headerSize = 10;
                this.data.read(DiskStore.buffer, 0, blockSize + headerSize);
                DiskStore.buffer.pos = 0;

                actualGroup = DiskStore.buffer.g4();
                actualBlockNum = DiskStore.buffer.g2();
                nextBlock = DiskStore.buffer.g3();
                archive = DiskStore.buffer.g1();
            } else {
                if (blockSize > 512) {
                    blockSize = 512;
                }

                headerSize = 8;
                this.data.read(DiskStore.buffer, 0, blockSize + headerSize);
                DiskStore.buffer.pos = 0;

                actualGroup = DiskStore.buffer.g2();
                actualBlockNum = DiskStore.buffer.g2();
                nextBlock = DiskStore.buffer.g3();
                archive = DiskStore.buffer.g1();
            }

            if (actualGroup !== group || actualBlockNum !== blockNum || archive !== this.archive) {
                return null;
            }

            if (nextBlock < 0 || nextBlock > this.data.length / 520) {
                return null;
            }

            const b: Uint8Array = new Uint8Array(blockSize);
            DiskStore.buffer.gdata(b, 0, b.length);
            data.set(b, off);
            off += blockSize;

            blockNum++;
            block = nextBlock;
        }

        return data;
    }
}
