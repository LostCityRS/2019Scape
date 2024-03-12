import net from 'net';

import Packet from '#jagex/bytepacking/Packet.js';

import ConnectionState from '#lostcity/network/ConnectionState.js';

export default class ClientSocket {
    socket: net.Socket;
    state: ConnectionState;
    debug: boolean = false;

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.state = ConnectionState.Login;
    }

    write(buf: Uint8Array | Packet): void {
        if (buf.length === 0) {
            return;
        }

        if (buf instanceof Packet) {
            buf = buf.data.subarray(0, buf.pos);
        }

        this.socket.write(buf);
    }

    end(): void {
        this.socket.end();
    }
}
