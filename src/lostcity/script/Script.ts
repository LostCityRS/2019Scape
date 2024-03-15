import path from 'path';

import Packet from '#jagex/bytepacking/Packet.js';

import ServerScriptCommand from '#lostcity/script/ServerScriptCommands.js';

export interface ScriptInfo {
    scriptName: string;
    sourceFilePath: string;
    lookupKey: number;
    parameterTypes: number[];
    pcs: number[];
    lines: number[];
}

export type SwitchTable = {
    [key: number]: number | undefined;
};

// compiled bytecode representation
export default class Script {
    info: ScriptInfo = {
        scriptName: '<unknown>',
        sourceFilePath: '<unknown>',
        lookupKey: -1,
        parameterTypes: [],
        pcs: [],
        lines: []
    };

    readonly id: number;
    intLocalCount = 0;
    stringLocalCount = 0;
    intArgCount = 0;
    stringArgCount = 0;
    switchTables: SwitchTable[] = [];
    opcodes: number[] = [];
    intOperands: number[] = [];
    stringOperands: string[] = [];

    // decodes the same binary format as clientscript2
    static decode(id: number, stream: Packet): Script {
        if (stream.length < 16) {
            throw new Error('Invalid script file (minimum length)');
        }

        stream.pos = stream.length - 2;

        const trailerLen: number = stream.g2();
        const trailerPos: number = stream.length - trailerLen - 12 - 2;

        if (trailerPos < 0 || trailerPos >= stream.length) {
            throw new Error('Invalid script file (bad trailer pos)');
        }

        stream.pos = trailerPos;

        const script: Script = new Script(id);
        const _instructions: number = stream.g4(); // we don't need to preallocate anything in JS, but still need to read it
        script.intLocalCount = stream.g2();
        script.stringLocalCount = stream.g2();
        script.intArgCount = stream.g2();
        script.stringArgCount = stream.g2();

        const switches : number= stream.g1();
        for (let i: number = 0; i < switches; i++) {
            const count: number = stream.g2();
            const table: SwitchTable = [];

            for (let j: number = 0; j < count; j++) {
                const key: number = stream.g4();
                const offset: number = stream.g4();
                table[key] = offset;
            }

            script.switchTables[i] = table;
        }

        stream.pos = 0;
        script.info.scriptName = stream.gjstr();
        script.info.sourceFilePath = stream.gjstr();
        script.info.lookupKey = stream.g4();
        const parameterTypeCount: number = stream.g1();
        for (let i: number = 0; i < parameterTypeCount; i++) {
            script.info.parameterTypes.push(stream.g1());
        }

        const lineNumberTableLength: number = stream.g2();
        for (let i: number = 0; i < lineNumberTableLength; i++) {
            script.info.pcs.push(stream.g4());
            script.info.lines.push(stream.g4());
        }

        let instr: number = 0;
        while (trailerPos > stream.pos) {
            const opcode: number = stream.g2();
            const command: ServerScriptCommand | undefined = ServerScriptCommand.BY_ID[opcode];
            if (typeof command === 'undefined') {
                throw new Error(`Invalid opcode ${opcode} at ${stream.pos}`);
            }

            if (command === ServerScriptCommand.PUSH_CONSTANT_STRING) {
                script.stringOperands[instr] = stream.gjstr();
            } else if (command.largeOperand) {
                script.intOperands[instr] = stream.g4();
            } else {
                script.intOperands[instr] = stream.g1();
            }

            script.opcodes[instr++] = opcode;
        }

        return script;
    }

    constructor(id: number) {
        this.id = id;
    }

    get name(): string {
        return this.info.scriptName;
    }

    get fileName(): string {
        return path.basename(this.info.sourceFilePath);
    }

    lineNumber(pc: number): number {
        for (let i: number = 0; i < this.info.pcs.length; i++) {
            if (this.info.pcs[i] > pc) {
                return this.info.lines[i - 1];
            }
        }

        return this.info.lines[this.info.lines.length - 1];
    }
}
