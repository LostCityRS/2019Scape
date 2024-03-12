import Packet from '#jagex/bytepacking/Packet.js';

import Bzip2Decompressor from '#jagex/compression/Bzip2Decompressor.js';
import GzipDecompressor from '#jagex/compression/GzipDecompressor.js';
import LzmaDecompressor from '#jagex/compression/LzmaDecompressor.js';

export default class Js5Compression {
    static async decompress(src: Uint8Array): Promise<Uint8Array> {
        const buf: Packet = new Packet(src);
        const type: number = buf.g1();
        const len: number = buf.g4();

        if (len < 0) {
            throw new Error('Js5Compression: invalid length');
        } else if (type === 0) {
            const out: Uint8Array = new Uint8Array(len);
            out.set(src.subarray(buf.pos, buf.pos + len));
            return out;
        } else {
            const uncompressedLen: number = buf.g4();
            if (uncompressedLen < 0) {
                throw new Error('Js5Compression: invalid uncompressed length');
            }

            const out: Uint8Array = new Uint8Array(uncompressedLen);
            if (type === 1) {
                Bzip2Decompressor.bunzip(buf, out);
            } else if (type === 2) {
                GzipDecompressor.gunzip(buf, out);
            } else if (type === 3) {
                await LzmaDecompressor.unzip(buf, out);
            } else {
                throw new Error(`Js5Compression: unsupported compression type ${type}`);
            }

            return out;
        }
    }
}
