import BaseVarTypeCodec from '#jagex/config/vartype/constants/BaseVarTypeCodec.js';
import Packet from '#jagex/bytepacking/Packet.js';

export default class BaseVarTypeCoordFine implements BaseVarTypeCodec {
    encode(data: unknown, buf: Packet): void {
        throw new Error('Not implemented');
    }

    decode(buf: Packet): unknown {
        throw new Error('Not implemented');
    }
}