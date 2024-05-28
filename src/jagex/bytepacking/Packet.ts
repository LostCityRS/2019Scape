import fs from 'fs';
import {dirname} from 'path';
import forge from 'node-forge';
import PrivateKey = forge.pki.rsa.PrivateKey;
import BigInteger = forge.jsbn.BigInteger;
import Hashable from '#jagex/datastruct/Hashable.js';
import LinkList from '#jagex/datastruct/LinkList.js';

export default class Packet extends Hashable {
    private static readonly crctable: Int32Array = new Int32Array(256);
    private static readonly bitmask: Uint32Array = new Uint32Array(33);

    /**
     * Reversed CRC-32 polynomial for Cyclic Redundancy Check (CRC).
     * This is sometimes referred to as CRC32B.
     */
    private static readonly crc32b = 0xEDB88320;

    static {
        for (let i: number = 0; i < 32; i++) {
            this.bitmask[i] = (1 << i) - 1;
        }
        this.bitmask[32] = 0xffffffff;

        for (let b = 0; b < 256; b++) {
            let remainder = b;

            for (let bit = 0; bit < 8; bit++) {
                if ((remainder & 0x1) == 1) {
                    remainder = (remainder >>> 1) ^ this.crc32b;
                } else {
                    remainder >>>= 0x1;
                }
            }

            this.crctable[b] = remainder;
        }
    }

    static getcrc(src: Uint8Array, offset: number, length: number): number {
        let crc = 0xffffffff;
        for (let i = offset; i < length; i++) {
            crc = (crc >>> 8) ^ (this.crctable[(crc ^ src[i]) & 0xFF]);
        }
        return ~crc;
    }

    static checkcrc(src: Uint8Array, offset: number, length: number, expected: number = 0): boolean {
        const checksum: number = Packet.getcrc(src, offset, length);
        // console.log(checksum, expected);
        return checksum == expected;
    }

    static wrap(src: Uint8Array, advance: boolean = true): Packet {
        const buf: Packet = new Packet(src);
        if (advance) {
            buf.pos = src.length;
        }

        return buf;
    }

    static unwrap(src: Uint8Array, copy: boolean): Uint8Array {
        if (copy) {
            const len: number = src.length;
            const temp: Uint8Array = new Uint8Array(len);
            temp.set(src);
            return temp;
        }
        return src;
    }

    static alloc(type: number): Packet {
        let packet: Packet | null = null;

        if (type === 0 && this.cacheMinCount > 0) {
            packet = this.cacheMin.removeHead();
            this.cacheMinCount--;
        } else if (type === 1 && this.cacheMidCount > 0) {
            packet = this.cacheMid.removeHead();
            this.cacheMidCount--;
        } else if (type === 2 && this.cacheMaxCount > 0) {
            packet = this.cacheMax.removeHead();
            this.cacheMaxCount--;
        } else if (type === 3 && this.cacheBigCount > 0) {
            packet = this.cacheBig.removeHead();
            this.cacheBigCount--;
        } else if (type === 4 && this.cacheHugeCount > 0) {
            packet = this.cacheHuge.removeHead();
            this.cacheHugeCount--;
        } else if (type === 5 && this.cacheUnimaginableCount > 0) {
            packet = this.cacheUnimaginable.removeHead();
            this.cacheUnimaginableCount--;
        }

        if (packet !== null) {
            packet.pos = 0;
            packet.bitPos = 0;
            return packet;
        }

        if (type === 0) {
            return new Packet(new Uint8Array(100));
        } else if (type === 1) {
            return new Packet(new Uint8Array(5000));
        } else if (type === 2) {
            return new Packet(new Uint8Array(30000));
        } else if (type === 3) {
            return new Packet(new Uint8Array(100000));
        } else if (type === 4) {
            return new Packet(new Uint8Array(500000));
        } else if (type === 5) {
            return new Packet(new Uint8Array(2000000));
        } else {
            return new Packet(new Uint8Array(type));
        }
    }

    static load(path: string, seekToEnd: boolean = false): Packet {
        const packet: Packet = new Packet(new Uint8Array(fs.readFileSync(path)));
        if (seekToEnd) {
            packet.pos = packet.data.length;
        }
        return packet;
    }

    private static cacheMinCount: number = 0;
    private static cacheMidCount: number = 0;
    private static cacheMaxCount: number = 0;
    private static cacheBigCount: number = 0;
    private static cacheHugeCount: number = 0;
    private static cacheUnimaginableCount: number = 0;

    private static readonly cacheMin: LinkList<Packet> = new LinkList();
    private static readonly cacheMid: LinkList<Packet> = new LinkList();
    private static readonly cacheMax: LinkList<Packet> = new LinkList();
    private static readonly cacheBig: LinkList<Packet> = new LinkList();
    private static readonly cacheHuge: LinkList<Packet> = new LinkList();
    private static readonly cacheUnimaginable: LinkList<Packet> = new LinkList();

    data: Uint8Array;
    #view: DataView;
    pos: number;
    bitPos: number;

    constructor(src: Uint8Array) {
        super();

        this.data = src;
        this.#view = new DataView(this.data.buffer);
        this.pos = 0;
        this.bitPos = 0;
    }

    get available(): number {
        return this.data.length - this.pos;
    }

    get length(): number {
        return this.data.length;
    }

    release(): void {
        this.pos = 0;
        this.bitPos = 0;

        if (this.data.length === 100 && Packet.cacheMinCount < 1000) {
            Packet.cacheMin.addTail(this);
            Packet.cacheMinCount++;
        } else if (this.data.length === 5000 && Packet.cacheMidCount < 250) {
            Packet.cacheMid.addTail(this);
            Packet.cacheMidCount++;
        } else if (this.data.length === 30000 && Packet.cacheMaxCount < 50) {
            Packet.cacheMax.addTail(this);
            Packet.cacheMaxCount++;
        } else if (this.data.length === 100000 && Packet.cacheBigCount < 10) {
            Packet.cacheBig.addTail(this);
            Packet.cacheBigCount++;
        } else if (this.data.length === 500000 && Packet.cacheHugeCount < 5) {
            Packet.cacheHuge.addTail(this);
            Packet.cacheHugeCount++;
        } else if (this.data.length === 2000000 && Packet.cacheUnimaginableCount < 2) {
            Packet.cacheUnimaginable.addTail(this);
            Packet.cacheUnimaginableCount++;
        }
    }

    save(path: string, length: number = this.pos, start: number = 0): void {
        const dir: string = dirname(path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(path, this.data.subarray(start, start + length));
    }

    p1(value: number): void {
        this.#view.setUint8(this.pos++, value);
    }

    p1_alt1(value: number): void {
        this.#view.setUint8(this.pos++, value + 128);
    }

    p1_alt2(value: number): void {
        this.#view.setUint8(this.pos++, -value);
    }

    p1_alt3(value: number): void {
        this.#view.setUint8(this.pos++, 128 - value);
    }

    p2(value: number): void {
        this.#view.setUint16(this.pos, value);
        this.pos += 2;
    }

    p2_alt1(value: number): void {
        this.#view.setUint16(this.pos, value, true);
        this.pos += 2;
    }

    p2_alt2(value: number): void {
        this.#view.setUint8(this.pos++, (value >> 8) & 0xFF);
        this.#view.setUint8(this.pos++, (value + 128) & 0xFF);
    }

    p2_alt3(value: number): void {
        this.#view.setUint8(this.pos++, (value + 128) & 0xFF);
        this.#view.setUint8(this.pos++, (value >> 8) & 0xFF);
    }

    p3(value: number): void {
        this.#view.setUint8(this.pos++, value >> 16);
        this.#view.setUint16(this.pos, value);
        this.pos += 2;
    }

    p4(value: number): void {
        this.#view.setInt32(this.pos, value);
        this.pos += 4;
    }

    p4_alt1(value: number): void {
        this.#view.setInt32(this.pos, value, true);
        this.pos += 4;
    }

    p4_alt2(value: number): void {
        this.#view.setUint8(this.pos++, value >> 8);
        this.#view.setUint8(this.pos++, value);
        this.#view.setUint8(this.pos++, value >> 24);
        this.#view.setUint8(this.pos++, value >> 16);
    }

    p5(value: bigint): void {
        this.p1(Number(value >> 32n));
        this.p4(Number(value & 0xffffffffn));
    }

    p6(value: bigint): void {
        this.p2(Number(value >> 32n));
        this.p4(Number(value & 0xffffffffn));
    }

    p8(value: bigint): void {
        this.#view.setBigInt64(this.pos, value);
        this.pos += 8;
    }

    pbool(value: boolean): void {
        this.p1(value ? 1 : 0);
    }

    pjstr(str: string, terminator: number = 0): void {
        const length: number = str.length;
        for (let i: number = 0; i < length; i++) {
            this.#view.setUint8(this.pos++, str.charCodeAt(i));
        }
        this.#view.setUint8(this.pos++, terminator);
    }

    pjstr2(str: string): void {
        this.p1(0);
        this.pjstr(str);
    }

    pdata(src: Uint8Array, off: number, len: number): void {
        for (let i: number = off; i < off + len; i++) {
            this.#view.setUint8(this.pos++, src[i]);
        }
    }

    pdata_alt2(src: Uint8Array, off: number, len: number): void {
        for (let i: number = off; i < off + len; i++) {
            this.#view.setUint8(this.pos++, 128 + src[i]);
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

    psize4(size: number): void {
        this.#view.setUint32(this.pos - size - 4, size);
    }

    psize2(size: number): void {
        this.#view.setUint16(this.pos - size - 2, size);
    }

    psize1(size: number): void {
        this.#view.setUint8(this.pos - size - 1, size);
    }

    // ----

    g1(): number {
        return this.#view.getUint8(this.pos++);
    }

    g1b(): number {
        return this.#view.getInt8(this.pos++);
    }

    g2(): number {
        this.pos += 2;
        return this.#view.getUint16(this.pos - 2);
    }

    g2s(): number {
        this.pos += 2;
        return this.#view.getInt16(this.pos - 2);
    }

    g3(): number {
        const result: number = (this.#view.getUint8(this.pos++) << 16) | this.#view.getUint16(this.pos);
        this.pos += 2;
        return result;
    }

    g4(): number {
        this.pos += 4;
        return this.#view.getInt32(this.pos - 4);
    }

    g8(): bigint {
        this.pos += 8;
        return this.#view.getBigInt64(this.pos - 8);
    }

    gbool(): boolean {
        return this.g1() === 1;
    }

    gdata(dest: Uint8Array, offset: number, length: number): void {
        dest.set(this.data.subarray(this.pos, this.pos + length), offset);
        this.pos += length;
    }

    gPacket(length: number): Packet {
        const dest: Uint8Array = new Uint8Array(length);
        dest.set(this.data.subarray(this.pos, this.pos + length), 0);
        this.pos += length;
        return new Packet(dest);
    }

    gjstr(terminator: number = 0): string {
        const length: number = this.data.length;
        let str: string = '';
        let b: number;
        while ((b = this.#view.getUint8(this.pos++)) !== terminator && this.pos < length) {
            str += String.fromCharCode(b);
        }
        return str;
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
        const version: number = this.#view.getUint8(this.pos++);
        if (version !== 0) {
            throw new Error();
        }
        return this.gjstr();
    }

    gSmart1or2(): number {
        return this.#view.getUint8(this.pos) < 128 ? this.g1() : this.g2() - 32768;
    }

    gSmart1or2s(): number {
        return this.#view.getUint8(this.pos) < 128 ? this.g1() - 64 : this.g2s() - 49152;
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
        return this.#view.getUint8(this.pos) >= 128 ? this.g4() & 0x7fffffff : this.g2();
    }

    gSmart2or4null(): number {
        if (this.#view.getUint8(this.pos) >= 128) {
            return this.g4() & 0x7fffffff;
        } else {
            const val: number = this.g2();
            return val === 32767 ? -1 : val;
        }
    }

    gVarInt(): number {
        let value: number = this.#view.getUint8(this.pos++);
        let remainder: number = 0;

        while (value < 0) {
            remainder = ((remainder | value & 0x7f) << 7) | 0;
            value = this.#view.getUint8(this.pos++);
        }

        return value | remainder;
    }

    gVarInt2(): number {
        let value: number = 0;
        let bits: number = 0;
        let read: number = 0;
        do {
            read = this.g1();
            value |= (read & 0x7f) << bits;
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
            result |= BigInt(this.#view.getUint8(this.pos++)) << BigInt(bits);
            bits -= 8;
        }

        return result;
    }

    bits(): void {
        this.bitPos = this.pos * 8;
        // this.bitPos = this.pos << 3;
    }

    bytes(): void {
        this.pos = ((this.bitPos + 7) / 8) | 0;
        // this.pos = (this.bitPos + 7) >>> 3;
    }

    gBit(n: number): number {
        let bytePos: number = this.bitPos >>> 3;
        let remaining: number = 8 - (this.bitPos & 7);
        let value: number = 0;
        this.bitPos += n;

        for (; n > remaining; remaining = 8) {
            value += (this.#view.getUint8(bytePos++) & Packet.bitmask[remaining]) << (n - remaining);
            n -= remaining;
        }

        if (n == remaining) {
            value += this.#view.getUint8(bytePos) & Packet.bitmask[remaining];
        } else {
            value += (this.#view.getUint8(bytePos) >>> (remaining - n)) & Packet.bitmask[n];
        }

        return value;
    }

    pBit(n: number, value: number): void {
        let bytePos: number = this.bitPos >>> 3;
        let remaining: number = 8 - (this.bitPos & 7);
        this.bitPos += n;

        for (; n > remaining; remaining = 8) {
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) & ~Packet.bitmask[remaining]);
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) | ((value >>> (n - remaining)) & Packet.bitmask[remaining]));
            bytePos++;
            n -= remaining;
        }

        if (n == remaining) {
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) & ~Packet.bitmask[remaining]);
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) | value & Packet.bitmask[remaining]);
        } else {
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) & (~Packet.bitmask[n] << (remaining - n)));
            this.#view.setUint8(bytePos, this.#view.getUint8(bytePos) | ((value & Packet.bitmask[n]) << (remaining - n)));
        }
    }

    tinyenc(key: number[], offset: number, length: number): void {
        const start: number = this.pos;
        this.pos = offset;

        const blocks: number = ((length - offset) / 8) | 0;
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

        const blocks: number = ((length - offset) / 8) | 0;
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

    rsaenc(pem: PrivateKey): void {
        const length: number = this.pos;
        this.pos = 0;

        const dec: Uint8Array = new Uint8Array(length);
        this.gdata(dec, 0, dec.length);

        const bigRaw: BigInteger = new BigInteger(Array.from(dec));
        const rawEnc: Uint8Array = Uint8Array.from(bigRaw.modPow(pem.e, pem.n).toByteArray());

        this.pos = 0;
        this.p1(rawEnc.length);
        this.pdata(rawEnc, 0, rawEnc.length);
    }

    rsadec(pem: PrivateKey): void {
        const p: BigInteger = pem.p;
        const q: BigInteger = pem.q;
        const dP: BigInteger = pem.dP;
        const dQ: BigInteger = pem.dQ;
        const qInv: BigInteger = pem.qInv;

        const enc: Uint8Array = new Uint8Array(this.g1());
        this.gdata(enc, 0, enc.length);

        const bigRaw: BigInteger = new BigInteger(Array.from(enc));
        const m1: BigInteger = bigRaw.mod(p).modPow(dP, p);
        const m2: BigInteger = bigRaw.mod(q).modPow(dQ, q);
        const h: BigInteger = qInv.multiply(m1.subtract(m2)).mod(p);
        const rawDec: Uint8Array = new Uint8Array(m2.add(h.multiply(q)).toByteArray());

        this.pos = 0;
        this.pdata(rawDec, 0, rawDec.length);
        this.pos = 0;
    }
}
