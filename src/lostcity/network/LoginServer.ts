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
        reply.pIsaac1or2(157);
        reply.p1(value);
        reply.p2_alt2(varp);
    } else {
        reply.p1(50);
        reply.p2_alt1(varp);
        reply.p4(value);
    }

    client.write(reply);
}

function updateVarbit(client: ClientSocket, varbit: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.p1(44);
        reply.p1_alt3(value);
        reply.p2_alt2(varbit);
    } else {
        reply.pIsaac1or2(142);
        reply.p2_alt2(varbit);
        reply.p4_alt1(value);
    }

    client.write(reply);
}

function updateVarc(client: ClientSocket, varc: number, value: number): void {
    const reply: Packet = new Packet();

    if (value <= 255) {
        reply.pIsaac1or2(149);
        reply.p1_alt3(value);
        reply.p2(varc);
    } else {
        reply.pIsaac1or2(128);
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

function ifOpenSub(client: ClientSocket, toplevel: number, com: number, child: number, type: number = 0): void {
    const reply: Packet = new Packet();
    reply.p1(38);

    reply.p4_alt2(0); // xtea 3
    reply.p4_alt1((toplevel << 16) | com); // toplevel | component
    reply.p1_alt2(type); // type (overlay or modal)
    reply.p4(0); // xtea 4
    reply.p2(child); // id
    reply.p4_alt2(0); // xtea 2
    reply.p4_alt2(0); // xtea 1

    client.write(reply);
}

function runClientScript(client: ClientSocket, script: number, args: (string | number)[] = []): void {
    const reply: Packet = new Packet();
    reply.pIsaac1or2(156);
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
    console.log(descriptor);

    for (let i: number = 0; i < args.length; i++) {
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
            const lang: number = buf.g1();

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
            const buildMajor: number = buf.g4();
            const buildMinor: number = buf.g4();

            if (buildMajor !== 910 || buildMinor !== 1) {
                client.write(Uint8Array.from([6]));
                client.end();
                return;
            }

            // start rsadec
            if (buf.g1() !== 10) {
                client.write(Uint8Array.from([11]));
                client.end();
                return;
            }

            const seed: number[] = [];
            for (let i: number = 0; i < 4; i++) {
                seed[i] = buf.g4();
            }

            const sessionId: bigint = buf.g8();

            const authId: number = buf.g1();
            if (authId === 0) {
                const authValue: number = buf.g4();
            } else if (authId === 1 || authId === 3) {
                const authValue: number = buf.g3();
                buf.pos += 1;
            } else {
                buf.pos += 4;
            }

            buf.pos += 1; // always false (0)
            const password: string = buf.gjstr();
            console.log(`password = ${password}`);
            const ssoKey: bigint = buf.g8();
            const ssoRandom: bigint = buf.g8();

            // start tinydec
            let username: bigint | string;
            if (buf.gbool()) {
                username = buf.gjstr();
            } else {
                username = buf.g8();
            }
            console.log(`username = ${username}`);

            const game: number = buf.g1();
            const lang: number = buf.g1();
            const window: number = buf.g1();
            const width: number = buf.g2();
            const height: number = buf.g2();
            const antialiasing: number = buf.g1();
            buf.pos += 24; // TODO uid192
            const settings: string = buf.gjstr();

            // start client options
            buf.pos += 1; // options length
            buf.pos += 1; // always 38
            const option1: number = buf.g1();
            const option2: number = buf.g1();
            const option3: number = buf.g1();
            const option4: number = buf.g1();
            const option5: number = buf.g1();
            const option6: number = buf.g1();
            const option7: number = buf.g1();
            const option8: number = buf.g1();
            const option9: number = buf.g1();
            const option10: number = buf.g1();
            const option11: number = buf.g1();
            const option12: number = buf.g1();
            const option13: number = buf.g1();
            const option14: number = buf.g1();
            const option15: number = buf.g1();
            buf.pos += 1; // always 0
            const option17: number = buf.g1();
            const option18: number = buf.g1();
            const option19: number = buf.g1();
            const option20: number = buf.g1();
            const option21: number = buf.g1();
            const option22: number = buf.g1();
            const option23: number = buf.g1();
            const option24: number = buf.g1();
            buf.pos += 1; // always 0
            const option26: number = buf.g1();
            const option27: number = buf.g1();
            const option28: number = buf.g1();
            const option29: number = buf.g1();
            const option30: number = buf.g1();
            const option31: number = buf.g1();
            const option32: number = buf.g1();
            const option33: number = buf.g1();
            const option34: number = buf.g1();
            const option35: number = buf.g1();
            const option36: number = buf.g2();
            const option37: number = buf.g2();
            const option38: number = buf.g2();
            const option39: number = buf.g2();
            const option40: number = buf.g1();
            const option41: number = buf.g1();
            const option42: number = buf.g1();
            const option43: number = buf.g1();
            const option44: number = buf.g1();
            const option45: number = buf.g1();
            const option46: number = buf.g1();
            const option47: number = buf.g1();
            const option48: number = buf.g1();
            const option49: number = buf.g1();
            const option50: number = buf.g1();
            const option51: number = buf.g1();
            const option52: number = buf.g1();
            const option53: number = buf.g1();
            // end client options

            // start hardware
            buf.pos += 1; // always 8
            const anInt2058: number = buf.g1();
            const aBoolean362: boolean = buf.gbool();
            const anInt2041: number = buf.g2();
            const anInt2047: number = buf.g1();
            const anInt2045: number = buf.g1();
            const anInt2049: number = buf.g1();
            const anInt2036: number = buf.g1();
            const aBoolean363: boolean = buf.gbool();
            const anInt2023: number = buf.g2();
            const anInt2053: number = buf.g1();
            const anInt2055: number = buf.g3();
            const anInt2056: number = buf.g2();
            const aString52: string = buf.gjstr2();
            const aString57: string = buf.gjstr2();
            const aString53: string = buf.gjstr2();
            const aString54: string = buf.gjstr2();
            const anInt2060: number = buf.g1();
            const anInt2059: number = buf.g2();
            const aString55: string = buf.gjstr2();
            const aString56: string = buf.gjstr2();
            const anInt2033: number = buf.g1();
            const anInt2062: number = buf.g1();
            const anIntArray199: number[] = [];
            for (let index: number = 0; index < 3; index++) {
                anIntArray199[index] = buf.g4();
            }
            const anInt2063: number = buf.g4();
            const aString51: string = buf.gjstr2();
            // end hardware

            const verifyId: number = buf.g4();
            const aString210: string = buf.gjstr();
            const affiliate: number = buf.g4();
            const anInt3434: number = buf.g4();
            const clientToken: string = buf.gjstr();
            const anInt4202: number = buf.g1();
            buf.pos += 1; // always false (0)

            // start crcs
            const crcs: number[] = [];
            for (let index: number = 0; index < 42; index++) {
                const crc: number = buf.g4(); // TODO
            }
            // end crcs

            lobbyLoginReply(client);
            client.debug = true;

            resetClientVarCache(client);

            updateVar(client, 1750, 5412518);
            updateVar(client, 1751, 5412518);
            updateVar(client, 1752, 9259915);
            updateVar(client, 1753, 110);
            updateVar(client, 1754, 41);

            ifOpenTop(client, 906);
            ifOpenSub(client, 906, 106, 907);
            // ifOpenSub(client, 906, 107, 910);
            // ifOpenSub(client, 906, 108, 909);
            // ifOpenSub(client, 906, 110, 912);
            // ifOpenSub(client, 906, 109, 589);
            // ifOpenSub(client, 906, 111, 911);
            // ifOpenSub(client, 906, 279, 914);
            // ifOpenSub(client, 906, 297, 915);
            // ifOpenSub(client, 906, 306, 913);

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
            if (typeof username === 'string') {
                updateVarcStr(client, 2508, username);
            } else {
                // TODO handle bigint type username
            }

            // news
            runClientScript(client, 10931, [1, 0, 1, 0, 1, '02-Dec-2019', 'unk', 'This week we\'ve fixed a few cheeky bugs that had cropped up!', 'Game Update: Farming & Herblore 120 Fixes']);
            runClientScript(client, 10931, [0, 0, 1, 0, 2, '09-Dec-2019', 'unk', 'While you\'ve been gliding about on the ice outside, we\'ve been working on some smooth moves of our own.', 'Game Update: Smooth Movement']);
            runClientScript(client, 10931, [0, 0, 1, 0, 3, '09-Dec-2019', 'unk', 'The Patch Notes for December 9th!', 'Patch Notes - 9/12']);

            runClientScript(client, 10936);
            // runClientScript(client, 5953); // lobbyscreen_billing_login
            // runClientScript(client, 9345); // play music
            // runClientScript(client, 7486, [906]); // timer on component

            client.state = ConnectionState.Lobby;
        }
    }
}

export default new LoginServer();
