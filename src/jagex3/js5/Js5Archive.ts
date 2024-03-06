export enum Js5ArchiveType {
    Anims = 0,
    Bases = 1,
    Config = 2,
    Interfaces = 3,
    SynthSounds = 4, // empty
    Maps = 5,
    MidiSongs = 6, // empty
    Models = 7,
    Sprites = 8,
    Textures = 9, // empty
    Binary = 10,
    MidiJingles = 11, // empty
    ClientScripts = 12,
    FontMetrics = 13,
    Vorbis = 14,
    MidiInstruments = 15, // empty
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
    // 36 empty
    // 37 empty
    // 38 empty
    // 39 empty
    AudioStreams = 40,
    WorldMapAreas = 41,
    WorldMapLabels = 42,
    TexturesDiffusePng = 43, // empty
    TexturesHdrPng = 44, // empty
    TexturesDiffuseDxt = 45, // empty
    TexturesHdrPngMipped = 46, // empty
    ModelsRT7 = 47,
    AnimsRT7 = 48,
    DbTableIndex = 49,
    // 50 empty
    // 51 empty
    TexturesDxt = 52,
    TexturesPng = 53,
    TexturesPngMipped = 54,
    TexturesEtc = 55,
    AnimKeyframes = 56,
    ArchiveSet = 255
}

export default class Js5Archive {
    static Anims = new Js5Archive(Js5ArchiveType.Anims, 'anims');
    static Bases = new Js5Archive(Js5ArchiveType.Bases, 'bases');
    static Config = new Js5Archive(Js5ArchiveType.Config, 'config');
    static Interfaces = new Js5Archive(Js5ArchiveType.Interfaces, 'interfaces',);
    static Maps = new Js5Archive(Js5ArchiveType.Maps, 'mapsv2');
    static Models = new Js5Archive(Js5ArchiveType.Models, 'models');
    static Sprites = new Js5Archive(Js5ArchiveType.Sprites, 'sprites');
    static Binary = new Js5Archive(Js5ArchiveType.Binary, 'binary');
    static ClientScripts = new Js5Archive(Js5ArchiveType.ClientScripts, 'scripts');
    static FontMetrics = new Js5Archive(Js5ArchiveType.FontMetrics, 'fontmetrics');
    static Vorbis = new Js5Archive(Js5ArchiveType.Vorbis, 'vorbis');
    static ConfigLoc = new Js5Archive(Js5ArchiveType.ConfigLoc, 'loc.config');
    static ConfigEnum = new Js5Archive(Js5ArchiveType.ConfigEnum, 'enum.config');
    static ConfigNpc = new Js5Archive(Js5ArchiveType.ConfigNpc, 'npc.confnig');
    static ConfigObj = new Js5Archive(Js5ArchiveType.ConfigObj, 'obj.config');
    static ConfigSeq = new Js5Archive(Js5ArchiveType.ConfigSeq, 'seq.config');
    static ConfigSpot = new Js5Archive(Js5ArchiveType.ConfigSpot, 'spot.config');
    static ConfigStruct = new Js5Archive(Js5ArchiveType.ConfigStruct, 'struct.config');
    static WorldMapData = new Js5Archive(Js5ArchiveType.WorldMapData, 'worldmap');
    static QuickChat = new Js5Archive(Js5ArchiveType.QuickChat, 'quickchat');
    static QuickChatGlobal = new Js5Archive(Js5ArchiveType.QuickChatGlobal, 'global.quickchat');
    static Materials = new Js5Archive(Js5ArchiveType.Materials, 'materials');
    static ConfigParticle = new Js5Archive(Js5ArchiveType.ConfigParticle, 'particles');
    static Defaults = new Js5Archive(Js5ArchiveType.Defaults, 'defaults');
    static ConfigBillboard = new Js5Archive(Js5ArchiveType.ConfigBillboard, 'billboards');
    static Dlls = new Js5Archive(Js5ArchiveType.Dlls, 'dlls');
    static Shaders = new Js5Archive(Js5ArchiveType.Shaders, 'shaders');
    static LoadingSprites = new Js5Archive(Js5ArchiveType.LoadingSprites, 'loadingsprites');
    static LoadingScreen = new Js5Archive(Js5ArchiveType.LoadingScreen, 'loadingscreen');
    static LoadingSpritesRaw = new Js5Archive(Js5ArchiveType.LoadingSpritesRaw, 'loadingspritesraw');
    static Cutscenes = new Js5Archive(Js5ArchiveType.Cutscenes, 'cutscenes');
    static AudioStreams = new Js5Archive(Js5ArchiveType.AudioStreams, 'audiostreams');
    static WorldMapAreas = new Js5Archive(Js5ArchiveType.WorldMapAreas, 'worldmapareas');
    static WorldMapLabels = new Js5Archive(Js5ArchiveType.WorldMapLabels, 'worldmaplabels');
    static ModelsRT7 = new Js5Archive(Js5ArchiveType.ModelsRT7, 'modelsrt7');
    static AnimsRT7 = new Js5Archive(Js5ArchiveType.AnimsRT7, 'animsrt7');
    static DbTableIndex = new Js5Archive(Js5ArchiveType.DbTableIndex, 'dbtableindex');
    static TexturesDxt = new Js5Archive(Js5ArchiveType.TexturesDxt, 'textures.dxt');
    static TexturesPng = new Js5Archive(Js5ArchiveType.TexturesPng, 'textures.png');
    static TexturesPngMipped = new Js5Archive(Js5ArchiveType.TexturesPngMipped, 'textures.png.mipped');
    static TexturesEtc = new Js5Archive(Js5ArchiveType.TexturesEtc, 'textures.etc');
    static AnimKeyframes = new Js5Archive(Js5ArchiveType.AnimKeyframes, 'anims.keyframes');

    static values: Js5Archive[] = [ Js5Archive.Anims, Js5Archive.Bases, Js5Archive.Config, Js5Archive.Interfaces, Js5Archive.Maps, Js5Archive.Models, Js5Archive.Sprites, Js5Archive.Binary, Js5Archive.ClientScripts, Js5Archive.FontMetrics, Js5Archive.Vorbis, Js5Archive.ConfigLoc, Js5Archive.ConfigEnum, Js5Archive.ConfigNpc, Js5Archive.ConfigObj, Js5Archive.ConfigSeq, Js5Archive.ConfigSpot, Js5Archive.ConfigStruct, Js5Archive.WorldMapData, Js5Archive.QuickChat, Js5Archive.QuickChatGlobal, Js5Archive.Materials, Js5Archive.ConfigParticle, Js5Archive.Defaults, Js5Archive.ConfigBillboard, Js5Archive.Dlls, Js5Archive.Shaders, Js5Archive.LoadingSprites, Js5Archive.LoadingScreen, Js5Archive.LoadingSpritesRaw, Js5Archive.Cutscenes, Js5Archive.AudioStreams, Js5Archive.WorldMapAreas, Js5Archive.WorldMapLabels, Js5Archive.ModelsRT7, Js5Archive.AnimsRT7, Js5Archive.DbTableIndex, Js5Archive.TexturesDxt, Js5Archive.TexturesPng, Js5Archive.TexturesPngMipped, Js5Archive.TexturesEtc, Js5Archive.AnimKeyframes ];
    static forId(id: number): Js5Archive | null {
        for (const archive of Js5Archive.values) {
            if (archive.id === id) {
                return archive;
            }
        }

        return null;
    }

    static maxId: number = -1;
    static getMaxId(): number {
        if (Js5Archive.maxId === -1) {
            for (const archive of Js5Archive.values) {
                Js5Archive.maxId = Math.max(Js5Archive.maxId, archive.id);
            }

            Js5Archive.maxId++;
        }

        return Js5Archive.maxId;
    }

    id: Js5ArchiveType;
    name: string;

    constructor(id: Js5ArchiveType, name: string) {
        this.id = id;
        this.name = name;
    }
}
