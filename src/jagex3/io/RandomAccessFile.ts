import fs from 'fs';

export default class RandomAccessFile {
    fd: number;
    path: string;
    pos: number;

    constructor(path: string, mode: string) {
        this.fd = fs.openSync(path, mode);
        this.path = path;
        this.pos = 0;
    }

    get length(): number {
        return fs.fstatSync(this.fd).size;
    }

    seek(pos: number): void {
        this.pos = pos;
    }

    read(buffer: Uint8Array, offset: number, length: number): void {
        fs.readSync(this.fd, buffer, offset, length, this.pos);
        this.pos += length;
    }
}
