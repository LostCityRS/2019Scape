import Packet from '#jagex/bytepacking/Packet.js';
import Js5 from '#jagex/js5/Js5.js';
import ServerScript from './ServerScript.js';
import ServerTriggerType from './ServerTriggerType.js';

export default class ServerScriptList {

    private static scripts: ServerScript[] = [];
    private static scriptLookup = new Map<number, ServerScript>();
    private static scriptNames = new Map<string, number>();

    static async load(js5: Js5): Promise<void> {
        ServerScriptList.scripts = [];
        ServerScriptList.scriptNames.clear();
        ServerScriptList.scriptLookup.clear();

        for (let i: number = 0; i < js5.index.size; i++) {
            const groupId: number = js5.index.groupIds![i];
            const data: Uint8Array | null = await js5.readGroup(groupId);

            if (data !== null) {
                const script: ServerScript = ServerScript.decode(groupId, new Packet(data));

                ServerScriptList.scripts[groupId] = script;
                ServerScriptList.scriptNames.set(script.name, groupId);

                // add the script to lookup table if the value isn't -1
                if (script.info.lookupKey !== 0xffffffff) {
                    ServerScriptList.scriptLookup.set(script.info.lookupKey, script);
                }
            }
        }
    }

    static get(id: number): ServerScript | undefined {
        return this.scripts[id] ?? null;
    }

    static getByName(name: string): ServerScript | undefined {
        const id: number | undefined = ServerScriptList.scriptNames.get(name);
        if (typeof id === 'undefined') {
            return undefined;
        }

        return ServerScriptList.scripts[id];
    }

    static getByTrigger(trigger: ServerTriggerType, type: number = -1, category: number = -1): ServerScript | undefined {
        let script: ServerScript | undefined = ServerScriptList.scriptLookup.get(trigger | (0x2 << 8) | (type << 10));
        if (script) {
            return script;
        }

        script = ServerScriptList.scriptLookup.get(trigger | (0x1 << 8) | (category << 10));
        if (script) {
            return script;
        }

        return ServerScriptList.scriptLookup.get(trigger);
    }

    static getByTriggerSpecific(trigger: ServerTriggerType, type: number = -1, category: number = -1): ServerScript | undefined {
        if (type !== -1) {
            return ServerScriptList.scriptLookup.get(trigger | (0x2 << 8) | (type << 10));
        } else if (category !== -1) {
            return ServerScriptList.scriptLookup.get(trigger | (0x1 << 8) | (category << 10));
        } else {
            return ServerScriptList.scriptLookup.get(trigger);
        }
    }
}
