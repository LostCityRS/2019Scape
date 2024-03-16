import AllPackets from '#jagex/network/packetencoders/AllPackets.js';
import Player from '#lostcity/entity/Player.js';
import ServerScript, { SwitchTable } from './ServerScript.js';
import ServerScriptCommand from './ServerScriptCommands.js';
import ServerScriptList from './ServerScriptList.js';
import ServerScriptState, { GosubStackFrame } from './ServerScriptState.js';

function setupNewScript(state: ServerScriptState, script: ServerScript): void {
    state.script = script;
    state.pc = -1;
    state.intLocals = state.popInts(script.intArgCount);
    state.stringLocals = state.popStrings(script.stringArgCount);
}

function gosub(state: ServerScriptState, id: number): void {
    if (state.fp >= 50) {
        throw new Error('stack overflow');
    }

    state.frames[state.fp++] = {
        script: state.script,
        pc: state.pc,
        intLocals: state.intLocals,
        stringLocals: state.stringLocals
    };

    const script: ServerScript | undefined = ServerScriptList.get(id);
    if (typeof script === 'undefined') {
        throw new Error(`unable to find proc ${script}`);
    }

    setupNewScript(state, script);
}

function jump(state: ServerScriptState, id: number): void {
    const label: ServerScript | undefined = ServerScriptList.get(id);
    if (typeof label === 'undefined') {
        throw new Error(`unable to find label ${id}`);
    }

    state.debugFrames[state.debugFp++] = {
        script: state.script,
        pc: state.pc
    };

    setupNewScript(state, label);
    state.fp = 0;
    state.frames = [];
}

export default class ScriptRunner {
    static MAP_LOBBY: boolean = false;

    static createState(script: ServerScript, self: Player | null = null, args: (number | string)[] = []): ServerScriptState {
        const state: ServerScriptState = new ServerScriptState(script);
        state._activePlayer = self;
        return state;
    }

    static execute(state: ServerScriptState): number {
        while (state.execution === ServerScriptState.RUNNING) {
            if (state.pc >= state.script.opcodes.length || state.pc < -1) {
                state.execution = ServerScriptState.ABORTED;
                break;
            }

            state.opcount++;
            ScriptRunner.executeInner(state, ServerScriptCommand.BY_ID[state.script.opcodes[++state.pc]]);
        }

        return state.execution;
    }

    static executeInner(state: ServerScriptState, command: ServerScriptCommand): void {
        if (typeof command === 'undefined') {
            return;
        }

        // todo: dynamic handler registration
        switch (command) {
            case ServerScriptCommand.PUSH_CONSTANT_INT:
                state.pushInt(state.intOperand);
                break;
            case ServerScriptCommand.PUSH_CONSTANT_STRING:
                state.pushString(state.stringOperand);
                break;
            case ServerScriptCommand.PUSH_INT_LOCAL:
                state.pushInt(state.intLocals[state.intOperand]);
                break;
            case ServerScriptCommand.POP_INT_LOCAL:
                state.intLocals[state.intOperand] = state.popInt();
                break;
            case ServerScriptCommand.PUSH_STRING_LOCAL:
                state.pushString(state.stringLocals[state.intOperand]);
                break;
            case ServerScriptCommand.POP_STRING_LOCAL:
                state.stringLocals[state.intOperand] = state.popString();
                break;
            case ServerScriptCommand.POP_INT_DISCARD:
                state.isp--;
                break;
            case ServerScriptCommand.POP_STRING_DISCARD:
                state.ssp--;
                break;
            case ServerScriptCommand.PUSH_VARP: {
                const varpId: number = state.intOperand & 0xFFFF;
                const secondary: number = (state.intOperand >> 16) & 0x1;

                if (!secondary) {
                    state.pushInt(state._activePlayer!.varp[varpId] as number);
                }

                break;
            }
            case ServerScriptCommand.POP_VARP: {
                const varpId: number = state.intOperand & 0xFFFF;
                const secondary: number = (state.intOperand >> 16) & 0x1;

                if (!secondary) {
                    state._activePlayer!.varp[varpId] = state.popInt();
                    // temp
                    AllPackets.updateVar(state._activePlayer!.client!, varpId, state._activePlayer!.varp[varpId] as number);
                }

                break;
            }
            //
            case ServerScriptCommand.BRANCH:
                state.pc += state.intOperand;
                break;
            case ServerScriptCommand.BRANCH_NOT:
                if (state.popInt() !== state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            case ServerScriptCommand.BRANCH_EQUALS:
                if (state.popInt() === state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            case ServerScriptCommand.BRANCH_LESS_THAN:
                if (state.popInt() < state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            case ServerScriptCommand.BRANCH_GREATER_THAN:
                if (state.popInt() > state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            case ServerScriptCommand.BRANCH_LESS_THAN_OR_EQUALS:
                if (state.popInt() <= state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            case ServerScriptCommand.BRANCH_GREATER_THAN_OR_EQUALS:
                if (state.popInt() >= state.popInt()) {
                    state.pc += state.intOperand;
                }
                break;
            //
            case ServerScriptCommand.RETURN: {
                if (state.fp === 0) {
                    state.execution = ServerScriptState.FINISHED;
                    break;
                }

                const frame: GosubStackFrame = state.frames[--state.fp];
                state.pc = frame.pc;
                state.script = frame.script;
                state.intLocals = frame.intLocals;
                state.stringLocals = frame.stringLocals;
                break;
            }
            case ServerScriptCommand.JOIN_STRING: {
                const count: number = state.intOperand;
        
                const strings: string[] = [];
                for (let i: number = 0; i < count; i++) {
                    strings.push(state.popString());
                }
        
                state.pushString(strings.reverse().join(''));
                break;
            }
            case ServerScriptCommand.GOSUB: {
                gosub(state, state.popInt());
                break;
            }
            case ServerScriptCommand.GOSUB_WITH_PARAMS: {
                gosub(state, state.intOperand);
                break;
            }
            case ServerScriptCommand.JUMP: {
                jump(state, state.popInt());
                break;
            }
            case ServerScriptCommand.JUMP_WITH_PARAMS: {
                jump(state, state.intOperand);
                break;
            }
            case ServerScriptCommand.SWITCH: {
                const key: number = state.popInt();
                const table: SwitchTable = state.script.switchTables[state.intOperand];
                if (typeof table === 'undefined') {
                    return;
                }

                const result: number | undefined = table[key];
                if (typeof result !== 'undefined') {
                    state.pc += result;
                }

                break;
            }
            //
            case ServerScriptCommand.MAP_LOBBY:
                state.pushInt(ScriptRunner.MAP_LOBBY ? 1 : 0);
                break;
            //
            case ServerScriptCommand.IF_OPENTOP: {
                const ifId: number = state.popInt();
                AllPackets.ifOpenTop(state._activePlayer!.client!, ifId);
                break;
            }
            case ServerScriptCommand.IF_OPENSUB: {
                const [ifCom, child, type] = state.popInts(3);
                const ifId: number = ifCom >> 16;
                const comId: number = ifCom & 0xFFFF;
                AllPackets.ifOpenSub(state._activePlayer!.client!, ifId, comId, child, type);
                break;
            }
            default:
                console.error('Unimplemented command: ' + command.name);
                state.execution = ServerScriptState.ABORTED;
                break;
        }
    }
}
