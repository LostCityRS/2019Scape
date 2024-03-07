import Packet from '#jagex3/io/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from './ConnectionState.js';
import Server from './Server.js';

enum LoginProt {
    INIT_GAME_CONNECTION = 14,
    INIT_JS5REMOTE_CONNECTION = 15,
    GAMELOGIN = 16,
    LOBBYLOGIN = 19,
    WORLDLIST = 23,
    WORLD_SUITABILITY = 24,
    GAMELOGIN_CONITNUE = 26,
    SSL_WEBCONNECTION = 27,
    CREATE_ACCOUNT_CONNECT = 28,
    INIT_SOCIAL_NETWORK_CONNECTION = 29,
    SOCIAL_NETWORK_LOGIN = 30,
    INIT_DEBUG_CONNECTION = 31,
}

const LoginProtLengths: number[] = [];
LoginProtLengths[LoginProt.INIT_JS5REMOTE_CONNECTION] = -1;
LoginProtLengths[LoginProt.INIT_GAME_CONNECTION] = 0;
LoginProtLengths[LoginProt.GAMELOGIN] = -2;
LoginProtLengths[LoginProt.LOBBYLOGIN] = -2;

class LoginServer {
    async decode(client: ClientSocket, stream: Packet, opcode: number): Promise<void> {
        if (typeof LoginProtLengths[opcode] === 'undefined') {
            console.log('[LOGIN]: Unknown opcode', opcode, stream);
            client.end();
            return;
        }

        let buf: Packet;
        if (LoginProtLengths[opcode] === -1) {
            const length: number = stream.g1();
            buf = stream.gPacket(length);
        } else if (LoginProtLengths[opcode] === -2) {
            const length: number = stream.g2();
            buf = stream.gPacket(length);
        } else {
            buf = stream.gPacket(LoginProtLengths[opcode]);
        }
        console.log('[LOGIN]: Received opcode', opcode);

        if (opcode === LoginProt.INIT_JS5REMOTE_CONNECTION) {
            const buildMajor: number = buf.g4();
            const buildMinor: number = buf.g4();
            const token: string = buf.gjstr();
            const language: number = buf.g1();

            if (buildMajor !== 910 && buildMinor !== 1) {
                client.write(Uint8Array.from([6]));
                client.end();
                return;
            }

            const reply: Packet = Packet.alloc(1 + Server.cache.prefetches.length * 4);
            reply.p1(0);
            for (let i: number = 0; i < Server.cache.prefetches.length; i++) {
                reply.p4(Server.cache.prefetches[i]);
            }
            client.write(reply);

            client.state = ConnectionState.Js5;
        } else if (opcode === LoginProt.INIT_GAME_CONNECTION) {
            const reply: Packet = Packet.alloc(9);
            reply.p1(0);
            reply.p4(Math.random() * 0xFFFFFFFF);
            reply.p4(Math.random() * 0xFFFFFFFF);
            client.write(reply);
        } else if (opcode === LoginProt.LOBBYLOGIN) {
            const reply: Packet = new Packet();
            reply.p1(2);
            reply.p1(0);
            const start: number = reply.pos;

            reply.p1(0);
            reply.p1(2); // rights
            reply.p1(0); // blackmarks
            reply.p1(0); // muted
            reply.p3(0);
            reply.p1(0);
            reply.p1(0);
            reply.p1(0);
            reply.p8(0n); // subscription days left
            reply.p5(0); // subscription minutes and seconds left
            reply.p1(3); // members/subscription flag?
            reply.p4(0);
            reply.p4(0);
            reply.p2(0); // recovery questions
            reply.p2(0); // messages count
            reply.p2(0); // last logged in
            reply.p4(0); // last ip
            reply.p1(0); // email status
            reply.p2(0);
            reply.p2(0);
            reply.p1(0);
            reply.pjstr2('display name');
            reply.p1(0);
            reply.p4(1);
            reply.p2(0); // world index
            reply.pjstr2('localhost'); // world ip

            reply.psize1(start - reply.pos);
            client.write(reply);

            client.state = ConnectionState.Lobby;
        }
    }
}

export default new LoginServer();
