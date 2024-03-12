import { decompress } from '@napi-rs/lzma/lzma';

import Packet from '#jagex/bytepacking/Packet.js';

export default class LzmaDecompressor {
    static async unzip(src: Packet, dst: Uint8Array): Promise<void> {
        // jagex format doesn't include the uncompressed length so we need to build a new header
        const raw: Uint8Array = src.data.subarray(src.pos);
        const temp: Uint8Array = new Uint8Array(8 + raw.length);
        temp.set(raw.subarray(0, 5)); // copy over zlib properties

        // add uncompressed size
        temp[5] = dst.length;
        temp[6] = dst.length >> 8;
        temp[7] = dst.length >> 16;
        temp[8] = dst.length >> 24;
        temp[9] = 0;
        temp[10] = 0;
        temp[11] = 0;
        temp[12] = 0;
        temp.set(src.data.subarray(src.pos + 5), 13);

        const compressed: Buffer = Buffer.from(temp);
        const uncompressed: Buffer = await decompress(compressed);
        dst.set(uncompressed);
    }
}
