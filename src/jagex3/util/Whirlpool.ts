import Packet from '#jagex3/io/Packet.js';
import { whirlpool } from 'hash-wasm';

export default class Whirlpool {
    static async compute(bytes: Uint8Array | Packet): Promise<Uint8Array> {
        if (bytes instanceof Packet) {
            bytes = bytes.data;
        }

        return Buffer.from(await whirlpool(bytes), 'hex');
    }
}
