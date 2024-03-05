import fs from 'fs';

import DiskStore from '#jagex3/io/DiskStore.js';
import FlatDiskStore from '#jagex3/io/FlatDiskStore.js';
import Packet from '#jagex3/io/Packet.js';

import Js5 from '#jagex3/js5/Js5.js';
import Js5Index from '#jagex3/js5/Js5Index.js';
import Js5Archive from '#jagex3/js5/Js5Archive.js';

import Whirlpool from '#jagex3/util/Whirlpool.js';

export default class Cache {
    js5: Js5[] = [];

    masterStore: DiskStore | null = null;
    maxArchive: number = -1;

    prefetches: number[] = [];
    masterIndexIndex: Uint8Array | null = null;

    async load(dir: string, overrides: string[] = []): Promise<void> {
        this.masterStore = new FlatDiskStore(dir, 255);
        // this.masterStore = new DiskStore(`${dir}/main_file_cache.dat255`, `${dir}/main_file_cache.idx255`, 255);
        this.maxArchive = this.masterStore.count;

        for (let archive: number = 0; archive < this.maxArchive; archive++) {
            const index: Uint8Array | null = this.masterStore.read(archive);
            if (index === null) {
                continue;
            }

            if (archive === Js5Archive.ModelsRT7) {
                // until we can handle LZMA
                continue;
            }

            if (typeof overrides[archive] !== 'undefined') {
                const store: FlatDiskStore = new FlatDiskStore(overrides[archive], archive);
                this.js5[archive] = await Js5.create(store, index, archive);
                continue;
            }

            const store: FlatDiskStore = new FlatDiskStore(dir, archive);
            // const store: DiskStore = new DiskStore(`${dir}/main_file_cache.dat${archive}`, `${dir}/main_file_cache.idx${archive}`, archive);
            this.js5[archive] = await Js5.create(store, index, archive);
        }

        // if (!fs.existsSync(`${dir}/main_file_cache.idx255_255`)) {
            console.log('Generating master index... index');
            await this.generateMasterIndexIndex();
        //     fs.writeFileSync(`${dir}/main_file_cache.idx255_255`, this.masterIndexIndex!);
        // } else {
        //     this.masterIndexIndex = fs.readFileSync(`${dir}/main_file_cache.idx255_255`);
        // }

        this.prefetches.push(this.js5[Js5Archive.Defaults].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('windows/x86/jaclib.dll'));
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('windows/x86/jaggl.dll'));
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('windows/x86/jagdx.dll'));
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('windows/x86/sw3d.dll'));
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('RuneScape-Setup.exe'));
        this.prefetches.push(this.js5[Js5Archive.Dlls].getPrefetchGroup('windows/x86/hw3d.dll'));
        this.prefetches.push(this.js5[Js5Archive.Shaders].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.Materials].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.Config].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigLoc].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigEnum].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigNpc].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigObj].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigSeq].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigSpot].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigStruct].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.DbTableIndex].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.QuickChat].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.QuickChatGlobal].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigParticle].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ConfigBillboard].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.Binary].getPrefetchGroup('huffman'));
        this.prefetches.push(this.js5[Js5Archive.Interfaces].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.ClientScripts].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.FontMetrics].getPrefetchArchive());
        this.prefetches.push(this.js5[Js5Archive.WorldMapData].getPrefetchGroup(0));
    }

    async getGroup(archive: number, group: number, raw: boolean = false): Promise<Uint8Array | null> {
        if (archive === 255 && group === 255) {
            return this.masterIndexIndex;
        } else if (archive === 255) {
            if (this.masterStore) {
                return this.masterStore.read(group);
            }
        } else {
            const store: DiskStore | null = this.js5[archive].store;
            if (raw && store) {
                return store.read(group);
            } else {
                return this.js5[archive].readGroup(group);
            }
        }

        return null;
    }

    async generateMasterIndexIndex(format: number = 8): Promise<void> {
        const buf: Packet = new Packet();
        if (format >= 7) {
            buf.p1(this.maxArchive);
        }

        for (let i: number = 0; i < this.maxArchive; i++) {
            const masterIndexData: Uint8Array | null = await this.getGroup(255, i);
            if (!masterIndexData || i === 47) {
                buf.p4(0);
                if (format >= 6) {
                    buf.p4(0);
                }
                if (format >= 8) {
                    buf.p4(0);
                    buf.p4(0);
                }
                if (format >= 7) {
                    buf.pdata(new Uint8Array(64));
                }
                continue;
            }

            const index: Js5Index = this.js5[i].index;
            buf.pdata(index.encodeForMasterIndex(format));
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
}
