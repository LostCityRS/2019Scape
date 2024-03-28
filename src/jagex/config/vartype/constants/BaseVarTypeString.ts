import BaseVarTypeCodec from '#jagex/config/vartype/constants/BaseVarTypeCodec.js';
import Packet from '#jagex/bytepacking/Packet.js';

export default class BaseVarTypeString implements BaseVarTypeCodec {
    encode(data: string, buf: Packet): void {
        buf.pjstr(data);
    }

    decode(buf: Packet): string {
        return buf.gjstr();
    }
}