import ApiModule from './apiModule';

const currencies = {
    86069: 'Kralkatite Ore',
    86977: 'Difluorite Crystal',
    87645: 'Inscribed Shard',
    88955: 'Lump of Mistonium',
    89537: 'Branded Mass',
    90783: 'Mistborn Mote'
};

export default class extends ApiModule {
    get commandName() {
        return 'ls4-currencies';
    }

    async _execute() {
        this._terminal.writeLine(`<span style='color:yellow;'>Searching your account for Living Story Season 4 currencies. Please wait...</span>`);
        this._terminal.writeLine();

        const [bank, materials, characters] = await Promise.all([
            this._api.account().bank().get(),
            this._api.account().materials().get(),
            this._api.characters().all()
        ]);

        let currencyCounts = {};
        Object.keys(currencies).forEach(a => currencyCounts[a] = 0);

        bank.forEach(function(item) {
            if (item === null) return;
            if (item.id in currencyCounts) currencyCounts[item.id] += item.count;
        });
        materials.forEach(function(item) {
            if (item === null) return;
            if (item.id in currencyCounts) currencyCounts[item.id] += item.count;
        });
        characters.forEach(function(character) {
            character.bags.forEach(function(bag) {
                if (bag === null) return;
                bag.inventory.forEach(function(item) {
                    if (item === null) return;
                    if (item.id in currencyCounts) currencyCounts[item.id] += item.count;
                });
            });
        });

        let result = '';
        Object.keys(currencies).forEach(currency => result += `${currencies[currency]}: ${currencyCounts[currency]}\n`);
        return result;
    }
}
