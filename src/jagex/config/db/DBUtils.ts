import Packet from '#jagex/bytepacking/Packet.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';

export function decodeColumnValues(buf: Packet, types: ScriptVarType[]): unknown[] {
    const count: number = buf.gSmart1or2();
    const values: unknown[] = new Array(types.length * count);
    for (let field: number = 0; field < count; field++) {
        for (let typeIdx: number = 0; typeIdx < types.length; typeIdx++) {
            const idx: number = types.length * field + typeIdx;
            values[idx] = types[typeIdx].baseType.decode(buf);
        }
    }
    return values;
}