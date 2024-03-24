import Packet from '#jagex/bytepacking/Packet.js';

import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '../Js5Archive.js';

export default class StructType {
    static async list(id: number, js5: Js5[]): Promise<StructType> {
        const type: StructType = new StructType();
        type.id = id;

        const buf: Uint8Array | null = await js5[Js5Archive.ConfigStruct.id].readFile(id / 32 | 0, id % 32);
        if (!buf) {
            return type;
        }

        type.decode(new Packet(buf));
        return type;
    }

    id: number = 0;

    params: Map<number, string | number> = new Map();

    decode(buf: Packet): void {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const code: number = buf.g1();
            if (code === 0) {
                return;
            }

            this.decodeInner(buf, code);
        }
    }

    decodeInner(buf: Packet, code: number): void {
        if (code === 249) {
            const count: number = buf.g1();

            for (let i: number = 0; i < count; i++) {
                const string: boolean = buf.g1() === 1;
                const key: number = buf.g3();
                let value: string | number;

                if (string) {
                    value = buf.gjstr();
                } else {
                    value = buf.g4();
                }

                this.params.set(key, value);
            }
        }
    }
}
