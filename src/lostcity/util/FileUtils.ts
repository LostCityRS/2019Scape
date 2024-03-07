import fs from 'fs';
import { dirname } from 'path';

export function saveFile(path: string, data: Uint8Array): void {
    if (!fs.existsSync(dirname(path))) {
        fs.mkdirSync(dirname(path), { recursive: true });
    }

    fs.writeFileSync(path, data);
}
