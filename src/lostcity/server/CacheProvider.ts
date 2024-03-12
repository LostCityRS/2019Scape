import Cache from '#jagex/js5/Cache.js';

const CacheProvider: Cache = new Cache();
await CacheProvider.load('data/pack');

export default CacheProvider;
