import Packet from '#jagex/bytepacking/Packet.js';
import BuildAreaSize from '#jagex/core/constants/BuidlAreaSize.js';
import ClientSocket from '#lostcity/network/ClientSocket.js';
import ServerMessage from '../ServerMessage.js';
import Viewport from '#lostcity/entity/Viewport.js';
import Player from '#lostcity/entity/Player.js';

export default class ServerProt {

    static readonly TELEMETRY_GRID_ADD_GROUP = new ServerProt(0, 5, 'TELEMETRY_GRID_ADD_GROUP');
    static readonly ENVIRONMENT_OVERRIDE = new ServerProt(1, -1, 'ENVIRONMENT_OVERRIDE');
    static readonly UPDATE_FRIENDCHAT_CHANNEL_SINGLEUSER = new ServerProt(2, -1, 'UPDATE_FRIENDCHAT_CHANNEL_SINGLEUSER');
    static readonly CREATE_CHECK_EMAIL_REPLY = new ServerProt(3, 1, 'CREATE_CHECK_EMAIL_REPLY');
    static readonly PROJANIM_SPECIFIC = new ServerProt(4, 23, 'PROJANIM_SPECIFIC');
    static readonly CAM_LOOKAT = new ServerProt(5, 6, 'CAM_LOOKAT');
    static readonly UPDATE_INV_FULL = new ServerProt(6, -2, 'UPDATE_INV_FULL');
    static readonly MESSAGE_PRIVATE_ECHO = new ServerProt(7, -2, 'MESSAGE_PRIVATE_ECHO');
    static readonly MESSAGE_PUBLIC = new ServerProt(8, -1, 'MESSAGE_PUBLIC');
    static readonly REBUILD_REGION = new ServerProt(9, -2, 'REBUILD_REGION');
    static readonly UPDATE_SITESETTINGS = new ServerProt(10, -1, 'UPDATE_SITESETTINGS');
    static readonly NPC_ANIM_SPECIFIC = new ServerProt(11, 19, 'NPC_ANIM_SPECIFIC');
    static readonly RESET_ANIMS = new ServerProt(12, 0, 'RESET_ANIMS');
    static readonly MAP_PROJANIM = new ServerProt(13, 18, 'MAP_PROJANIM');
    static readonly SET_PLAYER_OP = new ServerProt(14, -1, 'SET_PLAYER_OP');
    static readonly TELEMETRY_GRID_VALUES_DELTA = new ServerProt(15, -2, 'TELEMETRY_GRID_VALUES_DELTA');
    static readonly UPDATE_INV_PARTIAL = new ServerProt(16, -2, 'UPDATE_INV_PARTIAL');
    static readonly MIDI_SONG = new ServerProt(17, 3, 'MIDI_SONG');
    static readonly SET_MOVEACTION = new ServerProt(18, -1, 'SET_MOVEACTION');
    static readonly CREATE_SUGGEST_NAME_ERROR = new ServerProt(19, 1, 'CREATE_SUGGEST_NAME_ERROR');
    static readonly TELEMETRY_GRID_ADD_COLUMN = new ServerProt(20, 6, 'TELEMETRY_GRID_ADD_COLUMN');
    static readonly CLIENT_SETVARCSTR_LARGE = new ServerProt(21, -2, 'CLIENT_SETVARCSTR_LARGE');
    static readonly MESSAGE_CLANCHANNEL = new ServerProt(22, -1, 'MESSAGE_CLANCHANNEL');
    static readonly UPDATE_FRIENDCHAT_CHANNEL_FULL = new ServerProt(23, -2, 'UPDATE_FRIENDCHAT_CHANNEL_FULL');
    static readonly EXECUTE_CLIENT_CHEAT = new ServerProt(24, 2, 'EXECUTE_CLIENT_CHEAT');
    static readonly FRIENDLIST_LOADED = new ServerProt(25, 0, 'FRIENDLIST_LOADED');
    static readonly IF_OPENSUB_ACTIVE_LOC = new ServerProt(26, 32, 'IF_OPENSUB_ACTIVE_LOC');
    static readonly CLEAR_PLAYER_SNAPSHOT = new ServerProt(27, 1, 'CLEAR_PLAYER_SNAPSHOT');
    static readonly UPDATE_STOCKMARKET_SLOT = new ServerProt(28, 21, 'UPDATE_STOCKMARKET_SLOT');
    static readonly SONG_PRELOAD = new ServerProt(29, 2, 'SONG_PRELOAD');
    static readonly CLIENT_SETVARCSTR_SMALL = new ServerProt(30, -1, 'CLIENT_SETVARCSTR_SMALL');
    static readonly IF_SETTEXTFONT = new ServerProt(31, 8, 'IF_SETTEXTFONT');
    static readonly TELEMETRY_GRID_REMOVE_COLUMN = new ServerProt(32, 2, 'TELEMETRY_GRID_REMOVE_COLUMN');
    static readonly UPDATE_STAT = new ServerProt(33, 6, 'UPDATE_STAT');
    static readonly LOC_CUSTOMISE = new ServerProt(34, -1, 'LOC_CUSTOMISE');
    static readonly IF_OPENTOP = new ServerProt(35, 19, 'IF_OPENTOP');
    static readonly MESSAGE_FRIENDCHANNEL = new ServerProt(36, -1, 'MESSAGE_FRIENDCHANNEL');
    static readonly VORBIS_SOUND = new ServerProt(37, 8, 'VORBIS_SOUND');
    static readonly IF_OPENSUB = new ServerProt(38, 23, 'IF_OPENSUB');
    static readonly TELEMETRY_GRID_MOVE_COLUMN = new ServerProt(39, 3, 'TELEMETRY_GRID_MOVE_COLUMN');
    static readonly PLAYER_GROUP_FULL = new ServerProt(40, -2, 'PLAYER_GROUP_FULL');
    static readonly MESSAGE_PLAYER_GROUP = new ServerProt(41, -1, 'MESSAGE_PLAYER_GROUP');
    static readonly VORBIS_SOUND_GROUP = new ServerProt(42, 10, 'VORBIS_SOUND_GROUP');
    static readonly IF_SETPLAYERHEAD = new ServerProt(43, 4, 'IF_SETPLAYERHEAD');
    static readonly VARBIT_SMALL = new ServerProt(44, 3, 'VARBIT_SMALL');
    static readonly LOC_DEL = new ServerProt(45, 2, 'LOC_DEL');
    static readonly UPDATE_FRIENDLIST = new ServerProt(46, -2, 'UPDATE_FRIENDLIST');
    static readonly SHOW_FACE_HERE = new ServerProt(47, 1, 'SHOW_FACE_HERE');
    static readonly SEND_PING = new ServerProt(48, 8, 'SEND_PING');
    static readonly OBJ_DEL = new ServerProt(49, 3, 'OBJ_DEL');
    static readonly VARP_LARGE = new ServerProt(50, 6, 'VARP_LARGE');
    static readonly field3853 = new ServerProt(51, -2);
    static readonly DEBUG_SERVER_TRIGGERS = new ServerProt(52, -1, 'DEBUG_SERVER_TRIGGERS');
    static readonly UPDATE_UID192 = new ServerProt(53, 28, 'UPDATE_UID192');
    static readonly CLIENT_SETVARCBIT_SMALL = new ServerProt(54, 3, 'CLIENT_SETVARCBIT_SMALL');
    static readonly MIDI_JINGLE = new ServerProt(55, 3, 'MIDI_JINGLE');
    static readonly UPDATE_ZONE_PARTIAL_FOLLOWS = new ServerProt(56, 3, 'UPDATE_ZONE_PARTIAL_FOLLOWS');
    static readonly LOGOUT_TRANSFER = new ServerProt(57, -1, 'LOGOUT_TRANSFER');
    static readonly UPDATE_ZONE_PARTIAL_ENCLOSED = new ServerProt(58, -2, 'UPDATE_ZONE_PARTIAL_ENCLOSED');
    static readonly CLANCHANNEL_FULL = new ServerProt(59, -2, 'CLANCHANNEL_FULL');
    static readonly URL_OPEN = new ServerProt(60, -2, 'URL_OPEN');
    static readonly IF_OPENSUB_ACTIVE_PLAYER = new ServerProt(61, 25, 'IF_OPENSUB_ACTIVE_PLAYER');
    static readonly IF_SETPLAYERHEAD_OTHER = new ServerProt(62, 10, 'IF_SETPLAYERHEAD_OTHER');
    static readonly IF_SETRECOL = new ServerProt(63, 9, 'IF_SETRECOL');
    static readonly CAM_REMOVEROOF = new ServerProt(64, 4, 'CAM_REMOVEROOF');
    static readonly UPDATE_INV_STOP_TRANSMIT = new ServerProt(65, 3, 'UPDATE_INV_STOP_TRANSMIT');
    static readonly CREATE_SUGGEST_NAME_REPLY = new ServerProt(66, -1, 'CREATE_SUGGEST_NAME_REPLY');
    static readonly PLAYER_SNAPSHOT = new ServerProt(67, -2, 'PLAYER_SNAPSHOT');
    static readonly TELEMETRY_GRID_REMOVE_GROUP = new ServerProt(68, 1, 'TELEMETRY_GRID_REMOVE_GROUP');
    static readonly CLIENT_SETVARCBIT_LARGE = new ServerProt(69, 6, 'CLIENT_SETVARCBIT_LARGE');
    static readonly SOUND_AREA = new ServerProt(70, 6, 'SOUND_AREA');
    static readonly MAP_PROJANIM_HALFSQ = new ServerProt(71, 21, 'MAP_PROJANIM_HALFSQ');
    static readonly IF_SETPOSITION = new ServerProt(72, 8, 'IF_SETPOSITION');
    static readonly OBJ_COUNT = new ServerProt(73, 7, 'OBJ_COUNT');
    static readonly CHAT_FILTER_SETTINGS_PRIVATECHAT = new ServerProt(74, 1, 'CHAT_FILTER_SETTINGS_PRIVATECHAT');
    static readonly TELEMETRY_GRID_FULL = new ServerProt(75, -2, 'TELEMETRY_GRID_FULL');
    static readonly SETDRAWORDER = new ServerProt(76, 1, 'SETDRAWORDER');
    static readonly SOCIAL_NETWORK_LOGOUT = new ServerProt(77, -2, 'SOCIAL_NETWORK_LOGOUT');
    static readonly HINT_ARROW = new ServerProt(78, 14, 'HINT_ARROW');
    static readonly IF_SETSCROLLPOS = new ServerProt(79, 6, 'IF_SETSCROLLPOS');
    static readonly MESSAGE_QUICKCHAT_PRIVATE = new ServerProt(80, -1, 'MESSAGE_QUICKCHAT_PRIVATE');
    static readonly CAM2_ENABLE = new ServerProt(81, 1, 'CAM2_ENABLE');
    static readonly MESSAGE_CLANCHANNEL_SYSTEM = new ServerProt(82, -1, 'MESSAGE_CLANCHANNEL_SYSTEM');
    static readonly NO_TIMEOUT = new ServerProt(83, 0, 'NO_TIMEOUT');
    static readonly LOC_ANIM_SPECIFIC = new ServerProt(84, 10, 'LOC_ANIM_SPECIFIC');
    static readonly OBJ_ADD = new ServerProt(85, 5, 'OBJ_ADD');
    static readonly LOGOUT_FULL = new ServerProt(86, 1, 'LOGOUT_FULL');
    static readonly CAM_SMOOTHRESET = new ServerProt(87, 0, 'CAM_SMOOTHRESET');
    static readonly REBUILD_NORMAL = new ServerProt(88, -2, 'REBUILD_NORMAL');
    static readonly MESSAGE_QUICKCHAT_CLANCHANNEL = new ServerProt(89, -1, 'MESSAGE_QUICKCHAT_CLANCHANNEL');
    static readonly MESSAGE_PRIVATE = new ServerProt(90, -2, 'MESSAGE_PRIVATE');
    static readonly VARCLAN_DISABLE = new ServerProt(91, 0, 'VARCLAN_DISABLE');
    static readonly VORBIS_SOUND_GROUP_START = new ServerProt(92, 2, 'VORBIS_SOUND_GROUP_START');
    static readonly MESSAGE_QUICKCHAT_PRIVATE_ECHO = new ServerProt(93, -1, 'MESSAGE_QUICKCHAT_PRIVATE_ECHO');
    static readonly SET_MAP_FLAG = new ServerProt(94, 2, 'SET_MAP_FLAG');
    static readonly VORBIS_SOUND_GROUP_STOP = new ServerProt(95, 2, 'VORBIS_SOUND_GROUP_STOP');
    static readonly TELEMETRY_GRID_MOVE_ROW = new ServerProt(96, 3, 'TELEMETRY_GRID_MOVE_ROW');
    static readonly VORBIS_PRELOAD_SOUNDS = new ServerProt(97, 2, 'VORBIS_PRELOAD_SOUNDS');
    static readonly CAM_MOVETO = new ServerProt(98, 6, 'CAM_MOVETO');
    static readonly RESET_CLIENT_VARCACHE = new ServerProt(99, 0, 'RESET_CLIENT_VARCACHE');
    static readonly IF_SETPLAYERMODEL_OTHER = new ServerProt(100, 10, 'IF_SETPLAYERMODEL_OTHER');
    static readonly CLANSETTINGS_FULL = new ServerProt(101, -2, 'CLANSETTINGS_FULL');
    static readonly IF_OPENSUB_ACTIVE_NPC = new ServerProt(102, 25, 'IF_OPENSUB_ACTIVE_NPC');
    static readonly IF_SETANIM = new ServerProt(103, 8, 'IF_SETANIM');
    static readonly CAM_RESET = new ServerProt(104, 0, 'CAM_RESET');
    static readonly LOBBY_APPEARANCE = new ServerProt(105, -2, 'LOBBY_APPEARANCE');
    static readonly VARCLAN_ENABLE = new ServerProt(106, 0, 'VARCLAN_ENABLE');
    static readonly POINTLIGHT_COLOUR = new ServerProt(107, 8, 'POINTLIGHT_COLOUR');
    static readonly IF_SETRETEX = new ServerProt(108, 9, 'IF_SETRETEX');
    static readonly IF_SETHIDE = new ServerProt(109, 5, 'IF_SETHIDE');
    static readonly LAST_LOGIN_INFO = new ServerProt(110, 4, 'LAST_LOGIN_INFO');
    static readonly REFLECTION_CHECKER = new ServerProt(111, -2, 'REFLECTION_CHECKER');
    static readonly IF_SETANGLE = new ServerProt(112, 10, 'IF_SETANGLE');
    static readonly TEXT_COORD = new ServerProt(113, -1, 'TEXT_COORD');
    static readonly VORBIS_SPEECH_STOP = new ServerProt(114, 0, 'VORBIS_SPEECH_STOP');
    static readonly VORBIS_PRELOAD_SOUND_GROUP = new ServerProt(115, 2, 'VORBIS_PRELOAD_SOUND_GROUP');
    static readonly IF_SETMODEL = new ServerProt(116, 8, 'IF_SETMODEL');
    static readonly DO_CHEAT = new ServerProt(117, -1, 'DO_CHEAT');
    static readonly OBJ_REVEAL = new ServerProt(118, 7, 'OBJ_REVEAL');
    static readonly HINT_TRAIL = new ServerProt(119, -2, 'HINT_TRAIL');
    static readonly MESSAGE_GAME = new ServerProt(120, -1, 'MESSAGE_GAME');
    static readonly IF_OPENSUB_ACTIVE_OBJ = new ServerProt(121, 29, 'IF_OPENSUB_ACTIVE_OBJ');
    static readonly PLAYER_INFO = new ServerProt(122, -2, 'PLAYER_INFO');
    static readonly SOUND_MIXBUSS_ADD = new ServerProt(123, 6, 'SOUND_MIXBUSS_ADD');
    static readonly LOC_PREFETCH = new ServerProt(124, 5, 'LOC_PREFETCH');
    static readonly NPC_HEADICON_SPECIFIC = new ServerProt(125, 9, 'NPC_HEADICON_SPECIFIC');
    static readonly UPDATE_DOB = new ServerProt(126, 4, 'UPDATE_DOB');
    static readonly MIDI_SONG_LOCATION = new ServerProt(127, 11, 'MIDI_SONG_LOCATION');
    static readonly CLIENT_SETVARC_LARGE = new ServerProt(128, 6, 'CLIENT_SETVARC_LARGE');
    static readonly SERVER_TICK_END = new ServerProt(129, 0, 'SERVER_TICK_END');
    static readonly IF_SETPLAYERHEAD_IGNOREWORN = new ServerProt(130, 10, 'IF_SETPLAYERHEAD_IGNOREWORN');
    static readonly CREATE_ACCOUNT_REPLY = new ServerProt(131, 1, 'CREATE_ACCOUNT_REPLY');
    static readonly CLANSETTINGS_DELTA = new ServerProt(132, -2, 'CLANSETTINGS_DELTA');
    static readonly TRIGGER_ONDIALOGABORT = new ServerProt(133, 0, 'TRIGGER_ONDIALOGABORT');
    static readonly REDUCE_PLAYER_ATTACK_PRIORITY = new ServerProt(134, 1, 'REDUCE_PLAYER_ATTACK_PRIORITY');
    static readonly IF_SET_HTTP_IMAGE = new ServerProt(135, 8, 'IF_SET_HTTP_IMAGE');
    static readonly CUTSCENE = new ServerProt(136, -2, 'CUTSCENE');
    static readonly MINIMAP_TOGGLE = new ServerProt(137, 1, 'MINIMAP_TOGGLE');
    static readonly CHAT_FILTER_SETTINGS = new ServerProt(138, 2, 'CHAT_FILTER_SETTINGS');
    static readonly LOC_ADD_CHANGE = new ServerProt(139, -1, 'LOC_ADD_CHANGE');
    static readonly IF_SETCOLOUR = new ServerProt(140, 6, 'IF_SETCOLOUR');
    static readonly REDUCE_NPC_ATTACK_PRIORITY = new ServerProt(141, 1, 'REDUCE_NPC_ATTACK_PRIORITY');
    static readonly VARBIT_LARGE = new ServerProt(142, 6, 'VARBIT_LARGE');
    static readonly VORBIS_SPEECH_SOUND = new ServerProt(143, 6, 'VORBIS_SPEECH_SOUND');
    static readonly POINTLIGHT_INTENSITY = new ServerProt(144, 5, 'POINTLIGHT_INTENSITY');
    static readonly MESSAGE_QUICKCHAT_FRIENDCHAT = new ServerProt(145, -1, 'MESSAGE_QUICKCHAT_FRIENDCHAT');
    static readonly CLANCHANNEL_DELTA = new ServerProt(146, -2, 'CLANCHANNEL_DELTA');
    static readonly LOC_ANIM = new ServerProt(147, 7, 'LOC_ANIM');
    static readonly STORE_SERVERPERM_VARCS_ACK = new ServerProt(148, 0, 'STORE_SERVERPERM_VARCS_ACK');
    static readonly CLIENT_SETVARC_SMALL = new ServerProt(149, 3, 'CLIENT_SETVARC_SMALL');
    static readonly SET_TARGET = new ServerProt(150, 2, 'SET_TARGET');
    static readonly IF_SETPLAYERMODEL_SELF = new ServerProt(151, 4, 'IF_SETPLAYERMODEL_SELF');
    static readonly CAMERA_UPDATE = new ServerProt(152, -2, 'CAMERA_UPDATE');
    static readonly JS5_RELOAD = new ServerProt(153, 0, 'JS5_RELOAD');
    static readonly CHANGE_LOBBY = new ServerProt(154, -1, 'CHANGE_LOBBY');
    static readonly IF_SETEVENTS = new ServerProt(155, 12, 'IF_SETEVENTS');
    static readonly RUNCLIENTSCRIPT = new ServerProt(156, -2, 'RUNCLIENTSCRIPT');
    static readonly VARP_SMALL = new ServerProt(157, 3, 'VARP_SMALL');
    static readonly IF_SETOBJECT = new ServerProt(158, 10, 'IF_SETOBJECT');
    static readonly PLAYER_GROUP_VARPS = new ServerProt(159, -2, 'PLAYER_GROUP_VARPS');
    static readonly TELEMETRY_GRID_REMOVE_ROW = new ServerProt(160, 2, 'TELEMETRY_GRID_REMOVE_ROW');
    static readonly UPDATE_RUNENERGY = new ServerProt(161, 1, 'UPDATE_RUNENERGY');
    static readonly SOUND_MIXBUSS_SETLEVEL = new ServerProt(162, 4, 'SOUND_MIXBUSS_SETLEVEL');
    static readonly CREATE_CHECK_NAME_REPLY = new ServerProt(163, 1, 'CREATE_CHECK_NAME_REPLY');
    static readonly CAM_FORCEANGLE = new ServerProt(164, 4, 'CAM_FORCEANGLE');
    static readonly IF_SETTEXTANTIMACRO = new ServerProt(165, 5, 'IF_SETTEXTANTIMACRO');
    static readonly IF_CLOSESUB = new ServerProt(166, 4, 'IF_CLOSESUB');
    static readonly WORLDLIST_FETCH_REPLY = new ServerProt(167, -2, 'WORLDLIST_FETCH_REPLY');
    static readonly LOGOUT = new ServerProt(168, 1, 'LOGOUT');
    static readonly UPDATE_RUNWEIGHT = new ServerProt(169, 2, 'UPDATE_RUNWEIGHT');
    static readonly field3996 = new ServerProt(170, -2);
    static readonly CAM_SHAKE = new ServerProt(171, 6, 'CAM_SHAKE');
    static readonly VARCLAN = new ServerProt(172, -1, 'VARCLAN');
    static readonly TELEMETRY_GRID_SET_ROW_PINNED = new ServerProt(173, 3, 'TELEMETRY_GRID_SET_ROW_PINNED');
    static readonly UPDATE_IGNORELIST = new ServerProt(174, -2, 'UPDATE_IGNORELIST');
    static readonly UPDATE_ZONE_FULL_FOLLOWS = new ServerProt(175, 3, 'UPDATE_ZONE_FULL_FOLLOWS');
    static readonly MESSAGE_QUICKCHAT_PLAYER_GROUP = new ServerProt(176, -1, 'MESSAGE_QUICKCHAT_PLAYER_GROUP');
    static readonly UPDATE_REBOOT_TIMER = new ServerProt(177, 2, 'UPDATE_REBOOT_TIMER');
    static readonly SPOTANIM_SPECIFIC = new ServerProt(178, 12, 'SPOTANIM_SPECIFIC');
    static readonly IF_SETTARGETPARAM = new ServerProt(179, 10, 'IF_SETTARGETPARAM');
    static readonly IF_SETPLAYERMODEL_SNAPSHOT = new ServerProt(180, 5, 'IF_SETPLAYERMODEL_SNAPSHOT');
    static readonly IF_SETTEXT = new ServerProt(181, -2, 'IF_SETTEXT');
    static readonly SYNTH_SOUND = new ServerProt(182, 8, 'SYNTH_SOUND');
    static readonly IF_SETGRAPHIC = new ServerProt(183, 8, 'IF_SETGRAPHIC');
    static readonly IF_SETCLICKMASK = new ServerProt(184, 5, 'IF_SETCLICKMASK');
    static readonly TELEMETRY_GRID_ADD_ROW = new ServerProt(185, 6, 'TELEMETRY_GRID_ADD_ROW');
    static readonly NPC_INFO = new ServerProt(186, -2, 'NPC_INFO');
    static readonly PLAYER_GROUP_DELTA = new ServerProt(187, -2, 'PLAYER_GROUP_DELTA');
    static readonly LOYALTY_UPDATE = new ServerProt(188, 4, 'LOYALTY_UPDATE');
    static readonly IF_SETNPCHEAD = new ServerProt(189, 8, 'IF_SETNPCHEAD');
    static readonly MIDI_SONG_STOP = new ServerProt(190, 0, 'MIDI_SONG_STOP');
    static readonly IF_MOVESUB = new ServerProt(191, 8, 'IF_MOVESUB');
    static readonly TELEMETRY_CLEAR_GRID_VALUE = new ServerProt(192, 3, 'TELEMETRY_CLEAR_GRID_VALUE');
    static readonly MAP_ANIM = new ServerProt(193, 10, 'MAP_ANIM');
    static readonly JCOINS_UPDATE = new ServerProt(194, 4, 'JCOINS_UPDATE');

    readonly opcode: number;
    readonly size: number;
    readonly debugname: string;

    constructor(opcode: number, size: number, debugname?: string) {
        this.opcode = opcode;
        this.size = size;
        this.debugname = debugname ?? opcode.toString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encode(...args: any): Packet {
        return new Packet();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send(client: ClientSocket, ...args: any): void {
        const message: ServerMessage = ServerMessage.create(this);
        const buf: Packet = this.encode(...args);
        message.buf.pdata(buf);
        client.send(message);
    }
}

ServerProt.VARP_SMALL.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p1(value);
    buf.p2_alt2(id);
    return buf;
};

ServerProt.VARP_LARGE.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p2_alt1(id);
    buf.p4(value);
    return buf;
};

ServerProt.VARBIT_SMALL.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p1_alt3(value);
    buf.p2_alt2(id);
    return buf;
};

ServerProt.VARBIT_LARGE.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p2_alt2(id);
    buf.p4_alt1(value);
    return buf;
};

ServerProt.CLIENT_SETVARC_SMALL.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p1_alt3(value);
    buf.p2(id);
    return buf;
};

ServerProt.CLIENT_SETVARC_LARGE.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p4_alt1(value);
    buf.p2_alt2(id);
    return buf;
};

ServerProt.CLIENT_SETVARCBIT_SMALL.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p2(id);
    buf.p1_alt1(value);
    return buf;
};

ServerProt.CLIENT_SETVARCBIT_LARGE.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    buf.p2_alt2(id);
    buf.p4_alt1(value);
    return buf;
};

ServerProt.CLIENT_SETVARCSTR_SMALL.encode = function(id: number, value: string): Packet {
    const buf: Packet = new Packet();
    buf.p2(id);
    buf.pjstr(value);
    return buf;
};

ServerProt.CLIENT_SETVARCSTR_LARGE.encode = function(id: number, value: string): Packet {
    const buf: Packet = new Packet();
    buf.p2(id);
    buf.pjstr(value);
    return buf;
};

ServerProt.IF_OPENTOP.encode = function(topLevelInterfaceId: number, type: number = 0, key: number[] = [0, 0, 0, 0]): Packet {
    const buf: Packet = new Packet();
    buf.p4_alt2(key[3]);
    buf.p4_alt1(key[2]);
    buf.p4_alt2(key[0]);
    buf.p4(key[1]);
    buf.p1(type);
    buf.p2_alt3(topLevelInterfaceId);
    return buf;
};

ServerProt.IF_OPENSUB.encode = function(topLevelInterfaceId: number, component: number, subInterfaceId: number, type: number, key: number[] = [0, 0, 0, 0]): Packet {
    const buf: Packet = new Packet();
    buf.p4_alt2(key[2]);
    buf.p4_alt1((topLevelInterfaceId << 16) | component);
    buf.p1_alt2(type);
    buf.p4(key[3]);
    buf.p2(subInterfaceId);
    buf.p4_alt2(key[1]);
    buf.p4_alt2(key[0]);
    return buf;
};

ServerProt.IF_SETEVENTS.encode = function(interfaceId: number, component: number, fromSlot: number, toSlot: number, settings: number): Packet {
    const buf: Packet = new Packet();
    buf.p2_alt1(fromSlot);
    buf.p4(interfaceId << 16 | component);
    buf.p2_alt3(toSlot);
    buf.p4_alt1(settings);
    return buf;
};

ServerProt.RUNCLIENTSCRIPT.encode = function(scriptId: number, args: (string | number)[]): Packet {
    const buf: Packet = new Packet();
    let descriptor: string = '';
    for (let i: number = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'string') {
            descriptor += 's';
        } else {
            descriptor += 'i';
        }
    }

    buf.pjstr(descriptor);

    for (let i: number = 0; i < args.length; i++) {
        if (typeof args[i] === 'string') {
            buf.pjstr(args[i] as string);
        } else {
            buf.p4(args[i] as number);
        }
    }

    buf.p4(scriptId);
    return buf;
};

ServerProt.UPDATE_REBOOT_TIMER.encode = function(ticks: number): Packet {
    const buf: Packet = new Packet();
    buf.p2(ticks);
    return buf;
};

ServerProt.WORLDLIST_FETCH_REPLY.encode = function(id: number, value: number): Packet {
    const buf: Packet = new Packet();
    // has update
    buf.pbool(true);

    // status
    buf.p1(2); // leftover from loginprot days?

    // full update
    /// world list
    const worldList: Packet = new Packet();
    worldList.pSmart1or2(1); // # of locations

    /// location 1
    worldList.pSmart1or2(0); // country code
    worldList.pjstr2('United States');

    worldList.pSmart1or2(1); // min ID
    worldList.pSmart1or2(1); // max ID
    worldList.pSmart1or2(1); // size

    /// world 1
    worldList.pSmart1or2(0); // world index
    worldList.p1(0); // location
    worldList.p4(0); // flags
    worldList.pSmart1or2(0); // unknown, truthy = read string
    worldList.pjstr2(''); // activity
    worldList.pjstr2('localhost'); // hostname

    buf.pbool(true);
    buf.pdata(worldList);
    buf.p4(Packet.getcrc(worldList));

    // partial update
    /// world 1
    buf.pSmart1or2(0); // world index
    buf.p2(0); // players
    return buf;
};

ServerProt.REBUILD_NORMAL.encode = function(player: Player, level: number, absX: number, absZ: number, buildAreaSize: BuildAreaSize, forceRebuild: boolean = true, nearbyPlayers: boolean = false): Packet {
    const buf: Packet = new Packet();
    if (nearbyPlayers) {
        buf.accessBits();

        const highres: number = ((level & 0x3) << 28) | ((absX & 0x3FFF) << 14) | (absZ & 0x3FFF);
        buf.pBit(30, highres);

        const viewport: Viewport = player.viewport;
        viewport.players[player.pid] = player;
        viewport.high[viewport.highCount++] = player.pid;

        // low-res player info
        for (let i: number = 1; i < 2048; i++) {
            if (i === player.pid) {
                continue;
            }

            // const lowres: number = (0 << 16) | (50 << 16) | 50;
            buf.pBit(18, 0);
            viewport.positions[i] = 0;
            viewport.low[viewport.lowCount++] = i;
        }

        buf.accessBytes();
    }

    const zoneX: number = absX >> 3;
    const zoneZ: number = absZ >> 3;
    const count: number = 9;
    // for (let x: number = (zoneX - (buildAreaSize.size >> 4)) / 8; x <= ((buildAreaSize.size >> 4) + zoneX) / 8; x++) {
    //     for (let z: number = (zoneZ - (buildAreaSize.size >> 4)) / 8; z <= ((buildAreaSize.size >> 4) + zoneZ) / 8; z++) {
    // 		// todo: check if map is valid
    //         count++;
    //     }
    // }

    buf.p2_alt2(zoneZ);
    buf.p1(5); // npc distance (bits)
    buf.p1_alt3(count);
    buf.p1(buildAreaSize.id);
    buf.p2_alt2(zoneX);
    buf.p1_alt3(forceRebuild ? 1 : 0);
    return buf;
};

ServerProt.PLAYER_INFO.encode = function(player: Player): Packet {
    function putSkip(buf: Packet, amount: number): number {
        if (amount === -1) {
            return amount;
        }
        buf.pBit(1, 0); // has no update
        if (amount === 0) {
            buf.pBit(2, 0);
        } else if (amount < 32) {
            buf.pBit(2, 1);
            buf.pBit(5, amount);
        } else if (amount < 256) {
            buf.pBit(2, 2);
            buf.pBit(8, amount);
        } else if (amount < 2048) {
            buf.pBit(2, 3);
            buf.pBit(11, amount);
        }
        return -1;
    }

    function position(buf: Packet, viewport: Viewport, other: Player, index: number): void {
        const current: number = viewport.positions[index];
        const next: number = 0 << 18 | (other.level << 16) | (other.x >> 6 << 8) | other.x >> 6; // TODO
        const update = current !== next;
        buf.pBit(1, update ? 1 : 0);
        if (update) {
            const cs: number = current >> 18;
            const cp: number = current >> 16;
            const cx: number = current >> 8;
            const cz: number = current & 0xff;

            const ns: number = next >> 18;
            const np: number = next >> 16;
            const nx: number = next >> 8;
            const nz: number = next & 0xff;

            const dl: number = np - cp;
            const dx: number = nx - cx;
            const dz: number = nz - cz;
            const ds: number = ns - cs;

            if (cx == nx && cz == nz) {
                buf.pBit(2, 1);
                buf.pBit(2, dl);
            } else if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) {
                let direction: number;
                if (dx == -1 && dz == -1) {
                    direction = 0;
                } else if (dx == 1 && dz == -1) {
                    direction = 2;
                } else if (dx == -1 && dz == 1) {
                    direction = 5;
                } else if (dx == 1 && dz == 1) {
                    direction = 7;
                } else if (dz == -1) {
                    direction = 1;
                } else if (dx == -1) {
                    direction = 3;
                } else if (dx == 1) {
                    direction = 4;
                } else {
                    direction = 6;
                }
                buf.pBit(2, 2);
                buf.pBit(5, ((dl & 0x3) << 3) + (direction & 0x7));
            } else {
                buf.pBit(2, 3);
                buf.pBit(20, ((ds & 0x3) << 18) | ((dl & 0x3) << 16) | ((dx & 0xff) << 8) | (dz & 0xff));
            }
        }
    }

    function highPlayer(buf: Packet, viewport: Viewport, other: Player, index: number): void {
        buf.pBit(1, 1); // updating
        buf.pBit(2, 0);
        viewport.updates.add(other.pid);
    }

    function high(buf: Packet, viewport: Viewport, nsn: boolean = true): void {
        buf.accessBits();
        let skip: number = -1;
        for (let i: number = 0; i < viewport.highCount; i++) {
            const index: number = viewport.high[i];
            if (nsn === ((0x1 & viewport.nsnFlags[index]) !== 0)) {
                continue;
            }
            const other: Player | undefined = viewport.players[index];
            if (!other) {
                viewport.nsnFlags[index] |= 0x2;
                skip++;
                continue;
            }
            const updating: boolean = true; // TODO just forcing for appearance
            if (!updating) {
                viewport.nsnFlags[index] |= 0x2;
                skip++;
                continue;
            }
            skip = putSkip(buf, skip);
            buf.pBit(1, 1); // do not skip
            highPlayer(buf, viewport, other, index);
        }
        putSkip(buf, skip);
        buf.accessBytes();
        if (nsn) {
            high(buf, viewport, false);
        }
    }

    function lowPlayer(buf: Packet, viewport: Viewport, other: Player, index: number): void {
        buf.pBit(2, 0);
        position(buf, viewport, other, index);
        buf.pBit(6, other.x & 0x3f);
        buf.pBit(6, other.z & 0x3f);
        buf.pBit(1, 1);
        viewport.players[other.pid] = other;
        viewport.nsnFlags[index] |= 0x2;
        viewport.updates.add(other.pid);
    }

    function low(buf: Packet, viewport: Viewport, nsn: boolean = true): void {
        buf.accessBits();
        let skip: number = -1;
        for (let i: number = 0; i < viewport.lowCount; i++) {
            const index: number = viewport.low[i];
            if (nsn === ((0x1 & viewport.nsnFlags[index]) === 0)) {
                continue;
            }
            const other: Player | undefined = viewport.players[index];
            if (!other) {
                viewport.nsnFlags[index] |= 0x2;
                skip++;
                continue;
            }
            const updating: boolean = false;
            if (!updating) {
                viewport.nsnFlags[index] |= 0x2;
                skip++;
                continue;
            }
            skip = putSkip(buf, skip);
            buf.pBit(1, 1); // do not skip
            // low block is just used to transfer to high block
            // local player does not count.
            lowPlayer(buf, viewport, other, index);
        }
        putSkip(buf, skip);
        buf.accessBytes();
        if (nsn) {
            low(buf, viewport, false);
        }
    }

    const viewport: Viewport = player.viewport;

    // bits
    const buf: Packet = new Packet();
    high(buf, viewport);
    low(buf, viewport);

    // bytes
    const block: Packet = new Packet();
    for (const pid of viewport.updates) {
        let mask: number = 0;
        mask |= 0x4; // appearance

        block.p2(0); // unused
        block.p1(mask);
        if ((mask & 0x40) !== 0) {
            block.p1(mask >> 8);
        }
        if ((mask & 0x1000) !== 0) {
            block.p1(mask >> 16);
        }

        const appearance: Packet = new Packet();
        appearance.p1(0); // info
        appearance.p1(0); // visible
        // wearpos defaults
        appearance.p2(0);
        appearance.p2(0);
        appearance.p2(0);
        appearance.p2(0);
        // 2004scape values
        appearance.p2(18 | 0x100); // index 2 (body)
        appearance.p2(26 | 0x100); // index 3 (arms)
        appearance.p2(36 | 0x100); // index 5 (legs)
        appearance.p2(0 | 0x100); // index 0 (hair)
        appearance.p2(33 | 0x100); // index 4 (gloves)
        appearance.p2(42 | 0x100); // index 6 (boots)
        appearance.p2(10 | 0x100); // index 1 (beard)
        appearance.p2(0);
        appearance.p1(0);
        for (let index: number = 0; index < 10; index++) {
            appearance.p1(0);
        }
        for (let index: number = 0; index < 10; index++) {
            appearance.p1(0);
        }
        appearance.p2(2699); // bas // 2688
        appearance.pjstr('2004Scape'); // name
        appearance.p1(138); // combat lvl
        appearance.p1(0); // idk
        appearance.p1(0);
        appearance.p1(0); // bgsound

        block.p1_alt1(appearance.pos);
        block.pdata_alt2(appearance.data, 0, appearance.pos);
    }
    buf.pdata(block);

    viewport.reset();
    return buf;
};
