import Packet from '#jagex3/io/Packet.js';

export default class DefaultsAudio {
    static encode(def: string[]): Uint8Array {
        const buf: Packet = Packet.alloc(4);
        for (let i: number = 0; i < def.length; i++) {
            const line: string = def[i];
            const [key, value] = line.split('=');

            switch (key) {
                case 'loginmusic':
                    buf.p1(1);
                    buf.p2(parseInt(value));
                    break;
                default:
                    console.error(`Unknown property: ${key}`);
                    process.exit(1);
                    break;
            }
        }
        buf.p1(0);

        return buf.data.subarray(0, buf.pos);
    }

    loginmusic: number = 0;

    decode(buf: Packet): string[] {
        const def: string[] = [];

        while (buf.available > 0) {
            const opcode: number = buf.g1();
            if (opcode === 0) {
                break;
            }

            const line: string | null = this.decodeInner(buf, opcode);
            if (line !== null) {
                def.push(line);
            }
        }

        if (buf.available > 0) {
            console.error(`audio.defaults Buffer not empty: ${buf.available} bytes left`);
            process.exit(1);
        }

        return def;
    }

    decodeInner(buf: Packet, code: number): string | null {
        switch (code) {
            case 1:
                this.loginmusic = buf.g2();
                return `loginmusic=${this.loginmusic}`;
            default:
                console.error(`audio.defaults Unknown config code: ${code}`);
                process.exit(1);
                break;
        }

        return null;
    }
}
