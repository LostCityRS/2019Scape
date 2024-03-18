import net from 'net';
import { parentPort } from 'worker_threads';

import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';
import LoginProt from '#jagex/network/protocol/LoginProt.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import ClientProt from '#jagex/network/protocol/ClientProt.js';

import AllPackets from '#jagex/network/packetencoders/AllPackets.js';
import ClientMessage from '#jagex/network/ClientMessage.js';
import ServerScriptList from '#lostcity/script/ServerScriptList.js';
import Js5Archive from '#jagex/config/Js5Archive.js';

import ScriptRunner from '#lostcity/script/ScriptRunner.js';

import Player from '#lostcity/entity/Player.js';
import ServerScriptState from '#lostcity/script/ServerScriptState.js';

class Lobby {
    tick: number = 0;
    server: net.Server = net.createServer();
    players: Player[] = new Array(2048);

    async loginDecode(client: ClientSocket, stream: Packet): Promise<void> {
        const opcode: number = stream.g1();
        const packetType: LoginProt | undefined = LoginProt.BY_ID[opcode];
        if (typeof packetType === 'undefined') {
            // console.log(`[LOBBY]: Received unknown packet ${opcode}`);
            client.end();
            return;
        }

        let size: number = packetType.size;
        if (size === -1) {
            size = stream.g1();
        } else if (size === -2) {
            size = stream.g2();
        }

        // console.log(`[LOBBY]: Received packet ${packetType.debugname} size=${size}`);

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
                reply.p2(43595); // port 1
                reply.p2(43595); // port 2
                reply.p2(43595); // port 3

                reply.psize1(reply.pos - start);
                client.write(reply);

                const player: Player = new Player();
                player.client = client;
                this.addPlayer(player);
                player.login();
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

                // console.log(`[JS5]: Requesting ${archive} ${group}`);

                const data: Uint8Array | null = await CacheProvider.getGroup(archive, group, true);
                if (!data) {
                    return;
                }

                let sent: number = 0;
                while (sent < data.length) {
                    const length: number = data.length;

                    const buf: Packet = Packet.alloc(Math.min(102400, length - sent) + 5);
                    buf.p1(archive);
                    buf.p4(opcode === 1 ? group : group | 0x80000000);

                    for (let pos: number = sent; pos < length; pos++) {
                        buf.p1(data[pos]);

                        if (buf.pos == 102400 || pos == length - 1) {
                            sent = pos + 1;
                            client.write(buf);
                            break;
                        }
                    }
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

    async lobbyDecode(client: ClientSocket, message: ClientMessage): Promise<void> {
        // console.log(`[LOBBY]: Received packet ${message.packetType.debugname} opcode=${message.packetType.opcode} size=${message.buf.length}`);

        switch (message.packetType) {
            case ClientProt.WORLDLIST_FETCH: {
                AllPackets.worldlistFetchReply(client);
                break;
            }
            case ClientProt.CLIENT_CHEAT: {
                const scripted: boolean = message.buf.g1() == 1;
                const suggest: boolean = message.buf.g1() == 1
                const command: string = message.buf.gjstr();

                switch (command) {
                    case 'js5_reload': {
                        AllPackets.js5Reload(client);
                        break
                    }
                    case 'reboottimer': {
                        AllPackets.updateRebootTimer(client, 1200);
                        break
                    }
                    default: {
                        console.log(`Unknown command: ${command}`)
                        break;
                    }
                }

                break;
            }
            case ClientProt.WINDOW_STATUS: {
                const windowMode: number = message.buf.g1();
                const width: number = message.buf.g2();
                const height: number = message.buf.g2();
                const antialiasing: number = message.buf.g1();
                break;
            }
            case ClientProt.NO_TIMEOUT:
                break;
            default:
                console.log(`[LOBBY]: Unhandled packet ${message.packetType.debugname}`);
                break;
        }
    }

    constructor() {
        this.server.on('listening', (): void => {
            console.log('[LOBBY]: Listening on port 43594');
        });

        this.server.on('connection', (socket: net.Socket): void => {
            console.log(`[LOBBY]: Client connected from ${socket.remoteAddress}`);

            socket.setNoDelay(true);
            socket.setKeepAlive(true, 5000);
            socket.setTimeout(15000);

            const client: ClientSocket = new ClientSocket(socket);
            socket.on('data', async (data: Buffer): Promise<void> => {
                const stream: Packet = Packet.wrap(data, false);

                try {
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
                                const opcode: number = stream.g1();
                                const packetType: ClientProt | undefined = ClientProt.values()[opcode];
                                if (typeof packetType === 'undefined') {
                                    console.log(`[LOBBY]: Unknown packet ${opcode}`);
                                    client.end();
                                    return;
                                }

                                let size: number = packetType.size;
                                if (size === -1) {
                                    size = stream.g1();
                                } else if (size === -2) {
                                    size = stream.g2();
                                }

                                client.netInQueue.push(new ClientMessage(packetType, stream.gPacket(size)));
                                break;
                            }
                            case ConnectionState.Game: {
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.error(err);
                    socket.end();
                }

                client.lastResponse = this.tick;
            });

            socket.on('end', (): void => {
                console.log('[LOBBY]: Client disconnected');
                this.removeClient(client);
            });

            socket.on('timeout', (): void => {
                socket.destroy();
            });

            socket.on('error', (): void => {
                socket.destroy();
            });
        });
    }

    async start(): Promise<void> {
        await CacheProvider.load('data/pack');
        await ServerScriptList.load(CacheProvider.serverJs5[Js5Archive.ServerScripts.id]);
        ServerScriptState.MAP_LOBBY = true;
        CacheProvider.watch('data/pack');

        this.server.listen(43594, '0.0.0.0');
        setImmediate(this.cycle.bind(this));
    }

    async cycle(): Promise<void> {
        // console.log(`[LOBBY]: Tick ${this.tick}`);

        if (CacheProvider.reload && this.tick % 100 === 0) {
            await CacheProvider.load('data/pack', true, true);
            await ServerScriptList.load(CacheProvider.serverJs5[Js5Archive.ServerScripts.id]);
            CacheProvider.reload = false;
            console.log('[LOBBY]: Cache reloaded');
        }

        // process incoming packets
        for (let i: number = 0; i < this.players.length; i++) {
            const player: Player = this.players[i];
            if (typeof this.players[i] === 'undefined' || !player.client) {
                continue;
            }

            const client: ClientSocket = player.client;
            for (let j: number = 0; j < client.netInQueue.length; j++) {
                await this.lobbyDecode(client, client.netInQueue[j]);
            }

            client.netInQueue = [];
        }

        for (let i: number = 0; i < this.players.length; i++) {
            const player: Player = this.players[i];
            if (typeof this.players[i] === 'undefined') {
                continue;
            }

            player.cycle();
        }

        // process outgoing packets
        for (let i: number = 0; i < this.players.length; i++) {
            const player: Player = this.players[i];
            if (typeof this.players[i] === 'undefined' || !player.client) {
                continue;
            }

            const client: ClientSocket = player.client;

            // keepalive every 5s
            if (this.tick % 100 === 0) {
                AllPackets.noTimeout(client);
            }

            // logout after 15s of the socket being idle (15000ms / 50ms tick = 300 ticks)
            if (this.tick - client.lastResponse > 300) {
                this.removeClient(client);
                continue;
            }

            for (let j: number = 0; j < client.netOutQueue.length; j++) {
                client.send(client.netOutQueue[j]);
            }
        }

        this.tick++;
        setTimeout(this.cycle.bind(this), 50);
    }

    addPlayer(player: Player): void {
        const index: number = this.players.findIndex((p: Player): boolean => typeof p === 'undefined' || p === null);
        if (index !== -1) {
            this.players[index] = player;
        }
    }

    removeClient(client: ClientSocket): void {
        client.end();

        const index: number = this.players.findIndex((player: Player): boolean => typeof player !== 'undefined' && player !== null && player.client === client);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }
}

if (!parentPort) {
    console.error('Lobby.ts must be run as a worker thread');
    process.exit(1);
}

const lobby: Lobby = new Lobby();

parentPort.on('message', async (...args: unknown[]): Promise<void> => {
    if (args[0] === 'start') {
        await lobby.start();
    }
});
