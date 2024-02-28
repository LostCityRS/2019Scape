import { download, downloadJson } from '#runewiki/util/DownloadUtils.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};

const OPENRS2_DOMAIN: string = 'https://archive.openrs2.org';

export type CacheInfo = {
    id: number;
    scope: string;
    game: string;
    environment: string;
    language: string;
    builds: [{
        major: number;
        minor: number | null;
    }];
    timestamps: string
    sources: string[];
    valid_indexes: number;
    indexes: number;
    valid_groups: number;
    groups: number;
    valid_keys: number;
    keys: number;
    size: number;
    blocks: number;
    disk_store_valid: boolean;
}

export class OpenRS2 {
    static ARCHIVE_COMPONENTS = 3;
    static ARCHIVE_MAPS = 5;
    static ARCHIVE_TEXTURES_DXT = 52;
    static ARCHIVE_TEXTURES_PNG = 53;
    static ARCHIVE_TEXTURES_PNG_MIPPED = 54;
    static ARCHIVE_TEXTURES_ETC = 55;
    static ARCHIVE_TYPEFONTS = 59;

    info: CacheInfo;
    url: string;

    static async getLatest(): Promise<CacheInfo[]> {
        return await downloadJson(`${OPENRS2_DOMAIN}/caches.json`, 'data/openrs2/caches.json') as CacheInfo[];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async find(query: any): Promise<OpenRS2> {
        const { openrs2 = -1, environment = 'live', lang = 'en', rev = -1, match = 0 } = query;
        let { game = '' } = query;

        if ((rev < 0 && openrs2 < 0) || (!rev.length && !openrs2.length)) {
            throw new Error('No rev or openrs2 build in your query. Example: &rev=550 or &openrs2=1');
        }

        const all: CacheInfo[] = await OpenRS2.getLatest();

        if (openrs2 != -1) {
            const match: CacheInfo | undefined = all.find((x: CacheInfo): boolean => x.id == openrs2);
            if (!match) {
                throw new Error('Build not found');
            }

            return new OpenRS2(match);
        } else if (rev != -1) {
            const matches: CacheInfo[] = all.filter((x: CacheInfo): boolean => x.environment == environment && x.language == lang && x.builds.length > 0 && x.builds.some((y: { major: number }): boolean => y.major == rev));

            if (matches.length > 0 && matches.some((x: CacheInfo): boolean => x.game != matches[0].game)) {
                throw new Error(`Ambiguous revision, please specify the game in your query. Example: &game=${matches[0].game}`);
            }

            if (!game) {
                // for ease of use we can make some assumptions and rely on the ambiguous revision check
                if (rev < 226) {
                    game = 'oldschool';
                } else {
                    game = 'runescape';
                }
            }

            if (matches.length > 0 && matches[match] && matches[match].game == game) {
                return new OpenRS2(matches[match]);
            }
        }

        throw new Error('Build not found');
    }

    constructor(info: CacheInfo) {
        this.info = info;
        this.url = `${OPENRS2_DOMAIN}/caches/${this.scope}/${this.id}`;
    }

    get id(): number {
        return this.info.id;
    }

    get scope(): string {
        return this.info.scope;
    }

    get game(): string {
        return this.info.game;
    }

    get environment(): string {
        return this.info.environment;
    }

    get rev(): number {
        return this.info.builds.length > 0 ? this.info.builds[0].major : -1;
    }

    isOldEngine(): boolean {
        return this.game === 'runescape' && this.rev < 400;
    }

    async getKeys(): Promise<unknown | null> {
        return downloadJson(`${this.url}/keys.json`, `data/openrs2/${this.id}/keys.json`);
    }

    async getGroup(archive: number, group: number): Promise<Uint8Array | null> {
        return download(`${this.url}/archives/${archive}/groups/${group}.dat`, `data/openrs2/${this.id}/${archive}/${group}.dat`);
    }
}
