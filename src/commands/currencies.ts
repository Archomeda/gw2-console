import { wrapApi } from '../utils';
import Gw2Api from '../gw2api';
import Console from '../console';
import ICommand from './icommand'

// Abstract command module for finding Living Story-style "currencies"
// across a user's account. Including bank storage, material storage,
// and character inventories.
export default abstract class Currencies implements ICommand {
    constructor(protected console: Console, protected api: Gw2Api) { }

    abstract get name(): string;

    abstract get currencies(): { [key: number]: string }

    async execute(args: string[]) {
        const verbose = args.length > 0 && args[0] === 'verbose';

        this.console.terminal.writeLine(`<span style='color:yellow;'>Searching your account for currencies...</span>`);
        this.console.terminal.writeLine();

        const [bank, materials, account, characters] = await Promise.all([
            wrapApi(this.api.client.account().bank().get()),
            wrapApi(this.api.client.account().materials().get()),
            wrapApi(this.api.client.account().inventory().get()),
            wrapApi(this.api.client.characters().all())
        ]);

        const currencyCounts = { };
        Object.keys(this.currencies).forEach(a => currencyCounts[a] = 0);

        const bankCurrencies = bank
            .filter(item => item && item.id in currencyCounts)
            .map(item => ({ item, source: 'bank' }));
        const materialCurrencies = materials
            .filter(item => item && item.id in currencyCounts && item.count > 0)
            .map(item => ({ item, source: 'materials' }));
        const accountCurrencies = account
            .filter(item => item && item.id in currencyCounts)
            .map(item => ({ item, source: 'account' }));
        const characterCurrencies = characters
            .reduce((character, { bags, name }) =>
                ([ ...character,
                    ...bags.filter(Boolean).reduce((bag, { inventory }) =>
                        ([ ...bag,
                            ...(inventory
                                .filter(x => x && x.id in currencyCounts)
                                .map(item => ({ item, source: name }))
                            )
                        ]),
                    []
                    )
                ]),
            []);
        const allCurrencies = [
            ...bankCurrencies,
            ...materialCurrencies,
            ...accountCurrencies,
            ...characterCurrencies
        ];

        const currencyTotals = allCurrencies.reduce((counts, { item }) => ({ ...counts, [item.id]: (counts[item.id] || 0) + item.count }), currencyCounts);

        let result = 'Total Currencies:\n';
        result += Object.keys(this.currencies)
            .map(x => this.console.createItemIcon(x, currencyTotals[x], this.currencies[x]))
            .map(x => `- ${x}`).join('\n');
        result += '\n\n';

        if (verbose) {
            result += '\n<b>&gt; Detailed Breakdown</b>\n\n';
            const currencySources = allCurrencies.reduce((sources, x) => ({ ...sources, [x.source]: (sources[x.source] || []).concat([x.item]) }), {});

            const breakdownResults = Object.keys(currencySources).map(source => {
                let breakdownResult = '';
                if (source === 'bank') breakdownResult += 'Account Bank:\n';
                else if (source === 'materials') breakdownResult += 'Material Storage:\n';
                else breakdownResult += `${source}:\n`;
                const items = currencySources[source];
                const sourceTotals = items.reduce((counts, { id, count }) => ({ ...counts, [id]: (counts[id] || 0) + count }), {});
                breakdownResult += Object.keys(sourceTotals)
                    .map(x => this.console.createItemIcon(x, sourceTotals[x], this.currencies[x]))
                    .map(x => `- ${x}`).join('\n');
                return breakdownResult;
            });
            result += breakdownResults.join('\n\n');
        }
        else {
            result += `<span style='color:yellow;'>Use the 'verbose' argument for a detailed breakdown of where each currency is stored.</span>`;
        }

        return result;
    }
}
