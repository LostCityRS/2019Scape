export default class LoginProt {

    static readonly INIT_GAME_CONNECTION = new LoginProt(14, 0, 'INIT_GAME_CONNECTION');
    static readonly INIT_JS5REMOTE_CONNECTION = new LoginProt(15, -1, 'INIT_JS5REMOTE_CONNECTION');
    static readonly GAMELOGIN = new LoginProt(16, -2, 'GAMELOGIN');
    static readonly LOBBYLOGIN = new LoginProt(19, -2, 'LOBBYLOGIN');
    static readonly REQUEST_WORLDLIST = new LoginProt(23, 4, 'REQUEST_WORLDLIST');
    static readonly CHECK_WORLD_SUITABILITY = new LoginProt(24, -1, 'CHECK_WORLD_SUITABILITY');
    static readonly GAMELOGIN_CONTINUE = new LoginProt(26, 0, 'GAMELOGIN_CONTINUE');
    static readonly SSL_WEBCONNECTION = new LoginProt(27, 0, 'SSL_WEBCONNECTION');
    static readonly CREATE_ACCOUNT_CONNECT = new LoginProt(28, -2, 'CREATE_ACCOUNT_CONNECT');
    static readonly INIT_SOCIAL_NETWORK_CONNECTION = new LoginProt(29, -2, 'INIT_SOCIAL_NETWORK_CONNECTION');
    static readonly SOCIAL_NETWORK_LOGIN = new LoginProt(30, -2, 'SOCIAL_NETWORK_LOGIN');
    static readonly INIT_DEBUG_CONNECTION = new LoginProt(31, 4, 'INIT_DEBUG_CONNECTION');

    static readonly BY_ID: LoginProt[] = new Array(32);

    static {
        const all: LoginProt[] = LoginProt.values();

        for (let i: number = 0; i < all.length; i++) {
            LoginProt.BY_ID[all[i].opcode] = all[i];
        }
    }

    static values(): LoginProt[] {
        return [
            LoginProt.SSL_WEBCONNECTION,
            LoginProt.INIT_DEBUG_CONNECTION,
            LoginProt.INIT_JS5REMOTE_CONNECTION,
            LoginProt.LOBBYLOGIN,
            LoginProt.SOCIAL_NETWORK_LOGIN,
            LoginProt.CHECK_WORLD_SUITABILITY,
            LoginProt.INIT_SOCIAL_NETWORK_CONNECTION,
            LoginProt.GAMELOGIN_CONTINUE,
            LoginProt.REQUEST_WORLDLIST,
            LoginProt.CREATE_ACCOUNT_CONNECT,
            LoginProt.GAMELOGIN,
            LoginProt.INIT_GAME_CONNECTION
        ];
    }

    readonly opcode: number;
    readonly size: number;
    readonly debugname: string;

    constructor(opcode: number, size: number, debugname?: string) {
        this.opcode = opcode;
        this.size = size;
        this.debugname = debugname ?? opcode.toString();
    }
}
