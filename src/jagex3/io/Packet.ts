import net from 'net';

export default class Packet {
    static bitmask: Uint32Array = new Uint32Array(33);

    static crctable: Int32Array = new Int32Array(256);
    static CRC32_POLYNOMIAL: number = 0xedb88320;

    static {
        for (let i: number = 0; i < 32; i++) {
            Packet.bitmask[i] = (1 << i) - 1;
        }
        Packet.bitmask[32] = 0xffffffff;

        for (let i: number = 0; i < 256; i++) {
            let remainder: number = i;

            for (let bit: number = 0; bit < 8; bit++) {
                if ((remainder & 1) == 1) {
                    remainder = (remainder >>> 1) ^ Packet.CRC32_POLYNOMIAL;
                } else {
                    remainder >>>= 1;
                }
            }

            Packet.crctable[i] = remainder;
        }
    }

    static crc32(src: Packet | Uint8Array | Buffer, length: number = src.length, offset: number = 0): number {
        if (src instanceof Packet) {
            src = src.data;
        }

        let crc: number = 0xffffffff;

        for (let i: number = offset; i < offset + length; i++) {
            crc = (crc >>> 8) ^ Packet.crctable[(crc ^ src[i]) & 0xff];
        }

        return ~crc;
    }

    static textDecoder = new TextDecoder('utf-8');

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

    data: Uint8Array;
    pos: number;

    constructor(src?: ArrayBuffer | Packet) {
        if (src instanceof Packet) {
            this.data = src.data;
        } else if (typeof src === 'undefined') {
            this.data = new Uint8Array();
        } else {
            this.data = new Uint8Array(src);
        }

        this.pos = 0;
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

    private ensure(size: number): void {
        if (this.available < size) {
            this.resize(this.length + size);
        }
    }

    // ----

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
        if (this.data[this.pos] < 0) {
            return this.g4() & 0x7FFFFFFF;
        }

        return this.g2();
    }

    gSmart2or4null(): number {
        if (this.data[this.pos] < 0) {
            return this.g4() & 0x7FFFFFFF;
        }

        const value: number = this.g2();
        return value === 32767 ? -1 : value;
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

    p2(value: number): void {
        this.ensure(2);
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p3(value: number): void {
        this.ensure(3);
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value: number): void {
        this.ensure(4);
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p8(value: number): void {
        this.ensure(8);
        this.data[this.pos++] = value >> 56;
        this.data[this.pos++] = value >> 48;
        this.data[this.pos++] = value >> 40;
        this.data[this.pos++] = value >> 32;
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    pdata(src: Uint8Array): void {
        this.ensure(src.length);
        this.data.set(src, this.pos);
        this.pos += src.length;
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

    send(socket: net.Socket): void {
        socket.write(this.data.subarray(0, this.pos));
    }
}
