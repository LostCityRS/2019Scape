import net from 'net';

import { TcpServer, TcpServerClient } from '#lostcity/network/TcpServer.js';
import LoginProt from '#jagex/network/protocol/LoginProt.js';
import CacheProvider from '#lostcity/server/CacheProvider.js';
import ServerScriptList from '#lostcity/script/ServerScriptList.js';
import ServerScriptState from '#lostcity/script/ServerScriptState.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Packet from '#jagex/bytepacking/Packet.js';

class Lobby {
    private server: TcpServer = new TcpServer();

    async start(): Promise<void> {
        await CacheProvider.load('data/pack');
        await ServerScriptList.load(CacheProvider.serverJs5[Js5Archive.ServerScripts.id]);
        ServerScriptState.MAP_LOBBY = true;

        this.server.listen(43594, '0.0.0.0');
        setImmediate(this.cycle.bind(this));
    }

    async cycle(): Promise<void> {
        for (const client of this.server.clients) {
            if (client.idle > 30000) {
                client.close();
                continue;
            }

            if (client.available === 0) {
                continue;
            }

            for (let i: number = 0; i < 100; i++) {
                if (client.available === 0) {
                    break;
                }

                if (client.state === 0 && !await this.onLoginProt(client)) {
                    break;
                } else if (client.state === 1 && !await this.onJs5Prot(client)) {
                    break;
                } else if (client.state === 2 && !await this.onLobbyProt(client)) {
                    break;
                }
            }
        }

        setTimeout(this.cycle.bind(this), 50);
    }

    private async onLoginProt(client: TcpServerClient): Promise<boolean> {
        if (client.packetType === -1) {
            if (client.available < 1) {
                return false;
            }

            client.read(client.in.data, 0, 1);
            client.in.pos = 0;
            client.packetType = client.in.g1();

            const prot: LoginProt | undefined = LoginProt.BY_ID[client.packetType];
            if (typeof prot === 'undefined') {
                client.close();
                return false;
            }

            client.packetSize = prot.size;
        }

        if (client.packetSize === -1) {
            if (client.available < 1) {
                return false;
            }

            client.read(client.in.data, 0, 1);
            client.in.pos = 0;
            client.packetSize = client.in.g1();
        }

        if (client.packetSize === -2) {
            if (client.available < 2) {
                return false;
            }

            client.read(client.in.data, 0, 2);
            client.in.pos = 0;
            client.packetSize = client.in.g2();
        }

        if (client.packetSize > 0) {
			if (client.available < client.packetSize) {
                return false;
            }

            client.read(client.in.data, 0, client.packetSize);
            client.in.pos = 0;
        }

        if (client.packetType === LoginProt.INIT_JS5REMOTE_CONNECTION.opcode) {
            const buildMajor: number = client.in.g4();
            const buildMinor: number = client.in.g4();
            const token: string = client.in.gjstr();
            const lang: number = client.in.g1();

            if (buildMajor !== 910 && buildMinor !== 1) {
                const reply: Packet = Packet.alloc(1);
                reply.p1(6);
                client.write(reply.data, 0, reply.pos);
                client.close();
                return false;
            }

            client.state = 1;

            const reply: Packet = Packet.alloc(1 + CacheProvider.prefetches.length * 4);
            reply.p1(0);
            for (let i: number = 0; i < CacheProvider.prefetches.length; i++) {
                reply.p4(CacheProvider.prefetches[i]);
            }
            client.write(reply.data, 0, reply.pos);
        }

        client.packetType = -1;
        return true;
    }

    private async onJs5Prot(client: TcpServerClient): Promise<boolean> {
        if (client.packetType === -1) {
            if (client.available < 1) {
                return false;
            }

            client.read(client.in.data, 0, 1);
            client.in.pos = 0;
            client.packetType = client.in.g1();

            if (client.packetType > 7) {
                // valid opcodes: 0 to 7
                client.close();
                return false;
            }

            client.packetSize = 5;
        }

        if (client.packetSize > 0) {
			if (client.available < client.packetSize) {
                return false;
            }

            client.read(client.in.data, 0, client.packetSize);
            client.in.pos = 0;
        }

        // console.log('JS5 packet type:', client.packetType, 'Packet size:', client.packetSize, client.in.data.subarray(0, client.packetSize));

        if (client.packetType === 0 || client.packetType === 1) {
            const archive: number = client.in.g1();
            const group: number = client.in.g4();

            // console.log(`[JS5]: Requesting ${archive} ${group}`);

            const data: Uint8Array | null = await CacheProvider.getGroup(archive, group, true);
            if (!data) {
                return true;
            }

            let sent: number = 0;
            while (sent < data.length) {
                const length: number = data.length;

                const buf: Packet = Packet.alloc(Math.min(102400, length - sent) + 5);
                buf.p1(archive);
                buf.p4(client.packetType === 1 ? group : group | 0x80000000);

                for (let pos: number = sent; pos < length; pos++) {
                    buf.p1(data[pos]);

                    if (buf.pos == 102400 || pos == length - 1) {
                        sent = pos + 1;
                        client.write(buf.data, 0, buf.pos);
                        break;
                    }
                }
            }
        }

        client.packetType = -1;
        return false;
    }

    private async onLobbyProt(client: TcpServerClient): Promise<boolean> {
        if (client.packetType === -1) {
            if (client.available < 1) {
                return false;
            }

            client.read(client.in.data, 0, 1);
            client.in.pos = 0;
            client.packetType = client.in.g1();

            const prot: LoginProt | undefined = LoginProt.BY_ID[client.packetType];
            if (typeof prot === 'undefined') {
                client.close();
                return false;
            }

            client.packetSize = prot.size;
        }

        if (client.packetSize === -1) {
            if (client.available < 1) {
                return false;
            }

            client.read(client.in.data, 0, 1);
            client.in.pos = 0;
            client.packetSize = client.in.g1();
        }

        if (client.packetSize === -2) {
            if (client.available < 2) {
                return false;
            }

            client.read(client.in.data, 0, 2);
            client.in.pos = 0;
            client.packetSize = client.in.g2();
        }

        if (client.packetSize > 0) {
			if (client.available < client.packetSize) {
                return false;
            }

            client.read(client.in.data, 0, client.packetSize);
            client.in.pos = 0;
        }

        console.log('Lobby packet type:', client.packetType, 'Packet size:', client.packetSize);

        client.packetType = -1;
        return false;
    }
}

const lobby: Lobby = new Lobby();
await lobby.start();
