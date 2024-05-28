import { whirlpool } from 'hash-wasm';

export default class Whirlpool {
    static async compute(bytes: Uint8Array): Promise<Uint8Array> {
        return Buffer.from(await whirlpool(bytes), 'hex');
    }
}
