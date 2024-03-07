import net from 'net';

import ConnectionState from '#lostcity/network/ConnectionState.js';
import Packet from '#jagex3/io/Packet.js';

export default class ClientSocket {
    socket: net.Socket;
    state: ConnectionState;

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.state = ConnectionState.Login;
    }

    write(buf: Uint8Array | Packet): void {
        if (buf instanceof Packet) {
            buf = buf.data.subarray(0, buf.pos);
        }

        this.socket.write(buf);
    }

    end(): void {
        this.socket.end();
    }
}
