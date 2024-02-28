import net from 'net';

import Packet from '#jagex3/io/Packet.js';
import Cache from '#jagex3/js5/Cache.js';

enum ConnectionState {
    Login = 0,
    Js5 = 1,
    Game = 2,
}

enum LoginProt {
    INIT_JS5REMOTE_CONNECTION = 15,
}

enum Js5Prot {
    RequestGroupPrefetch = 0,
    RequestGroupUrgent = 1,
    LoggedIn = 2,
    LoggedOut = 3,
    Rekey = 4,
    Connected = 6,
    Disconnect = 7
}

const LoginProtLengths: number[] = [];
LoginProtLengths[LoginProt.INIT_JS5REMOTE_CONNECTION] = -1;

class Server {
    tcp: net.Server;

    cache: Cache = new Cache();

    constructor() {
        this.tcp = net.createServer((socket): void => {
            console.log('Client connected');

            let state: ConnectionState = ConnectionState.Login;

            socket.on('data', async (data: Buffer): Promise<void> => {
                // console.log('Received data', data.length, 'bytes');

                const stream: Packet = Packet.wrap(data, false);
                while (stream.available > 0) {
                    const opcode: number = stream.g1();

                    if (state === ConnectionState.Login) {
                        if (typeof LoginProtLengths[opcode] === 'undefined') {
                            console.log('[LOGIN]: Unknown opcode', opcode);
                            socket.end();
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

                        // console.log('[LOGIN]: Received opcode', opcode);

                        if (opcode === LoginProt.INIT_JS5REMOTE_CONNECTION) {
                            const buildMajor: number = buf.g4();
                            const buildMinor: number = buf.g4();
                            const token: string = buf.gjstr();
                            const language: number = buf.g1();

                            if (buildMajor !== 910 && buildMinor !== 1) {
                                socket.write(Uint8Array.from([6]));
                                socket.end();
                                return;
                            }

                            const reply: Packet = Packet.alloc(1 + this.cache.prefetches.length * 4);
                            reply.p1(0);
                            for (let i: number = 0; i < this.cache.prefetches.length; i++) {
                                reply.p4(this.cache.prefetches[i]);
                            }
                            reply.send(socket);

                            state = ConnectionState.Js5;
                        }
                    } else if (state === ConnectionState.Js5) {
                        // console.log('[JS5]: Received opcode', opcode);

                        if (opcode === Js5Prot.RequestGroupPrefetch || opcode === Js5Prot.RequestGroupUrgent) {
                            const archive: number = stream.g1();
                            const group: number = stream.g4();

                            let data: Uint8Array | null = await this.cache.getGroup(archive, group, true);
                            if (!data) {
                                continue;
                            }

                            if (archive !== 255) {
                                data = data.subarray(0, data.length - 2); // remove version trailer
                            }

                            const maxChunkSize: number = 102400 - 5;
                            for (let offset: number = 0; offset < data.length; offset += maxChunkSize) {
                                const chunkSize: number = Math.min(maxChunkSize, data.length - offset);
                                const buf: Packet = new Packet();
                                buf.p1(archive);
                                buf.p4(opcode === Js5Prot.RequestGroupUrgent ? group : group | 0x80000000);
                                buf.pdata(data.subarray(offset, offset + chunkSize));
                                buf.send(socket);
                                // console.log(`Sending ${archive} ${group} ${offset} ${chunkSize}`);
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
                            socket.end();
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
        await this.cache.load('data/cache');

        this.tcp.listen(43594, '0.0.0.0', (): void => {
            console.log('Server started');
        });
    }
}

export default new Server();
