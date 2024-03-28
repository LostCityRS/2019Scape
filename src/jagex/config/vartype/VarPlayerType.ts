import VarType from '#jagex/config/vartype/VarType.js';
import Packet from '#jagex/bytepacking/Packet.js';
import Js5 from '#jagex/js5/Js5.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import { Js5ArchiveType } from '#jagex/config/Js5Archive.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';

export default class VarPlayerType extends VarType {
    static async list(id: number, configClient: Js5 = CacheProvider.js5[Js5ArchiveType.Config]): Promise<VarPlayerType> {
        const type: VarPlayerType = new VarPlayerType(id);

        const buf: Uint8Array | null = await configClient.readFile(Js5ConfigGroup.VAR_PLAYER.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }

    clientcode: number = 0;

    protected decode(buf: Packet, code: number): void {
        if (code === 110) {
            this.clientcode = buf.g2();
        } else {
            super.decode(buf, code);
        }
    }
}
