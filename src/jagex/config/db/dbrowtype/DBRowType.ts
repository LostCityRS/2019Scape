import { ConfigType } from '#jagex/config/ConfigType.js';
import Packet from '#jagex/bytepacking/Packet.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';
import { decodeColumnValues } from '#jagex/config/db/DBUtils.js';
import Js5 from '#jagex/js5/Js5.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';

export default class DBRowType extends ConfigType {
    static async list(id: number, configClient: Js5 = CacheProvider.js5[Js5Archive.Config.id]): Promise<DBRowType> {
        const type: DBRowType = new DBRowType(id);

        const buf: Uint8Array | null = await configClient.readFile(Js5ConfigGroup.DBROWTYPE.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    values: unknown[][] | null = null;
    types: ScriptVarType[][] | null = null;
    table: number = 0;

    protected decode(buf: Packet, code: number): void {
        if (code === 3) {
            const count: number = buf.g1();
            if (this.values === null || this.types === null) {
                this.values = new Array(count);
                this.types = new Array(count);
            }

            for (let column: number = 0; column != 255; column++) {
                const columnTypes: ScriptVarType[] = new Array(buf.g1());
                for (let i: number = 0; i < columnTypes.length; i++) {
                    columnTypes[i] = ScriptVarType.of(buf.gSmart1or2());
                }
                this.values[column] = decodeColumnValues(buf, columnTypes);
                this.types[column] = columnTypes;
            }
        } else if (code === 4) {
            this.table = buf.gVarInt2();
        }
    }
}
