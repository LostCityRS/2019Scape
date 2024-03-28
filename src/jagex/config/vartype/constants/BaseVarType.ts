import Packet from '#jagex/bytepacking/Packet.js';
import BaseVarTypeInteger from '#jagex/config/vartype/constants/BaseVarTypeInteger.js';
import BaseVarTypeCodec from '#jagex/config/vartype/constants/BaseVarTypeCodec.js';
import BaseVarTypeLong from '#jagex/config/vartype/constants/BaseVarTypeLong.js';
import BaseVarTypeString from '#jagex/config/vartype/constants/BaseVarTypeString.js';
import BaseVarTypeCoordFine from '#jagex/config/vartype/constants/BaseVarTypeCoordFine.js';

export class BaseVarType {
    public static readonly INTEGER = new BaseVarType(0, 'integer', new BaseVarTypeInteger());
    public static readonly LONG = new BaseVarType(1, 'long', new BaseVarTypeLong());
    public static readonly STRING = new BaseVarType(2, 'string', new BaseVarTypeString());
    public static readonly COORDFINE = new BaseVarType(3, 'coordfine', new BaseVarTypeCoordFine());

    public readonly id: number;
    public readonly name: string;
    private readonly codec: BaseVarTypeCodec;

    private constructor(id: number, name: string, codec: BaseVarTypeCodec) {
        this.id = id;
        this.name = name;
        this.codec = codec;
    }

    decode(buf: Packet): unknown {
        return this.codec.decode(buf);
    }

    encode(value: unknown, buf: Packet): void {
        this.codec.encode(value, buf);
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
        ];
    }
}
