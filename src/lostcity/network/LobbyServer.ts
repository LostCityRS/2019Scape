import Packet from '#jagex3/io/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';

const ClientProtLengths: number[] = [];
ClientProtLengths[103] = 0;
ClientProtLengths[117] = 3;
ClientProtLengths[118] = 1;
ClientProtLengths[119] - 9;
ClientProtLengths[120] = -2;
ClientProtLengths[121] = 7;
ClientProtLengths[122] = 16;
ClientProtLengths[123] = 6;

class LobbyServer {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        if (typeof ClientProtLengths[opcode] === 'undefined') {
            console.log('[LOBBY]: Unknown opcode', opcode, stream);
            // client.end();
            return;
        }

        const buf: Packet = stream.gPacket(ClientProtLengths[opcode]);
        switch (opcode) {
            case 123: {
                const windowMode: number = buf.g1();
                const width: number = buf.g2();
                const height: number = buf.g2();
                const antialiasing: number = buf.g1();
                break;
            }
            case 103:
                break;
            default:
                console.log('[LOBBY]: Unhandled opcode', opcode);
                break;        
        }
    }
}

export default new LobbyServer();
