import BaseVarTypeCodec from '#jagex/config/vartype/constants/BaseVarTypeCodec.js';
import Packet from '#jagex/bytepacking/Packet.js';

export default class BaseVarTypeInteger implements BaseVarTypeCodec {
    encode(data: number, buf: Packet): void {
        buf.p4(data);
    }

    decode(buf: Packet): number {
        return buf.g4();
    }
}