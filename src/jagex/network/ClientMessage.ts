import Packet from '#jagex/bytepacking/Packet.js';
import ClientProt from '#jagex/network/protocol/ClientProt.js';
import LoginProt from '#jagex/network/protocol/LoginProt.js';

export default class ClientMessage {
    packetType: ClientProt | LoginProt;
    buf: Packet;

    constructor(packetType: ClientProt | LoginProt, buf: Packet) {
        this.packetType = packetType;
        this.buf = buf;
    }
}
