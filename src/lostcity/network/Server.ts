import net from 'net';

import Packet from '#jagex3/io/Packet.js';
import Cache from '#jagex3/js5/Cache.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';
import ConnectionState from '#lostcity/network/ConnectionState.js';
import LoginServer from '#lostcity/network/LoginServer.js';
import Js5Server from '#lostcity/network/Js5Server.js';
import LobbyServer from '#lostcity/network/LobbyServer.js';
import GameServer from '#lostcity/network/GameServer.js';

class Server {
    tcp: net.Server;

    cache: Cache = new Cache();

    constructor() {
        this.tcp = net.createServer((socket): void => {
            console.log('Client connected');

            const client: ClientSocket = new ClientSocket(socket);

            socket.on('data', async (data: Buffer): Promise<void> => {
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
                console.log('Client disconnected');
            });

            socket.on('error', (): void => {
                socket.destroy();
            });
        });
    }

    async start(): Promise<void> {
        await this.cache.load('data/pack');

        this.tcp.listen(43594, '0.0.0.0', (): void => {
            console.log('Server started');
        });
    }
}

export default new Server();
