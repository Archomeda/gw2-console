import 'core-js';
import { container } from 'tsyringe';

import Gw2Api from './gw2api';
import Console from './console';

import Commands from './commands';
import Help from './commands/help';
import Apikey from './commands/apikey';
import Clear from './commands/clear';
import Github from './commands/github';

import './css/gw2-console.css';
import DungeonCollection from './commands/dungeon-collection';
import Ls3Currencies from './commands/ls3-currencies';
import Ls4Currencies from './commands/ls4-currencies';
import MasteryPointAchievements from './commands/mastery-point-achievements';
import SabCollections from './commands/sab-collections';

// Set up DI
container.register<Gw2Api>(Gw2Api, { useClass: Gw2Api });
container.registerSingleton<Commands>(Commands);
container.registerSingleton<Console>(Console);

const commands = container.resolve(Commands);
commands.add(Help);
commands.add(Clear);
commands.add(Github);
commands.add(Apikey);
commands.add(DungeonCollection);
commands.add(Ls3Currencies);
commands.add(Ls4Currencies);
commands.add(MasteryPointAchievements);
commands.add(SabCollections);

container.resolve(Console);
