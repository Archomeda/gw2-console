import CurrencyModule from './currencies';

export default class extends CurrencyModule {
    get commandName() {
        return 'ls3-currencies';
    }

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
