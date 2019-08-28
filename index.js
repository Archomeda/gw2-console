import cacheBrowserStorage from 'gw2api-client/src/cache/browser';
import client from 'gw2api-client';
import Terminal from './terminal.js';
import modules from './modules';
import './static/gw2-console.css';

const api = client();

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

const cacheOptions = {
    storageKey: 'gw2-console'
}

api.cacheStorage(cacheBrowserStorage(cacheOptions));

async function renderIcons() {
    const icons = Array.from(document.querySelectorAll('.item.item-unrendered'));
    const item_ids = icons.map((element) => (element.attributes['data-item-id'].value)).filter((elem) => (elem && elem != ''));
    if (item_ids.length == 0) return;
    const items = await api.items().many(item_ids);
    items.forEach(({id, icon, rarity, name}) => {
        const item_containers = document.querySelectorAll(`.item-unrendered.item-${id}`);
        const item_images = document.querySelectorAll(`.item-unrendered.item-${id} .item-icon`);
        const item_names = document.querySelectorAll(`.item-unrendered.item-${id} .item-name`);
        item_containers.forEach((container) => (container.classList.add(rarity.toLowerCase())));
        item_images.forEach((image) => (image.src = icon));
        item_names.forEach((item_name) => (item_name.innerHTML = name));
    });
    icons.forEach((icon) => (icon.classList.remove('item-unrendered')));
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
                return result;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return `<span style='color:red;'>${err}</span>`;
        }
    },
    after_execute: async function (cmd, args) {
        await renderIcons();
    },
    tabComplete: async function(prefix, index) {
        const candidates = Object.keys(commands).sort().filter((cmd) => (cmd.startsWith(prefix)));
        if (candidates.length > 0) {
            const fixedIndex = index % candidates.length;
            return candidates[fixedIndex];
        }
        return false;
    }
});

terminal.renderItem = function(item_id, count = -1, name = '') {
    const display_count = count != -1 ? `${count} ` : '';
    return `<span class='item item-${item_id} item-unrendered' data-item-id='${item_id}'><img class='item-icon'/><span class='item-label'><span class='item-count'>${display_count}</span><span class='item-name'>${name}</span></span></span>`;
};

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
    }
}

for (const module of modules) {
    const newModule = new module();
    newModule.initialize(terminal, api);
    commands[newModule.commandName] = newModule.execute.bind(newModule);
}
