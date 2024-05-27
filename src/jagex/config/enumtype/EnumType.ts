import Packet from '#jagex/bytepacking/Packet.js';

import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '../Js5Archive.js';
import { ConfigType } from '#jagex/config/ConfigType.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';

export default class EnumType extends ConfigType {
    static async list(id: number, js5: Js5[]): Promise<EnumType> {
        const type: EnumType = new EnumType(id);

        const buf: Uint8Array | null = await js5[Js5Archive.ConfigEnum.id].readFile(id >>> 8, id & 0xFF);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    inputtype: ScriptVarType | null = null;
    outputtype: ScriptVarType | null = null;
    defaultString: string = '';
    defaultInt: number = 0;
    valuesMap: Map<number, string | number> = new Map();
    valuesArray: (string | number)[] = [];
    valuesCount: number = 0;

    decode = (buf: Packet, code: number): void => {
        if (code === 1) {
            this.inputtype = ScriptVarType.getByLegacyChar(buf.g1b());
        } else if (code === 2) {
            this.outputtype = ScriptVarType.getByLegacyChar(buf.g1b());
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
            this.inputtype = ScriptVarType.of(buf.gSmart1or2());
        } else if (code === 102) {
            this.outputtype = ScriptVarType.of(buf.gSmart1or2());
        }
    };
}
