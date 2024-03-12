import { whirlpool } from 'hash-wasm';

import Packet from '#jagex/bytepacking/Packet.js';

export default class Whirlpool {
    static async compute(bytes: Uint8Array | Packet): Promise<Uint8Array> {
        if (bytes instanceof Packet) {
            bytes = bytes.data;
        }

        return Buffer.from(await whirlpool(bytes), 'hex');
    }
}
