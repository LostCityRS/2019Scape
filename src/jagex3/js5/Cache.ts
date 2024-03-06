import Js5 from '#jagex3/js5/Js5.js';
import Js5Archive, { Js5ArchiveType } from '#jagex3/js5/Js5Archive.js';
import Js5Index from '#jagex3/js5/Js5Index.js';
import Packet from '#jagex3/io/Packet.js';

import Whirlpool from '#jagex3/util/Whirlpool.js';

export default class Cache {
    js5: Js5[] = [];

    prefetches: number[] = [];
    masterIndexIndex: Uint8Array | null = null;

    async load(dir: string): Promise<void> {
        for (let archive: number = 0; archive < Js5Archive.getMaxId(); archive++) {
            const type: Js5Archive | null = Js5Archive.forId(archive);

            if (type) {
                this.js5[type.id] = await Js5.load(`${dir}/client.${type.name}.js5`, archive);
            }
        }

        await this.generateMasterIndexIndex();
        this.generatePrefetches();
    }

    async getGroup(archive: number, group: number, raw: boolean = false): Promise<Uint8Array | null> {
        if (archive === Js5ArchiveType.ArchiveSet && group === Js5ArchiveType.ArchiveSet) {
            return this.masterIndexIndex;
        } else if (archive === Js5ArchiveType.ArchiveSet) {
            if (this.js5[group]) {
                return this.js5[group].masterIndex;
            }
        } else {
            if (raw) {
                return this.js5[archive].readRaw(group);
            } else {
                return await this.js5[archive].readGroup(group);
            }
        }

        return null;
    }

    async generateMasterIndexIndex(format: number = 7): Promise<void> {
        const buf: Packet = new Packet();
        if (format >= 7) {
            buf.p1(Js5Archive.getMaxId());
        }

        for (let i: number = 0; i < Js5Archive.getMaxId(); i++) {
            const masterIndexData: Uint8Array | null = await this.getGroup(255, i);
            if (!masterIndexData) {
                buf.p4(0);
                if (format >= 6) {
                    buf.p4(0);
                }
                if (format >= 7) {
                    buf.p4(0);
                    buf.p4(0);
                    buf.pdata(new Uint8Array(64));
                }
                continue;
            }

            const index: Js5Index = this.js5[i].index;
            buf.pdata(index.encodeForMasterIndex());
        }

        if (format >= 7) {
            const hashBuf: Packet = new Packet();
            hashBuf.p1(0);
            hashBuf.pdata(await Whirlpool.compute(buf));
            // todo: encrypt here
            buf.pdata(hashBuf);
        }

        const js5Buf: Packet = Packet.alloc(buf.pos + 5);
        js5Buf.p1(0);
        js5Buf.p4(buf.pos);
        js5Buf.pdata(buf);

        this.masterIndexIndex = js5Buf.data;
    }

    generatePrefetches(): void {
        this.prefetches.push(this.js5[Js5ArchiveType.Defaults].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('windows/x86/jaclib.dll'));
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('windows/x86/jaggl.dll'));
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('windows/x86/jagdx.dll'));
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('windows/x86/sw3d.dll'));
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('RuneScape-Setup.exe'));
        this.prefetches.push(this.js5[Js5ArchiveType.Dlls].getPrefetchGroup('windows/x86/hw3d.dll'));
        this.prefetches.push(this.js5[Js5ArchiveType.Shaders].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.Materials].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.Config].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigLoc].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigEnum].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigNpc].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigObj].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigSeq].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigSpot].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigStruct].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.DbTableIndex].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.QuickChat].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.QuickChatGlobal].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigParticle].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ConfigBillboard].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.Binary].getPrefetchGroup('huffman'));
        this.prefetches.push(this.js5[Js5ArchiveType.Interfaces].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.ClientScripts].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.FontMetrics].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5ArchiveType.WorldMapData].getPrefetchGroup(0));
    }
}
