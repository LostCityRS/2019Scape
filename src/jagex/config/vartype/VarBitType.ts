import { ConfigType } from '#jagex/config/ConfigType.js';
import Packet from '#jagex/bytepacking/Packet.js';
import VarDomainType from '#jagex/config/vartype/constants/VarDomainType.js';
import VarType from '#jagex/config/vartype/VarType.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import { Js5ArchiveType } from '#jagex/config/Js5Archive.js';
import Js5 from '#jagex/js5/Js5.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';

export default class VarBitType extends ConfigType {
    static async list(id: number, configClient: Js5 = CacheProvider.js5[Js5ArchiveType.Config]): Promise<VarBitType> {
        const type: VarBitType = new VarBitType(id);

        const buf: Uint8Array | null = await configClient.readFile(Js5ConfigGroup.VAR_BIT.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    basevar: VarType | null = null;
    startbit: number = 0;
    endbit: number = 0;
    domain: VarDomainType | null = null;
    basevarId: number = -1;

    protected decode(buf: Packet, code: number): void {
        switch (code) {
            case 1:
                this.domain = VarDomainType.of(buf.g1());
                this.basevarId = buf.gSmart2or4null();
                // TODO lookup basevar
                break;
            case 2:
                this.startbit = buf.g1();
                this.endbit = buf.g1();
                break;
            default:
                throw new Error(`Unrecognised .varbit config code: ${code}`);
        }
    }
}