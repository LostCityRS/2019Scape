import Packet from '#jagex/bytepacking/Packet.js';

import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '../Js5Archive.js';
import {ConfigType} from '#jagex/config/ConfigType.js';

export default class StructType extends ConfigType {
    static async list(id: number, js5: Js5[]): Promise<StructType> {
        const type: StructType = new StructType(id);

        const buf: Uint8Array | null = await js5[Js5Archive.ConfigStruct.id].readFile(id / 32 | 0, id % 32);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    params: Map<number, string | number> = new Map();

    decode = (buf: Packet, code: number): void => {
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
