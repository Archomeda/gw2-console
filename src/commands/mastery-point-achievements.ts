import { injectable } from 'tsyringe';
import { wrapApi } from '../utils';
import Gw2Api from '../gw2api';
import Console from '../console';
import ICommand from './icommand'

@injectable()
export default class MasteryPointAchievements implements ICommand {
    constructor(private console: Console, private api: Gw2Api) { }

    get name() { return 'mastery-point-achievements'; }

    async execute(args: string[]) {
        this.console.terminal.writeLine(`<span style='color:yellow;'>Searching your account for all locked and unlocked mastery points...</span>`);
        this.console.terminal.writeLine();

        const achievements = await wrapApi(this.api.client.achievements().all());

        const masteriesRegion = new Map();
        const masteries = new Map();
        for (let achievement of achievements) {
            const mastery = achievement.rewards ? achievement.rewards.find(r => r.type === 'Mastery') : null;
            if (!mastery) {
                continue;
            }
            if (!masteries.has(mastery.id)) {
                masteries.set(mastery.id, []);
            }
            if (!masteriesRegion.has(mastery.region)) {
                masteriesRegion.set(mastery.region, []);
            }
            masteriesRegion.get(mastery.region).push(achievement);
            masteries.get(mastery.id).push(achievement);
        }

        const [accountAchievements, accountPoints] = await Promise.all([
            wrapApi(this.api.client.account().achievements().get()),
            wrapApi(this.api.client.account().mastery().points().get())
        ]);
        const unlocked = accountPoints.unlocked;
        const locked = Array.from(this.setDifference(new Set(masteries.keys()), new Set(accountPoints.unlocked))).sort();

        const unlockedIncorrectly = unlocked.filter(m => {
            const accountAchievement = accountAchievements.find(a => masteries.has(m) && masteries.get(m).find(m => m.id === a.id));
            return !accountAchievement || !accountAchievement.done;
        });
        const lockedIncorrectly = locked.filter(m => {
            const accountAchievement = accountAchievements.find(a => masteries.has(m) && masteries.get(m).find(m => m.id === a.id));
            return accountAchievement && accountAchievement.done;
        });

        let result = '';
        result += `Unlocked incorrectly:\n`;
        for (let mastery of unlockedIncorrectly) {
            const achievement = masteries.get(mastery);
            if (achievement) {
                result += ` - ${mastery} -> ${achievement.map(a => `${a.name} (${a.id})`).join(', ')}\n`;
            } else {
                result += ` - ${mastery} -> unknown achievement\n`;
            }
        }
        result += `\n`;

        result += `Locked incorrectly:\n`;
        for (let mastery of lockedIncorrectly) {
            const achievement = masteries.get(mastery);
            if (achievement) {
                result += ` - ${mastery} -> ${achievement.map(a => `${a.name} (${a.id})`).join(', ')}\n`;
            } else {
                result += ` - ${mastery} -> unknown achievement\n`;
            }
        }

        return result;
    }

    private setDifference<T>(setA: Set<T>, setB: Set<T>) {
        let difference = new Set(setA);
        for (let elem of setB) {
            difference.delete(elem);
        }
        return difference;
    }
}
