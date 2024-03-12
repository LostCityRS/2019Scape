import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';

import CacheProvider from '#lostcity/server/CacheProvider.js';

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

function lobbyLoginReply(client: ClientSocket, username: string): void {
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
    reply.pjstr2(username); // display name
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

            const reply: Packet = Packet.alloc(1 + CacheProvider.prefetches.length * 4);
            reply.p1(0);
            for (let i: number = 0; i < CacheProvider.prefetches.length; i++) {
                reply.p4(CacheProvider.prefetches[i]);
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
            const ssoKey: bigint = buf.g8();
            const ssoRandom: bigint = buf.g8();

            // start tinydec
            let username: bigint | string;
            if (buf.gbool()) {
                username = buf.gjstr();
            } else {
                username = buf.g8();
            }

            const game: number = buf.g1();
            const lang: number = buf.g1();
            const window: number = buf.g1();
            const width: number = buf.g2();
            const height: number = buf.g2();
            const antialiasing: number = buf.g1();
            buf.pos += 24; // TODO uid192
            const settings: string = buf.gjstr();

            // start client preferences
            buf.pos += 1; // preferences length
            const version: number = buf.g1();
            const unknown: number = buf.g1();
            const unknown1: number = buf.g1();
            buf.pos += 1; // unused
            const bloom: number = buf.g1();
            const brightness: number = buf.g1();
            const buildArea: number = buf.g1();
            const buildAreaSize: number = buf.g1();
            const flickeringEffects: number = buf.g1();
            const fog: number = buf.g1();
            const groundBlending: number = buf.g1();
            const groundDecoration: number = buf.g1();
            const idleAnimations: number = buf.g1();
            const lightingDetail: number = buf.g1();
            const sceneryShadows: number = buf.g1();
            const unknown3: number = buf.g1();
            buf.pos += 1; // always 0
            const unknown4: number = buf.g1();
            const particles: number = buf.g1();
            const removeRoofs: number = buf.g1();
            const screenSize: number = buf.g1();
            const skyboxes: number = buf.g1();
            const characterShadows: number = buf.g1();
            const textures: number = buf.g1();
            const displayMode: number = buf.g1();
            buf.pos += 1; // always 0
            const waterDetail: number = buf.g1();
            const maxScreenSize: number = buf.g1();
            buf.pos += 16; // unused
            const customCursors: number = buf.g1();
            const preset: number = buf.g1();
            const cpuUsage: number = buf.g1();
            const unknown5: number = buf.g1();
            const unknown6: number = buf.g1();
            const unknown7: number = buf.g1();
            buf.pos += 1; // unused
            const unknown8: number = buf.g1();
            const themeMusicVolume: number = buf.g1();
            const themeMusicVolume1: number = buf.g1();
            const themeMusicVolume2: number = buf.g1();
            const themeMusicVolume3: number = buf.g1();
            const themeMusicVolume4: number = buf.g1();
            const unknown9: number = buf.g1();
            // end client options

            // start hardware
            buf.pos += 1; // always 8
            const operatingSystem: number = buf.g1();
            const osArch64: boolean = buf.gbool();
            const osVersion: number = buf.g2();
            const javaVendor: number = buf.g1();
            const javaVersionMajor: number = buf.g1();
            const javaVersionMinor: number = buf.g1();
            const javaVersionPatch: number = buf.g1();
            buf.pos += 1; // unused
            const maxMemory: number = buf.g2();
            const availableProcessors: number = buf.g1();
            const cpuInfoRam: number = buf.g3();
            const cpuInfoSpeed: number = buf.g2();
            const gpuInfoDescription: string = buf.gjstr2();
            buf.gjstr2(); // unused
            const dxDriverVersion: string = buf.gjstr2();
            buf.gjstr2(); // unused
            const dxDriverDateMonth: number = buf.g1();
            const dxDriverDateYear: number = buf.g2();
            const rawCpuInfoVendor: string = buf.gjstr2();
            const rawCpuInfoDescription: string = buf.gjstr2();
            const rawCpuInfoProcessors: number = buf.g1();
            const rawCpuInfoProcessors2: number = buf.g1();
            const rawCpuInfoUnknown: number[] = [];
            for (let index: number = 0; index < 3; index++) {
                rawCpuInfoUnknown[index] = buf.g4();
            }
            const rawCpuInfoUnknown1: number = buf.g4();
            buf.gjstr2(); // unused
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
                crcs[index] = buf.g4();
            }
            // end crcs

            lobbyLoginReply(client, username as string);
            client.state = ConnectionState.Lobby;

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

            // news
            runClientScript(client, 10931, [1, 0, 1, 0, 1, '02-Dec-2019', 'unk', 'This week we\'ve fixed a few cheeky bugs that had cropped up!', 'Game Update: Farming & Herblore 120 Fixes']);
            runClientScript(client, 10931, [0, 0, 1, 0, 2, '09-Dec-2019', 'unk', 'While you\'ve been gliding about on the ice outside, we\'ve been working on some smooth moves of our own.', 'Game Update: Smooth Movement']);
            runClientScript(client, 10931, [0, 0, 1, 0, 3, '09-Dec-2019', 'unk', 'The Patch Notes for December 9th!', 'Patch Notes - 9/12']);

            runClientScript(client, 10936);
            // runClientScript(client, 5953); // lobbyscreen_billing_login
            // runClientScript(client, 9345); // play music
            // runClientScript(client, 7486, [906]); // timer on component
        }
    }
}

export default new LoginServer();
