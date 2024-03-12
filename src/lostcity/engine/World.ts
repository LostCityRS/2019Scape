import net from 'net';

class World {
    id: number = 1;

    tick: number = 0;
    server: net.Server = net.createServer();

    constructor() {
        this.server.on('listening', (): void => {
            console.log(`[WORLD]: Listening on port ${43594 + this.id}`);
        });

        this.server.on('connection', (socket: net.Socket): void => {
        });

        this.server.listen(43594 + this.id, '0.0.0.0');

        this.cycle();
    }

    cycle(): void {
        // console.log(`[WORLD]: Tick ${this.tick}`);

        this.tick++;
        setTimeout(this.cycle.bind(this), 600);
    }
}

export default new World();
