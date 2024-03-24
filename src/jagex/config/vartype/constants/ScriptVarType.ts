import {BaseVarType} from '#jagex/config/vartype/constants/BaseVarType.js';

export default class ScriptVarType {
    public static readonly INT = new ScriptVarType(0, 'int', 'i', BaseVarType.INTEGER, 0);
    public static readonly BOOLEAN = new ScriptVarType(1, 'boolean', '1', BaseVarType.INTEGER, 0);
    public static readonly QUEST = new ScriptVarType(3, 'quest', ':', BaseVarType.INTEGER, -1);
    public static readonly QUESTHELP = new ScriptVarType(4, 'questhelp', ';', BaseVarType.INTEGER, -1);
    public static readonly CURSOR = new ScriptVarType(5, 'cursor', '@', BaseVarType.INTEGER, -1);
    public static readonly SEQ = new ScriptVarType(6, 'seq', 'A', BaseVarType.INTEGER, -1);
    public static readonly COLOUR = new ScriptVarType(7, 'colour', 'C', BaseVarType.INTEGER, -1);
    public static readonly LOC_SHAPE = new ScriptVarType(8, 'locshape', 'H', BaseVarType.INTEGER, -1);
    public static readonly COMPONENT = new ScriptVarType(9, 'component', 'I', BaseVarType.INTEGER, -1);
    public static readonly IDKIT = new ScriptVarType(10, 'idkit', 'K', BaseVarType.INTEGER, -1);
    public static readonly MIDI = new ScriptVarType(11, 'midi', 'M', BaseVarType.INTEGER, -1);
    public static readonly NPC_MODE = new ScriptVarType(12, 'npc_mode', 'N', BaseVarType.INTEGER, -1);
    public static readonly NAMEDOBJ = new ScriptVarType(13, 'namedobj', 'O', BaseVarType.INTEGER, -1);
    public static readonly SYNTH = new ScriptVarType(14, 'synth', 'P', BaseVarType.INTEGER, -1);
    public static readonly AREA = new ScriptVarType(16, 'area', 'R', BaseVarType.INTEGER, -1);
    public static readonly STAT = new ScriptVarType(17, 'stat', 'S', BaseVarType.INTEGER, -1);
    public static readonly NPC_STAT = new ScriptVarType(18, 'npc_stat', 'T', BaseVarType.INTEGER, -1);
    public static readonly WRITEINV = new ScriptVarType(19, 'writeinv', 'V', BaseVarType.INTEGER, -1);
    public static readonly MESH = new ScriptVarType(20, 'mesh', '^', BaseVarType.INTEGER, -1);
    public static readonly MAPAREA = new ScriptVarType(21, 'wma', '`', BaseVarType.INTEGER, -1);
    public static readonly COORDGRID = new ScriptVarType(22, 'coord', 'c', BaseVarType.INTEGER, -1);
    public static readonly GRAPHIC = new ScriptVarType(23, 'graphic', 'd', BaseVarType.INTEGER, -1);
    public static readonly CHATPHRASE = new ScriptVarType(24, 'chatphrase', 'e', BaseVarType.INTEGER, -1);
    public static readonly FONTMETRICS = new ScriptVarType(25, 'fontmetrics', 'f', BaseVarType.INTEGER, -1);
    public static readonly ENUM = new ScriptVarType(26, 'enum', 'g', BaseVarType.INTEGER, -1);
    public static readonly JINGLE = new ScriptVarType(28, 'jingle', 'j', BaseVarType.INTEGER, -1);
    public static readonly CHATCAT = new ScriptVarType(29, 'chatcat', 'k', BaseVarType.INTEGER, -1);
    public static readonly LOC = new ScriptVarType(30, 'loc', 'l', BaseVarType.INTEGER, -1);
    public static readonly MODEL = new ScriptVarType(31, 'model', 'm', BaseVarType.INTEGER, -1);
    public static readonly NPC = new ScriptVarType(32, 'npc', 'n', BaseVarType.INTEGER, -1);
    public static readonly OBJ = new ScriptVarType(33, 'obj', 'o', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_UID = new ScriptVarType(34, 'player_uid', 'p', BaseVarType.INTEGER, -1);
    public static readonly STRING = new ScriptVarType(36, 'string', 's', BaseVarType.STRING, '');
    public static readonly SPOTANIM = new ScriptVarType(37, 'spotanim', 't', BaseVarType.INTEGER, -1);
    public static readonly NPC_UID = new ScriptVarType(38, 'npc_uid', 'u', BaseVarType.INTEGER, -1);
    public static readonly INV = new ScriptVarType(39, 'inv', 'v', BaseVarType.INTEGER, -1);
    public static readonly TEXTURE = new ScriptVarType(40, 'texture', 'x', BaseVarType.INTEGER, -1);
    public static readonly CATEGORY = new ScriptVarType(41, 'category', 'y', BaseVarType.INTEGER, -1);
    public static readonly CHAR = new ScriptVarType(42, 'char', 'z', BaseVarType.INTEGER, -1);
    public static readonly LASER = new ScriptVarType(43, 'laser', '|', BaseVarType.INTEGER, -1);
    public static readonly BAS = new ScriptVarType(44, 'bas', '¬', BaseVarType.INTEGER, -1);
    public static readonly COLLISION_GEOMETRY = new ScriptVarType(46, 'collision_geometry', '!', BaseVarType.INTEGER, -1);
    public static readonly PHYSICS_MODEL = new ScriptVarType(47, 'physics_model', '0', BaseVarType.INTEGER, -1);
    public static readonly PHYSICS_CONTROL_MODIFIER = new ScriptVarType(48, 'physics_control_modifier', '`', BaseVarType.INTEGER, -1);
    public static readonly CLANHASH = new ScriptVarType(49, 'clanhash', 'R', BaseVarType.LONG, -1n);
    public static readonly COORDFINE = new ScriptVarType(50, 'coordfine', '}', BaseVarType.COORDFINE, -1n);
    public static readonly CUTSCENE = new ScriptVarType(51, 'cutscene', 'a', BaseVarType.INTEGER, -1);
    public static readonly ITEMCODE = new ScriptVarType(53, 'itemcode', '¡', BaseVarType.INTEGER, -1);
    public static readonly MAPSCENEICON = new ScriptVarType(55, 'msi', '£', BaseVarType.INTEGER, -1);
    public static readonly CLANFORUMQFC = new ScriptVarType(56, 'clanforumqfc', '§', BaseVarType.LONG, -1n);
    public static readonly VORBIS = new ScriptVarType(57, 'vorbis', '«', BaseVarType.INTEGER, -1);
    public static readonly VERIFY_OBJECT = new ScriptVarType(58, 'verifyobj', '®', BaseVarType.INTEGER, -1);
    public static readonly MAPELEMENT = new ScriptVarType(59, 'mapelement', 'µ', BaseVarType.INTEGER, -1);
    public static readonly CATEGORYTYPE = new ScriptVarType(60, 'categorytype', '¶', BaseVarType.INTEGER, -1);
    public static readonly SOCIAL_NETWORK = new ScriptVarType(61, 'socialnetwork', 'Æ', BaseVarType.INTEGER, -1);
    public static readonly HITMARK = new ScriptVarType(62, 'hitmark', '×', BaseVarType.INTEGER, -1);
    public static readonly PACKAGE = new ScriptVarType(63, 'package', 'Þ', BaseVarType.INTEGER, -1);
    public static readonly PARTICLE_EFFECTOR = new ScriptVarType(64, 'pef', 'á', BaseVarType.INTEGER, -1);
    public static readonly PARTICLE_EMITTER = new ScriptVarType(66, 'pem', 'é', BaseVarType.INTEGER, -1);
    public static readonly PLOGTYPE = new ScriptVarType(67, 'plog', 'í', BaseVarType.INTEGER, -1);
    public static readonly UNSIGNED_INT = new ScriptVarType(68, 'unsigned_int', 'î', BaseVarType.INTEGER, -1);
    public static readonly SKYBOX = new ScriptVarType(69, 'skybox', 'ó', BaseVarType.INTEGER, -1);
    public static readonly SKYDECOR = new ScriptVarType(70, 'skydecor', 'ú', BaseVarType.INTEGER, -1);
    public static readonly HASH64 = new ScriptVarType(71, 'hash64', 'û', BaseVarType.LONG, -1n);
    public static readonly INPUTTYPE = new ScriptVarType(72, 'inputtype', 'Î', BaseVarType.INTEGER, -1);
    public static readonly STRUCT = new ScriptVarType(73, 'struct', 'J', BaseVarType.INTEGER, -1);
    public static readonly DBROW = new ScriptVarType(74, 'dbrow', 'Ð', BaseVarType.INTEGER, -1);
    public static readonly TYPE_75 = new ScriptVarType(75, 'type_75', '¤', BaseVarType.INTEGER, -1);
    public static readonly TYPE_76 = new ScriptVarType(76, 'type_76', '¥', BaseVarType.INTEGER, -1);
    public static readonly GWC_PLATFORM = new ScriptVarType(89, 'gwc_platform', 'ò', BaseVarType.INTEGER, -1);
    public static readonly BUG_TEMPLATE = new ScriptVarType(94, 'bugtemplate', 'ê', BaseVarType.INTEGER, -1);
    public static readonly BILLING_AUTH_FLAG = new ScriptVarType(95, 'billingauthflag', 'ð', BaseVarType.INTEGER, -1);
    public static readonly ACCOUNT_FEATURE_FLAG = new ScriptVarType(96, 'accountfeatureflag', 'å', BaseVarType.INTEGER, -1);
    public static readonly INTERFACE = new ScriptVarType(97, 'interface', 'a', BaseVarType.INTEGER, -1);
    public static readonly TOPLEVELINTERFACE = new ScriptVarType(98, 'toplevelinterface', 'F', BaseVarType.INTEGER, -1);
    public static readonly OVERLAYINTERFACE = new ScriptVarType(99, 'overlayinterface', 'L', BaseVarType.INTEGER, -1);
    public static readonly CLIENTINTERFACE = new ScriptVarType(100, 'clientinterface', '©', BaseVarType.INTEGER, -1);
    public static readonly MOVESPEED = new ScriptVarType(101, 'movespeed', 'Ý', BaseVarType.INTEGER, -1);
    public static readonly MATERIAL = new ScriptVarType(102, 'material', '¬', BaseVarType.INTEGER, -1);
    public static readonly SEQGROUP = new ScriptVarType(103, 'seqgroup', 'ø', BaseVarType.INTEGER, -1);
    public static readonly TEMP_HISCORE = new ScriptVarType(104, 'temphiscore', 'ä', BaseVarType.INTEGER, -1);
    public static readonly TEMP_HISCORE_LENGTH_TYPE = new ScriptVarType(105, 'temphiscorelengthtype', 'ã', BaseVarType.INTEGER, -1);
    public static readonly TEMP_HISCORE_DISPLAY_TYPE = new ScriptVarType(106, 'temphiscoretype', 'â', BaseVarType.INTEGER, -1);
    public static readonly TEMP_HISCORE_CONTRIBUTE_RESULT = new ScriptVarType(107, 'temphiscorecontributeresult', 'à', BaseVarType.INTEGER, -1);
    public static readonly AUDIOGROUP = new ScriptVarType(108, 'audiogroup', 'À', BaseVarType.INTEGER, -1);
    public static readonly AUDIOMIXBUSS = new ScriptVarType(109, 'audiobuss', 'Ò', BaseVarType.INTEGER, -1);
    public static readonly LONG = new ScriptVarType(110, 'long', 'Ï', BaseVarType.LONG, 0n);
    public static readonly CRM_CHANNEL = new ScriptVarType(111, 'crm_channel', 'Ì', BaseVarType.INTEGER, -1);
    public static readonly HTTP_IMAGE = new ScriptVarType(112, 'http_image', 'É', BaseVarType.INTEGER, -1);
    public static readonly POP_UP_DISPLAY_BEHAVIOUR = new ScriptVarType(113, 'popupdisplaybehaviour', 'Ê', BaseVarType.INTEGER, -1);
    public static readonly POLL = new ScriptVarType(114, 'poll', '÷', BaseVarType.INTEGER, -1);
    public static readonly POINTLIGHT = new ScriptVarType(117, 'pointlight', '"', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_GROUP = new ScriptVarType(118, 'player_group', 'Â', BaseVarType.LONG, -1n);
    public static readonly PLAYER_GROUP_STATUS = new ScriptVarType(119, 'player_group_status', 'Ã', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_GROUP_INVITE_RESULT = new ScriptVarType(120, 'player_group_invite_result', 'Å', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_GROUP_MODIFY_RESULT = new ScriptVarType(121, 'player_group_modify_result', 'Ë', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_GROUP_JOIN_OR_CREATE_RESULT = new ScriptVarType(122, 'player_group_join_or_create_result', 'Í', BaseVarType.INTEGER, -1);
    public static readonly PLAEYR_GROUP_AFFINITY_MODIFY_RESULT = new ScriptVarType(123, 'plaeyr_group_affinity_modify_result', 'Õ', BaseVarType.INTEGER, -1);
    public static readonly PLAYER_GROUP_DELTA_TYPE = new ScriptVarType(124, 'player_group_delta_type', '²', BaseVarType.INTEGER, -1);
    public static readonly CLIENT_TYPE = new ScriptVarType(125, 'client_type', 'ª', BaseVarType.INTEGER, -1);
    public static readonly TELEMETRY_INTERVAL = new ScriptVarType(126, 'telemetry_interval', null, BaseVarType.INTEGER, 0);

    private static varByLegacyChar: ScriptVarType[] = [];

    public readonly id: number;

    public readonly name: string;

    public readonly legacyChar: number;

    public readonly baseType: BaseVarType;

    public readonly defaultValue: number | string | bigint;

    constructor(id: number, name: string, legacyChar: string | null, baseType: BaseVarType, defaultValue: number | string | bigint) {
        this.id = id;
        this.name = name;
        this.legacyChar = typeof legacyChar === 'string' ? legacyChar.charCodeAt(0) : 0;
        this.baseType = baseType;
        this.defaultValue = defaultValue;
        if (this.legacyChar !== 0) {
            if (ScriptVarType.varByLegacyChar === undefined) {
                ScriptVarType.varByLegacyChar = [];
            }
            ScriptVarType.varByLegacyChar[this.legacyChar] = this;
        }
    }

    static of(id: number): ScriptVarType {
        for (const value of this.values()) {
            if (value.id == id) {
                return value;
            }
        }
        throw new Error(`Unknown type id: ${id}`);
    }

    static getByLegacyChar(char: number): ScriptVarType | null {
        const type: ScriptVarType = this.varByLegacyChar[char & 0xFF];
        if (type === undefined) {
            throw new Error(`Unknown legacy char code: ${char}`);
        }
        return type;
    }

    static values(): ScriptVarType[] {
        return [
            this.INT,
            this.BOOLEAN,
            this.QUEST,
            this.QUESTHELP,
            this.CURSOR,
            this.SEQ,
            this.COLOUR,
            this.LOC_SHAPE,
            this.COMPONENT,
            this.IDKIT,
            this.MIDI,
            this.NPC_MODE,
            this.NAMEDOBJ,
            this.SYNTH,
            this.AREA,
            this.STAT,
            this.NPC_STAT,
            this.WRITEINV,
            this.MESH,
            this.MAPAREA,
            this.COORDGRID,
            this.GRAPHIC,
            this.CHATPHRASE,
            this.FONTMETRICS,
            this.ENUM,
            this.JINGLE,
            this.CHATCAT,
            this.LOC,
            this.MODEL,
            this.NPC,
            this.OBJ,
            this.PLAYER_UID,
            this.STRING,
            this.SPOTANIM,
            this.NPC_UID,
            this.INV,
            this.TEXTURE,
            this.CATEGORY,
            this.CHAR,
            this.LASER,
            this.BAS,
            this.COLLISION_GEOMETRY,
            this.PHYSICS_MODEL,
            this.PHYSICS_CONTROL_MODIFIER,
            this.CLANHASH,
            this.COORDFINE,
            this.CUTSCENE,
            this.ITEMCODE,
            this.MAPSCENEICON,
            this.CLANFORUMQFC,
            this.VORBIS,
            this.VERIFY_OBJECT,
            this.MAPELEMENT,
            this.CATEGORYTYPE,
            this.SOCIAL_NETWORK,
            this.HITMARK,
            this.PACKAGE,
            this.PARTICLE_EFFECTOR,
            this.PARTICLE_EMITTER,
            this.PLOGTYPE,
            this.UNSIGNED_INT,
            this.SKYBOX,
            this.SKYDECOR,
            this.HASH64,
            this.INPUTTYPE,
            this.STRUCT,
            this.DBROW,
            this.TYPE_75,
            this.TYPE_76,
            this.GWC_PLATFORM,
            this.BUG_TEMPLATE,
            this.BILLING_AUTH_FLAG,
            this.ACCOUNT_FEATURE_FLAG,
            this.INTERFACE,
            this.TOPLEVELINTERFACE,
            this.OVERLAYINTERFACE,
            this.CLIENTINTERFACE,
            this.MOVESPEED,
            this.MATERIAL,
            this.SEQGROUP,
            this.TEMP_HISCORE,
            this.TEMP_HISCORE_LENGTH_TYPE,
            this.TEMP_HISCORE_DISPLAY_TYPE,
            this.TEMP_HISCORE_CONTRIBUTE_RESULT,
            this.AUDIOGROUP,
            this.AUDIOMIXBUSS,
            this.LONG,
            this.CRM_CHANNEL,
            this.HTTP_IMAGE,
            this.POP_UP_DISPLAY_BEHAVIOUR,
            this.POLL,
            this.POINTLIGHT,
            this.PLAYER_GROUP,
            this.PLAYER_GROUP_STATUS,
            this.PLAYER_GROUP_INVITE_RESULT,
            this.PLAYER_GROUP_MODIFY_RESULT,
            this.PLAYER_GROUP_JOIN_OR_CREATE_RESULT,
            this.PLAEYR_GROUP_AFFINITY_MODIFY_RESULT,
            this.PLAYER_GROUP_DELTA_TYPE,
            this.CLIENT_TYPE,
            this.TELEMETRY_INTERVAL,
        ];
    }
}