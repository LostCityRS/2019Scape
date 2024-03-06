import child_process from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import zlib from 'zlib';

const parameters: Map<string, string> = new Map();
const paramTxt: Buffer = fs.readFileSync('data/client/parameters.txt');
for (const line of paramTxt.toString().split('\n')) {
    // format is client_parameters.put("key", "value");
    const match: RegExpMatchArray | null = line.match(/client_parameters.put\("(.+)", "(.+)"\);/);
    if (match) {
        parameters.set(match[1], match[2]);
    }
}

const secret: string | undefined = parameters.get('0');
const vector: string | undefined = parameters.get('-1');

if (!secret || !vector) {
    console.error('Could not find decryption parameters');
    process.exit(1);
}

function getKeySize(length: number): number {
    if (length === 0) {
        return 0;
    }

    return 3 * Math.floor((length - 1) / 4) + 1;
}

function decodeBase64(input: string, size: number): Uint8Array {
    input = input.replace(/\*/g, '+').replace(/-/g, '/');

    const buffer: Buffer = Buffer.from(input, 'base64');
    const result: Uint8Array = new Uint8Array(size);
    result.set(buffer);
    return result;
}

const secretKeySize: number = getKeySize(secret.length);
const vectorSize: number = getKeySize(vector.length);

const secretKey: Uint8Array = secretKeySize === 0 ? new Uint8Array() : decodeBase64(secret, secretKeySize);
const initialisationVector: Uint8Array = vectorSize === 0 ? new Uint8Array() : decodeBase64(vector, vectorSize);

const innerPack: Buffer = fs.readFileSync('data/client/inner.pack.gz');

// encrypted with a 128-bit key and an initialisation vector (decrypt it)
// compressed with gzip (decompress it)
// stored as pack200 (to unpack it, you'll need java <= 11)

const decipher: crypto.Decipher = crypto.createDecipheriv('aes-128-cbc', secretKey, initialisationVector);
const decrypted: Buffer = Buffer.concat([decipher.update(innerPack), decipher.final()]);
const decompressed: Buffer = zlib.gunzipSync(decrypted);

fs.writeFileSync('data/client/inner.pack200', decompressed);
child_process.spawnSync('unpack200', ['data/client/inner.pack200', 'data/client/inner.jar'], { stdio: 'inherit' });
