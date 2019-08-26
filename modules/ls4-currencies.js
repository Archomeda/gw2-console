import CurrencyModule from './currencies';

export default class extends CurrencyModule {
    get commandName() {
        return 'ls4-currencies';
    }

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
