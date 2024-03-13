import net from 'net';

import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';
import LoginProt from '#jagex/network/protocol/LoginProt.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import ClientProt from '#jagex/network/protocol/ClientProt.js';
import ServerMessage from '#jagex/network/ServerMessage.js';
import ServerProt from '#jagex/network/protocol/ServerProt.js';

function resetClientVarCache(client: ClientSocket): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.RESET_CLIENT_VARCACHE);
    client.send(message);
}

function updateVar(client: ClientSocket, varp: number, value: number): void {
    if (value <= 255) {
        const message: ServerMessage = ServerMessage.create(ServerProt.VARP_SMALL);
        message.buf.p1(value);
        message.buf.p2_alt2(varp);
        client.send(message);
    } else {
        const message: ServerMessage = ServerMessage.create(ServerProt.VARP_LARGE);
        message.buf.p2_alt1(varp);
        message.buf.p4(value);
        client.send(message);
    }
}

function updateVarbit(client: ClientSocket, varbit: number, value: number): void {
    if (value <= 255) {
        const message: ServerMessage = ServerMessage.create(ServerProt.VARBIT_SMALL);
        message.buf.p1_alt3(value);
        message.buf.p2_alt2(varbit);
        client.send(message);
    } else {
        const message: ServerMessage = ServerMessage.create(ServerProt.VARBIT_LARGE);
        message.buf.p2_alt2(varbit);
        message.buf.p4_alt1(value);
        client.send(message);
    }
}

function updateVarc(client: ClientSocket, varc: number, value: number): void {
    if (value <= 255) {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARC_SMALL);
        message.buf.p1_alt3(value);
        message.buf.p2(varc);
        client.send(message);
    } else {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARC_LARGE);
        message.buf.p4_alt1(value);
        message.buf.p2_alt2(varc);
        client.send(message);
    }
}

function updateVarcbit(client: ClientSocket, varc: number, value: number): void {
    if (value <= 255) {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARCBIT_SMALL);
        message.buf.p2(varc);
        message.buf.p1_alt1(value);
        client.send(message);
    } else {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARCBIT_LARGE);
        message.buf.p2_alt2(varc);
        message.buf.p4_alt1(value);
        client.send(message);
    }
}

function updateVarcStr(client: ClientSocket, varc: number, value: string): void {
    if (value.length < 250) {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARCSTR_SMALL);
        message.buf.p2(varc);
        message.buf.pjstr(value);
        client.send(message);
    } else {
        const message: ServerMessage = ServerMessage.create(ServerProt.CLIENT_SETVARCSTR_LARGE);
        message.buf.p2(varc);
        message.buf.pjstr(value);
        client.send(message);
    }
}

function ifOpenTop(client: ClientSocket, toplevel: number): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.IF_OPENTOP);
    message.buf.p4_alt2(0); // xtea 4
    message.buf.p4_alt1(0); // xtea 3
    message.buf.p4_alt2(0); // xtea 1
    message.buf.p4(0); // xtea 2
    message.buf.p1(0); // unused, maybe was type?
    message.buf.p2_alt3(toplevel); // toplevel interface
    client.send(message);
}

function ifOpenSub(client: ClientSocket, toplevel: number, com: number, child: number, type: number = 0): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.IF_OPENSUB);
    message.buf.p4_alt2(0); // xtea 3
    message.buf.p4_alt1((toplevel << 16) | com); // toplevel | component
    message.buf.p1_alt2(type); // type (overlay or modal)
    message.buf.p4(0); // xtea 4
    message.buf.p2(child); // id
    message.buf.p4_alt2(0); // xtea 2
    message.buf.p4_alt2(0); // xtea 1
    client.send(message);
}

function runClientScript(client: ClientSocket, script: number, args: (string | number)[] = []): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.RUNCLIENTSCRIPT);

    let descriptor: string = '';
    for (let i: number = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'string') {
            descriptor += 's';
        } else {
            descriptor += 'i';
        }
    }

    message.buf.pjstr(descriptor);

    for (let i: number = 0; i < args.length; i++) {
        if (typeof args[i] === 'string') {
            message.buf.pjstr(args[i] as string);
        } else {
            message.buf.p4(args[i] as number);
        }
    }

    message.buf.p4(script);
    client.send(message);
}

class Lobby {
    tick: number = 0;
    server: net.Server = net.createServer();

    async loginDecode(client: ClientSocket, stream: Packet): Promise<void> {
        const opcode: number = stream.g1();
        const packetType: LoginProt | undefined = LoginProt.BY_ID[opcode];
        if (typeof packetType === 'undefined') {
            console.log(`[LOBBY]: Received unknown packet ${opcode}`);
            client.end();
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
            case LoginProt.INIT_JS5REMOTE_CONNECTION: {
                const buildMajor: number = buf.g4();
                const buildMinor: number = buf.g4();
                const token: string = buf.gjstr();
                const lang: number = buf.g1();

                if (buildMajor !== 910 && buildMinor !== 1) {
                    client.write(Uint8Array.from([6]));
                    client.end();
                    return;
                }

                client.state = ConnectionState.Js5;

                const reply: Packet = Packet.alloc(1 + CacheProvider.prefetches.length * 4);
                reply.p1(0);
                for (let i: number = 0; i < CacheProvider.prefetches.length; i++) {
                    reply.p4(CacheProvider.prefetches[i]);
                }
                client.write(reply);
                break;
            }
            case LoginProt.INIT_GAME_CONNECTION: {
                const reply: Packet = Packet.alloc(9);
                reply.p1(0);
                reply.p4(Math.random() * 0xFFFFFFFF);
                reply.p4(Math.random() * 0xFFFFFFFF);
                client.write(reply);
                break;
            }
            case LoginProt.LOBBYLOGIN: {
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

                client.state = ConnectionState.Lobby;

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
                reply.pjstr2(username as string); // display name
                reply.p1(0); // members stats
                reply.p4(1); // play age
                reply.p2(0); // world index
                reply.pjstr2('localhost'); // world ip
                reply.p2(43594); // port 1
                reply.p2(43594); // port 2
                reply.p2(43594); // port 3

                reply.psize1(reply.pos - start);
                client.write(reply);

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
                break;
            }
        }
    }

    async js5Decode(client: ClientSocket, stream: Packet): Promise<void> {
        const opcode: number = stream.g1();
        const buf: Packet = stream.gPacket(5);

        switch (opcode) {
            case 0:
            case 1: {
                const archive: number = buf.g1();
                const group: number = buf.g4();

                const data: Uint8Array | null = await CacheProvider.getGroup(archive, group, true);
                if (!data) {
                    return;
                }

                const maxChunkSize: number = 102400 - 5;
                for (let offset: number = 0; offset < data.length; offset += maxChunkSize) {
                    const chunkSize: number = Math.min(maxChunkSize, data.length - offset);
                    const buf: Packet = new Packet();
                    buf.p1(archive);
                    buf.p4(opcode === 1 ? group : group | 0x80000000);
                    buf.pdata(data.subarray(offset, offset + chunkSize));
                    client.write(buf);
                }

                break;
            }
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 6:
                break;
            case 7:
                client.end();
                break;
        }
    }

    async lobbyDecode(client: ClientSocket, stream: Packet): Promise<void> {
        const opcode: number = stream.g1();
        const packetType: ClientProt | undefined = ClientProt.values()[opcode];
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

    constructor() {
        this.server.on('listening', (): void => {
            console.log('[LOBBY]: Listening on port 43594');
        });

        this.server.on('connection', (socket: net.Socket): void => {
            console.log(`[LOBBY]: Client connected from ${socket.remoteAddress}`);

            const client: ClientSocket = new ClientSocket(socket);
            socket.on('data', async (data: Buffer): Promise<void> => {
                const stream: Packet = Packet.wrap(data, false);

                while (stream.available > 0) {
                    switch (client.state) {
                        case ConnectionState.Login: {
                            await this.loginDecode(client, stream);
                            break;
                        }
                        case ConnectionState.Js5: {
                            await this.js5Decode(client, stream);
                            break;
                        }
                        case ConnectionState.Lobby: {
                            await this.lobbyDecode(client, stream);
                            break;
                        }
                    }8
                }
            });

            socket.on('end', (): void => {
                console.log('[LOBBY]: Client disconnected');
            });

            socket.on('error', (): void => {
                socket.destroy();
            });
        });

        this.server.listen(43594, '0.0.0.0');

        this.cycle();
    }

    cycle(): void {
        // console.log(`[LOBBY]: Tick ${this.tick}`);

        this.tick++;
        setTimeout(this.cycle.bind(this), 50);
    }
}

export default new Lobby();
