import Packet from '#jagex/bytepacking/Packet.js';
import ServerMessage from '#jagex/network/ServerMessage.js';

import ServerProt from '#jagex/network/protocol/ServerProt.js';

import ClientSocket from '#lostcity/network/ClientSocket.js';

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

function updateRebootTimer(client: ClientSocket, ticks: number): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.UPDATE_REBOOT_TIMER);
    message.buf.p2(ticks);
    client.send(message);
}

function noTimeout(client: ClientSocket): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.NO_TIMEOUT);
    client.send(message);
}

function worldlistFetchReply(client: ClientSocket): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.WORLDLIST_FETCH_REPLY);

    // has update
    message.buf.pbool(true);

    // status
    message.buf.p1(2); // leftover from loginprot days?

    // full update
    /// world list
    const worldList: Packet = new Packet();
    worldList.pSmart1or2(1); // # of locations

    /// location 1
    worldList.pSmart1or2(0); // country code
    worldList.pjstr2('United States');

    worldList.pSmart1or2(1); // min ID
    worldList.pSmart1or2(1); // max ID
    worldList.pSmart1or2(1); // size

    /// world 1
    worldList.pSmart1or2(0); // world index
    worldList.p1(0); // location
    worldList.p4(0); // flags
    worldList.pSmart1or2(0); // unknown, truthy = read string
    worldList.pjstr2(''); // activity
    worldList.pjstr2('localhost'); // hostname

    message.buf.pbool(true);
    message.buf.pdata(worldList);
    message.buf.p4(Packet.getcrc(worldList));

    // partial update
    /// world 1
    message.buf.pSmart1or2(0); // world index
    message.buf.p2(0); // players

    client.send(message);
}

function js5Reload(client: ClientSocket): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.JS5_RELOAD);
    client.send(message);
}

function rebuildNormal(client: ClientSocket, nearbyPlayers: boolean, forceRebuild: boolean = true): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.REBUILD_NORMAL);

    if (nearbyPlayers) {
        message.buf.accessBits();

        const highres: number = (0 << 28) | (3200 << 14) | 3200;
        message.buf.pBit(30, highres);

        // low-res player info
        for (let i: number = 1; i < 2048; i++) {
            // const lowres: number = (0 << 16) | (50 << 16) | 50;
            message.buf.pBit(18, 0);
        }

        message.buf.accessBytes();
    }

    const x: number = 3200 >> 3;
    const z: number = 3200 >> 3;

    let count: number = 0;

    const sizeZ: number = 104;
    const sizeX: number = 104;
    for (let zoneZ: number = (z - (sizeZ >> 4)) / 8; zoneZ <= ((sizeZ >> 4) + x) / 8; zoneZ++) {
        for (let zoneX: number = (x - (sizeX >> 4)) / 8; zoneX <= ((sizeX >> 4) + x) / 8; zoneX++) {
            count++;
        }
    }

    message.buf.p2_alt2(z); // z
    message.buf.p1(5); // npc distance (bits)
    message.buf.p1_alt3(count); // # of regions
    message.buf.p1(0); // build area size
    message.buf.p2_alt2(x); // x
    message.buf.p1_alt3(forceRebuild ? 1 : 0);
    client.send(message);
}

function playerInfo(client: ClientSocket, testing: boolean): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.PLAYER_INFO);

    // local players (active)
    message.buf.accessBits();
    if (!testing) {
        message.buf.pBit(1, 0);
    }
    message.buf.accessBytes();

    // local players (inactive)
    message.buf.accessBits();
    message.buf.accessBytes();

    // external players (active)
    message.buf.accessBits();
    for (let i: number = 0; i < 2047; i++) {
        message.buf.pBit(1, 0);
        message.buf.pBit(2, 0);
    }
    message.buf.accessBytes();

    // external players (inactive)
    message.buf.accessBits();
    message.buf.accessBytes();

    // masks

    client.send(message);
}

function serverTickEnd(client: ClientSocket): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.SERVER_TICK_END);
    client.send(message);
}

// wrong args naming
function ifSetEvents(client: ClientSocket, interfaceId: number, componentId: number, fromSlot: number, toSlot: number, settingsHash: number): void {
    const message: ServerMessage = ServerMessage.create(ServerProt.IF_SETEVENTS);
    message.buf.p2_alt1(fromSlot);
    message.buf.p4(interfaceId << 16 | componentId);
    message.buf.p2_alt3(toSlot);
    message.buf.p4_alt1(settingsHash);
    client.send(message);
}

export default {
    resetClientVarCache,
    updateVar,
    updateVarbit,
    updateVarc,
    updateVarcbit,
    updateVarcStr,
    ifOpenTop,
    ifOpenSub,
    runClientScript,
    updateRebootTimer,
    noTimeout,
    worldlistFetchReply,
    js5Reload,
    rebuildNormal,
    playerInfo,
    serverTickEnd,
    ifSetEvents
}
