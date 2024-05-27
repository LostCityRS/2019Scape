import Packet from '#jagex/bytepacking/Packet.js';

export abstract class ConfigType {
    readonly id: number;

    debugname: string | null = null;

    protected constructor(id: number) {
        this.id = id;
    }

    protected abstract decode(buf: Packet, code: number): void;

    protected decodeType = (buf: Packet): void => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const code: number = buf.g1();
            if (code === 0) {
                return;
            }

            this.decode(buf, code);
        }
    };
}
