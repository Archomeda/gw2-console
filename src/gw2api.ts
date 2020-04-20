import cacheBrowserStorage from 'gw2api-client/src/cache/browser';
import client, { LibGw2ApiClient } from 'gw2api-client';
import { injectable } from 'tsyringe';

@injectable()
export class Gw2Api {
    private _client: LibGw2ApiClient;

    constructor() {
        this._client = client();
        const apiKey = localStorage.getItem('apikey');
        if (apiKey) {
            this._client.authenticate(apiKey);
        }
        const cacheOptions = {
            storageKey: 'gw2-console'
        };
        this._client.cacheStorage(cacheBrowserStorage(cacheOptions));
    }

    get client() {
        return this._client;
    }
}

export default Gw2Api;
