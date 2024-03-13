import Packet from '#jagex/bytepacking/Packet.js';
import ServerProt from '#jagex/network/protocol/ServerProt.js';

export default class ServerMessage {
    static pool: ServerMessage[] = [];
    static poolSize: number = 0;

    static create(packetType: ServerProt): ServerMessage {
        if (ServerMessage.poolSize === 0) {
            return new ServerMessage(packetType);
        }

        const message: ServerMessage = ServerMessage.pool[--ServerMessage.poolSize];
        message.packetType = packetType;
        message.reset();
        return message;
    }

    packetType: ServerProt;
    buf: Packet;
    start: number = 1;

    constructor(packetType: ServerProt) {
        this.packetType = packetType;
        this.buf = Packet.alloc(100);
        this.reset();
    }

    private reset(): void {
        this.buf.pos = 0;
        this.buf.pIsaac1or2(this.packetType.opcode);

        if (this.packetType.size === -1) {
            this.buf.p1(0);
        } else if (this.packetType.size === -2) {
            this.buf.p2(0);
        }

        this.start = this.buf.pos;
    }

    release(): void {
        // ServerMessage.pool[ServerMessage.poolSize++] = this;
    }
}
