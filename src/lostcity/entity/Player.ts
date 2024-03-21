import ServerProt from '#jagex/network/protocol/ServerProt.js';
import ClientSocket from '#lostcity/network/ClientSocket.js';
import ScriptRunner from '#lostcity/script/ScriptRunner.js';
import ServerScript from '#lostcity/script/ServerScript.js';
import ServerScriptList from '#lostcity/script/ServerScriptList.js';
import ServerScriptState from '#lostcity/script/ServerScriptState.js';
import ServerTriggerType from '#lostcity/script/ServerTriggerType.js';

export default class Player {
    // persistent data
    username: bigint = 0n;
    displayname: string = '';
    level: number = 0;
    x: number = 3200; // todo: CoordGrid
    z: number = 3200;
    varp: (number | string | bigint)[] = new Array(10000);
    varc: (number | string | bigint)[] = new Array(10000);
    // todo: invs
    // todo: stats
    // todo: identity kit (body/colors/gender)
    runenergy: number = 10000;
    playtime: number = 0;

    // runtime data
    client: ClientSocket | null = null;
    pid: number = -1;
    uid: number = -1;
    runweight: number = 0;

    delay: number = 0;
    protect: boolean = false;
    // todo: interface states
    activeScript: ServerScriptState | null = null;
    queue: Set<ServerScriptState> = new Set();
    weakQueue: Set<ServerScriptState> = new Set();
    timers: Map<number, ServerScript> = new Map();
    // todo: interaction properties
    // todo: last_ pointers
    // todo: hero points (pvp)
    // todo: aggro squares

    // todo: extended info
    appearance: Uint8Array | null = null;

    login(): void {
        if (this.client) {
            if (!ServerScriptState.MAP_LOBBY) {
                ServerProt.REBUILD_NORMAL.send(this.client, this.level, this.x, this.z, true, true);
            }

            ServerProt.RESET_CLIENT_VARCACHE.send(this.client);
        }

        this.executeScript(ServerScriptList.getByTrigger(ServerTriggerType.LOGIN));
    }

    cycle(): void {
    }

    executeScript(script?: ServerScript): void {
        if (!script) {
            return;
        }

        const state: ServerScriptState = ScriptRunner.createState(script, this);
        ScriptRunner.execute(state);
    }
}
