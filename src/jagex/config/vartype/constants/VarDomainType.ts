import Js5ConfigGroup from '#jagex/config/Js5ConfigGroup.js';

export default class VarDomainType {
    public static readonly PLAYER: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_PLAYER, 0, 'player');
    public static readonly NPC: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_NPC, 1, 'npc');
    public static readonly CLIENT: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_CLIENT, 2, 'client');
    public static readonly WORLD: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_WORLD, 3, 'world');
    public static readonly REGION: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_REGION, 4, 'region');
    public static readonly OBJECT: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_OBJECT, 5, 'object');
    public static readonly CLAN: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_CLAN, 6, 'clan');
    public static readonly CLAN_SETTING: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_CLAN_SETTING, 7, 'clan_setting');
    public static readonly CONTROLLER: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_CONTROLLER, 8, 'controller');
    public static readonly PLAYER_GROUP: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_PLAYER_GROUP, 9, 'player_group');
    public static readonly GLOBAL: VarDomainType = new VarDomainType(Js5ConfigGroup.VAR_GLOBAL, 10, 'global');

    public readonly js5GroupId: Js5ConfigGroup;
    public readonly id: number;
    public readonly name: string;

    constructor(js5GroupId: Js5ConfigGroup, id: number, name: string) {
        this.js5GroupId = js5GroupId;
        this.id = id;
        this.name = name;
    }

    static of(id: number): VarDomainType {
        for (const type of this.values()) {
            if (type.id === id) {
                return type;
            }
        }
        throw new Error(`Unknown type id: ${id}`);
    }

    static values(): VarDomainType[] {
        return [
            this.PLAYER,
            this.NPC,
            this.CLIENT,
            this.WORLD,
            this.REGION,
            this.OBJECT,
            this.CLAN,
            this.CLAN_SETTING,
            this.CONTROLLER,
            this.PLAYER_GROUP,
            this.GLOBAL,
        ];
    }
}