import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import Server from './Server.js';

enum Js5Prot {
    RequestGroupPrefetch = 0,
    RequestGroupUrgent = 1,
    LoggedIn = 2,
    LoggedOut = 3,
    Rekey = 4,
    Connected = 6,
    Disconnect = 7
}

class Js5Server {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        // console.log('[JS5]: Received opcode', opcode);

        if (opcode === Js5Prot.RequestGroupPrefetch || opcode === Js5Prot.RequestGroupUrgent) {
            const archive: number = stream.g1();
            const group: number = stream.g4();

            const data: Uint8Array | null = await Server.cache.getGroup(archive, group, true);
            if (!data) {
                return;
            }

            const maxChunkSize: number = 102400 - 5;
            for (let offset: number = 0; offset < data.length; offset += maxChunkSize) {
                const chunkSize: number = Math.min(maxChunkSize, data.length - offset);
                const buf: Packet = new Packet();
                buf.p1(archive);
                buf.p4(opcode === Js5Prot.RequestGroupUrgent ? group : group | 0x80000000);
                buf.pdata(data.subarray(offset, offset + chunkSize));
                client.write(buf);
            }
        } else if (opcode === Js5Prot.LoggedIn) {
            // g5
            stream.pos += 5;
        } else if (opcode === Js5Prot.LoggedOut) {
            // g5
            stream.pos += 5;
        } else if (opcode === Js5Prot.Rekey) {
            // g1
            // g4
            stream.pos += 5;
        } else if (opcode === Js5Prot.Connected) {
            // g3
            // g2
            stream.pos += 5;
        } else if (opcode === Js5Prot.Disconnect) {
            // g5
            stream.pos += 5;
            client.end();
        }
    }
}

export default new Js5Server();
