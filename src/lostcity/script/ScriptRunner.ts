import ServerScriptCommand from './ServerScriptCommands.js';
import ServerScriptState from './ServerScriptState.js';

export default class ScriptRunner {
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

        console.log(command);
    }
}
