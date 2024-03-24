import Packet from '#jagex/bytepacking/Packet.js';

export type ParamMap = Map<number, number | string>;

export const ParamHelper: {decodeParams: (packet: Packet) => Map<number, number | string>} = {
    decodeParams: (packet: Packet): Map<number, number | string> => {
        const count: number = packet.g1();
        const params: Map<number, number | string> = new Map();
        for (let i: number = 0; i < count; i++) {
            const string: boolean = packet.gbool();
            const key: number = packet.g3();

            if (string) {
                params.set(key, packet.gjstr());
            } else {
                params.set(key, packet.g4());
            }
        }
        return params;
    }
};
