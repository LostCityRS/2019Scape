import VarType from '#jagex/config/vartype/VarType.js';
import Js5 from '#jagex/js5/Js5.js';
import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';
import Packet from '#jagex/bytepacking/Packet.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import { Js5ArchiveType } from '#jagex/config/Js5Archive.js';

export default class VarBasicType extends VarType {
    static async list(id: number, group: Js5ConfigGroup, configClient: Js5 = CacheProvider.js5[Js5ArchiveType.Config]): Promise<VarBasicType> {
        // TODO cache by domain
        const type: VarBasicType = new VarBasicType(id);

        const buf: Uint8Array | null = await configClient.readFile(group.id, id);
        if (!buf) {
            return type;
        }

        type.decodeType(new Packet(buf));
        return type;
    }
}
