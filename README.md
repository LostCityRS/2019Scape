## Overview

The cache is 13.6GB. It's **highly** recommended to download the pre-processed cache from the link below if you don't want to wait for it to build.  
Jump down to the [DIY Cache Setup](#diy-cache-setup) section if you understand and want to build it yourself.

1. First and foremost - you need Node 20 or newer installed on your machine.
2. Next you'll need the server repository (you are here). Clone it down.
3. Download the cache and extract it to `data/` so you have a `data/pack/` folder inside.
4. Start the server using `npm start`.
5. Clone the client repository.
6. Start the client using `./gradlew run`.

### Requirements

- [Git](https://git-scm.com/downloads)
- [Node 20 or newer](https://nodejs.org/en/download/) (for the server)
- [Java 8 or newer](https://adoptium.net/) (for the client)
- [910 RS3 Java Cache](https://mega.nz/file/VXURDZ5J#CKKIPTt4WWO9OKikprD_KY_ZnnZQ3h33_DG7WOxHELM) (caches are paired to clients)

### Server Setup

```bash
git clone https://github.com/LostCityRS/2019Scape
cd 2019Scape
npm ci
# this line is not a command. go ahead and extract 2019Scape-Pack.7z to data/ now.
npm start
```

### Client Setup

```bash
git clone https://github.com/LostCityRS/2019Scape-Client
cd 2019Scape-Client
./gradlew run
```

### DIY Cache Setup

This grabs a `flat-file.tar.gz` from OpenRS2, extracts it, and packs it into the .js5 format.

As a result it takes 3 times the disk space (download, extract, pack). You'll want to delete the `data/cache/` folder afterwards to reclaim some space.

```bash
cd 2019Scape
npm run cache:download
```

If anything goes wrong with the download you can get the flat file cache manually from [OpenRS2](https://archive.openrs2.org/caches/runescape/1730).  Then move the file to `data/cache/1730/` and rename it to `flat-file.tar.gz`. Run `npm run cache:download` again and it will see the tar is downloaded, ready to extract.
