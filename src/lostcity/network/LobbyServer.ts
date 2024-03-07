import Packet from '#jagex3/io/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';

class LobbyServer {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        console.log('[LOBBY]: Received opcode', opcode);
    }
}

export default new LobbyServer();
