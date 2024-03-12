import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';

class GameServer {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        console.log('[GAME]: Received opcode', opcode);
    }
}

export default new GameServer();
