import { ConfigType } from '#jagex/config/ConfigType.js';
import Packet from '#jagex/bytepacking/Packet.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';
import { decodeColumnValues } from '#jagex/config/db/DBUtils.js';
import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';

export default class DBTableType extends ConfigType {
    static async list(id: number, configClient: Js5 = CacheProvider.js5[Js5Archive.Config.id]): Promise<DBTableType> {
        const type: DBTableType = new DBTableType(id);

        const buf: Uint8Array | null = await configClient.readFile(Js5ConfigGroup.DBTABLETYPE.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    columns: ScriptVarType[][] | null = null;
    defaults: unknown[][] | null = null;

    protected decode(buf: Packet, code: number): void {
        if (code === 1) {
            const count: number = buf.g1();
            if (this.columns === null) {
                this.columns = new Array(count);
            }

            for (let data: number = buf.g1(); data != 255; data = buf.g1()) {
                const column: number = data & 0x7F;
                const hasDefaults: boolean = (data & 0x80) != 0;
                
                const colTypes: ScriptVarType[] = new Array(buf.g1());
                for (let i: number = 0; i < colTypes.length; i++) {
                    colTypes[i] = ScriptVarType.of(buf.gSmart1or2());
                }
                this.columns[column] = colTypes;
                
                if (hasDefaults) {
                    if (this.defaults === null) {
                        this.defaults = new Array(this.columns.length);
                    }
                    this.defaults[column] = decodeColumnValues(buf, colTypes);
                }
            }
        } else {
            throw new Error(`Unrecognised .dbtable config code: ${code}`);
        }
    }
}