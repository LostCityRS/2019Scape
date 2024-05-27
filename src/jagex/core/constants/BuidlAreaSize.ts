export default class BuildAreaSize {

    public static readonly SIZE_104 = new BuildAreaSize(0, 104);
    public static readonly SIZE_120 = new BuildAreaSize(1, 120);
    public static readonly SIZE_136 = new BuildAreaSize(2, 136);
    public static readonly SIZE_168 = new BuildAreaSize(3, 168);
    public static readonly SIZE_72 = new BuildAreaSize(4, 72);
    public static readonly SIZE_256 = new BuildAreaSize(5, 256);

    readonly id: number;
    readonly size: number;

    constructor(id: number, size: number) {
        this.id = id;
        this.size = size;
    }

    static values(): BuildAreaSize[] {
        return [ BuildAreaSize.SIZE_168, BuildAreaSize.SIZE_72, BuildAreaSize.SIZE_104, BuildAreaSize.SIZE_256, BuildAreaSize.SIZE_120, BuildAreaSize.SIZE_136 ];
    }

    public static buildAreaSizeForId(id: number): BuildAreaSize | null{
        const values: BuildAreaSize[] = BuildAreaSize.values();

        for (let index: number = 0; index < values.length; index++) {
            const buildAreaSize: BuildAreaSize = values[index];
            if (buildAreaSize.id == id) {
                return buildAreaSize;
            }
        }

        return null;
    }
}
