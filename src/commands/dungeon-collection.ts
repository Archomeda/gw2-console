import { injectable } from 'tsyringe';
import { wrapApi } from '../utils';
import Gw2Api from '../gw2api';
import Console from '../console';
import ICommand from './icommand'

const collectionAchievements = [
    1725, // AC
    1723, // CM
    1721, // TA
    1722, // SE
    1714, // CoF
    1718, // HotW
    1719, // CoE
    1724 // Arah
];

const tokenCurrencies = {
    1725: 5,
    1723: 9,
    1721: 11,
    1722: 10,
    1714: 13,
    1718: 12,
    1719: 14,
    1724: 6
};

const skinCosts = {
    Helm: 180,
    Shoulders: 210,
    Coat: 330,
    Gloves: 180,
    Leggings: 300,
    Boots: 180,
    Axe: 300,
    Dagger: 300,
    Focus: 210,
    Greatsword: 390,
    Hammer: 390,
    Spear: 390,
    Longbow: 390,
    Mace: 300,
    Pistol: 300,
    Rifle: 390,
    Scepter: 210,
    Shield: 210,
    Shortbow: 390,
    Speargun: 390,
    Staff: 390,
    Sword: 300,
    Torch: 210,
    Trident: 390,
    Warhorn: 210
};

@injectable()
export default class DungeonCollections implements ICommand {
    constructor(private console: Console, private api: Gw2Api) { }

    get name() { return 'dungeon-collection'; }

    async execute(args: string[]) {
        this.console.terminal.writeLine(`<span style='color:yellow;'>Searching your account for dungeon collection skins...</span>`);
        this.console.terminal.writeLine();

        const [achievements, accountAchievements, wallet] = await Promise.all([
            wrapApi(this.api.client.achievements().many(collectionAchievements)),
            wrapApi(this.api.client.account().achievements().many(collectionAchievements)),
            wrapApi(this.api.client.account().wallet().get())
        ]);

        const skinIds = achievements.map(a => a.bits.map(b => b.id));
        const skins = new Map(
            (await Promise.all(skinIds.map(x => wrapApi(this.api.client.skins().many(x)))))
                .flat()
                .map(x => [x.id, x]));

        let result = '';
        for (let achievement of achievements) {
            // Determine locked / unlocked status
            const accountAchievement = accountAchievements.find(a => a.id === achievement.id);
            const skinsUnlocked = accountAchievement ? (accountAchievement.done ? achievement.bits.map(b => b.id) : accountAchievement.bits.map(b => achievement.bits[b].id)) : [];
            const skinsLocked = achievement.bits.filter(b => skinsUnlocked.indexOf(b.id) === -1).map(b => b.id);

            // Determine dungeon tokens
            const tokensSpent = skinsUnlocked.map(id => skinCosts[skins.get(id).details.type]).reduce((a, b) => a + b);
            const tokensLeft = skinsLocked.map(id => skinCosts[skins.get(id).details.type]).reduce((a, b) => a + b);
            const tokensOwned = wallet.find(c => c.id === tokenCurrencies[achievement.id]).value;

            // Output
            result += `${achievement.name}:\n`;
            result += ` - Unlocked skins: ${skinsUnlocked.length}/${skinsUnlocked.length + skinsLocked.length}\n`;
            result += ` - Tokens required: ${tokensLeft.toLocaleString()} (${tokensSpent.toLocaleString()}/${(tokensSpent + tokensLeft).toLocaleString()})\n`;
            result += ` - Tokens to collect: ${(tokensLeft < tokensOwned ? 0 : tokensLeft - tokensOwned).toLocaleString()} (${tokensOwned.toLocaleString()}/${tokensLeft.toLocaleString()})\n`;
        }
        return result;
    }
}
