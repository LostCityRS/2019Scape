import Bunzip from 'seek-bzip';

import Packet from '#jagex3/io/Packet.js';

export default class Bzip2Decompressor {
    static bunzip(src: Packet, dst: Uint8Array): void {
        const temp: Uint8Array = new Uint8Array((src.length - src.pos) + 4);
        // decompressor expects to read a magic number
        temp[0] = 0x42;
        temp[1] = 0x5A;
        temp[2] = 0x68;
        temp[3] = 0x31;
        temp.set(src.data.subarray(src.pos), 4);
        dst.set(Bunzip.decode(temp));
    }
}
