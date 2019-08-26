import ApiModule from './apiModule';

// Abstract command module for finding Living Story-style "currencies"
// across a user's account. Including bank storage, material storage,
// and character inventories.
export default class extends ApiModule {
    // Override this method to define what currencies to search for.
    // Return value should be an object where keys are item IDs,
    // and values are the name of the currency.
    // e.g.
    // { 86069: 'Kralkatite Ore', 86977: 'Difluorite Crystal' }
    get currencies() {
        return {};
    }

    async _execute(verbose) {
        this._terminal.writeLine(`<span style='color:yellow;'>Searching your account. Please wait...</span>`);
        this._terminal.writeLine();

        const [bank, materials, account, characters] = await Promise.all([
            this._api.account().bank().get(),
            this._api.account().materials().get(),
            this._api.account().inventory().get(),
            this._api.characters().all()
        ]);

        let currencyCounts = {};
        Object.keys(this.currencies).forEach(a => currencyCounts[a] = 0);

        const bankCurrencies = bank
              .filter(item => item && item.id in currencyCounts)
              .map(item => (item.source = 'bank', item));
        const materialCurrencies = materials
              .filter(item => item && item.id in currencyCounts && item.count > 0)
              .map(item => (item.source = 'materials', item));
        const accountCurrencies = account
              .filter(item => item && item.id in currencyCounts)
              .map(item => (item.source = 'account', item));
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
            ...accountCurrencies,
            ...characterCurrencies
        ];

        const currencyTotals = allCurrencies.reduce((counts, {id, count}) => ({ ...counts, [id]: (counts[id] || 0) + count }), currencyCounts);

        let result = 'Total Currencies:\n';
        Object.keys(this.currencies).forEach((currency) => (result += `- ${this.currencies[currency]}: ${currencyTotals[currency]}\n`), this);

        if (verbose === 'verbose') {
            result += '\n= Detailed Breakdown =\n\n';
            const currencySources = allCurrencies.reduce((sources, item) => ({ ...sources, [item.source]: (sources[item.source] || []).concat([item]) }), {});
            Object.keys(currencySources).forEach((source) => {
                if (source === 'bank') result += 'Account Bank:\n'
                else if (source === 'materials') result += 'Material Storage:\n';
                else result += `${source}:\n`;
                const items = currencySources[source];
                const sourceTotals = items.reduce((counts, {id, count}) => ({ ...counts, [id]: (counts[id] || 0) + count }), {});
                Object.keys(sourceTotals).forEach((currency) => (result += `- ${this.currencies[currency]}: ${sourceTotals[currency]}\n`), this);
            });
        }
        else {
            result += `\n<span style='color:yellow;'>Use the 'verbose' argument for a detailed breakdown of where each currency is stored.</span>\n`;
        }

        return result;
    }
}
