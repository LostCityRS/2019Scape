export default class ServerScriptCommand {

    static readonly PUSH_CONSTANT_INT = new ServerScriptCommand(0, 'push_constant_int', true);
    static readonly PUSH_VARP = new ServerScriptCommand(1, 'push_varp', true);
    static readonly POP_VARP = new ServerScriptCommand(2, 'pop_varp', true);
    static readonly PUSH_CONSTANT_STRING = new ServerScriptCommand(3, 'push_constant_string', true);
    static readonly PUSH_VARN = new ServerScriptCommand(4, 'push_varn', true);
    static readonly POP_VARN = new ServerScriptCommand(5, 'pop_varn', true);
    static readonly BRANCH = new ServerScriptCommand(6, 'branch', true);
    static readonly BRANCH_NOT = new ServerScriptCommand(7, 'branch_not', true);
    static readonly BRANCH_EQUALS = new ServerScriptCommand(8, 'branch_equals', true);
    static readonly BRANCH_LESS_THAN = new ServerScriptCommand(9, 'branch_less_than', true);
    static readonly PUSH_VARS = new ServerScriptCommand(11, 'push_vars', true);
    static readonly POP_VARS = new ServerScriptCommand(12, 'pop_vars', true);
    static readonly RETURN = new ServerScriptCommand(21, 'return');
    static readonly GOSUB = new ServerScriptCommand(22, 'gosub');
    static readonly JUMP = new ServerScriptCommand(23, 'jump');
    static readonly SWITCH = new ServerScriptCommand(24, 'switch', true);
    static readonly PUSH_VARBIT = new ServerScriptCommand(25, 'push_varbit', true);
    static readonly POP_VARBIT = new ServerScriptCommand(27, 'pop_varbit', true);
    static readonly BRANCH_LESS_THAN_OR_EQUALS = new ServerScriptCommand(31, 'branch_less_than_or_equals', true);
    static readonly BRANCH_GREATER_THAN_OR_EQUALS = new ServerScriptCommand(32, 'branch_greater_than_or_equals', true);
    static readonly PUSH_INT_LOCAL = new ServerScriptCommand(33, 'push_int_local', true);
    static readonly POP_INT_LOCAL = new ServerScriptCommand(34, 'pop_int_local', true);
    static readonly PUSH_STRING_LOCAL = new ServerScriptCommand(35, 'push_string_local', true);
    static readonly POP_STRING_LOCAL = new ServerScriptCommand(36, 'pop_string_local', true);
    static readonly JOIN_STRING = new ServerScriptCommand(37, 'join_string', true);
    static readonly POP_INT_DISCARD = new ServerScriptCommand(38, 'pop_int_discard');
    static readonly POP_STRING_DISCARD = new ServerScriptCommand(39, 'pop_string_discard');
    static readonly GOSUB_WITH_PARAMS = new ServerScriptCommand(40, 'gosub_with_params', true);
    static readonly JUMP_WITH_PARAMS = new ServerScriptCommand(41, 'jump_with_params', true);
    static readonly PUSH_VARC_INT = new ServerScriptCommand(42, 'push_varc_int', true);
    static readonly POP_VARC_INT = new ServerScriptCommand(43, 'pop_varc_int', true);
    static readonly DEFINE_ARRAY = new ServerScriptCommand(44, 'define_array', true);
    static readonly PUSH_ARRAY_INT = new ServerScriptCommand(45, 'push_array_int', true);
    static readonly POP_ARRAY_INT = new ServerScriptCommand(46, 'pop_array_int', true);

    static readonly MAP_LOBBY = new ServerScriptCommand(1000, 'map_lobby');

    static readonly IF_OPENTOP = new ServerScriptCommand(2000, 'if_opentop');
    static readonly IF_OPENSUB = new ServerScriptCommand(2001, 'if_opensub');
    static readonly RUNCLIENTSCRIPT = new ServerScriptCommand(2002, 'runclientscript');

    static readonly BY_ID: ServerScriptCommand[] = new Array(10000);

    static {
        const all: ServerScriptCommand[] = ServerScriptCommand.values();

        for (let i: number = 0; i < all.length; i++) {
            ServerScriptCommand.BY_ID[all[i].id] = all[i];
        }
    }

    static values(): ServerScriptCommand[] {
        return [
            ServerScriptCommand.PUSH_CONSTANT_INT,
            ServerScriptCommand.PUSH_VARP,
            ServerScriptCommand.POP_VARP,
            ServerScriptCommand.PUSH_CONSTANT_STRING,
            ServerScriptCommand.PUSH_VARN,
            ServerScriptCommand.POP_VARN,
            ServerScriptCommand.BRANCH,
            ServerScriptCommand.BRANCH_NOT,
            ServerScriptCommand.BRANCH_EQUALS,
            ServerScriptCommand.BRANCH_LESS_THAN,
            ServerScriptCommand.PUSH_VARS,
            ServerScriptCommand.POP_VARS,
            ServerScriptCommand.RETURN,
            ServerScriptCommand.GOSUB,
            ServerScriptCommand.JUMP,
            ServerScriptCommand.SWITCH,
            ServerScriptCommand.PUSH_VARBIT,
            ServerScriptCommand.POP_VARBIT,
            ServerScriptCommand.BRANCH_LESS_THAN_OR_EQUALS,
            ServerScriptCommand.BRANCH_GREATER_THAN_OR_EQUALS,
            ServerScriptCommand.PUSH_INT_LOCAL,
            ServerScriptCommand.POP_INT_LOCAL,
            ServerScriptCommand.PUSH_STRING_LOCAL,
            ServerScriptCommand.POP_STRING_LOCAL,
            ServerScriptCommand.JOIN_STRING,
            ServerScriptCommand.POP_INT_DISCARD,
            ServerScriptCommand.POP_STRING_DISCARD,
            ServerScriptCommand.GOSUB_WITH_PARAMS,
            ServerScriptCommand.JUMP_WITH_PARAMS,
            ServerScriptCommand.PUSH_VARC_INT,
            ServerScriptCommand.POP_VARC_INT,
            ServerScriptCommand.DEFINE_ARRAY,
            ServerScriptCommand.PUSH_ARRAY_INT,
            ServerScriptCommand.POP_ARRAY_INT,
            ServerScriptCommand.MAP_LOBBY,
            ServerScriptCommand.IF_OPENTOP,
            ServerScriptCommand.IF_OPENSUB
        ];
    }

    id: number;
    name: string;
    largeOperand: boolean;

    constructor(id: number, name: string, largeOperand: boolean = false) {
        this.id = id;
        this.name = name;
        this.largeOperand = largeOperand;
    }
}
