import fs from 'fs';
import { dirname } from 'path';

export default class Packet {
    static bitmask: Uint32Array = new Uint32Array(33);
    static crctable: Int32Array = new Int32Array(256);

    static textDecoder = new TextDecoder('utf-8');
    static textEncoder = new TextEncoder();

    static {
        for (let i: number = 0; i < 32; i++) {
            Packet.bitmask[i] = (1 << i) - 1;
        }
        Packet.bitmask[32] = 0xffffffff;

        for (let b: number = 0; b < 256; b++) {
            let remainder: number = b;
            for (let bit: number = 0; bit < 8; bit++) {
                if ((remainder & 0x1) == 1) {
                    remainder = (remainder >>> 1) ^ 0xEDB88320;
                } else {
                    remainder >>>= 0x1;
                }
            }

            Packet.crctable[b] = remainder;
        }
    }

    static getcrc(src: Packet | Uint8Array | Buffer, length: number = src.length, offset: number = 0): number {
        if (src instanceof Packet) {
            src = src.data;
        }

        let crc: number = -1;
        for (let i: number = offset; i < length; i++) {
            crc = (crc >>> 8) ^ Packet.crctable[(crc ^ src[i]) & 0xFF];
        }
        return ~crc;
    }

    static wrap(src: Uint8Array | Packet | Buffer | null, advance: boolean = true): Packet {
        if (src === null) {
            return new Packet(new Uint8Array(0));
        }

        if (src instanceof Packet) {
            src = src.data;
        }

        const buf: Packet = new Packet(src);
        if (advance) {
            buf.pos = src.length;
        }

        return buf;
    }

    static unwrap(src: Uint8Array | Packet, copy: boolean): Uint8Array {
        if (src instanceof Packet) {
            src = src.data;
        }

        return copy ? Packet.copy(src) : src;
    }

    private static copy(src: Uint8Array): Uint8Array {
        const len: number = src.length;
        const temp: Uint8Array = new Uint8Array(len);
        temp.set(src);
        return temp;
    }

    static alloc(size: number): Packet {
        return new Packet(new Uint8Array(size));
    }

    static load(file: string): Packet {
        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        return new Packet(fs.readFileSync(file));
    }

    data: Uint8Array;
    pos: number;
    bitPos: number;

    constructor(src?: ArrayBuffer | Packet | null) {
        if (src instanceof Packet) {
            this.data = src.data;
        } else if (typeof src === 'undefined' || src === null) {
            this.data = new Uint8Array();
        } else {
            this.data = new Uint8Array(src);
        }

        this.pos = 0;
        this.bitPos = 0;
    }

    get length(): number {
        return this.data.length;
    }

    get available(): number {
        return this.length - this.pos;
    }

    private resize(size: number): void {
        if (this.length < size) {
            const temp: Uint8Array = new Uint8Array(size);
            temp.set(this.data);
            this.data = temp;
        }
    }

    ensure(size: number): void {
        if (this.available < size) {
            this.resize(this.length + size);
        }
    }

    save(file: string, all: boolean = false): void {
        if (!fs.existsSync(dirname(file))) {
            fs.mkdirSync(dirname(file), { recursive: true });
        }

        fs.writeFileSync(file, this.data.subarray(0, all ? this.length : this.pos));
    }

    // ----

    gbool(): boolean {
        return this.g1() === 1;
    }

    g1(): number {
        return this.data[this.pos++] & 0xFF;
    }

    g1b(): number {
        return this.data[this.pos++];
    }

    g2(): number {
        return (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
    }

    g2s(): number {
        let value: number = (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
        if (value > 0x7FFF) {
            value -= 0x10000;
        }
        return value;
    }

    g3(): number {
        return (this.data[this.pos++] & 0xFF) << 16 |
            (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
    }

    g4(): number {
        return ((this.data[this.pos++] & 0xFF) << 24 |
            (this.data[this.pos++] & 0xFF) << 16 |
            (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF) | 0;
    }

    g5(): bigint {
        const high: number = this.g1();
        const low: number = this.g4();

        return (BigInt(high) << 32n) + BigInt(low);
    }

    g6(): bigint {
        const high: number = this.g2();
        const low: number = this.g4();

        return (BigInt(high) << 32n) + BigInt(low);
    }

    g8(): bigint {
        const high: number = this.g4();
        const low: number = this.g4();

        return (BigInt(high) << 32n) + BigInt(low);
    }

    gdata(length: number): Uint8Array {
        const start: number = this.pos;
        this.pos += length;
        return this.data.subarray(start, this.pos);
    }

    gPacket(length: number): Packet {
        const start: number = this.pos;
        this.pos += length;
        return new Packet(this.data.subarray(start, this.pos));
    }

    gjstr(): string {
        const start: number = this.pos;
        while (this.data[this.pos++] !== 0 && this.pos < this.length) {
            /* empty */
        }
        const length: number = this.pos - start - 1;
        return length === 0 ? '' : Packet.textDecoder.decode(this.data.subarray(start, start + length));
    }

    fastgstr(): string | null {
        if (this.data[this.pos] === 0) {
            this.pos++;
            return null;
        } else {
            return this.gjstr();
        }
    }

    gjstr2(): string {
        const version: number = this.data[this.pos++];
        if (version !== 0) {
            throw new Error();
        }

        return this.gjstr();
    }

    gSmart1or2(): number {
        const value: number = this.data[this.pos] & 0xFF;
        return value < 128 ? this.g1() : this.g2() - 32768;
    }

    gSmart1or2s(): number {
        const value: number = this.data[this.pos] & 0xFF;
        return value < 128 ? this.g1() - 64 : this.g2s() - 49152;
    }

    // todo
    gExtended1or2(): number {
        let local5: number = 0;
        let local9: number = this.gSmart1or2();
        while (local9 === 32767) {
            local5 += 32767;
            local9 = this.gSmart1or2();
        }
        return local5 + local9;
    }

    gSmart2or4(): number {
        return this.data[this.pos] >= 128 ? this.g4() & 0x7FFFFFFF : this.g2();
    }

    gSmart2or4null(): number {
        if (this.data[this.pos] >= 128) {
            return this.g4() & 0x7FFFFFFF;
        } else {
            const val: number = this.g2();
            return val === 32767 ? -1 : val;
        }
    }

    gVarInt(): number {
        let value: number = this.data[this.pos++];
        let remainder: number = 0;

        while (value < 0) {
            remainder = ((remainder | value & 0x7F) << 7) | 0;
            value = this.data[this.pos++];
        }

        return value | remainder;
    }

    gVarInt2(): number {
        let value: number = 0;
        let bits: number = 0;
        let read: number = 0;
        do {
            read = this.g1();
            value |= (read & 0x7F) << bits;
            bits += 7;
        } while (read > 127);
        return value;
    }

    gVarLong(bytes: number): bigint {
        const read: number = bytes - 1;
        if (read < 0 || read > 7) {
            throw new Error();
        }

        let bits: number = read * 8;
        let result: bigint = 0n;
        while (bits >= 0) {
            result |= BigInt(this.data[this.pos++] & 0xFF) << BigInt(bits);
            bits -= 8;
        }

        return result;
    }

    // ----

    p1(value: number): void {
        this.ensure(1);
        this.data[this.pos++] = value;
    }

    pbool(value: boolean): void {
        this.p1(value ? 1 : 0);
    }

    p1_alt1(value: number): void {
        this.ensure(1);
        this.data[this.pos++] = value + 128;
    }

    p1_alt2(value: number): void {
        this.ensure(1);
        this.data[this.pos++] = -value;
    }

    p1_alt3(value: number): void {
        this.ensure(1);
        this.data[this.pos++] = 128 - value;
    }

    p2(value: number): void {
        this.ensure(2);
        this.data[this.pos++] = (value >> 8) & 0xFF;
        this.data[this.pos++] = value & 0xFF;
    }

    p2_alt1(value: number): void {
        this.ensure(2);
        this.data[this.pos++] = value & 0xFF;
        this.data[this.pos++] = (value >> 8) & 0xFF;
    }

    p2_alt2(value: number): void {
        this.ensure(2);
        this.data[this.pos++] = (value >> 8) & 0xFF;
        this.data[this.pos++] = (value + 128) & 0xFF;
    }

    p2_alt3(value: number): void {
        this.ensure(2);
        this.data[this.pos++] = (value + 128) & 0xFF;
        this.data[this.pos++] = (value >> 8) & 0xFF;
    }

    p3(value: number): void {
        this.ensure(3);
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value: number): void {
        this.ensure(4);
        this.data[this.pos++] = (value >> 24) & 0xFF;
        this.data[this.pos++] = (value >> 16) & 0xFF;
        this.data[this.pos++] = (value >> 8) & 0xFF;
        this.data[this.pos++] = value & 0xFF;
    }

    p4_alt1(value: number): void {
        this.ensure(4);
        this.data[this.pos++] = value & 0xFF;
        this.data[this.pos++] = (value >> 8) & 0xFF;
        this.data[this.pos++] = (value >> 16) & 0xFF;
        this.data[this.pos++] = (value >> 24) & 0xFF;
    }

    p4_alt2(value: number): void {
        this.ensure(4);
        this.data[this.pos++] = (value >> 8) & 0xFF;
        this.data[this.pos++] = value & 0xFF;
        this.data[this.pos++] = (value >> 24) & 0xFF;
        this.data[this.pos++] = (value >> 16) & 0xFF;
    }

    p5(value: number): void {
        this.ensure(5);
        this.p1(value >> 32);
        this.p4(value & 0xFFFFFFFF);
    }

    p6(value: number): void {
        this.ensure(6);
        this.p2(value >> 32);
        this.p4(value & 0xFFFFFFFF);
    }

    p8(value: bigint): void {
        this.ensure(8);
        this.p4(Number(value >> 32n));
        this.p4(Number(value & 0xffffffffn));
    }

    pdata(src: Uint8Array | Packet): void {
        if (src instanceof Packet) {
            src = src.data;
        }

        this.ensure(src.length);
        this.data.set(src, this.pos);
        this.pos += src.length;
    }

    pdata_alt2(src: Uint8Array, off: number, len: number): void {
        this.ensure(len - off);
        for (let i: number = off; i < off + len; i++) {
            this.data[(++this.pos) - 1] = 128 + src[i];
        }
    }

    pSmart1or2(value: number): void {
        if (value < 128) {
            this.p1(value);
        } else {
            this.p2(value + 32768);
        }
    }

    pSmart1or2s(value: number): void {
        if (value < -64 || value >= 64) {
            this.p2(value + 49152);
        } else {
            this.p1(value + 64);
        }
    }

    pIsaac1or2(value: number): void {
        if (value < 128) {
            this.p1(value);
        } else {
            this.p1((value >> 8) + 128);
            this.p1(value);
        }
    }

    pSmart2or4(value: number): void {
        if (value < 32768) {
            this.p2(value);
        } else {
            this.p4(value | 0x80000000);
        }
    }

    pSmart2or4null(value: number): void {
        if (value === -1) {
            this.p2(32767);
        } else if (value < 32768) {
            this.p2(value);
        } else {
            this.p4(value | 0x80000000);
        }
    }

    pjstr(value: string): void {
        const length: number = value.length;
        this.ensure(length + 1);
        this.data.set(Packet.textEncoder.encode(value), this.pos);
        this.pos += length;
        this.p1(0);
    }

    pjstr2(value: string): void {
        this.p1(0);
        this.pjstr(value);
    }

    // ----

    psize1(length: number): void {
        this.data[this.pos - length - 1] = length;
    }

    psize2(length: number): void {
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    psize4(length: number): void {
        this.data[this.pos - length - 4] = length >> 24;
        this.data[this.pos - length - 3] = length >> 16;
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    tinyenc(key: number[], offset: number, length: number): void {
        const start: number = this.pos;
        this.pos = offset;

        const blocks: number = Math.floor((length - offset) / 8);
        for (let i: number = 0; i < blocks; i++) {
            let v0: number = this.g4();
            let v1: number = this.g4();
            let sum: number = 0;

            let num_rounds: number = 32;
            while (num_rounds-- > 0) {
                v0 += (v1 + (v1 << 4 ^ v1 >>> 5) ^ sum + key[sum & 0x3]) | 0;
                sum = (sum + 0x9E3779B9) | 0;
                v1 += ((v0 >>> 5 ^ v0 << 4) + v0 ^ sum + key[sum >>> 11 & 0xE8C00003]) | 0;
            }

            this.pos -= 8;
            this.p4(v0);
            this.p4(v1);
        }

        this.pos = start;
    }

    tinydec(key: number[], offset: number, length: number): void {
        const start: number = this.pos;

        const blocks: number = Math.trunc((length - offset) / 8);
        this.pos = offset;

        const delta: number = 0x9E3779B9;
        for (let i: number = 0; i < blocks; i++) {
            let v0: number = this.g4();
            let v1: number = this.g4();
            let num_rounds: number = 32;
            let sum: number = delta * num_rounds;

            while (num_rounds-- > 0) {
                v1 -= (((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + key[(sum >>> 11) & 0x3]);
                v1 = v1 >>> 0; // js

                sum -= delta;
                sum = sum >>> 0; // js

                v0 -= (((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + key[sum & 0x3]);
                v0 = v0 >>> 0; // js
            }

            this.pos -= 8;
            this.p4(v0);
            this.p4(v1);
        }

        this.pos = start;
    }

    // ----

    accessBits(): void {
        this.bitPos = this.pos * 8;
    }

    accessBytes(): void {
        this.pos = ((this.bitPos + 7) / 8) >>> 0;
    }

    gBit(n: number): number {
        let bytePos: number = this.bitPos >>> 3;
        let remaining: number = 8 - (this.bitPos & 7);
        let value: number = 0;
        this.bitPos += n;

        for (; n > remaining; remaining = 8) {
            value += (this.data[bytePos++] & Packet.bitmask[remaining]) << (n - remaining);
            n -= remaining;
        }

        if (n === remaining) {
            value += this.data[bytePos] & Packet.bitmask[remaining];
        } else {
            value += (this.data[bytePos] >>> (remaining - n)) & Packet.bitmask[n];
        }

        return value;
    }

    pBit(n: number, value: number): void {
        let bytePos: number = this.bitPos >>> 3;
        let remaining: number = 8 - (this.bitPos & 7);
        this.bitPos += n;

        // grow if necessary
        if (bytePos + 1 > this.length) {
            this.resize(bytePos + 1);
        }

        for (; n > remaining; remaining = 8) {
            this.data[bytePos] &= ~Packet.bitmask[remaining];
            this.data[bytePos++] |= (value >>> (n - remaining)) & Packet.bitmask[remaining];
            n -= remaining;

            // grow if necessary
            if (bytePos + 1 > this.length) {
                this.resize(bytePos + 1);
            }
        }

        if (n == remaining) {
            this.data[bytePos] &= ~Packet.bitmask[remaining];
            this.data[bytePos] |= value & Packet.bitmask[remaining];
        } else {
            this.data[bytePos] &= ~Packet.bitmask[n] << (remaining - n);
            this.data[bytePos] |= (value & Packet.bitmask[n]) << (remaining - n);
        }
    }
}
