import RandomAccessFile from '#jagex3/io/RandomAccessFile.js';

export default class DiskStore {
    static buffer: Uint8Array = new Uint8Array(520);

    data: RandomAccessFile;
    index: RandomAccessFile;
    archive: number;

    constructor(data: string, index: string, archive: number) {
        this.data = new RandomAccessFile(data, 'r');
        this.index = new RandomAccessFile(index, 'r');
        this.archive = archive;
    }

    get count(): number {
        return this.index.length / 6;
    }

    read(group: number): Uint8Array | null {
        if ((group * 6) + 6 > this.index.length) {
            return null;
        }

        this.index.seek(group * 6);
        this.index.read(DiskStore.buffer, 0, 6);

        const len: number = ((DiskStore.buffer[0] & 0xff) << 16) + ((DiskStore.buffer[1] & 0xff) << 8) + (DiskStore.buffer[2] & 0xff);
        let block: number = ((DiskStore.buffer[3] & 0xff) << 16) + ((DiskStore.buffer[4] & 0xff) << 8) + (DiskStore.buffer[5] & 0xff);

        if (len < 0 || len > 1_000_000_000) {
            return null;
        }

        if (block <= 0 || block > this.data.length / 520) {
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
            const actualGroup: number = ((DiskStore.buffer[0] & 0xff) << 8) + (DiskStore.buffer[1] & 0xff);
            const actualBlockNum: number = ((DiskStore.buffer[2] & 0xff) << 8) + (DiskStore.buffer[3] & 0xff);
            const nextBlock: number = ((DiskStore.buffer[4] & 0xff) << 16) + ((DiskStore.buffer[5] & 0xff) << 8) + (DiskStore.buffer[6] & 0xff);
            const archive: number = DiskStore.buffer[7] & 0xff;

            if (actualGroup !== group || actualBlockNum !== blockNum || archive !== this.archive) {
                return null;
            }

            if (nextBlock < 0 || nextBlock > this.data.length / 520) {
                return null;
            }

            data.set(DiskStore.buffer.subarray(8, 8 + blockSize), off);
            off += blockSize;

            blockNum++;
            block = nextBlock;
        }

        return data;
    }
}
