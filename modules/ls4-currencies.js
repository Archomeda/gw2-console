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

    async _execute(verbose) {
        this._terminal.writeLine(`<span style='color:yellow;'>Searching your account for Living Story Season 4 currencies. Please wait...</span>`);
        this._terminal.writeLine();

        const [bank, materials, characters] = await Promise.all([
            this._api.account().bank().get(),
            this._api.account().materials().get(),
            this._api.characters().all()
        ]);

        let currencyCounts = {};
        Object.keys(currencies).forEach(a => currencyCounts[a] = 0);

        const bankCurrencies = bank
              .filter(item => item && item.id in currencyCounts)
              .map(item => (item.source = 'bank', item));
        const materialCurrencies = materials
              .filter(item => item && item.id in currencyCounts && item.count > 0)
              .map(item => (item.source = 'materials', item));
        const characterCurrencies = characters
              .reduce((character, {bags, name}) =>
                      ([ ...character,
                         ...bags.filter(Boolean).reduce((bag, {inventory}) =>
                                                        ([ ...bag,
                                                           ...(inventory
                                                               .filter((item) => item && item.id in currencyCounts)
                                                               .map((item) => (item.source = name, item))
                                                              )
                                                         ]),
                                                        []
                                                       )
                       ]),
                      []
                     );
        const allCurrencies = [
            ...bankCurrencies,
            ...materialCurrencies,
            ...characterCurrencies
        ];

        const currencyTotals = allCurrencies.reduce((counts, {id, count}) => ({ ...counts, [id]: (counts[id] || 0) + count }), currencyCounts);

        let result = 'Total Currencies:\n';
        Object.keys(currencies).forEach(currency => result += `- ${currencies[currency]}: ${currencyTotals[currency]}\n`);

        if (verbose === 'verbose') {
            result += '\n= Detailed Breakdown =\n\n';
            const currencySources = allCurrencies.reduce((sources, item) => ({ ...sources, [item.source]: (sources[item.source] || []).concat([item]) }), {});
            Object.keys(currencySources).forEach((source) => {
                if (source === 'bank') result += 'Account Bank:\n'
                else if (source === 'materials') result += 'Material Storage:\n';
                else result += `${source}:\n`;
                const items = currencySources[source];
                const sourceTotals = items.reduce((counts, {id, count}) => ({ ...counts, [id]: (counts[id] || 0) + count }), {});
                Object.keys(sourceTotals).forEach(currency => result += `- ${currencies[currency]}: ${sourceTotals[currency]}\n`);
            });
        }

        return result;
    }
}
