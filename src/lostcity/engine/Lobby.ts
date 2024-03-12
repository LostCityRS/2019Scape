import net from 'net';

import Packet from '#jagex/bytepacking/Packet.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';
import LoginServer from '#lostcity/network/LoginServer.js';
import Js5Server from '#lostcity/network/Js5Server.js';
import LobbyServer from '#lostcity/network/LobbyServer.js';
import GameServer from '#lostcity/network/GameServer.js';

class Lobby {
    tick: number = 0;
    server: net.Server = net.createServer();

    constructor() {
        this.server.on('listening', (): void => {
            console.log('[LOBBY]: Listening on port 43594');
        });

        this.server.on('connection', (socket: net.Socket): void => {
            console.log(`[LOBBY]: Client connected from ${socket.remoteAddress}`);

            const client: ClientSocket = new ClientSocket(socket);
            socket.on('data', (data: Buffer): void => {
                const stream: Packet = Packet.wrap(data, false);

                while (stream.available > 0) {
                    const opcode: number = stream.g1();

                    switch (client.state) {
                        case ConnectionState.Login: {
                            LoginServer.decode(client, stream, opcode);
                            break;
                        }
                        case ConnectionState.Js5: {
                            client.debug = false;
                            Js5Server.decode(client, stream, opcode);
                            break;
                        }
                        case ConnectionState.Lobby: {
                            client.debug = true;
                            LobbyServer.decode(client, stream, opcode);
                            break;
                        }
                        case ConnectionState.Game: {
                            client.debug = true;
                            GameServer.decode(client, stream, opcode);
                            break;
                        }
                    }
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
