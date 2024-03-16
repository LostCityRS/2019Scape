import Player from '#lostcity/entity/Player.js';
import ServerScript from '#lostcity/script/ServerScript.js';
import ServerTriggerType from '#lostcity/script/ServerTriggerType.js';

export interface GosubStackFrame {
    script: ServerScript;
    pc: number;
    intLocals: number[];
    stringLocals: string[];
}

// for debugging stack traces
export interface JumpStackFrame {
    script: ServerScript;
    pc: number;
}

export default class ServerScriptState {
    static ABORTED = -1;
    static RUNNING = 0;
    static FINISHED = 1;
    static SUSPENDED = 2; // suspended to move to player
    static PAUSEBUTTON = 3;
    static COUNTDIALOG = 4;
    static NPC_SUSPENDED = 5; // suspended to move to npc
    static WORLD_SUSPENDED = 6; // suspended to move to world

    // interpreter
    script: ServerScript;
    trigger: ServerTriggerType;
    execution = ServerScriptState.RUNNING;
    executionHistory: number[] = [];

    pc = -1; // program counter
    opcount = 0; // number of opcodes executed

    frames: GosubStackFrame[] = [];
    fp = 0; // frame pointer

    debugFrames: JumpStackFrame[] = [];
    debugFp = 0;

    intStack: (number | null)[] = [];
    isp = 0; // int stack pointer

    stringStack: (string | null)[] = [];
    ssp = 0; // string stack pointer

    intLocals: number[] = [];
    stringLocals: string[] = [];

    _activePlayer: Player | null = null;
    _activePlayer2: Player | null = null;

    constructor(script: ServerScript, args: (number | string)[] | null = []) {
        this.script = script;
        this.trigger = script.info.lookupKey & 0xff;

        if (args) {
            for (let i: number = 0; i < args.length; i++) {
                const arg: number | string = args[i];

                if (typeof arg === 'number') {
                    this.intLocals.push(arg);
                } else {
                    this.stringLocals.push(arg);
                }
            }
        }
    }

    get intOperand(): number {
        return this.script.intOperands[this.pc];
    }

    get stringOperand(): string {
        return this.script.stringOperands[this.pc];
    }

    popInt(): number {
        const value: number | null = this.intStack[--this.isp];
        if (typeof value === 'undefined' || value === null) {
            return 0;
        }

        return value | 0;
    }

    popInts(amount: number): number[] {
        const ints: Array<number> = new Array(amount);
        for (let i: number = amount - 1; i >= 0; i--) {
            ints[i] = this.popInt();
        }
        return ints;
    }

    pushInt(value: number): void {
        this.intStack[this.isp++] = value | 0;
    }

    popString(): string {
        return this.stringStack[--this.ssp] ?? '';
    }

    popStrings(amount: number): string[] {
        const strings: Array<string> = new Array(amount);
        for (let i: number = amount - 1; i >= 0; i--) {
            strings[i] = this.popString();
        }
        return strings;
    }

    pushString(value: string): void {
        this.stringStack[this.ssp++] = value;
    }

    reset(): void {
        this.pc = -1;
        this.frames = [];
        this.fp = 0;
        this.intStack = [];
        this.isp = 0;
        this.stringStack = [];
        this.ssp = 0;
        this.intLocals = [];
        this.stringLocals = [];
    }
}
