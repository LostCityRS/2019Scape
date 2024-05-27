import BuildAreaSize from '#jagex/core/constants/BuidlAreaSize.js';
import ServerProt from '#jagex/network/protocol/ServerProt.js';
import ClientSocket from '#lostcity/network/ClientSocket.js';
import ScriptRunner from '#lostcity/script/ScriptRunner.js';
import ServerScript from '#lostcity/script/ServerScript.js';
import ServerScriptList from '#lostcity/script/ServerScriptList.js';
import ServerScriptState from '#lostcity/script/ServerScriptState.js';
import ServerTriggerType from '#lostcity/script/ServerTriggerType.js';
import Entity from '#lostcity/entity/Entity.js';
import Viewport from '#lostcity/entity/Viewport.js';

export default class Player extends Entity {
    // persistent data
    username: bigint = 0n;
    displayname: string = '';
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
    buildAreaSize: BuildAreaSize = BuildAreaSize.SIZE_104;
    viewport: Viewport = new Viewport();
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

    constructor() {
        super(0, 3222, 3222, 1, 1);
    }

    resetEntity(respawn: boolean): void {
    }

    login(): void {
        if (this.client) {
            if (!ServerScriptState.MAP_LOBBY) {
                ServerProt.REBUILD_NORMAL.send(this.client, this, this.level, this.x, this.z, this.buildAreaSize, true, true);
            }

            ServerProt.RESET_CLIENT_VARCACHE.send(this.client);
        }

        this.executeScript(ServerScriptList.getByTrigger(ServerTriggerType.LOGIN));
    }

    cycle(): void {
    }

    updatePlayers(): void {
        if (this.client) {
            ServerProt.PLAYER_INFO.send(this.client, this);
        }
    }

    executeScript(script?: ServerScript): void {
        if (!script) {
            return;
        }

        const state: ServerScriptState = ScriptRunner.createState(script, this);
        ScriptRunner.execute(state);
    }
}
