import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export async function download(url: string, local: string, redownload: boolean = false): Promise<Uint8Array | null> {
    try {
        if (!redownload && fs.existsSync(local)) {
            // console.log(`[DOWNLOAD]: Returning cached ${local}`);
            return new Uint8Array(await fsp.readFile(local));
        }

        if (!fs.existsSync(path.dirname(local))) {
            await fsp.mkdir(path.dirname(local), { recursive: true });
        }

        const res: Response = await fetch(url);
        if (!res.ok) {
            return null;
        }

        // console.log(`[DOWNLOAD]: Downloading ${url}`);

        const data: Uint8Array = new Uint8Array(await res.arrayBuffer());
        await fsp.writeFile(local, data);
        return data;
    } catch (err) {
        return null;
    }
}

export async function downloadJson(url: string, local: string, redownload: boolean = false): Promise<unknown> {
    try {
        if (!redownload && fs.existsSync(local)) {
            return JSON.parse(await fsp.readFile(local, 'utf8'));
        }

        if (!fs.existsSync(path.dirname(local))) {
            await fsp.mkdir(path.dirname(local), { recursive: true });
        }

        const res: Response = await fetch(url);
        const data: unknown = await res.json();
        await fsp.writeFile(local, JSON.stringify(data));
        return data;
    } catch (err) {
        return null;
    }
}

export async function downloadStream(url: string, local: string, redownload: boolean = false): Promise<void> {
    if (!redownload && fs.existsSync(local)) {
        return;
    }

    if (!fs.existsSync(path.dirname(local))) {
        await fsp.mkdir(path.dirname(local), { recursive: true });
    }

    const res: Response = await fetch(url);
    if (res.ok === false || res.body === null) {
        throw new Error(`Failed to download ${url}: ${res.statusText}`);
    }

    const stream: fs.WriteStream = fs.createWriteStream(local);
    await finished(Readable.fromWeb(res.body).pipe(stream));
}
