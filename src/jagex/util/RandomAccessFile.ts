import fs from 'fs';

import Packet from '#jagex/bytepacking/Packet.js';

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

    get available(): number {
        return this.length - this.pos;
    }

    seek(pos: number): void {
        this.pos = pos;
    }

    read(buffer: Uint8Array | Packet, offset: number, length: number): void {
        if (buffer instanceof Packet) {
            fs.readSync(this.fd, buffer.data, offset, length, this.pos);
        } else {
            fs.readSync(this.fd, buffer, offset, length, this.pos);
        }

        this.pos += length;
    }

    write(buffer: Uint8Array | Packet, offset: number, length: number): void {
        if (buffer instanceof Packet) {
            fs.writeSync(this.fd, buffer.data, offset, length, this.pos);
        } else {
            fs.writeSync(this.fd, buffer, offset, length, this.pos);
        }

        this.pos += length;
    }
}
