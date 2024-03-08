import Packet from '#jagex3/io/Packet.js';
import RandomAccessFile from '#jagex3/io/RandomAccessFile.js';

export default class DiskStore {
    static buffer: Packet = Packet.alloc(520);

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
            if (blockSize > 512) {
                blockSize = 512;
            }

            this.data.read(DiskStore.buffer, 0, blockSize + 8);
            DiskStore.buffer.pos = 0;

            const actualGroup: number = DiskStore.buffer.g2();
            const actualBlockNum: number = DiskStore.buffer.g2();
            const nextBlock: number = DiskStore.buffer.g3();
            const archive: number = DiskStore.buffer.g1();

            if (actualGroup !== group || actualBlockNum !== blockNum || archive !== this.archive) {
                return null;
            }

            if (nextBlock < 0 || nextBlock > this.data.length / 520) {
                return null;
            }

            data.set(DiskStore.buffer.gdata(blockSize), off);
            off += blockSize;

            blockNum++;
            block = nextBlock;
        }

        return data;
    }
}
