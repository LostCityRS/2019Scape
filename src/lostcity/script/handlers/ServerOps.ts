import AllPackets from '#jagex/network/packetencoders/AllPackets.js';
import ScriptRunner from '../ScriptRunner.js';
import ServerScript, { SwitchTable } from '../ServerScript.js';
import ServerScriptCommand from '../ServerScriptCommands.js';
import ServerScriptList from '../ServerScriptList.js';
import ServerScriptState, { GosubStackFrame } from '../ServerScriptState.js';

ServerScriptCommand.PUSH_CONSTANT_INT.handler = (state: ServerScriptState): void => {
    state.pushInt(ScriptRunner.MAP_LOBBY ? 1 : 0);
}
