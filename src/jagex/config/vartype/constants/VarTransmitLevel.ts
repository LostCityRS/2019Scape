export default class VarTransmitLevel {
    public static readonly NEVER = new VarTransmitLevel(0);
    public static readonly ON_SET_DIFFERENT = new VarTransmitLevel(1);
    public static readonly ON_SET_ALWAYS = new VarTransmitLevel(2);

    readonly id: number;

    constructor(id: number) {
        this.id = id;
    }

    static of(id: number): VarTransmitLevel {
        for (const type of this.values()) {
            if (type.id === id) {
                return type;
            }
        }
        throw new Error(`Unknown type id: ${id}`);
    }

    static values(): VarTransmitLevel[] {
        return [
            this.NEVER,
            this.ON_SET_DIFFERENT,
            this.ON_SET_ALWAYS,
        ]
    }
}