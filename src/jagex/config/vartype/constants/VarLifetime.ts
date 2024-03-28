export default class VarLifetime {
    public static readonly TEMPORARY = new VarLifetime(0);
    public static readonly PERMANENT = new VarLifetime(1);
    public static readonly SERVER_PERMANENT = new VarLifetime(2);

    readonly id: number;

    constructor(id: number) {
        this.id = id;
    }

    static of(id: number): VarLifetime {
        for (const type of this.values()) {
            if (type.id === id) {
                return type;
            }
        }
        throw new Error(`Unknown type id: ${id}`);
    }

    static values(): VarLifetime[] {
        return [
            this.TEMPORARY,
            this.PERMANENT,
            this.SERVER_PERMANENT,
        ]
    }
}