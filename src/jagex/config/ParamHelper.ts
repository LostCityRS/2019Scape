import Packet from '#jagex/bytepacking/Packet.js';

export type ParamMap = Map<number, number | string>;

export const ParamHelper: {decode: (buf: Packet) => ParamMap} = {
    decode: (buf: Packet): ParamMap => {
        const count: number = buf.g1();
        const params: ParamMap = new Map();
        for (let i: number = 0; i < count; i++) {
            const string: boolean = buf.gbool();
            const key: number = buf.g3();

            if (string) {
                params.set(key, buf.gjstr());
            } else {
                params.set(key, buf.g4());
            }
        }
        return params;
    }
};
