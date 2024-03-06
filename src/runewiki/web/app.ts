/* eslint-disable @typescript-eslint/no-explicit-any */

import fastify from 'fastify';

import Server from '#runewiki/server/Server.js';

const app: fastify.FastifyInstance = fastify({ logger: true });

app.get('/clienterror.ws', (req: any): void => {
    const { c: client, cs: clientSub, u: update, v1: version1, v2: version2, e: error } = req.query;

    console.error(`${client}.${clientSub}.${update} - ${version1} ${version2}: ${error}`);
});

app.get('/ms', async (req: any, res: any): Promise<void> => {
    const { m, a: archive, g: group, cb, c: checksum, v: version } = req.query;

    let data: Uint8Array | null = await Server.cache.getGroup(parseInt(archive), parseInt(group), true);
    if (!data) {
        res.status(404);
        return;
    }

    if (archive != 255) {
        data = data.subarray(0, data.length - 2); // remove version trailer
    }

    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Disposition', `attachment; filename=${archive}_${group}.dat`);
    return res.send(data);
});

export default function startWeb(): void {
    app.listen({
        port: 80,
        host: '0.0.0.0'
    });
}
