export default class Js5ConfigGroup {

    static readonly FLUTYPE = new Js5ConfigGroup(1);
    static readonly HUNTTYPE = new Js5ConfigGroup(2);
    static readonly IDKTYPE = new Js5ConfigGroup(3);
    static readonly FLOTYPE = new Js5ConfigGroup(4);
    static readonly INVTYPE = new Js5ConfigGroup(5);
    static readonly LOCTYPE = new Js5ConfigGroup(6, 8);
    static readonly MESANIMTYPE = new Js5ConfigGroup(7);
    static readonly ENUMTYPE = new Js5ConfigGroup(8, 8);
    static readonly NPCTYPE = new Js5ConfigGroup(9, 7);
    static readonly OBJTYPE = new Js5ConfigGroup(10, 8);
    static readonly PARAMTYPE = new Js5ConfigGroup(11);
    static readonly SEQTYPE = new Js5ConfigGroup(12, 7);
    static readonly SPOTTYPE = new Js5ConfigGroup(13, 8);
    static readonly field8001 = new Js5ConfigGroup(14, 10);
    static readonly field7987 = new Js5ConfigGroup(15);
    static readonly field7988 = new Js5ConfigGroup(16);
    static readonly field7978 = new Js5ConfigGroup(17);
    static readonly AREATYPE = new Js5ConfigGroup(18);
    static readonly field7991 = new Js5ConfigGroup(19);
    static readonly field7973 = new Js5ConfigGroup(20);
    static readonly field7993 = new Js5ConfigGroup(21);
    static readonly field8025 = new Js5ConfigGroup(22);
    static readonly field7995 = new Js5ConfigGroup(23);
    static readonly field8003 = new Js5ConfigGroup(24);
    static readonly field7996 = new Js5ConfigGroup(25);
    static readonly STRUCTTYPE = new Js5ConfigGroup(26, 5);
    static readonly CHATPHRASETYPE = new Js5ConfigGroup(27);
    static readonly CHATCATTYPE = new Js5ConfigGroup(28);
    static readonly SKYBOXTYPE = new Js5ConfigGroup(29);
    static readonly SKYDECORTYPE = new Js5ConfigGroup(30);
    static readonly LIGHTTYPE = new Js5ConfigGroup(31);
    static readonly BASTYPE = new Js5ConfigGroup(32);
    static readonly CURSORTYPE = new Js5ConfigGroup(33);
    static readonly MSITYPE = new Js5ConfigGroup(34);
    static readonly QUESTTYPE = new Js5ConfigGroup(35);
    static readonly MELTYPE = new Js5ConfigGroup(36);
    static readonly field8041 = new Js5ConfigGroup(37);
    static readonly field8010 = new Js5ConfigGroup(38);
    static readonly field8011 = new Js5ConfigGroup(39);
    static readonly DBTABLETYPE = new Js5ConfigGroup(40);
    static readonly DBROWTYPE = new Js5ConfigGroup(41);
    static readonly CONTROLLERTYPE = new Js5ConfigGroup(42);
    static readonly field8015 = new Js5ConfigGroup(43);
    static readonly field8016 = new Js5ConfigGroup(44);
    static readonly field8017 = new Js5ConfigGroup(45);
    static readonly HITMARKTYPE = new Js5ConfigGroup(46);
    static readonly VARCLAN = new Js5ConfigGroup(47);
    static readonly ITEMCODETYPE = new Js5ConfigGroup(48);
    static readonly CATEGORYTYPE = new Js5ConfigGroup(49);
    static readonly field8022 = new Js5ConfigGroup(50);
    static readonly field8023 = new Js5ConfigGroup(51);
    static readonly field8024 = new Js5ConfigGroup(53);
    static readonly field8032 = new Js5ConfigGroup(54);
    static readonly VAR_PLAYER = new Js5ConfigGroup(60);
    static readonly VAR_NPC = new Js5ConfigGroup(61);
    static readonly VAR_CLIENT = new Js5ConfigGroup(62);
    static readonly VAR_WORLD = new Js5ConfigGroup(63);
    static readonly VAR_REGION = new Js5ConfigGroup(64);
    static readonly VAR_OBJECT = new Js5ConfigGroup(65);
    static readonly VAR_CLAN = new Js5ConfigGroup(66);
    static readonly VAR_CLAN_SETTING = new Js5ConfigGroup(67);
    static readonly VAR_CONTROLLER = new Js5ConfigGroup(68);
    static readonly VAR_BIT = new Js5ConfigGroup(69);
    static readonly GAMELOGEVENT = new Js5ConfigGroup(70);
    static readonly HEADBARTYPE = new Js5ConfigGroup(72);
    static readonly field8045 = new Js5ConfigGroup(73);
    static readonly field8039 = new Js5ConfigGroup(74);
    static readonly VAR_GLOBAL = new Js5ConfigGroup(75);
    static readonly WATERTYPE = new Js5ConfigGroup(76);
    static readonly SEQGROUPTYPE = new Js5ConfigGroup(77);
    static readonly field8009 = new Js5ConfigGroup(78);
    static readonly field8044 = new Js5ConfigGroup(79);
    static readonly VAR_PLAYER_GROUP = new Js5ConfigGroup(80);
    static readonly field8004 = new Js5ConfigGroup(81);
    static readonly field8047 = new Js5ConfigGroup(82);
    static readonly WORLDAREATYPE = new Js5ConfigGroup(83);
    static readonly field7997 = new Js5ConfigGroup(84);

    readonly id: number;
    readonly groupSizeInBits: number;

    constructor(id: number, bits: number = 0) {
        this.id = id;
        this.groupSizeInBits = bits;
    }

    getGroupSize(): number {
        return 0x1 << this.groupSizeInBits;
    }

    getGroupId(id: number): number {
        return id >>> this.groupSizeInBits;
    }

    getFileId(id: number): number {
        return id & (0x1 << this.groupSizeInBits) - 1;
    }
}
