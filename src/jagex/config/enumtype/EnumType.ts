import Packet from '#jagex/bytepacking/Packet.js';

import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '../Js5Archive.js';

export default class EnumType {
    static async list(id: number, js5: Js5[]): Promise<EnumType> {
        const type: EnumType = new EnumType();
        type.id = id;

        const buf: Uint8Array | null = await js5[Js5Archive.ConfigEnum.id].readFile(id >>> 8, id & 0xFF);
        if (!buf) {
            return type;
        }

        type.decode(new Packet(buf));
        return type;
    }

    id: number = 0;

    inputtype: number = 0;
    outputtype: number = 0;
    defaultString: string = '';
    defaultInt: number = 0;
    valuesMap: Map<number, string | number> = new Map();
    valuesArray: (string | number)[] = [];
    valuesCount: number = 0;

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
        if (code === 1) {
            this.inputtype = buf.g1();
        } else if (code === 2) {
            this.outputtype = buf.g1();
        } else if (code === 3) {
            this.defaultString = buf.gjstr();
        } else if (code === 4) {
            this.defaultInt = buf.g4();
        } else if (code === 5 || code === 6) {
            this.valuesCount = buf.g2();
            this.valuesMap = new Map();

            for (let i: number = 0; i < this.valuesCount; i++) {
                const key: number = buf.g4();

                let value: string | number;
                if (code === 5) {
                    value = buf.gjstr();
                } else {
                    value = buf.g4();
                }

                this.valuesMap.set(key, value);
            }
        } else if (code === 7 || code === 8) {
            const arraySize: number = buf.g2();
            this.valuesArray = new Array(arraySize);

            this.valuesCount = buf.g2();

            for (let i: number = 0; i < arraySize; i++) {
                const index: number = buf.g2();

                let value: string | number;
                if (code === 7) {
                    value = buf.gjstr();
                } else {
                    value = buf.g4();
                }

                this.valuesArray[index] = value;
            }
        } else if (code === 101) {
            this.inputtype = buf.gSmart1or2();
        } else if (code === 102) {
            this.outputtype = buf.gSmart1or2();
        }
    }
}
