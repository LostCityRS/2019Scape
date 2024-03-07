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

function lobbyLoginReply(client: ClientSocket): void {
    const reply: Packet = new Packet();
    reply.p1(2);
    reply.p1(0);
    const start: number = reply.pos;

    reply.p1(0); // totp token
    reply.p1(2); // staffmodlevel
    reply.p1(0); // playermodlevel
    reply.p1(0); // quickchat1
    reply.p3(0); // dob
    reply.p1(0); // gender
    reply.p1(0); // quickchat2
    reply.p1(0); // quickchat3
    reply.p8(-1n); // membership time
    reply.p5(12); // membership time left
    reply.p1(2); // members/subscription flag
    reply.p4(1); // jcoins balance
    reply.p4(0); // loyalty balance
    reply.p2(1); // recovery
    reply.p2(0); // unread messages
    reply.p2(0); // last logged in
    reply.p4(0); // last ip
    reply.p1(0); // email status
    reply.p2(53791); // cc expiry
    reply.p2(53791); // grace expiry
    reply.p1(0); // dob requested
    reply.pjstr2('Username'); // display name
    reply.p1(0); // members stats
    reply.p4(1); // play age
    reply.p2(0); // world index
    reply.pjstr2('localhost'); // world ip
    reply.p2(43594); // port 1
    reply.p2(43594); // port 2
    reply.p2(43594); // port 3

    reply.psize1(reply.pos - start);
    client.write(reply);
}

function resetClientVarCache(client: ClientSocket): void {
    const reply: Packet = new Packet();
    reply.p1(99);
    client.write(reply);
}

function updateVar(client: ClientSocket, varp: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.p1(157);
        reply.p1(value);
        reply.p2_alt2(varp);
    } else {
        reply.p1(50);
        reply.p2_alt1(varp);
        reply.p4(value);
    }

    console.log(reply.data);
    client.write(reply);
}

function updateVarbit(client: ClientSocket, varbit: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.p1(44);
        reply.p1_alt3(value);
        reply.p2_alt2(varbit);
    } else {
        reply.p1(142);
        reply.p2_alt2(varbit);
        reply.p4_alt1(value);
    }

    client.write(reply);
}

function updateVarc(client: ClientSocket, varc: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.p1(149);
        reply.p1_alt3(value);
        reply.p2(varc);
    } else {
        reply.p1(128);
        reply.p4_alt1(value);
        reply.p2_alt2(varc);
    }

    client.write(reply);
}

function updateVarcbit(client: ClientSocket, varc: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.p1(54);
        reply.p2(varc);
        reply.p1_alt1(value);
    } else {
        reply.p1(69);
        reply.p2_alt2(varc);
        reply.p4_alt1(value);
    }

    client.write(reply);
}

function updateVarcStr(client: ClientSocket, varc: number, value: string): void {
    const reply: Packet = new Packet();

    if (value.length < 250) {
        reply.p1(30);
        reply.p1(0);
        const start: number = reply.pos;

        reply.p2(varc);
        reply.pjstr(value);

        reply.psize1(reply.pos - start);
    } else {
        reply.p1(21);
        reply.p2(0);
        const start: number = reply.pos;

        reply.p2(varc);
        reply.pjstr(value);

        reply.psize2(reply.pos - start);
    }

    client.write(reply);
}

function ifOpenTop(client: ClientSocket, toplevel: number): void {
    const reply: Packet = new Packet();
    reply.p1(35);

    reply.p4_alt2(0); // xtea 4
    reply.p4_alt1(0); // xtea 3
    reply.p4_alt2(0); // xtea 1
    reply.p4(0); // xtea 2
    reply.p1(0); // unused, maybe was type?
    reply.p2_alt3(toplevel); // toplevel interface

    client.write(reply);
}

function ifOpenSub(client: ClientSocket, toplevel: number, com: number, child: number, overlay: boolean = false): void {
    const reply: Packet = new Packet();
    reply.p1(38);

    reply.p4_alt2(0); // xtea 3
    reply.p4_alt1((toplevel << 16) | com); // toplevel | component
    reply.p1_alt2(overlay ? 1 : 0); // type (overlay or modal)
    reply.p4(0); // xtea 4
    reply.p2(child); // id
    reply.p4_alt2(0); // xtea 2
    reply.p4_alt2(0); // xtea 1

    client.write(reply);
}

function runClientScript(client: ClientSocket, script: number, args: (string | number)[] = []): void {
    const reply: Packet = new Packet();
    reply.p1(156);
    reply.p2(0);
    const start: number = reply.pos;

    let descriptor: string = '';
    for (let i: number = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'string') {
            descriptor += 's';
        } else {
            descriptor += 'i';
        }
    }

    reply.pjstr(descriptor);

    for (let i: number = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'string') {
            reply.pjstr(args[i] as string);
        } else {
            reply.p4(args[i] as number);
        }
    }

    reply.p4(script);

    reply.psize2(reply.pos - start);
    client.write(reply);
}

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
            lobbyLoginReply(client);
            client.debug = true;

            resetClientVarCache(client);
            ifOpenTop(client, 930);
            runClientScript(client, 5953); // lobbyscreen_billing_login

            updateVar(client, 1750, 5412518);
            updateVar(client, 1751, 5412518);
            updateVar(client, 1752, 9259915);

            updateVar(client, 1753, 110);
            updateVar(client, 1754, 41);

            updateVarbit(client, 16464, 1);
            updateVarbit(client, 16465, 0);

            updateVarc(client, 3905, 0); // enable banner
            updateVarc(client, 4366, 0); // th keys
            updateVarc(client, 4367, 0); // th chest hearts
            updateVarc(client, 4368, -1); // th banner
            updateVarc(client, 4364, -1); // boss pets
            updateVarc(client, 4365, -1); // second right banner
            updateVarc(client, 4360, 0); // loyalty points
            updateVarc(client, 4359, 0); // runecoin
            updateVarcStr(client, 2508, 'Username');

            // ifOpenTop(client, 906);
            // ifOpenSub(client, 906, 106, 907);
            // ifOpenSub(client, 906, 107, 910);
            // ifOpenSub(client, 906, 108, 909);
            // ifOpenSub(client, 906, 110, 912);
            // ifOpenSub(client, 906, 109, 589);
            // ifOpenSub(client, 906, 111, 911);
            // ifOpenSub(client, 906, 279, 914);
            // ifOpenSub(client, 906, 297, 915);
            // ifOpenSub(client, 906, 306, 913);
            // runClientScript(client, 10931); // news
            // runClientScript(client, 10936);

            // runClientScript(client, 9345); // play music
            // runClientScript(client, 7486); // timer on component

            client.state = ConnectionState.Lobby;
        }
    }
}

export default new LoginServer();
