import Js5Archive from '#jagex/config/Js5Archive.js';
import Packet from '#jagex/bytepacking/Packet.js';
import Js5 from '#jagex/js5/Js5.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';
import {ConfigType} from '#jagex/config/ConfigType.js';

export default class ParamType extends ConfigType {
    static async list(id: number, js5: Js5[]): Promise<ParamType> {
        const type: ParamType = new ParamType(id);

        const buf: Uint8Array | null = await js5[Js5Archive.Config.id].readFile(Js5ConfigGroup.PARAMTYPE.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    type: ScriptVarType | null = null;
    defaultint: number = 0;
    defaultstr: string = '';
    autodisable: boolean = true;

    decode = (buf: Packet, code: number): void => {
        switch (code) {
            case 1: {
                const char: number = buf.g1b();
                this.type = ScriptVarType.getByLegacyChar(char);
                break;
            }
            case 2:
                this.defaultint = buf.g4();
                break;
            case 4:
                this.autodisable = false;
                break;
            case 5:
                this.defaultstr = buf.gjstr();
                break;
            case 101:
                this.type = ScriptVarType.of(buf.gSmart1or2());
                break;
            default:
                throw new Error(`Unrecognised .enum config code: ${code}`);
        }
    }
}