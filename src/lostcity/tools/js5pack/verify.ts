import Js5 from '#jagex/js5/Js5.js';
import Js5Archive from '#jagex/config/Js5Archive.js';
import Packet from '#jagex/bytepacking/Packet.js';

for (let i: number = 0; i < Js5Archive.getMaxId(); i++) {
    const type: Js5Archive | null = Js5Archive.forId(i);
    if (!type) {
        continue;
    }

    console.log(type);

    const js5: Js5 = await Js5.load(`data/pack/client.${type.name}.js5`, false);

    const oldIndex: Uint8Array = await Js5.decompress(js5.masterIndex);
    const expected: number = Packet.getcrc(oldIndex, 0, oldIndex.length);

    const newIndex: Uint8Array = js5.index.encode();
    const checksum: number = Packet.getcrc(newIndex, 0, newIndex.length);

    if (expected !== checksum) {
        console.error('Index mismatch');
    }

    for (let group: number = 0; group < js5.index.size; group++) {
        const groupId: number = js5.index.groupIds![group];
        const groupExpected: number = js5.index.groupChecksums![groupId];
        const groupData: Uint8Array | null = js5.readRaw(groupId);
        if (!groupData) {
            console.error('Missing group', groupId);
            continue;
        }

        const groupChecksum: number = Packet.getcrc(groupData, 0, groupData.length);
        if (groupExpected !== groupChecksum) {
            console.error('Group mismatch', groupId, groupExpected, groupChecksum);
        }
    }
}
