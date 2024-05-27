import ServerScriptCommand from '../ServerScriptCommands.js';
import ServerScriptState from '../ServerScriptState.js';

ServerScriptCommand.MAP_LOBBY.handler = (state: ServerScriptState): void => {
    state.pushInt(ServerScriptState.MAP_LOBBY ? 1 : 0);
};
