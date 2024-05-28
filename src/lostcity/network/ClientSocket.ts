import net from 'net';

import Packet from '#jagex/bytepacking/Packet.js';

import ConnectionState from '#lostcity/network/ConnectionState.js';
import ServerMessage from '#jagex/network/ServerMessage.js';
import ClientMessage from '#jagex/network/ClientMessage.js';
import Player from '#lostcity/entity/Player.js';

export default class ClientSocket {
    socket: net.Socket;
    state: ConnectionState;
    debug: boolean = false;
    lastResponse: number = 0;

    netInQueue: ClientMessage[] = [];
    netOutQueue: ServerMessage[] = [];
    player: Player | null = null;

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.state = ConnectionState.Login;
    }

    write(buf: Packet): void {
        if (buf.length === 0 || buf.pos === 0) {
            return;
        }

        this.socket.write(buf.data.subarray(0, buf.pos));
        buf.release();
    }

    end(): void {
        this.socket.end();
    }

    send(message: ServerMessage): void {
        const length: number = message.buf.pos - message.start;

        if (message.packetType.size === -1) {
            message.buf.psize1(length);
        } else if (message.packetType.size === -2) {
            message.buf.psize2(length);
        }

        // console.log(`Sending packet ${message.packetType.debugname} opcode=${message.packetType.opcode} size=${length}`);
        this.write(message.buf);
        message.release();
    }
}
