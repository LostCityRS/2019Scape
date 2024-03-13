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
import Js5Archive from '#jagex/config/Js5Archive.js';
import EnumType from '#jagex/config/enumtype/EnumType.js';
import StructType from '#jagex/config/enumtype/StructType.js';

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

        // console.log(`[WORLD]: Received packet ${packetType.debugname} size=${size}`);

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
                reply.p1(2); // staffmodlevel
                reply.p1(0);
                reply.pbool(false);
                reply.pbool(false);
                reply.pbool(true);
                reply.pbool(false);
                reply.p2(1); // player index
                reply.pbool(true);
                reply.p3(0);
                reply.pbool(true);
                reply.p6(0);

                reply.psize1(reply.pos - start);
                client.write(reply);

                AllPackets.rebuildNormal(client, true);

                // AllPackets.updateVarc(client, 3698, 1);
                // AllPackets.updateVarc(client, 987, 1);
                // AllPackets.updateVarc(client, 1701, 1);
                // AllPackets.updateVarc(client, 6042, 0);
                // AllPackets.updateVarc(client, 5187, 1);
                // AllPackets.updateVarc(client, 6503, 1);
                // AllPackets.updateVarc(client, 1240, 4);
                // AllPackets.updateVarc(client, 1277, 0);
                // AllPackets.updateVarc(client, 3684, 0);
                // AllPackets.updateVarc(client, 3708, 0);
                // AllPackets.updateVarc(client, 3681, 1);
                // AllPackets.updateVarc(client, 2771, 56495751);
                // AllPackets.updateVarc(client, 178, 0);
                // AllPackets.updateVarc(client, 6341, 1073741313);
                // AllPackets.updateVarc(client, 6348, 0);
                // AllPackets.updateVarc(client, 4738, 0);
                // AllPackets.updateVarc(client, 1787, 1);
                // AllPackets.updateVarc(client, 6040, 30);
                // AllPackets.updateVarc(client, 6041, 13);
                // AllPackets.updateVarcStr(client, 3683, 'test');
                // AllPackets.updateVarc(client, 1882, 0);
                // AllPackets.updateVarc(client, 1274, 102);
                // AllPackets.updateVarc(client, 1414, 1);
                // AllPackets.updateVarc(client, 1788, -37);
                // AllPackets.updateVarc(client, 1971, 5725);

                // AllPackets.updateVar(client, 1295, 1000);
                // AllPackets.updateVarbit(client, 20940, 120);
                // AllPackets.updateVarbit(client, 382, 1);
                // AllPackets.updateVarbit(client, 9513, 1);
                // AllPackets.updateVarbit(client, 14041, 200);
                // AllPackets.updateVarbit(client, 39917, 98);
                // AllPackets.updateVar(client, 425, 1);
                // AllPackets.updateVar(client, 8569, 1);
                // AllPackets.updateVar(client, 8571, 1);

                AllPackets.ifOpenTop(client, 1477);
                AllPackets.ifOpenSub(client, 1477, 22, 1482, 1); // gamescreen
                // AllPackets.ifOpenSub(client, 1477, 34, 1680, 1);
                // AllPackets.ifOpenSub(client, 1477, 50, 1252, 1); // TH promo
                AllPackets.ifOpenSub(client, 1477, 85, 1465, 1); // minimap
                AllPackets.ifOpenSub(client, 1477, 86, 1919, 1); // compass
                // AllPackets.ifOpenSub(client, 1477, 610, 635, 1); // system clock
                // AllPackets.ifOpenSub(client, 1477, 633, 568, 1);
                // AllPackets.ifOpenSub(client, 1477, 838, 1847, 1);

                // await this.ifOpenSubRedirect(client, 7716, 0, 3505, 1477, 1466);
                // await this.ifOpenSubRedirect(client, 7716, 1, 3505, 1477, 930);
                // await this.ifOpenSubRedirect(client, 7716, 2, 3505, 1477, 1473);
                // await this.ifOpenSubRedirect(client, 7716, 3, 3505, 1477, 1464);
                // await this.ifOpenSubRedirect(client, 7716, 4, 3505, 1477, 1458);
                // await this.ifOpenSubRedirect(client, 7716, 9, 3505, 1477, 590);
                // await this.ifOpenSubRedirect(client, 7716, 10, 3505, 1477, 1416);
                // await this.ifOpenSubRedirect(client, 7716, 11, 3505, 1477, 1417);
                // await this.ifOpenSubRedirect(client, 7716, 14, 3505, 1477, 550);
                // await this.ifOpenSubRedirect(client, 7716, 15, 3505, 1477, 1427);
                // await this.ifOpenSubRedirect(client, 7716, 16, 3505, 1477, 1110);
                // await this.ifOpenSubRedirect(client, 7716, 18, 3505, 1477, 137);
                // await this.ifOpenSubRedirect(client, 7716, 19, 3505, 1477, 1467);
                // await this.ifOpenSubRedirect(client, 7716, 20, 3505, 1477, 1472);
                // await this.ifOpenSubRedirect(client, 7716, 21, 3505, 1477, 1471);
                // await this.ifOpenSubRedirect(client, 7716, 22, 3505, 1477, 1740);
                // await this.ifOpenSubRedirect(client, 7716, 23, 3505, 1477, 464);
                // await this.ifOpenSubRedirect(client, 7716, 24, 3505, 1477, 228);
                // await this.ifOpenSubRedirect(client, 7716, 25, 3505, 1477, 1529);
                // await this.ifOpenSubRedirect(client, 7716, 26, 3505, 1477, 231);
                // await this.ifOpenSubRedirect(client, 7716, 27, 3505, 1477, 1519);
                // await this.ifOpenSubRedirect(client, 7716, 28, 3505, 1477, 1588);
                // await this.ifOpenSubRedirect(client, 7716, 29, 3505, 1477, 1678);
                // await this.ifOpenSubRedirect(client, 7716, 31, 3505, 1477, 1904);
                // await this.ifOpenSubRedirect(client, 7716, 32, 3505, 1477, 930); // task system
                // await this.ifOpenSubRedirect(client, 7716, 35, 3513, 1477, 1215);
                // await this.ifOpenSubRedirect(client, 7716, 1002, 3505, 1477, 1431);
                // // AllPackets.ifOpenSub(client, 1465, 6, 1920, 1);
                // await this.ifOpenSubRedirect(client, 7716, 1003, 3505, 1477, 1430);
                // // AllPackets.ifOpenSub(client, 1430, 58, 1616, 1);
                // // AllPackets.ifOpenSub(client, 1477, 747, 1433);
                // await this.ifOpenSubRedirect(client, 7716, 1010, 3505, 1477, 1483);
                // await this.ifOpenSubRedirect(client, 7716, 1014, 3505, 1477, 745);
                // await this.ifOpenSubRedirect(client, 7716, 1009, 3505, 1477, 284);
                // await this.ifOpenSubRedirect(client, 7716, 1026, 3505, 1477, 1213);
                // await this.ifOpenSubRedirect(client, 7716, 1001, 3505, 1477, 1448);
                // await this.ifOpenSubRedirect(client, 7716, 1020, 3505, 1477, 557);
                // await this.ifOpenSubRedirect(client, 7716, 1038, 3505, 1477, 291);
                // await this.ifOpenSubRedirect(client, 7716, 1019, 3505, 1477, 182);
                // await this.ifOpenSubRedirect(client, 7716, 1032, 3505, 1477, 1670);
                // await this.ifOpenSubRedirect(client, 7716, 1033, 3505, 1477, 1671);
                // await this.ifOpenSubRedirect(client, 7716, 1034, 3505, 1477, 1672);
                // await this.ifOpenSubRedirect(client, 7716, 1035, 3505, 1477, 1673);

                // unlock
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3509, 1477, 0, 24, 2);
                // AllPackets.ifSetEvents(client, 1466, 7, 0, 27, 30);
                // AllPackets.ifSetEvents(client, 1461, 1, 0, 194, 10320974);
                // AllPackets.ifSetEvents(client, 1884, 1, 0, 194, 10320974);
                // AllPackets.ifSetEvents(client, 1885, 1, 0, 194, 10320974);
                // AllPackets.ifSetEvents(client, 1887, 1, 0, 194, 10320974);
                // AllPackets.ifSetEvents(client, 1886, 1, 0, 194, 10320974);
                // AllPackets.ifSetEvents(client, 1461, 7, 7, 16, 2);
                // AllPackets.ifSetEvents(client, 1461, 7, 7, 10, 10319874);
                // AllPackets.ifSetEvents(client, 1460, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1881, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1888, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1452, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1883, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1449, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1882, 1, 0, 194, 10320902);
                // AllPackets.ifSetEvents(client, 1460, 5, 7, 16, 2);
                // AllPackets.ifSetEvents(client, 1460, 5, 7, 10, 10319874);
                // AllPackets.ifSetEvents(client, 1452, 7, 7, 16, 2);
                // AllPackets.ifSetEvents(client, 1883, 7, 7, 16, 2);
                // AllPackets.ifSetEvents(client, 1883, 7, 7, 10, 10319874);
                // AllPackets.ifSetEvents(client, 550, 14, 0, 500, 2046);
                // AllPackets.ifSetEvents(client, 550, 66, 0, 500, 6);
                // AllPackets.ifSetEvents(client, 1427, 30, 0, 600, 1040);
                // AllPackets.ifSetEvents(client, 1110, 31, 0, 200, 2);
                // AllPackets.ifSetEvents(client, 1110, 85, 0, 600, 2);
                // AllPackets.ifSetEvents(client, 1110, 83, 0, 600, 1040);
                // AllPackets.ifSetEvents(client, 1110, 38, 0, 600, 1040);
                // AllPackets.ifSetEvents(client, 590, 8, 0, 216, 8388614);
                // AllPackets.ifSetEvents(client, 1416, 3, 0, 2949, 62);
                // AllPackets.ifSetEvents(client, 1416, 11, 0, 29, 2359334);
                // AllPackets.ifSetEvents(client, 1416, 11, 30, 59, 4);
                // AllPackets.ifSetEvents(client, 1416, 11, 60, 60, 2097152);
                // AllPackets.ifSetEvents(client, 1417, 13, 0, 29, 2621470);
                // await this.ifSetEventsRedirect(client, 169, 1, 152, 190, 0, 300, 14);
                // await this.ifSetEventsRedirect(client, 7716, 1002, 3507, 1477, 1, 1, 2);
                // AllPackets.ifSetEvents(client, 1431, 0, 0, 47, 2);
                // AllPackets.ifSetEvents(client, 568, 5, 0, 47, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3507, 1477, 1, 1, 6);
                // AllPackets.ifSetEvents(client, 1433, 6, 0, 6, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1003, 3507, 1477, 1, 1, 4);
                // AllPackets.ifSetEvents(client, 1460, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1881, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1888, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1452, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1461, 1, 0, 194, 8617038);
                // AllPackets.ifSetEvents(client, 1884, 1, 0, 194, 8617038);
                // AllPackets.ifSetEvents(client, 1885, 1, 0, 194, 8617038);
                // AllPackets.ifSetEvents(client, 1887, 1, 0, 194, 8617038);
                // AllPackets.ifSetEvents(client, 1886, 1, 0, 194, 8617038);
                // AllPackets.ifSetEvents(client, 1883, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1449, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 1882, 1, 0, 194, 8616966);
                // AllPackets.ifSetEvents(client, 590, 8, 0, 216, 8388614);
                // AllPackets.ifSetEvents(client, 137, 78, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 137, 65, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 137, 68, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 137, 62, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 1467, 62, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1467, 185, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 1467, 189, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 1467, 191, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 1472, 62, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1472, 186, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 1472, 190, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 1472, 192, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 1471, 62, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1471, 186, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 1471, 190, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 1471, 192, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 1470, 62, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1470, 186, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 1470, 190, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 1470, 192, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 464, 8, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 464, 186, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 464, 190, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 464, 192, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 1529, 62, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1529, 185, 0, 11, 126);
                // AllPackets.ifSetEvents(client, 1529, 189, 0, 8, 126);
                // AllPackets.ifSetEvents(client, 1529, 191, 0, 2, 2);
                // AllPackets.ifSetEvents(client, 228, 6, 0, 99, 1792);
                // AllPackets.ifSetEvents(client, 1477, 17, -1, -1, 2097152);
                // AllPackets.ifSetEvents(client, 1477, 13, -1, -1, 2);
                // AllPackets.ifSetEvents(client, 1477, 13, 0, 41, 2);
                // await this.ifSetEventsRedirect(client, 8602, 10, 6397, 1477, 0, 0, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1002, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1002, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1002, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1002, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1003, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1003, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1003, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1003, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1004, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 18, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 19, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 20, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 21, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 22, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 23, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 25, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 9, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 2, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 6, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 37, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 38, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 7, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 5, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 33, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 34, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 35, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 36, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 8, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 39, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 40, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 3, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 12, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 17, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 0, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 4, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 10, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 11, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 14, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 16, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 15, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1005, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1005, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1005, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1005, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1006, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1006, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1006, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1007, 3505, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1007, 3505, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1007, 3505, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1047, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1047, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1047, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1008, 3505, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1007, 3506, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1008, 3506, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1009, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1009, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1009, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2008, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2008, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 2008, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1010, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1010, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1010, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1011, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1011, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1011, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1012, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1012, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1012, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1013, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1013, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1013, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1014, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1014, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1014, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1015, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1015, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1015, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1016, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1016, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1016, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1017, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1017, 3506, 1477, 5, 5, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1017, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1017, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1017, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1018, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1018, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1018, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1019, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1019, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1019, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1019, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1001, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1000, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1000, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1000, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1000, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1000, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1020, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1020, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1020, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1021, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1021, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1021, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 26, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 24, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 24, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 24, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 24, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 24, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1023, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1023, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1023, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 27, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 6, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 11, 11, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 13, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1024, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1025, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1025, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1025, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1026, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1026, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1026, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 28, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1027, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1027, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1027, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1029, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1029, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1029, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1028, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1028, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1028, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1028, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1030, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1030, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1030, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1031, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1031, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1031, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1032, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1032, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1032, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1032, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1033, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1033, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1033, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1033, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1034, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1034, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1034, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1034, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 1035, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1035, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1035, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1035, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 29, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1036, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1036, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1036, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 30, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1037, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1037, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1037, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 31, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1038, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1038, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1038, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 32, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3503, 1477, -1, -1, 2097152);
                // await this.ifSetEventsRedirect(client, 7716, 41, 3507, 1477, 1, 1, 2);
                // await this.ifSetEventsRedirect(client, 7716, 1040, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1040, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1040, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1041, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1041, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1041, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1045, 3506, 1477, 1, 2, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1045, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1045, 3506, 1477, 3, 4, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1046, 3506, 1477, 1, 7, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1046, 3506, 1477, 11, 13, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1046, 3506, 1477, 0, 0, 9175040);
                // await this.ifSetEventsRedirect(client, 7716, 1046, 3506, 1477, 3, 4, 9175040);
                // AllPackets.ifSetEvents(client, 1588, 27, 0, 78, 1730);
                // AllPackets.ifSetEvents(client, 1588, 21, 0, 78, 1730);
                // AllPackets.ifSetEvents(client, 1588, 15, 0, 78, 1730);
                // AllPackets.ifSetEvents(client, 1588, 9, 0, 26, 28);
                // AllPackets.ifSetEvents(client, 1588, 25, 0, 10, 6);
                // AllPackets.ifSetEvents(client, 1588, 19, 0, 10, 6);
                // AllPackets.ifSetEvents(client, 1588, 13, 0, 10, 6);
                // AllPackets.ifSetEvents(client, 1588, 28, 0, 100, 2359302);
                // AllPackets.ifSetEvents(client, 1588, 22, 0, 100, 2359302);
                // AllPackets.ifSetEvents(client, 1588, 16, 0, 100, 2359302);
                // AllPackets.ifSetEvents(client, 1588, 26, -1, -1, 2046);
                // AllPackets.ifSetEvents(client, 1588, 20, -1, -1, 2046);
                // AllPackets.ifSetEvents(client, 1588, 14, -1, -1, 2046);
                // AllPackets.ifSetEvents(client, 1588, 29, 0, 0, 6);
                // AllPackets.ifSetEvents(client, 1588, 23, 0, 0, 6);
                // AllPackets.ifSetEvents(client, 1588, 17, 0, 0, 6);

                this.clients.push(client);
                break;
            }
        }
    }

    async gameDecode(client: ClientSocket, message: ClientMessage): Promise<void> {
        // console.log(`[WORLD]: Received packet ${message.packetType.debugname} opcode=${message.packetType.opcode} size=${message.buf.length}`);

        switch (message.packetType) {
            case ClientProt.NO_TIMEOUT:
                break;
            default:
                console.log(`[WORLD]: Unhandled packet ${message.packetType.debugname}`);
                break;
        }
    }

    async ifOpenSubRedirect(
        client: ClientSocket, enumId: number, enumKey: number, structParam: number,
        toplevel: number, child: number
    ): Promise<void> {
        const enumLookup: EnumType = await EnumType.list(enumId, CacheProvider.js5);
        const structLookup: StructType = await StructType.list(enumLookup.valuesMap.get(enumKey) as number, CacheProvider.js5);
        const componentId: string | number | undefined = structLookup.params.get(structParam);

        if (typeof componentId !== 'undefined') {
            AllPackets.ifOpenSub(client, toplevel, (componentId as number) & 0xFFF, child, 1);
        }
    }

    async ifSetEventsRedirect(
        client: ClientSocket, enumId: number, enumKey: number, structParam: number,
        interfaceId: number, fromSlot: number, toSlot: number, settingsHash: number
    ): Promise<void> {
        const enumLookup: EnumType = await EnumType.list(enumId, CacheProvider.js5);
        const structLookup: StructType = await StructType.list(enumLookup.valuesMap.get(enumKey) as number, CacheProvider.js5);
        const componentId: string | number | undefined = structLookup.params.get(structParam);

        if (typeof componentId !== 'undefined') {
            AllPackets.ifSetEvents(client, interfaceId, (componentId as number) & 0xFFF, fromSlot, toSlot, settingsHash);
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

                try {
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
                } catch (err) {
                    console.error(err);
                    socket.end();
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
    }

    async start(): Promise<void> {
        await CacheProvider.load('data/pack');

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

            // logout after 15s of the socket being idle (15000ms / 600ms tick = 25 ticks)
            if (this.tick - client.lastResponse > 25) {
                client.end();
                this.clients.splice(i--, 1);
                continue;
            }

            // AllPackets.playerInfo(client);
            AllPackets.serverTickEnd(client);

            for (let j: number = 0; j < client.netOutQueue.length; j++) {
                client.send(client.netOutQueue[j]);
            }
        }

        this.tick++;
        setTimeout(this.cycle.bind(this), 600);
    }
}

if (!parentPort) {
    console.error('World.ts must be run as a worker thread');
    process.exit(1);
}

const world: World = new World();

parentPort.on('message', async (...args: unknown[]): Promise<void> => {
    if (args[0] === 'start') {
        await world.start();
    }
});
