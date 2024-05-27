import Packet from '#jagex/bytepacking/Packet.js';
import net from 'net';
import stream from 'stream';

export class TcpServerClient {
    socket: net.Socket;
    input: stream.Readable;
    lastResponse: number = 0;

    state: number = 0;
    in: Packet = Packet.alloc(40000);
    packetType: number = -1;
    packetSize: number = 0;

    get idle(): number {
        return Date.now() - this.lastResponse;
    }

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.socket.setNoDelay(true);
        this.socket.setKeepAlive(true);
        this.socket.setTimeout(15000);

        this.input = new stream.Readable();
        this.input._read = (): void => {};
        this.input.pause();

        this.lastResponse = Date.now();

        this.socket.on('data', (data: Buffer): void => {
            this.lastResponse = Date.now();
            this.input.push(data);
        });
    }

    get available(): number {
        return this.input.readableLength;
    }

    read(destination: Uint8Array | Buffer, offset: number, length: number): number {
        const data: Buffer | null = this.input.read(length);
        if (data === null) {
            return 0;
        }

        data.copy(destination, offset, 0, data.length);
        return length;
    }

    write(data: Uint8Array | Buffer, offset: number, length: number): void {
        this.socket.write(data.subarray(offset, offset + length));
    }

    close(): void {
        this.socket.end();
    }
}

export class TcpServer {
    server: net.Server;
    clients: Set<TcpServerClient> = new Set();

    constructor() {
        this.server = net.createServer();
    }

    listen(port: number, host: string): void {
        this.server.on('connection', (socket: net.Socket): void => {
            const client: TcpServerClient = new TcpServerClient(socket);

            console.log('Client connected.');

            client.socket.on('close', (): void => {
                console.log('Client disconnected.');
            });

            client.socket.on('end', (): void => {
                client.socket.destroy();
            });

            client.socket.on('destroy', (): void => {
                client.socket.destroy();
            });

            client.socket.on('error', (error: Error): void => {
                client.socket.destroy();
            });

            this.clients.add(client);
        });

        this.server.listen(port, host);
    }

    close(callback: () => void): void {
        this.server.close(callback);
    }

    address(): net.AddressInfo {
        return this.server.address() as net.AddressInfo;
    }
}
