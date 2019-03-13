const client = require('gw2api-client');
const Terminal = require('./terminal.js');

const api = client();
const initDungeonCollection = require('./gw2/dungeon-collection');
const initMasteryPointAchievements = require('./gw2/mastery-point-achievements');
const initSabCollections = require('./gw2/sab-collections');

const settings = {
    get apiKey() {
        return localStorage.getItem('apiKey');
    },
    set apiKey(val) {
        localStorage.setItem('apiKey', val);
        api.authenticate(val);
    }
};

if (settings.apiKey) {
    api.authenticate(settings.apiKey);
}

const terminal = new Terminal('terminal', {
    welcome: `Guild Wars 2 Console - For command information, type 'help'.`,
    prompt: 'GW2'
}, {
    execute: async function (cmd, args) {
        try {
            if (commands[cmd]) {
                let result = commands[cmd](...args);
                if (result.then) {
                    result = await result;
                }
                result = result.replace(/\n/g, '<br />');
                return result;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return `<span style='color:red;'>${err}</span>`;
        }
    }
});

async function wrapApi(promise) {
    try {
        return await promise;
    } catch (err) {
        if (!err.content) {
            throw err;
        } else if (err.content.text) {
            throw `Error ${err.response.status}: ${err.content.text}.`;
        } else {
            throw `Error ${err.response.status}`;
        }
    }
}

const dungeonCollection = initDungeonCollection(terminal, api);
const masteryPointAchievements = initMasteryPointAchievements(terminal, api);
const sabCollections = initSabCollections(terminal, api);

const commands = {
    /** Terminal specific commands **/
    clear: function() {
        terminal.clear();
        return '';
    },

    help: function() {
        return `Available commands: ${Object.keys(commands).sort().join(', ')}.`;
    },

    github: function() {
        return `The GitHub repository can be found at <a href='https://github.com/Archomeda/gw2-console' target='_blank'>github.com/Archomeda/gw2-console</a>.`;
    },

    /** API commands **/
    apikey: async function(key) {
        if (!key) {
            if (settings.apiKey) {
                return `Your API key is currently set to '${settings.apiKey}'.`;
            } else {
                return `You have no API key set. You can set one with 'apikey &lt;key&gt;'. This API key will be saved to your browser local storage.`;
            }
        } else {
            terminal.writeLine(`<span style='color:yellow;'>Testing API key, hang on tight...</span>`);
            const testApi = client().authenticate(key);
            const response = await wrapApi(testApi.account().get());
            if (typeof(response) === 'string') {
                return `Invalid API key: ${response}`;
            } else {
                settings.apiKey = key;
                return `Hello ${response.name}! Your API key is set to '${key}'.`;
            }
        }
    },

    'dungeon-collection': async() => wrapApi(dungeonCollection()),
    'mastery-point-achievements': async() => wrapApi(masteryPointAchievements()),
    'sab-collections': async() => wrapApi(sabCollections())
}
