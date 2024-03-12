import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ClientProt from '#jagex/network/protocol/ClientProt.js';

class LobbyServer {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        const packetType: ClientProt = ClientProt.values()[opcode];
        if (typeof packetType === 'undefined') {
            console.log(`[LOBBY]: Unknown packet ${opcode}`);
            return;
        }

        let size: number = packetType.size;
        if (size === -1) {
            size = stream.g1();
        } else if (size === -2) {
            size = stream.g2();
        }

        console.log(`[LOBBY]: Received packet ${packetType.debugname} size=${size}`);

        const buf: Packet = stream.gPacket(size);
        switch (packetType) {
            case ClientProt.WORLDLIST_FETCH: {
                const reply: Packet = new Packet();
                reply.pIsaac1or2(167);
                reply.p2(0);
                const start: number = reply.pos;

                reply.p1(0);

                reply.psize2(reply.pos - start);
                client.write(reply);
                break;
            }
            case ClientProt.WINDOW_STATUS: {
                const windowMode: number = buf.g1();
                const width: number = buf.g2();
                const height: number = buf.g2();
                const antialiasing: number = buf.g1();
                break;
            }
            case ClientProt.NO_TIMEOUT:
                break;
            default:
                console.log(`[LOBBY]: Unhandled packet ${packetType.debugname}`);
                break;        
        }
    }
}

export default new LobbyServer();
