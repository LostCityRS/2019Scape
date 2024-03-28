import BaseVarTypeCodec from '#jagex/config/vartype/constants/BaseVarTypeCodec.js';
import Packet from '#jagex/bytepacking/Packet.js';

export default class BaseVarTypeLong implements BaseVarTypeCodec {
    encode(data: bigint, buf: Packet): void {
        buf.p8(data);
    }

    decode(buf: Packet): bigint {
        return buf.g8();
    }
}
