import { ConfigType } from '#jagex/config/ConfigType.js';
import Packet from '#jagex/bytepacking/Packet.js';
import VarDomainType from '#jagex/config/vartype/constants/VarDomainType.js';
import ScriptVarType from '#jagex/config/vartype/constants/ScriptVarType.js';
import VarLifetime from '#jagex/config/vartype/constants/VarLifetime.js';
import VarTransmitLevel from '#jagex/config/vartype/constants/VarTransmitLevel.js';

export default abstract class VarType extends ConfigType {
    domain: VarDomainType | null = null;
    type: ScriptVarType | null = null;
    lifetime: VarLifetime = VarLifetime.TEMPORARY;
    transmitLevel: VarTransmitLevel = VarTransmitLevel.NEVER;
    domaindefault: boolean = true;

    protected decode(buf: Packet, code: number): void {
        if (code === 1) {
            this.debugname = buf.gjstr2();
        } else if (code === 2) {
            this.domain = VarDomainType.of(buf.g1());
        } else if (code === 3) {
            this.type = ScriptVarType.of(buf.g1());
        } else if (code === 4) {
            this.lifetime = VarLifetime.of(buf.g1());
        } else if (code === 5) {
            this.transmitLevel = VarTransmitLevel.of(buf.g1());
        } else if (code === 6) {
            buf.g4(); // varname_hash32
        } else if (code === 7) {
            this.domaindefault = false;
        } else {
            throw new Error(`${code} not supported for ${this.domain?.name}`);
        }
    }
}
