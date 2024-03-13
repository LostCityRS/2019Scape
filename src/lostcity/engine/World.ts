import net from 'net';

import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';
import LoginProt from '#jagex/network/protocol/LoginProt.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import ClientProt from '#jagex/network/protocol/ClientProt.js';

import AllPackets from '#jagex/network/packetencoders/AllPackets.js';
import ClientMessage from '#jagex/network/ClientMessage.js';

class World {
    id: number = 1;

    tick: number = 0;
    server: net.Server = net.createServer();
    clients: ClientSocket[] = [];

    async loginDecode(client: ClientSocket, stream: Packet): Promise<void> {
        const opcode: number = stream.g1();
        const packetType: LoginProt | undefined = LoginProt.BY_ID[opcode];
        if (typeof packetType === 'undefined') {
            console.log(`[WORLD]: Received unknown packet ${opcode}`);
            client.end();
            return;
        }

        let size: number = packetType.size;
        if (size === -1) {
            size = stream.g1();
        } else if (size === -2) {
            size = stream.g2();
        }

        console.log(`[WORLD]: Received packet ${packetType.debugname} size=${size}`);

        const buf: Packet = stream.gPacket(size);
        switch (packetType) {
            case LoginProt.INIT_GAME_CONNECTION: {
                const reply: Packet = Packet.alloc(9);
                reply.p1(0);
                reply.p4(Math.random() * 0xFFFFFFFF);
                reply.p4(Math.random() * 0xFFFFFFFF);
                client.write(reply);
                break;
            }
            case LoginProt.GAMELOGIN: {
                const reply: Packet = Packet.alloc(1);
                reply.p1(2);
                client.write(reply);

                const varUpdate: Packet = new Packet();
                varUpdate.p2(0);
                const varUpdateStart: number = varUpdate.pos;
                varUpdate.pbool(true); // no more vars
                varUpdate.psize2(varUpdate.pos - varUpdateStart);
                client.write(varUpdate);
                break;
            }
            case LoginProt.GAMELOGIN_CONTINUE: {
                client.state = ConnectionState.Game;

                const reply: Packet = Packet.alloc(1);
                reply.p1(2);
                reply.p1(0);
                const start: number = reply.pos;

                reply.pbool(false); // totp token
                reply.p1(2); // staffmodlevel?
                reply.p1(0);
                reply.pbool(false);
                reply.pbool(false);
                reply.pbool(false);
                reply.pbool(false);
                reply.p2(0);
                reply.pbool(false);
                reply.p3(0);
                reply.pbool(false);
                reply.p6(0);

                reply.psize1(reply.pos - start);
                client.write(reply);

                AllPackets.rebuildNormal(client, true);

                AllPackets.ifOpenTop(client, 1477);
                AllPackets.ifOpenSub(client, 1477, 23, 1482, 0);

                // unlock
                AllPackets.ifSetEvents(client, 1466, 7, 0, 27, 30);
                AllPackets.ifSetEvents(client, 1461, 1, 0, 194, 10320974);
                AllPackets.ifSetEvents(client, 1884, 1, 0, 194, 10320974);
                AllPackets.ifSetEvents(client, 1885, 1, 0, 194, 10320974);
                AllPackets.ifSetEvents(client, 1887, 1, 0, 194, 10320974);
                AllPackets.ifSetEvents(client, 1886, 1, 0, 194, 10320974);
                AllPackets.ifSetEvents(client, 1461, 7, 7, 16, 2);
                AllPackets.ifSetEvents(client, 1461, 7, 7, 10, 10319874);
                AllPackets.ifSetEvents(client, 1460, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1881, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1888, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1452, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1883, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1449, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1882, 1, 0, 194, 10320902);
                AllPackets.ifSetEvents(client, 1460, 5, 7, 16, 2);
                AllPackets.ifSetEvents(client, 1460, 5, 7, 10, 10319874);
                AllPackets.ifSetEvents(client, 1452, 7, 7, 16, 2);
                AllPackets.ifSetEvents(client, 1883, 7, 7, 16, 2);
                AllPackets.ifSetEvents(client, 1883, 7, 7, 10, 10319874);
                AllPackets.ifSetEvents(client, 550, 14, 0, 500, 2046);
                AllPackets.ifSetEvents(client, 550, 66, 0, 500, 6);
                AllPackets.ifSetEvents(client, 1427, 30, 0, 600, 1040);
                AllPackets.ifSetEvents(client, 1110, 31, 0, 200, 2);
                AllPackets.ifSetEvents(client, 1110, 85, 0, 600, 2);
                AllPackets.ifSetEvents(client, 1110, 83, 0, 600, 1040);
                AllPackets.ifSetEvents(client, 1110, 38, 0, 600, 1040);
                AllPackets.ifSetEvents(client, 590, 8, 0, 216, 8388614);
                AllPackets.ifSetEvents(client, 1416, 3, 0, 2949, 62);
                AllPackets.ifSetEvents(client, 1416, 11, 0, 29, 2359334);
                AllPackets.ifSetEvents(client, 1416, 11, 30, 59, 4);
                AllPackets.ifSetEvents(client, 1416, 11, 60, 60, 2097152);
                AllPackets.ifSetEvents(client, 1417, 13, 0, 29, 2621470);
                AllPackets.ifSetEvents(client, 1431, 0, 0, 47, 2);
                AllPackets.ifSetEvents(client, 568, 5, 0, 47, 2);
                AllPackets.ifSetEvents(client, 1433, 6, 0, 6, 2);
                AllPackets.ifSetEvents(client, 1460, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1881, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1888, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1452, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1461, 1, 0, 194, 8617038);
                AllPackets.ifSetEvents(client, 1884, 1, 0, 194, 8617038);
                AllPackets.ifSetEvents(client, 1885, 1, 0, 194, 8617038);
                AllPackets.ifSetEvents(client, 1887, 1, 0, 194, 8617038);
                AllPackets.ifSetEvents(client, 1886, 1, 0, 194, 8617038);
                AllPackets.ifSetEvents(client, 1883, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1449, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 1882, 1, 0, 194, 8616966);
                AllPackets.ifSetEvents(client, 590, 8, 0, 216, 8388614);
                AllPackets.ifSetEvents(client, 137, 78, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 137, 65, 0, 11, 126);
                AllPackets.ifSetEvents(client, 137, 68, 0, 8, 126);
                AllPackets.ifSetEvents(client, 137, 62, 0, 2, 2);
                AllPackets.ifSetEvents(client, 1467, 62, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1467, 185, 0, 11, 126);
                AllPackets.ifSetEvents(client, 1467, 189, 0, 8, 126);
                AllPackets.ifSetEvents(client, 1467, 191, 0, 2, 2);
                AllPackets.ifSetEvents(client, 1472, 62, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1472, 186, 0, 11, 126);
                AllPackets.ifSetEvents(client, 1472, 190, 0, 8, 126);
                AllPackets.ifSetEvents(client, 1472, 192, 0, 2, 2);
                AllPackets.ifSetEvents(client, 1471, 62, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1471, 186, 0, 11, 126);
                AllPackets.ifSetEvents(client, 1471, 190, 0, 8, 126);
                AllPackets.ifSetEvents(client, 1471, 192, 0, 2, 2);
                AllPackets.ifSetEvents(client, 1470, 62, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1470, 186, 0, 11, 126);
                AllPackets.ifSetEvents(client, 1470, 190, 0, 8, 126);
                AllPackets.ifSetEvents(client, 1470, 192, 0, 2, 2);
                AllPackets.ifSetEvents(client, 464, 8, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 464, 186, 0, 11, 126);
                AllPackets.ifSetEvents(client, 464, 190, 0, 8, 126);
                AllPackets.ifSetEvents(client, 464, 192, 0, 2, 2);
                AllPackets.ifSetEvents(client, 1529, 62, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1529, 185, 0, 11, 126);
                AllPackets.ifSetEvents(client, 1529, 189, 0, 8, 126);
                AllPackets.ifSetEvents(client, 1529, 191, 0, 2, 2);
                AllPackets.ifSetEvents(client, 228, 6, 0, 99, 1792);
                AllPackets.ifSetEvents(client, 1477, 17, -1, -1, 2097152);
                AllPackets.ifSetEvents(client, 1477, 13, -1, -1, 2);
                AllPackets.ifSetEvents(client, 1477, 13, 0, 41, 2);
                AllPackets.ifSetEvents(client, 1588, 27, 0, 78, 1730);
                AllPackets.ifSetEvents(client, 1588, 21, 0, 78, 1730);
                AllPackets.ifSetEvents(client, 1588, 15, 0, 78, 1730);
                AllPackets.ifSetEvents(client, 1588, 9, 0, 26, 28);
                AllPackets.ifSetEvents(client, 1588, 25, 0, 10, 6);
                AllPackets.ifSetEvents(client, 1588, 19, 0, 10, 6);
                AllPackets.ifSetEvents(client, 1588, 13, 0, 10, 6);
                AllPackets.ifSetEvents(client, 1588, 28, 0, 100, 2359302);
                AllPackets.ifSetEvents(client, 1588, 22, 0, 100, 2359302);
                AllPackets.ifSetEvents(client, 1588, 16, 0, 100, 2359302);
                AllPackets.ifSetEvents(client, 1588, 26, -1, -1, 2046);
                AllPackets.ifSetEvents(client, 1588, 20, -1, -1, 2046);
                AllPackets.ifSetEvents(client, 1588, 14, -1, -1, 2046);
                AllPackets.ifSetEvents(client, 1588, 29, 0, 0, 6);
                AllPackets.ifSetEvents(client, 1588, 23, 0, 0, 6);
                AllPackets.ifSetEvents(client, 1588, 17, 0, 0, 6);

                this.clients.push(client);
                break;
            }
        }
    }

    async gameDecode(client: ClientSocket, message: ClientMessage): Promise<void> {
        console.log(`[WORLD]: Received packet ${message.packetType.debugname} opcode=${message.packetType.opcode} size=${message.buf.length}`);

        switch (message.packetType) {
            case ClientProt.NO_TIMEOUT:
                break;
            default:
                console.log(`[WORLD]: Unhandled packet ${message.packetType.debugname}`);
                break;
        }
    }

    constructor() {
        this.server.on('listening', (): void => {
            console.log(`[WORLD]: Listening on port ${43594 + this.id}`);
        });

        this.server.on('connection', (socket: net.Socket): void => {
            console.log(`[WORLD]: Client connected from ${socket.remoteAddress}`);

            socket.setNoDelay(true);
            socket.setKeepAlive(true, 5000);
            socket.setTimeout(15000);

            const client: ClientSocket = new ClientSocket(socket);
            socket.on('data', async (data: Buffer): Promise<void> => {
                const stream: Packet = Packet.wrap(data, false);

                while (stream.available > 0) {
                    switch (client.state) {
                        case ConnectionState.Login: {
                            await this.loginDecode(client, stream);
                            break;
                        }
                        case ConnectionState.Game: {
                            const opcode: number = stream.g1();
                            const packetType: ClientProt | undefined = ClientProt.values()[opcode];
                            if (typeof packetType === 'undefined') {
                                console.log(`[WORLD]: Unknown packet ${opcode}`);
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
                    }
                }

                client.lastResponse = this.tick;
            });

            socket.on('end', (): void => {
                console.log('[LOBBY]: Client disconnected');
                this.clients.splice(this.clients.indexOf(client), 1);
            });

            socket.on('timeout', (): void => {
                socket.destroy();
            });

            socket.on('error', (): void => {
                socket.destroy();
            });
        });

        this.server.listen(43594 + this.id, '0.0.0.0');
        setImmediate(this.cycle.bind(this));
    }

    async cycle(): Promise<void> {
        // console.log(`[WORLD]: Tick ${this.tick}`);

        // process incoming packets
        for (let i: number = 0; i < this.clients.length; i++) {
            const client: ClientSocket = this.clients[i];

            for (let j: number = 0; j < client.netInQueue.length; j++) {
                await this.gameDecode(client, client.netInQueue[j]);
            }
            client.netInQueue = [];
        }

        // process players
        for (let i: number = 0; i < this.clients.length; i++) {
            const client: ClientSocket = this.clients[i];
        }

        // process outgoing packets
        for (let i: number = 0; i < this.clients.length; i++) {
            const client: ClientSocket = this.clients[i];

            // keepalive every ~5s
            if (this.tick % 8 === 0) {
                AllPackets.noTimeout(client);
            }

            // logout after 15s of the socket being idle (15000ms / 600ms tick = 25 ticks)
            if (this.tick - client.lastResponse > 25) {
                client.end();
                this.clients.splice(i--, 1);
                continue;
            }

            AllPackets.playerInfo(client, client.testing);
            client.testing = true;
            AllPackets.serverTickEnd(client);

            for (let j: number = 0; j < client.netOutQueue.length; j++) {
                client.send(client.netOutQueue[j]);
            }
        }

        this.tick++;
        setTimeout(this.cycle.bind(this), 600);
    }
}

export default new World();
