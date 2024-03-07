## Setup Instructions

1. First and foremost - you need Node 20 or newer installed on your machine. You can download it from [here](https://nodejs.org/en/download/).
2. Next you'll need the server repository (you are here). Clone it down.
3. Download the cache. There's a [pre-processed cache available here](todo), or DIY below. Extract it in `data/pack/` if you grabbed the link.
4. Start the server! It uses npm.
5. Clone the client repository.
6. Start the client! It uses gradle.

**Steps #2-4**
```bash
git clone https://github.com/LostCityRS/2019Scape
cd 2019Scape
npm ci
npm start
```

**Steps #5-6**
```bash
git clone https://github.com/LostCityRS/2019Scape-Client
cd 2019Scape-Client
./gradlew run
```

### DIY OpenRS2 Cache

**Alternatively** if you want to build it yourself or the link isn't available, there are scripts included to do it, but it will require **3** (!!!) times the space of the cache itself. You can reclaim some space afterwards by deleting the `data/cache/` folder.  
It has to be downloaded as flat files from OpenRS2 (1x), extracted (2x), and then packed into a single .js5 archive (3x). You just run a command and go watch a show while it does it for you.

```bash
cd 2019Scape
npm run cache:download
```
