import { injectable } from 'tsyringe';
import Gw2Api from '../gw2api';
import Console from '../console';
import Currencies from './currencies'

@injectable()
export default class Ls4Currencies extends Currencies {
    constructor(console: Console, api: Gw2Api) {
        super(console, api);
    }

    get name() { return 'ls4-currencies'; }

    get currencies() {
        return {
            86069: 'Kralkatite Ore',
            86977: 'Difluorite Crystal',
            87645: 'Inscribed Shard',
            88955: 'Lump of Mistonium',
            89537: 'Branded Mass',
            90783: 'Mistborn Mote'
        };
    }
}
