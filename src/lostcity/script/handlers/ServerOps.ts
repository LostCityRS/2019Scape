import ServerScriptCommand from '../ServerScriptCommands.js';
import ServerScriptState from '../ServerScriptState.js';

ServerScriptCommand.PUSH_CONSTANT_INT.handler = (state: ServerScriptState): void => {
    state.pushInt(ServerScriptState.MAP_LOBBY ? 1 : 0);
}
