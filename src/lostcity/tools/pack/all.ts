import { spawnSync } from 'child_process';
import fs from 'fs';

import packDefaults from '#lostcity/tools/pack/defaults.js';
import ServerScriptCommand from '#lostcity/script/ServerScriptCommands.js';

// ----

await packDefaults();

// ----

function loadPack(path: string): Map<string, string> {
    const pack: Map<string, string> = new Map();
    fs.readFileSync(path, 'ascii').replace(/\r/g, '').split('\n').forEach((line: string): void => {
        const [key, value] = line.split('=');
        if (typeof key === 'undefined' || typeof value === 'undefined') {
            return;
        }

        pack.set(key, value);
    });

    return pack;
}

function generatePack(path: string, ext: string, pack: Map<string, string>): void {
    fs.readdirSync(path).forEach((file: string): void => {
        if (fs.statSync(`${path}/${file}`).isDirectory()) {
            generatePack(`${path}/${file}`, ext, pack);
        } else if (file.endsWith(ext)) {
            const lines: string[] = fs.readFileSync(`${path}/${file}`, 'utf-8').replace(/\r/g, '').split('\n');

            for (const line of lines) {
                if (line.startsWith('[') && line.endsWith(']')) {
                    pack.set(pack.size.toString(), line);
                }
            }
        }
    });
}

const interfacePack: Map<string, string> = loadPack('data/src/pack/interface.pack');
const varbitPack: Map<string, string> = loadPack('data/src/pack/varbit.pack');
const varcPack: Map<string, string> = loadPack('data/src/pack/varc.pack');
const varconPack: Map<string, string> = loadPack('data/src/pack/varcon.pack');
const varglobalPack: Map<string, string> = loadPack('data/src/pack/varglobal.pack');
const varnPack: Map<string, string> = loadPack('data/src/pack/varn.pack');
const varobjPack: Map<string, string> = loadPack('data/src/pack/varobj.pack');
const varpPack: Map<string, string> = loadPack('data/src/pack/varp.pack');
const varregionPack: Map<string, string> = loadPack('data/src/pack/varregion.pack');
const varsPack: Map<string, string> = loadPack('data/src/pack/vars.pack');

fs.mkdirSync('data/pack/symbols', { recursive: true });

// ----

let interfaceSym: string = '';
let componentSym: string = '';

for (const [key, value] of interfacePack) {
    if (key.includes(':')) {
        const [root, com] = key.split(':');
        const rootId: number = parseInt(root);
        const comId: number = parseInt(com);
        const packed: number = (rootId << 16) | comId;
        componentSym += `${packed}\t${interfacePack.get(root)}:${value}\n`;
    } else {
        interfaceSym += `${key}\t${value}\n`;
    }
}

fs.writeFileSync('data/pack/symbols/interface.sym', interfaceSym);
fs.writeFileSync('data/pack/symbols/component.sym', componentSym);

// ----

let varpSym: string = '';
let varbitSym: string = '';
let varcSym: string = '';

for (const [key, value] of varpPack) {
    const type: string = 'int';
    varpSym += `${key}\t${value}\t${type}\n`;
}

for (const [key, value] of varbitPack) {
    varbitSym += `${key}\t${value}\n`;
}

for (const [key, value] of varcPack) {
    const type: string = 'int';
    varcSym += `${key}\t${value}\t${type}\n`;
}

fs.writeFileSync('data/pack/symbols/varp.sym', varpSym);
fs.writeFileSync('data/pack/symbols/varbit.sym', varbitSym);
fs.writeFileSync('data/pack/symbols/varc.sym', varcSym);

// ----

let commandsSym: string = '';

const commands: ServerScriptCommand[] = ServerScriptCommand.values();
for (let i: number = 0; i < commands.length; i++) {
    commandsSym += `${commands[i].id}\t${commands[i].name}\n`;
}

fs.writeFileSync('data/pack/symbols/commands.sym', commandsSym);

// ----

let runescriptSym: string = '';

const runescriptPack: Map<string, string> = new Map();
generatePack('data/src', '.rs2', runescriptPack);

for (const [key, value] of runescriptPack) {
    runescriptSym += `${key}\t${value}\n`;
}

fs.writeFileSync('data/pack/symbols/runescript.sym', runescriptSym);

// ----

spawnSync('java', ['-jar', 'RuneScriptCompiler.jar'], { stdio: 'inherit' });
