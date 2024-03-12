import fs from 'fs';

const clientProject: string = '../2019Scape-Client';
const outputName: string = 'data/obfclasses.txt';
const srcDir: string = `${clientProject}/client/src/main/java`;

// const clientProject: string = '../rs3-java';
// const outputName: string = 'data/obfclasses2.txt';
// const srcDir: string = `${clientProject}/src`;

// obf name -> index
const obfOrder: Map<string, number> = new Map();
fs.readFileSync(`${clientProject}/ref/obforder.txt`, 'ascii').replaceAll('\r', '').split('\n').forEach((line: string, index: number): void => {
    obfOrder.set(line, index);
});

// obf name -> name
const classes: Map<string, string> = new Map();

function scanDirectory(dir: string, startingDir?: string): void {
    if (typeof startingDir === 'undefined') {
        startingDir = dir;
    }

    fs.readdirSync(dir).forEach((file: string): void => {
        const path: string = `${dir}/${file}`;

        if (fs.statSync(path).isDirectory()) {
            if (file === 'twitchtv' || file === 'jagdx' || file === 'jaggl' || file === 'deob') {
                return;
            }

            scanDirectory(path, startingDir);
        } else if (path.endsWith('.java')) {
            const source: string = fs.readFileSync(path, 'utf8');
            const lines: string[] = source.replaceAll('\r', '').replaceAll('\t', '').replaceAll('    ', '').split('\n');

            // before a `class` or `interface` declaration there will be a @ObfuscatedName annotation
            // this may be multiple in a class due to inner classes and we want to know all of them
            // anything with a . is invalid

            const matches: RegExpMatchArray | null = source.match(/@ObfuscatedName\("([^"]+)"\)/g);
            if (matches === null) {
                return;
            }

            let counter: number = 0;
            matches.forEach((match: string): void => {
                const obfName: string = match.match(/@ObfuscatedName\("([^"]+)"\)/)![1];
                if (obfName.includes('.')) {
                    return;
                }

                // class name from inside the code
                const index: number = lines.findIndex((x): boolean => x.includes(`@ObfuscatedName("${obfName}")`));
                if (index === -1) {
                    return;
                }

                if (lines[index].includes('class ') || lines[index].includes('interface ')) {
                    const className: RegExpMatchArray | null = lines[index].match(/(class|interface) ([^ ]+)/);
                    if (className === null) {
                        return;
                    }

                    counter++;

                    const pkgName: string = path.substring(startingDir!.length + 1, path.length - file.length - 1).replaceAll('/', '.');
                    let fqn: string = '';
                    // if (pkgName.length > 1) {
                    //     fqn += pkgName + '.';
                    // }
                    // if (counter > 1) {
                    //     // inner class - add file name to fqn
                    //     fqn += file.substring(0, file.length - 5) + '$';
                    // }
                    // fqn += className![2];
                    fqn += lines[index];
                    classes.set(obfName, fqn);
                } else if (lines[index + 1].includes('class ') || lines[index + 1].includes('interface ')) {
                    const className: RegExpMatchArray | null = lines[index + 1].match(/(class|interface) ([^ ]+)/);
                    if (className === null) {
                        return;
                    }

                    counter++;

                    const pkgName: string = path.substring(startingDir!.length + 1, path.length - file.length - 1).replaceAll('/', '.');
                    let fqn: string = '';
                    // if (pkgName.length > 1) {
                    //     fqn += pkgName + '.';
                    // }
                    // if (counter > 1) {
                    //     // inner class - add file name to fqn
                    //     fqn += file.substring(0, file.length - 5) + '$';
                    // }
                    // fqn += className![2];
                    fqn += lines[index + 1];
                    classes.set(obfName, fqn);
                }
            });
        }
    });
}

scanDirectory(srcDir);

const names: string[] = Array.from(classes.keys());
names.sort((a: string, b: string): number => {
    return obfOrder.get(a)! - obfOrder.get(b)!;
});

// iterate over obfOrder and print out the class names that match
fs.writeFileSync(outputName, '');
for (const [obf, index] of obfOrder) {
    const name: string | undefined = classes.get(obf);
    if (typeof name === 'undefined') {
        fs.appendFileSync(outputName, `${index},\n`);
        continue;
    }

    fs.appendFileSync(outputName, `${name}\n`);
}
