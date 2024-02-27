import fastify from 'fastify';

const app: fastify.FastifyInstance = fastify();

app.get('/clienterror.ws', (): void => {
});

app.listen({
    port: 80,
    host: '0.0.0.0'
});

app.listen({
    port: 443,
    host: '0.0.0.0'
});