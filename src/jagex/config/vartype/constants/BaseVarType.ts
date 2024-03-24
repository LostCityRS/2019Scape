export class BaseVarType {
    public static readonly INTEGER = new BaseVarType(0, 'integer');
    public static readonly LONG = new BaseVarType(1, 'long');
    public static readonly STRING = new BaseVarType(2, 'string');
    public static readonly COORDFINE = new BaseVarType(3, 'coordfine');
    public static readonly COMPONENT_HOOK = new BaseVarType(4, 'component_hook');

    public readonly id: number;
    public readonly name: string;

    private constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    static of(id: number): BaseVarType | null {
        for (const value of this.values()) {
            if (value.id == id) {
                return value;
            }
        }
        return null;
    }

    static values(): BaseVarType[] {
        return [
            this.INTEGER,
            this.LONG,
            this.STRING,
            this.COORDFINE,
            this.COMPONENT_HOOK
        ];
    }
}