import Packet from '#jagex/bytepacking/Packet.js';

export default class ClientProt {

    static readonly MAP_BUILD_STUCK = new ClientProt(0, 15, 'MAP_BUILD_STUCK');
    static readonly RESUME_P_HSLDIALOG = new ClientProt(1, 2, 'RESUME_P_HSLDIALOG');
    static readonly OPNPC5 = new ClientProt(2, 3, 'OPNPC5');
    static readonly RESUME_P_STRINGDIALOG = new ClientProt(3, -1, 'RESUME_P_STRINGDIALOG');
    static readonly OPPLAYER6 = new ClientProt(4, 3, 'OPPLAYER6');
    static readonly EVENT_NATIVE_MOUSE_MOVE = new ClientProt(5, -1, 'EVENT_NATIVE_MOUSE_MOVE');
    static readonly OPPLAYER9 = new ClientProt(6, 3, 'OPPLAYER9');
    static readonly MESSAGE_PRIVATE = new ClientProt(7, -2, 'MESSAGE_PRIVATE');
    static readonly AFFINEDCLANSETTINGS_ADDBANNED_FROMCHANNEL = new ClientProt(8, -1, 'AFFINEDCLANSETTINGS_ADDBANNED_FROMCHANNEL');
    static readonly CLIENT_DETAILOPTIONS_STATUS = new ClientProt(9, -1, 'CLIENT_DETAILOPTIONS_STATUS');
    static readonly RESUME_P_COUNTDIALOG = new ClientProt(10, 4, 'RESUME_P_COUNTDIALOG');
    static readonly SEND_SNAPSHOT = new ClientProt(11, -1, 'SEND_SNAPSHOT');
    static readonly OPLOC1 = new ClientProt(12, 9, 'OPLOC1');
    static readonly IGNORELIST_ADD = new ClientProt(13, -1, 'IGNORELIST_ADD');
    static readonly SOUND_SONGEND = new ClientProt(14, 4, 'SOUND_SONGEND');
    static readonly field3697 = new ClientProt(15, 9);
    static readonly OPOBJ5 = new ClientProt(16, 7, 'OPOBJ5');
    static readonly MESSAGE_QUICKCHAT_PUBLIC = new ClientProt(17, -1, 'MESSAGE_QUICKCHAT_PUBLIC');
    static readonly CLICKWORLDMAP = new ClientProt(18, 4, 'CLICKWORLDMAP');
    static readonly field3701 = new ClientProt(19, 1);
    static readonly CREATE_ACCOUNT = new ClientProt(20, -2, 'CREATE_ACCOUNT');
    static readonly OPLOCT = new ClientProt(21, 17, 'OPLOCT');
    static readonly TRANSMITVAR_VERIFYID = new ClientProt(22, 4, 'TRANSMITVAR_VERIFYID');
    static readonly REFLECTION_CHECK_REPLY = new ClientProt(23, -1, 'REFLECTION_CHECK_REPLY');
    static readonly NATIVE_LIBRARY_FAILURE = new ClientProt(24, -1, 'NATIVE_LIBRARY_FAILURE');
    static readonly OPOBJ2 = new ClientProt(25, 7, 'OPOBJ2');
    static readonly OPOBJ3 = new ClientProt(26, 7, 'OPOBJ3');
    static readonly OPLOC3 = new ClientProt(27, 9, 'OPLOC3');
    static readonly CREATE_CHECK_EMAIL = new ClientProt(28, -2, 'CREATE_CHECK_EMAIL');
    static readonly IF_BUTTON4 = new ClientProt(29, 8, 'IF_BUTTON4');
    static readonly SOUND_SONGPRELOADED = new ClientProt(30, 4, 'SOUND_SONGPRELOADED');
    static readonly OPNPC4 = new ClientProt(31, 3, 'OPNPC4');
    static readonly CLAN_KICKUSER = new ClientProt(32, -1, 'CLAN_KICKUSER');
    static readonly MOVE_GAMECLICK = new ClientProt(33, 5, 'MOVE_GAMECLICK');
    static readonly CHANGE_EMAIL_ADDRESS = new ClientProt(34, -2, 'CHANGE_EMAIL_ADDRESS');
    static readonly FRIENDLIST_DEL = new ClientProt(35, -1, 'FRIENDLIST_DEL');
    static readonly OPNPC6 = new ClientProt(36, 3, 'OPNPC6');
    static readonly EVENT_CAMERA_POSITION = new ClientProt(37, 4, 'EVENT_CAMERA_POSITION');
    static readonly field3797 = new ClientProt(38, -2);
    static readonly OPLOC6 = new ClientProt(39, 9, 'OPLOC6');
    static readonly CUTSCENE_FINISHED = new ClientProt(40, 1, 'CUTSCENE_FINISHED');
    static readonly OPPLAYERT = new ClientProt(41, 11, 'OPPLAYERT');
    static readonly IGNORE_SETNOTES = new ClientProt(42, -1, 'IGNORE_SETNOTES');
    static readonly field3753 = new ClientProt(43, 1);
    static readonly CHAT_SETMODE = new ClientProt(44, 1, 'CHAT_SETMODE');
    static readonly EVENT_MOUSE_CLICK = new ClientProt(45, 6, 'EVENT_MOUSE_CLICK');
    static readonly field3700 = new ClientProt(46, -2);
    static readonly IGNORELIST_DEL = new ClientProt(47, -1, 'IGNORELIST_DEL');
    static readonly OPPLAYER8 = new ClientProt(48, 3, 'OPPLAYER8');
    static readonly OPPLAYER5 = new ClientProt(49, 3, 'OPPLAYER5');
    static readonly IF_BUTTON8 = new ClientProt(50, 8, 'IF_BUTTON8');
    static readonly OPNPC1 = new ClientProt(51, 3, 'OPNPC1');
    static readonly AFFINEDCLANSETTINGS_SETMUTED_FROMCHANNEL = new ClientProt(52, -1, 'AFFINEDCLANSETTINGS_SETMUTED_FROMCHANNEL');
    static readonly SIMPLE_TOOLKIT_CHANGE = new ClientProt(53, 1, 'SIMPLE_TOOLKIT_CHANGE');
    static readonly OPPLAYER7 = new ClientProt(54, 3, 'OPPLAYER7');
    static readonly DIRECTX_FAILURE = new ClientProt(55, 2, 'DIRECTX_FAILURE');
    static readonly OPNPC2 = new ClientProt(56, 3, 'OPNPC2');
    static readonly CLOSE_MODAL = new ClientProt(57, 0, 'CLOSE_MODAL');
    static readonly IF_BUTTONT = new ClientProt(58, 16, 'IF_BUTTONT');
    static readonly APCOORDT = new ClientProt(59, 12, 'APCOORDT');
    static readonly SEND_EMAIL_VALIDATION_CODE = new ClientProt(60, -1, 'SEND_EMAIL_VALIDATION_CODE');
    static readonly OPLOC4 = new ClientProt(61, 9, 'OPLOC4');
    static readonly OPPLAYER2 = new ClientProt(62, 3, 'OPPLAYER2');
    static readonly IF_BUTTON7 = new ClientProt(63, 8, 'IF_BUTTON7');
    static readonly ADD_NEW_EMAIL_ADDRESS = new ClientProt(64, -2, 'ADD_NEW_EMAIL_ADDRESS');
    static readonly CREATE_CHECK_NAME = new ClientProt(65, -1, 'CREATE_CHECK_NAME');
    static readonly IF_BUTTON9 = new ClientProt(66, 8, 'IF_BUTTON9');
    static readonly IF_BUTTON10 = new ClientProt(67, 8, 'IF_BUTTON10');
    static readonly IF_BUTTON2 = new ClientProt(68, 8, 'IF_BUTTON2');
    static readonly CREATE_SUGGEST_NAMES = new ClientProt(69, 0, 'CREATE_SUGGEST_NAMES');
    static readonly IF_BUTTON5 = new ClientProt(70, 8, 'IF_BUTTON5');
    static readonly STORE_SERVERPERM_VARCS = new ClientProt(71, -2, 'STORE_SERVERPERM_VARCS');
    static readonly EVENT_NATIVE_MOUSE_CLICK = new ClientProt(72, 7, 'EVENT_NATIVE_MOUSE_CLICK');
    static readonly FRIEND_SETRANK = new ClientProt(73, -1, 'FRIEND_SETRANK');
    static readonly PING_STATISTICS = new ClientProt(74, 4, 'PING_STATISTICS');
    static readonly FRIEND_SETNOTES = new ClientProt(75, -1, 'FRIEND_SETNOTES');
    static readonly OPPLAYER3 = new ClientProt(76, 3, 'OPPLAYER3');
    static readonly WORLDLIST_FETCH = new ClientProt(77, 4, 'WORLDLIST_FETCH');
    static readonly MOVE_MINIMAPCLICK = new ClientProt(78, 18, 'MOVE_MINIMAPCLICK');
    static readonly MAP_BUILD_COMPLETE = new ClientProt(79, 4, 'MAP_BUILD_COMPLETE');
    static readonly field3762 = new ClientProt(80, 0);
    static readonly OPOBJ1 = new ClientProt(81, 7, 'OPOBJ1');
    static readonly UID_PASSPORT_RESEND_REQUEST = new ClientProt(82, 0, 'UID_PASSPORT_RESEND_REQUEST');
    static readonly IF_BUTTON6 = new ClientProt(83, 8, 'IF_BUTTON6');
    static readonly CLIENT_CHEAT = new ClientProt(84, -1, 'CLIENT_CHEAT');
    static readonly FRIENDLIST_ADD = new ClientProt(85, -1, 'FRIENDLIST_ADD');
    static readonly IF_BUTTON3 = new ClientProt(86, 8, 'IF_BUTTON3');
    static readonly EVENT_KEYBOARD = new ClientProt(87, -2, 'EVENT_KEYBOARD');
    static readonly SET_CHATFILTERSETTINGS = new ClientProt(88, 3, 'SET_CHATFILTERSETTINGS');
    static readonly MOVE_SCRIPTED = new ClientProt(89, 5, 'MOVE_SCRIPTED');
    static readonly DETECT_MODIFIED_CLIENT = new ClientProt(90, 4, 'DETECT_MODIFIED_CLIENT');
    static readonly OPPLAYER10 = new ClientProt(91, 3, 'OPPLAYER10');
    static readonly CLAN_JOINCHAT_LEAVECHAT = new ClientProt(92, -1, 'CLAN_JOINCHAT_LEAVECHAT');
    static readonly EVENT_APPLET_FOCUS = new ClientProt(93, 1, 'EVENT_APPLET_FOCUS');
    static readonly CLANCHANNEL_KICKUSER = new ClientProt(94, -1, 'CLANCHANNEL_KICKUSER');
    static readonly MESSAGE_PUBLIC = new ClientProt(95, -1, 'MESSAGE_PUBLIC');
    static readonly OPLOC2 = new ClientProt(96, 9, 'OPLOC2');
    static readonly EVENT_MOUSE_MOVE = new ClientProt(97, -1, 'EVENT_MOUSE_MOVE');
    static readonly RESUME_PAUSEBUTTON = new ClientProt(98, 6, 'RESUME_PAUSEBUTTON');
    static readonly RESUME_P_OBJDIALOG = new ClientProt(99, 2, 'RESUME_P_OBJDIALOG');
    static readonly SEND_PING_REPLY = new ClientProt(100, 9, 'SEND_PING_REPLY');
    static readonly RESUME_P_NAMEDIALOG = new ClientProt(101, -1, 'RESUME_P_NAMEDIALOG');
    static readonly OPPLAYER4 = new ClientProt(102, 3, 'OPPLAYER4');
    static readonly NO_TIMEOUT = new ClientProt(103, 0, 'NO_TIMEOUT');
    static readonly IF_PLAYER = new ClientProt(104, -1, 'IF_PLAYER');
    static readonly OPOBJ6 = new ClientProt(105, 7, 'OPOBJ6');
    static readonly ABORT_P_DIALOG = new ClientProt(106, 0, 'ABORT_P_DIALOG');
    static readonly FACE_SQUARE = new ClientProt(107, 4, 'FACE_SQUARE');
    static readonly BUG_REPORT = new ClientProt(108, -2, 'BUG_REPORT');
    static readonly CLIENT_COMPRESSEDTEXTUREFORMAT_SUPPORT = new ClientProt(109, -2, 'CLIENT_COMPRESSEDTEXTUREFORMAT_SUPPORT');
    static readonly RESUME_P_CLANFORUMQFCDIALOG = new ClientProt(110, -1, 'RESUME_P_CLANFORUMQFCDIALOG');
    static readonly IF_BUTTON1 = new ClientProt(111, 8, 'IF_BUTTON1');
    static readonly AUTO_SETUP_RESULT = new ClientProt(112, 18, 'AUTO_SETUP_RESULT');
    static readonly OPNPCT = new ClientProt(113, 11, 'OPNPCT');
    static readonly OPOBJT = new ClientProt(114, 15, 'OPOBJT');
    static readonly MESSAGE_QUICKCHAT_PRIVATE = new ClientProt(115, -1, 'MESSAGE_QUICKCHAT_PRIVATE');
    static readonly OPNPC3 = new ClientProt(116, 3, 'OPNPC3');
    static readonly OPPLAYER1 = new ClientProt(117, 3, 'OPPLAYER1');
    static readonly CREATE_LOG_PROGRESS = new ClientProt(118, 1, 'CREATE_LOG_PROGRESS');
    static readonly OPLOC5 = new ClientProt(119, 9, 'OPLOC5');
    static readonly URL_REQUEST = new ClientProt(120, -2, 'URL_REQUEST');
    static readonly OPOBJ4 = new ClientProt(121, 7, 'OPOBJ4');
    static readonly IF_BUTTOND = new ClientProt(122, 16, 'IF_BUTTOND');
    static readonly WINDOW_STATUS = new ClientProt(123, 6, 'WINDOW_STATUS');

    static values(): ClientProt[] {
        return [
            ClientProt.MAP_BUILD_STUCK,
            ClientProt.RESUME_P_HSLDIALOG,
            ClientProt.OPNPC5,
            ClientProt.RESUME_P_STRINGDIALOG,
            ClientProt.OPPLAYER6,
            ClientProt.EVENT_NATIVE_MOUSE_MOVE,
            ClientProt.OPPLAYER9,
            ClientProt.MESSAGE_PRIVATE,
            ClientProt.AFFINEDCLANSETTINGS_ADDBANNED_FROMCHANNEL,
            ClientProt.CLIENT_DETAILOPTIONS_STATUS,
            ClientProt.RESUME_P_COUNTDIALOG,
            ClientProt.SEND_SNAPSHOT,
            ClientProt.OPLOC1,
            ClientProt.IGNORELIST_ADD,
            ClientProt.SOUND_SONGEND,
            ClientProt.field3697,
            ClientProt.OPOBJ5,
            ClientProt.MESSAGE_QUICKCHAT_PUBLIC,
            ClientProt.CLICKWORLDMAP,
            ClientProt.field3701,
            ClientProt.CREATE_ACCOUNT,
            ClientProt.OPLOCT,
            ClientProt.TRANSMITVAR_VERIFYID,
            ClientProt.REFLECTION_CHECK_REPLY,
            ClientProt.NATIVE_LIBRARY_FAILURE,
            ClientProt.OPOBJ2,
            ClientProt.OPOBJ3,
            ClientProt.OPLOC3,
            ClientProt.CREATE_CHECK_EMAIL,
            ClientProt.IF_BUTTON4,
            ClientProt.SOUND_SONGPRELOADED,
            ClientProt.OPNPC4,
            ClientProt.CLAN_KICKUSER,
            ClientProt.MOVE_GAMECLICK,
            ClientProt.CHANGE_EMAIL_ADDRESS,
            ClientProt.FRIENDLIST_DEL,
            ClientProt.OPNPC6,
            ClientProt.EVENT_CAMERA_POSITION,
            ClientProt.field3797,
            ClientProt.OPLOC6,
            ClientProt.CUTSCENE_FINISHED,
            ClientProt.OPPLAYERT,
            ClientProt.IGNORE_SETNOTES,
            ClientProt.field3753,
            ClientProt.CHAT_SETMODE,
            ClientProt.EVENT_MOUSE_CLICK,
            ClientProt.field3700,
            ClientProt.IGNORELIST_DEL,
            ClientProt.OPPLAYER8,
            ClientProt.OPPLAYER5,
            ClientProt.IF_BUTTON8,
            ClientProt.OPNPC1,
            ClientProt.AFFINEDCLANSETTINGS_SETMUTED_FROMCHANNEL,
            ClientProt.SIMPLE_TOOLKIT_CHANGE,
            ClientProt.OPPLAYER7,
            ClientProt.DIRECTX_FAILURE,
            ClientProt.OPNPC2,
            ClientProt.CLOSE_MODAL,
            ClientProt.IF_BUTTONT,
            ClientProt.APCOORDT,
            ClientProt.SEND_EMAIL_VALIDATION_CODE,
            ClientProt.OPLOC4,
            ClientProt.OPPLAYER2,
            ClientProt.IF_BUTTON7,
            ClientProt.ADD_NEW_EMAIL_ADDRESS,
            ClientProt.CREATE_CHECK_NAME,
            ClientProt.IF_BUTTON9,
            ClientProt.IF_BUTTON10,
            ClientProt.IF_BUTTON2,
            ClientProt.CREATE_SUGGEST_NAMES,
            ClientProt.IF_BUTTON5,
            ClientProt.STORE_SERVERPERM_VARCS,
            ClientProt.EVENT_NATIVE_MOUSE_CLICK,
            ClientProt.FRIEND_SETRANK,
            ClientProt.PING_STATISTICS,
            ClientProt.FRIEND_SETNOTES,
            ClientProt.OPPLAYER3,
            ClientProt.WORLDLIST_FETCH,
            ClientProt.MOVE_MINIMAPCLICK,
            ClientProt.MAP_BUILD_COMPLETE,
            ClientProt.field3762,
            ClientProt.OPOBJ1,
            ClientProt.UID_PASSPORT_RESEND_REQUEST,
            ClientProt.IF_BUTTON6,
            ClientProt.CLIENT_CHEAT,
            ClientProt.FRIENDLIST_ADD,
            ClientProt.IF_BUTTON3,
            ClientProt.EVENT_KEYBOARD,
            ClientProt.SET_CHATFILTERSETTINGS,
            ClientProt.MOVE_SCRIPTED,
            ClientProt.DETECT_MODIFIED_CLIENT,
            ClientProt.OPPLAYER10,
            ClientProt.CLAN_JOINCHAT_LEAVECHAT,
            ClientProt.EVENT_APPLET_FOCUS,
            ClientProt.CLANCHANNEL_KICKUSER,
            ClientProt.MESSAGE_PUBLIC,
            ClientProt.OPLOC2,
            ClientProt.EVENT_MOUSE_MOVE,
            ClientProt.RESUME_PAUSEBUTTON,
            ClientProt.RESUME_P_OBJDIALOG,
            ClientProt.SEND_PING_REPLY,
            ClientProt.RESUME_P_NAMEDIALOG,
            ClientProt.OPPLAYER4,
            ClientProt.NO_TIMEOUT,
            ClientProt.IF_PLAYER,
            ClientProt.OPOBJ6,
            ClientProt.ABORT_P_DIALOG,
            ClientProt.FACE_SQUARE,
            ClientProt.BUG_REPORT,
            ClientProt.CLIENT_COMPRESSEDTEXTUREFORMAT_SUPPORT,
            ClientProt.RESUME_P_CLANFORUMQFCDIALOG,
            ClientProt.IF_BUTTON1,
            ClientProt.AUTO_SETUP_RESULT,
            ClientProt.OPNPCT,
            ClientProt.OPOBJT,
            ClientProt.MESSAGE_QUICKCHAT_PRIVATE,
            ClientProt.OPNPC3,
            ClientProt.OPPLAYER1,
            ClientProt.CREATE_LOG_PROGRESS,
            ClientProt.OPLOC5,
            ClientProt.URL_REQUEST,
            ClientProt.OPOBJ4,
            ClientProt.IF_BUTTOND,
            ClientProt.WINDOW_STATUS
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

    decode(buf: Packet): any {
    }

    handle(...args: any): void {
    }
}
