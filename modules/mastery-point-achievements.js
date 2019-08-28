import ApiModule from './apiModule';

Set.prototype.difference = function(setB) {
    let difference = new Set(this);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
};

export default class extends ApiModule {
    get commandName() {
        return 'mastery-point-achievements';
    }

    async _execute() {
        this._terminal.writeLine(`<span style='color:yellow;'>This command will verify your account for all locked and unlocked mastery points. Please wait...</span>`);
        this._terminal.writeLine();
    
        const achievements = await this._api.achievements().all();
  
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
            this._api.account().achievements().get(),
            this._api.account().mastery().points().get()
        ]);
        const unlocked = accountPoints.unlocked;
        const locked = Array.from(new Set(masteries.keys()).difference(new Set(accountPoints.unlocked))).sort();
    
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
        
        return `${result}\n`;
    }
}
