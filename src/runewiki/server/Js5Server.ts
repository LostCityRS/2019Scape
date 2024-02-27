import fs from 'fs';
import net from 'net';

import { OpenRS2 } from '#runewiki/util/OpenRS2.js';
import Packet from '#jagex3/io/Packet.js';
import Js5 from '#jagex3/js5/Js5.js';
import DiskStore from '#jagex3/io/DiskStore.js';
import Js5Index from '#jagex3/js5/Js5Index.js';

const openrs2: OpenRS2 = await OpenRS2.find({ rev: '910' });

const prefetchSizes: number[] = [
    3300, 69795, 41651, 35866, 358716, 3987016, 44375, 18239, 57708, 328737, 1250879, 626813, 674472, 1226204, 1398484, 41322, 1258511, 7072, 35277, 1244, 91867, 2285, 119, 1244028, 4951060, 44023, 24426
];

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

type Js5QueueRequest = {
    socket: net.Socket;
    archive: number;
    group: number;
    urgent: boolean;
}

const LoginProtLengths: number[] = [];
LoginProtLengths[LoginProt.INIT_JS5REMOTE_CONNECTION] = -1;

const SPLIT_DAT_INDEXES: boolean = true;
const stores: DiskStore[] = [];
let maxIndex: number = -1;
for (let i: number = 0; i < 256; i++) {
    if (!fs.existsSync(`data/cache/main_file_cache.idx${i}`)) {
        continue;
    }

    if (SPLIT_DAT_INDEXES) {
        if (!fs.existsSync(`data/cache/main_file_cache.dat${i}`)) {
            continue;
        }

        stores[i] = new DiskStore(`data/cache/main_file_cache.dat${i}`, `data/cache/main_file_cache.idx${i}`, i);
    } else {
        stores[i] = new DiskStore('data/cache/main_file_cache.dat2', `data/cache/main_file_cache.idx${i}`, i);
    }

    if (i < 255 && i + 1 > maxIndex) {
        maxIndex = i + 1;
    }
}

const tempIndex: Uint8Array = fs.readFileSync('data/cache/255_255.dat');
const masterIndexIndex: Uint8Array = new Uint8Array(tempIndex.length + 5);
masterIndexIndex[0] = 0;
masterIndexIndex[1] = tempIndex.length >> 24;
masterIndexIndex[2] = tempIndex.length >> 16;
masterIndexIndex[3] = tempIndex.length >> 8;
masterIndexIndex[4] = tempIndex.length;
masterIndexIndex.set(tempIndex, 5);

// const masterIndexIndex: Packet = new Packet();
// masterIndexIndex.p1(maxIndex);
// for (let i: number = 0; i < maxIndex; i++) {
//     console.log(i);

//     const data: Uint8Array | null = stores[255].read(i);
//     if (!data || !data.length) {
//         masterIndexIndex.p4(0);
//         masterIndexIndex.p4(0);
//         masterIndexIndex.pdata(new Uint8Array(64));
//         continue;
//     }

//     if (i < 45) {
//         continue;
//     }

//     const masterIndex: Js5 = Js5.createRaw(stores[i], data, i);
//     masterIndexIndex.p4(masterIndex.index.checksum);
//     masterIndexIndex.p4(masterIndex.index.version);
//     masterIndexIndex.pdata(new Uint8Array(64));
// }
// console.log(masterIndexIndex);

class Js5Server {
    tcp: net.Server;

    js5Queue: Js5QueueRequest[] = [];
    currentJs5Cycle: number = 0;

    constructor() {
        this.tcp = net.createServer((socket): void => {
            console.log('Client connected');

            let state: ConnectionState = ConnectionState.Login;

            socket.on('data', async (data: Buffer): Promise<void> => {
                console.log('Received data', data.length, 'bytes');

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
                                socket.write(Uint8Array.from([ 6 ]));
                                socket.end();
                                return;
                            }

                            const reply: Packet = Packet.alloc(1 + prefetchSizes.length * 4);
                            reply.p1(0);
                            for (let i: number = 0; i < prefetchSizes.length; i++) {
                                reply.p4(prefetchSizes[i]);
                            }
                            reply.send(socket);

                            state = ConnectionState.Js5;
                        }
                    } else if (state === ConnectionState.Js5) {
                        // console.log('[JS5]: Received opcode', opcode);

                        if (opcode === Js5Prot.RequestGroupPrefetch || opcode === Js5Prot.RequestGroupUrgent) {
                            const archive: number = stream.g1();
                            const group: number = stream.g4();

                            this.js5Queue.push({
                                archive,
                                group,
                                urgent: opcode === Js5Prot.RequestGroupUrgent,
                                socket
                            });
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

        this.tcp.listen(43594, '0.0.0.0', (): void => {
            console.log('Server started');
        });

        this.js5Cycle();
    }

    async js5Cycle(): Promise<void> {
        for (let i: number = 0; i < this.js5Queue.length; i++) {
            const { archive, group, urgent, socket } = this.js5Queue[i];
            this.js5Queue.splice(i--, 1);

            if (socket.closed) {
                continue;
            }

            // let data: Uint8Array | null = await openrs2.getGroup(archive, group);
            let data: Uint8Array | null = stores[archive].read(group);
            if (archive === 255 && group === 255) {
                data = masterIndexIndex;
            }

            if (!data) {
                continue;
            }

            if (archive !== 255) {
                data = data.subarray(0, data.length - 2); // remove version trailer
            }

            const maxChunkSize: number = 102395;
            for (let offset: number = 0; offset < data.length; offset += maxChunkSize) {
                const chunkSize: number = Math.min(maxChunkSize, data.length - offset);
                const buf: Packet = new Packet();
                buf.p1(archive);
                buf.p4(urgent ? group : group | 0x80000000);
                buf.pdata(data.subarray(offset, offset + chunkSize));
                buf.send(socket);
                console.log(`Sending ${archive} ${group} ${offset} ${chunkSize}`);
            }
        }

        console.log('JS5 cycle', this.currentJs5Cycle, 'complete');
        this.currentJs5Cycle++;
        setTimeout(this.js5Cycle.bind(this), 1000);
    }
}

new Js5Server();
