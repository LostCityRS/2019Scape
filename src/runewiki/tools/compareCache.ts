import Js5 from '#jagex3/js5/Js5.js';
import DiskStore from '#jagex3/io/DiskStore.js';
import { OpenRS2 } from '#runewiki/util/OpenRS2.js';

enum Js5Archive {
    Anims = 0,
    Bases = 1,
    Config = 2,
    Interfaces = 3,
    SynthSounds = 4,
    Maps = 5,
    MidiSongs = 6,
    Models = 7,
    Sprites = 8,
    Textures = 9,
    Binary = 10,
    MidiJingles = 11,
    ClientScripts = 12,
    FontMetrics = 13,
    Vorbis = 14,
    MidiInstruments = 15,
    ConfigLoc = 16,
    ConfigEnum = 17,
    ConfigNpc = 18,
    ConfigObj = 19,
    ConfigSeq = 20,
    ConfigSpot = 21,
    ConfigStruct = 22,
    WorldMapData = 23,
    QuickChat = 24,
    QuickChatGlobal = 25,
    Materials = 26,
    ConfigParticle = 27,
    Defaults = 28,
    ConfigBillboard = 29,
    Dlls = 30,
    Shaders = 31,
    LoadingSprites = 32,
    LoadingScreen = 33,
    LoadingSpritesRaw = 34,
    Cutscenes = 35,
    AudioStreams = 40,
    WorldMapAreas = 41,
    WorldMapLabels = 42,
    TexturesDiffusePng = 43,
    TexturesHdrPng = 44,
    TexturesDiffuseDxt = 45,
    TexturesHdrPngMipped = 46,
    ModelsRT7 = 47,
    AnimsRT7 = 48,
    DbTableIndex = 49,
    TexturesDxt = 52,
    TexturesPng = 53,
    TexturesPngMipped = 54,
    TexturesEtc = 55,
    AnimKeyframes = 56
}

const openrs2: OpenRS2 = await OpenRS2.find({ rev: '910' });

const walied: Js5[] = [];
const displee: Js5[] = [];

const masterStore: DiskStore = new DiskStore('data/cache/main_file_cache.dat255', 'data/cache/main_file_cache.idx255', 255);
for (let archive: number = 0; archive < 57; archive++) {
    const store: DiskStore = new DiskStore(`data/cache/main_file_cache.dat${archive}`, `data/cache/main_file_cache.idx${archive}`, archive);
    const index: Uint8Array | null = masterStore.read(archive);
    if (index === null) {
        continue;
    }

    if (archive === 47) {
        // LZMA-compressed
        continue;
    }

    displee[archive] = await Js5.create(archive, openrs2, false);
    walied[archive] = Js5.createRaw(store, index, archive, false);

    if (displee[archive].index.checksum !== walied[archive].index.checksum) {
        console.log(archive + '\t' + Js5Archive[archive] + '\t\t' + displee[archive].index.checksum + '\t' + walied[archive].index.checksum);

        if (displee[archive].index.version !== walied[archive].index.version) {
            console.log(`Version doesn't match: ${displee[archive].index.version} != ${walied[archive].index.version}`);
        }

        if (displee[archive].index.capacity !== walied[archive].index.capacity) {
            console.log(`Group capacity doesn't match: ${displee[archive].index.capacity} != ${walied[archive].index.capacity}`);
        }

        const checksums: Int32Array | null = displee[archive].index.groupChecksums;
        const checksums2: Int32Array | null = walied[archive].index.groupChecksums;
        if (checksums && checksums2 && archive !== 12) {
            for (let i: number = 0; i < checksums.length; i++) {
                if (checksums[i] !== checksums2[i]) {
                    console.log(`Group checksum doesn't match: ${i} - ${checksums[i]} != ${checksums2[i]}`);
                }
            }
        }
    }
}
