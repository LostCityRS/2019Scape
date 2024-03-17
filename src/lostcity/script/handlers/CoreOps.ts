import AllPackets from '#jagex/network/packetencoders/AllPackets.js';
import ServerScript, { SwitchTable } from '../ServerScript.js';
import ServerScriptCommand from '../ServerScriptCommands.js';
import ServerScriptList from '../ServerScriptList.js';
import ServerScriptState, { GosubStackFrame } from '../ServerScriptState.js';

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

ServerScriptCommand.PUSH_CONSTANT_INT.handler = (state: ServerScriptState): void => {
    state.pushInt(state.intOperand);
}

ServerScriptCommand.PUSH_CONSTANT_STRING.handler = (state: ServerScriptState): void => {
    state.pushString(state.stringOperand);
}

ServerScriptCommand.PUSH_INT_LOCAL.handler = (state: ServerScriptState): void => {
    state.pushInt(state.intLocals[state.intOperand]);
}

ServerScriptCommand.POP_INT_LOCAL.handler = (state: ServerScriptState): void => {
    state.intLocals[state.intOperand] = state.popInt();
}

ServerScriptCommand.PUSH_STRING_LOCAL.handler = (state: ServerScriptState): void => {
    state.pushString(state.stringLocals[state.intOperand]);
}

ServerScriptCommand.POP_STRING_LOCAL.handler = (state: ServerScriptState): void => {
    state.stringLocals[state.intOperand] = state.popString();
}

ServerScriptCommand.POP_INT_DISCARD.handler = (state: ServerScriptState): void => {
    state.isp--;
}

ServerScriptCommand.POP_STRING_DISCARD.handler = (state: ServerScriptState): void => {
    state.ssp--;
}

ServerScriptCommand.PUSH_VARP.handler = (state: ServerScriptState): void => {
    const varpId: number = state.intOperand & 0xFFFF;
    const secondary: number = (state.intOperand >> 16) & 0x1;

    if (!secondary) {
        state.pushInt(state._activePlayer!.varp[varpId] as number);
    }
}

ServerScriptCommand.POP_VARP.handler = (state: ServerScriptState): void => {
    const varpId: number = state.intOperand & 0xFFFF;
    const secondary: number = (state.intOperand >> 16) & 0x1;

    if (!secondary) {
        state._activePlayer!.varp[varpId] = state.popInt();
        // temp
        AllPackets.updateVar(state._activePlayer!.client!, varpId, state._activePlayer!.varp[varpId] as number);
    }
}

ServerScriptCommand.BRANCH.handler = (state: ServerScriptState): void => {
    state.pc += state.intOperand;
}

ServerScriptCommand.BRANCH_NOT.handler = (state: ServerScriptState): void => {
    if (state.popInt() !== state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.BRANCH_EQUALS.handler = (state: ServerScriptState): void => {
    if (state.popInt() === state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.BRANCH_LESS_THAN.handler = (state: ServerScriptState): void => {
    if (state.popInt() < state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.BRANCH_GREATER_THAN.handler = (state: ServerScriptState): void => {
    if (state.popInt() > state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.BRANCH_LESS_THAN_OR_EQUALS.handler = (state: ServerScriptState): void => {
    if (state.popInt() <= state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.BRANCH_GREATER_THAN_OR_EQUALS.handler = (state: ServerScriptState): void => {
    if (state.popInt() >= state.popInt()) {
        state.pc += state.intOperand;
    }
}

ServerScriptCommand.RETURN.handler = (state: ServerScriptState): void => {
    if (state.fp === 0) {
        state.execution = ServerScriptState.FINISHED;
        return;
    }

    const frame: GosubStackFrame = state.frames[--state.fp];
    state.pc = frame.pc;
    state.script = frame.script;
    state.intLocals = frame.intLocals;
    state.stringLocals = frame.stringLocals;
}

ServerScriptCommand.JOIN_STRING.handler = (state: ServerScriptState): void => {
    const count: number = state.intOperand;
    const strings: string[] = state.popStrings(count);
    state.pushString(strings.join(''));
}

ServerScriptCommand.GOSUB.handler = (state: ServerScriptState): void => {
    gosub(state, state.popInt());
}

ServerScriptCommand.GOSUB_WITH_PARAMS.handler = (state: ServerScriptState): void => {
    gosub(state, state.intOperand);
}

ServerScriptCommand.JUMP.handler = (state: ServerScriptState): void => {
    jump(state, state.popInt());
}

ServerScriptCommand.JUMP_WITH_PARAMS.handler = (state: ServerScriptState): void => {
    jump(state, state.intOperand);
}

ServerScriptCommand.SWITCH.handler = (state: ServerScriptState): void => {
    const key: number = state.popInt();
    const table: SwitchTable = state.script.switchTables[state.intOperand];
    if (typeof table === 'undefined') {
        return;
    }

    const result: number | undefined = table[key];
    if (typeof result !== 'undefined') {
        state.pc += result;
    }
}
