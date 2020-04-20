import { injectable } from 'tsyringe';
import { wrapApi } from '../utils';
import Gw2Api from '../gw2api';
import Console from '../console';
import ICommand from './icommand'

@injectable()
export default class Apikey implements ICommand {
    constructor(private console: Console, private api: Gw2Api) { }

    get name() { return 'apikey'; }

    async execute(args: string[]) {
        const key = args.length > 0 ? args[0] : undefined;
        const existingKey = localStorage.getItem('apikey');

        if (!key) {
            if (existingKey) {
                return `Your API key is currently set to '${existingKey}'.`;
            } else {
                return `You have no API key set. You can set one with 'apikey &lt;key&gt;'. This API key will be saved to your browser local storage.`;
            }
        } else {
            this.console.terminal.writeLine(`<span style='color:yellow;'>Testing API key, hang on tight...</span>`);
            const testApi = this.api.client.authenticate(key);
            try {
                const response = await wrapApi(testApi.account().get());
                localStorage.setItem('apikey', key);
                return `Hello ${response.name}! Your API key is set to '${key}'.`;
            } catch(e) {
                this.api.client.authenticate(existingKey);
                return e;
            }
        }
    }
}
