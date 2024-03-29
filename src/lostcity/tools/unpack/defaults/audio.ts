import fs from 'fs';

import Js5 from '#jagex/js5/Js5.js';
import Packet from '#jagex/bytepacking/Packet.js';
import DefaultsAudio from '#jagex/config/defaults/AudioDefaults.js';

const js5: Js5 = await Js5.load('data/pack/client.defaults.js5');

const audio: DefaultsAudio = new DefaultsAudio();
const def: string[] = audio.decode(new Packet(await js5.readGroup(4)));

fs.writeFileSync('data/src/defaults/audio.defaults', def.join('\n') + '\n');
