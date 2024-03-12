import fs from 'fs';

const lines: string[] = fs.readFileSync('../2019Scape-Client/ref/nxt.txt', 'ascii').replaceAll('\r', '').split('\n').map((line: string): string => line.trim());

enum ReadMode {
    DirectoryTable = 0,
    FileNameTable = 1
}

let mode: ReadMode = ReadMode.DirectoryTable;

fs.writeFileSync('data/nxt.parsed.txt', '');

const listing: Map<number, string> = new Map();
for (let i: number = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line.length) {
        continue;
    }

    if (line.startsWith('The Directory Table')) {
        mode = ReadMode.DirectoryTable;
        listing.clear();
        continue;
    } else if (line.startsWith('The File Name Table')) {
        mode = ReadMode.FileNameTable;
        continue;
    } else if (line.startsWith('Entry')) {
        continue;
    }

    // tab separated values
    if (mode === ReadMode.DirectoryTable) {
        // Dir     Path
        const [dir, path]: string[] = line.split('\t');

        listing.set(parseInt(dir), path);
    } else if (mode === ReadMode.FileNameTable) {
        // Entry   Dir     Time    Size    Name
        const [entry, dir, time, size, name]: string[] = line.split('\t');

        const path: string | undefined = listing.get(parseInt(dir));
        if (typeof path === 'undefined') {
            console.error(`No path for dir ${dir}`);
            continue;
        }

        fs.appendFileSync('data/nxt.parsed.txt', `${path}/${name}\n`);
    }
}
