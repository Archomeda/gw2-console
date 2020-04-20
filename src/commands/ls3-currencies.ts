import { injectable } from 'tsyringe';
import Gw2Api from '../gw2api';
import Console from '../console';
import Currencies from './currencies'
import ICommand from './icommand';

@injectable()
export default class Ls3Currencies extends Currencies implements ICommand {
    constructor(console: Console, api: Gw2Api) {
        super(console, api);
    }

    get name() { return 'ls3-currencies'; }

    get currencies() {
        return {
            79280: 'Blood Ruby',
            79469: 'Petrified Wood',
            79899: 'Fresh Winterberry',
            80332: 'Jade Shard',
            81127: 'Fire Orchid Blossom',
            81706: 'Orrian Pearl'
        };
    }
}
