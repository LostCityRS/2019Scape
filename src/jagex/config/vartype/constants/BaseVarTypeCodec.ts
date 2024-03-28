import Packet from '#jagex/bytepacking/Packet.js';

export default interface BaseVarTypeCodec {
    encode(data: unknown, buf: Packet): void
    decode(buf: Packet): unknown
}
