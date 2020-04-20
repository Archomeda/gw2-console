import { injectable } from "tsyringe";
import Commands from "./commands";
import Gw2Api from "./gw2api";
import Terminal from "./terminal";

@injectable()
export class Console {
    private _terminal: Terminal;

    constructor(private _commands: Commands, private api: Gw2Api) {
        const consoleTerminal = this;

        this._terminal = new Terminal('terminal', {
            welcome: `Guild Wars 2 Console - For command information, type 'help'.`,
            prompt: 'GW2'
        }, {
            execute: async function (cmd: string, args: string[]) {
                try {
                    const command = _commands.get(cmd);
                    if (command) {
                        const result = await Promise.resolve(command.execute(args));
                        return result ? result : '';
                    } else {
                        return false;
                    }
                } catch (err) {
                    console.log(err);
                    return `<span style='color:red;'>${err}</span>`;
                }
            },
            afterExecute: async function (cmd, args, outputElements) {
                await consoleTerminal.renderItemIcons(outputElements);
            },
            tabComplete: async function (prefix: string, index: number) {
                const candidates = _commands.list.map(x => x.name).filter(x => x.startsWith(prefix));
                if (candidates.length > 0) {
                    const fixedIndex = index % candidates.length;
                    return candidates[fixedIndex];
                }
                return false;
            }
        });
    }

    public get terminal() {
        return this._terminal;
    }

    public get commands() {
        return this._commands;
    }


    public async renderItemIcons(elements: HTMLElement[]) {
        const icons = elements.flatMap(x => Array.from(x.querySelectorAll<HTMLElement>('.item.item-unrendered')));
        const itemIds = icons.map(x => x.attributes['data-item-id'].value).filter(x => x);
        if (itemIds.length === 0) {
            return;
        }

        const items = await this.api.client.items().many(itemIds);
        for (const item of items) {
            const itemContainers = document.querySelectorAll<HTMLElement>(`.item-unrendered.item-${item.id}`);
            const itemImages = document.querySelectorAll<HTMLImageElement>(`.item-unrendered.item-${item.id} .item-icon`);
            const itemNames = document.querySelectorAll<HTMLElement>(`.item-unrendered.item-${item.id} .item-name`);
            itemContainers.forEach(x => x.classList.add(item.rarity.toLowerCase()));
            itemImages.forEach(x => x.src = item.icon);
            itemNames.forEach(x => x.innerHTML = item.name);
        }

        icons.forEach(x => x.classList.remove('item-unrendered'));
    }

    public createItemIcon(itemId: string, count: number = -1, name?: string) {
        const displayCount = count !== -1 ? count : '';
        if (displayCount) {
            return `<span class='item item-${itemId} item-unrendered' data-item-id='${itemId}'><img class='item-icon'/><span class='item-label'><span class='item-count'>${displayCount}</span> <span class='item-name'>${name}</span></span></span>`;
        } else {
            return `<span class='item item-${itemId} item-unrendered' data-item-id='${itemId}'><img class='item-icon'/><span class='item-label'><span class='item-name'>${name}</span></span></span>`;
        }
    }
}

export default Console;
