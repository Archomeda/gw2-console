const collectionAchievements = [
    2875, // The Super Adventure (blue)
    2880, // The Kind Toad (green)
    2860, // The Storm Wizard (yellow)
    2867, // The Kaiser (orange)
    3393 // The Crimson Assassin (red)
];

const sabItems = {
    2875: [ // Blue weapons
        46515, // Axe (bound)
        46533, // Dagger (bound)
        46521, // Focus (bound)
        41925, // Greatsword (bound)
        46536, // Hammer (bound)
        41940, // Longbow (bound)
        46512, // Mace (bound)
        46527, // Pistol (bound)
        46530, // Rifle (bound)
        41928, // Scepter (bound)
        41934, // Shield (bound)
        41937, // Short Bow (bound)
        41931, // Staff (bound)
        41922, // Sword (bound)
        46524, // Torch (bound)
        46518, // Warhorn (bound)
        46540, // Axe
        46546, // Dagger
        46542, // Focus
        41946, // Greatsword
        46547, // Hammer
        41949, // Longbow
        46539, // Mace
        46544, // Pistol
        46545, // Rifle
        41952, // Scepter
        41955, // Shield
        41958, // Short Bow
        41961, // Staff
        41964, // Sword
        46543, // Torch
        46541, // Warhorn
    ],
    2880: [ // Green weapons
        46551, // Axe
        46569, // Dagger
        46557, // Focus
        46575, // Greatsword
        46572, // Hammer
        46578, // Longbow
        46548, // Mace
        46563, // Pistol
        46566, // Rifle
        46581, // Scepter
        46584, // Shield
        46587, // Short Bow
        46590, // Staff
        46593, // Sword
        46560, // Torch
        46554 // Warhorn
    ],
    2860: [ // Yellow weapons
        46599, // Axe
        46617, // Dagger
        46605, // Focus
        46623, // Greatsword
        46620, // Hammer
        46626, // Longbow
        46596, // Mace
        46611, // Pistol
        46614, // Rifle
        46629, // Scepter
        46632, // Shield
        46635, // Short Bow
        46638, // Staff
        46641, // Sword
        46608, // Torch
        46602 // Warhorn
    ],
    2867: [ // Orange weapons
        78105, // Axe
        78045, // Axe (bound)
        78029, // Axe (blue infusion)
        78068, // Axe (red infusion)
        78024, // Dagger
        78087, // Dagger (bound)
        78110, // Dagger (blue infusion)
        78073, // Dagger (red infusion)
        78022, // Focus
        78066, // Focus (bound)
        78060, // Focus (blue infusion)
        78102, // Focus (red infusion)
        78053, // Greatsword
        78106, // Greatsword (bound)
        78037, // Greatsword (blue infusion)
        78059, // Greatsword (red infusion)
        78081, // Hammer
        78100, // Hammer (bound)
        78051, // Hammer (blue infusion)
        78104, // Hammer (red infusion)
        78048, // Longbow
        78082, // Longbow (bound)
        78020, // Longbow (blue infusion)
        78014, // Longbow (red infusion)
        78013, // Mace
        78021, // Mace (bound)
        78098, // Mace (blue infusion)
        78056, // Mace (red infusion)
        78077, // Pistol
        78064, // Pistol (bound)
        78047, // Pistol (blue infusion)
        78113, // Pistol (red infusion)
        78023, // Rifle
        78035, // Rifle (bound)
        78083, // Rifle (blue infusion)
        78032, // Rifle (red infusion)
        78070, // Scepter
        78107, // Scepter (bound)
        78099, // Scepter (blue infusion)
        78063, // Scepter (red infusion)
        78112, // Shield
        78075, // Shield (bound)
        78092, // Shield (blue infusion)
        78093, // Shield (red infusion)
        78067, // Short Bow
        78017, // Short Bow (bound)
        78055, // Short Bow (blue infusion)
        78091, // Short Bow (red infusion)
        78050, // Staff
        78015, // Staff (bound)
        78078, // Staff (blue infusion)
        78080, // Staff (red infusion)
        78103, // Sword
        78101, // Sword (bound)
        78072, // Sword (blue infusion)
        78061, // Sword (red infusion)
        78033, // Torch
        78042, // Torch (bound)
        78040, // Torch (blue infusion)
        78111, // Torch (red infusion)
        78096, // Warhorn
        78026, // Warhorn (bound)
        78109, // Warhorn (blue infusion)
        78044 // Warhorn (red infusion)
    ],
    3393: [ // Red weapons
        80959, // Axe
        80968, // Dagger
        80870, // Focus
        80921, // Greatsword
        80894, // Hammer
        80933, // Longbow
        80931, // Mace
        80896, // Pistol
        80940, // Rifle
        80876, // Scepter
        80937, // Shield
        80905, // Short Bow
        80963, // Staff
        80912, // Sword
        80950, // Torch
        80867 // Warhorn
    ]
};

const sabContainers = {
    2867: [
        78039, // Super Adventure Weapon Box (bound orange weapon skin or 8 Crimson Assassin Tokens)
        78071, // Kaiser Snake Weapon Box (King Toad)
        78049, // Kaiser Snake Weapon Box (Storm Wizard)
        78058 // Kaiser Snake Weapon Box (skin)
    ]
};

const tokenItems = {
    3393: 80890
};

const tokenCosts = {
    3393: {
        Axe: 12,
        Dagger: 12,
        Focus: 8,
        Greatsword: 16,
        Hammer: 16,
        Longbow: 16,
        Mace: 12,
        Pistol: 12,
        Rifle: 16,
        Scepter: 12,
        Shield: 8,
        Shortbow: 16,
        Staff: 16,
        Sword: 12,
        Torch: 8,
        Warhorn: 8
    }
};

const itemProviders = {
    80890: [
        {
            id: 80862,
            count: 1,
            dayLimit: 1
        },
        {
            id: 78039,
            count: 8,
            dayLimit: 8
        }
    ]
};

let _terminal;
let _api;

async function dungeonCollection() {
    const [achievements, accountAchievements, items, bank, characters] = await Promise.all([
        _api.achievements().many(collectionAchievements),
        _api.account().achievements().many(collectionAchievements),
        _api.items().many(Object.values(sabItems).concat(Object.values(sabContainers), Object.values(tokenItems), [].concat.apply([], Object.values(itemProviders)).map(x => x.id)).flat()),
        _api.account().bank().get(),
        _api.characters().all()
    ]);

    const mappedItems = new Map(items.map(x => [x.id, x]));

    // Get skin ids from achievements
    const achievementSkins = new Map(achievements.map(a => [a.id, a.bits.map(b => b.id)]));

    // Get item skins
    const itemsToFind = new Map(items.map(x => {
        switch (x.type) {
            case 'Consumable':
                return [x.id, x.details.skins];
            case 'Weapon':
                return [x.id, [x.default_skin]];
        }
        return undefined;
    }).filter(x => x));

    // Add containers
    for (let achievementId of Object.keys(sabContainers)) {
        achievementId = parseInt(achievementId, 10);
        for (const containerId of sabContainers[achievementId]) {
            itemsToFind.set(containerId, achievementSkins.get(achievementId));
        }
    }

    // Add tokens
    for (let achievementId of Object.keys(tokenItems)) {
        achievementId = parseInt(achievementId, 10);
        itemsToFind.set(tokenItems[achievementId], null);
    }

    // Match skin ids to their items
    const skinItems = new Map();
    for (const [itemId, skinIds] of itemsToFind) {
        if (skinIds) {
            for (const skinId of skinIds) {
                if (!skinItems.has(skinId)) {
                    skinItems.set(skinId, []);
                }
                skinItems.get(skinId).push(itemId);
            }
        }
    }

    // Match all consumables in inventories
    const ownedItems = new Map();
    const addOwnedItem = (id, count, description) => {
        if (!ownedItems.has(id)) {
            ownedItems.set(id, []);
        }
        ownedItems.get(id).push({ count, description });
    };
    for (const character of characters) {
        // Search equipment
        for (const equipment of character.equipment.filter(e => e)) {
            if (itemsToFind.has(equipment.id)) {
                addOwnedItem(equipment.id, 1, `${character.name} - Equipped as ${equipment.slot}`);
            }
        }
        // Search bags
        for (const bag of character.bags.filter(b => b)) {
            for (const item of bag.inventory.filter(i => i)) {
                if (itemsToFind.has(item.id)) {
                    addOwnedItem(item.id, item.count, `${character.name} - Inventory`);
                }
            }
        }
    }
    for (const bankSlot of bank.filter(s => s)) {
        if (itemsToFind.has(bankSlot.id)) {
            addOwnedItem(bankSlot.id, bankSlot.count, 'Bank');
        }
    }

    _terminal.writeLine(`<span style='color:yellow;'>This command will search your account for all SAB related skin collections, and outputs the result. Please wait...</span>`);
    _terminal.writeLine();
        
    let result = '';
    for (const achievement of achievements) {
        // Determine locked / unlocked status
        const accountAchievement = accountAchievements.find(a => a.id === achievement.id);
        const skinsUnlocked = accountAchievement ? (accountAchievement.done ? achievement.bits.map(b => b.id) : accountAchievement.bits.map(b => achievement.bits[b].id)) : [];
        const skinsLocked = achievement.bits.filter(b => skinsUnlocked.indexOf(b.id) === -1).map(b => b.id);

        // Determine tokens
        let tokensRequired = undefined;
        if (tokenCosts[achievement.id]) {
            tokensRequired = Object.values(tokenCosts[achievement.id]).reduce((a, b) => a + b, 0);
        }

        // Determine item locations
        const getOwnedItems = (items, prefix) => {
            const result = [];
            let count = 0;
            if (items) {
                for (const itemId of items) {
                    if (ownedItems.has(itemId)) {
                        for (const item of ownedItems.get(itemId)) {
                            const name = mappedItems.get(itemId) ? mappedItems.get(itemId).name : `((unknown:${itemId}))`;
                            result.push(`${prefix}- ${name}: ${item.description} (x${item.count})`);
                            count += item.count;
                        }
                    }
                }
            }
            return [result, count];
        };
        const getUnlockedItems = items => getOwnedItems(items[achievement.id], '&nbsp;')[0];
        const getTokenItems = items => getOwnedItems([items[achievement.id]], '&nbsp;');

        const sabItemsUnlockedResult = getUnlockedItems(sabItems);
        const sabContainersUnlockedResult = getUnlockedItems(sabContainers);
        const [tokensUnlockedResult, tokensUnlocked] = getTokenItems(tokenItems);

        // Output
        result += `${achievement.name}:\n`;
        result += `&nbsp;- Unlocked skins: ${skinsUnlocked.length}/${skinsUnlocked.length + skinsLocked.length}\n`;
        
        if (sabItemsUnlockedResult.length > 0) {
            result += `${sabItemsUnlockedResult.join('\n')}\n`;
        }

        if (sabContainersUnlockedResult.length > 0) {
            result += `${sabContainersUnlockedResult.join('\n')}\n`;
        }

        if (tokensUnlockedResult.length > 0) {
            result += `${tokensUnlockedResult.join('\n')}\n`;
        }

        if (tokensRequired !== undefined) {
            const name = mappedItems.get(tokenItems[achievement.id]) ? mappedItems.get(tokenItems[achievement.id]).name : `((unknown:${tokenItems[achievement.id]}))`;
            const tokenProviders = itemProviders[tokenItems[achievement.id]];

            const tokensPerDay = tokenProviders.reduce((a, c) => a + (c.count / c.dayLimit || 0), 0);
            result += `&nbsp;- ${tokensPerDay}x ${name} per day:\n`;
            for (let tokenProvider of tokenProviders) {
                result += `&nbsp;&nbsp;&nbsp;- ${mappedItems.get(tokenProvider.id).name}: ${tokenProvider.count}x per ${tokenProvider.dayLimit} day(s)\n`;
            }

            result += '&nbsp;- Without unopened containers:\n'
            result += `&nbsp;&nbsp;&nbsp;- Tokens obtained: ${tokensUnlocked}/${tokensRequired}x ${name}\n`;
            const tokensRemaining = tokensRequired - tokensUnlocked;
            result += `&nbsp;&nbsp;&nbsp;- Tokens to collect: ${tokensRemaining < 0 ? 0 : tokensRemaining}x ${name}\n`;
            if (tokensRemaining > 0) {
                result += `&nbsp;&nbsp;&nbsp;- Days remaining: ${tokensRemaining / tokensPerDay} (does not take achievement gating into account)\n`;
            }

            result += '&nbsp;- With unopened containers:\n'

            let tokensUnlockedExtra = '';
            let tokensUnlockedExtraCount = tokensUnlocked;
            for (let tokenProvider of tokenProviders) {
                const [tokenContainersUnlockedResult, tokenContainersUnlocked] = getOwnedItems([tokenProvider.id], '&nbsp;&nbsp;&nbsp;');
                tokensUnlockedExtraCount += tokenContainersUnlocked * tokenProvider.count;
                if (tokenContainersUnlockedResult.length > 0) {
                    tokensUnlockedExtra += `${tokenContainersUnlockedResult.join('\n')}\n`;
                }
            }
            result += tokensUnlockedExtra;
            result += `&nbsp;&nbsp;&nbsp;- Tokens obtained: ${tokensUnlockedExtraCount}/${tokensRequired}x ${name}\n`;
            const tokensRemainingExtra = tokensRequired - tokensUnlockedExtraCount;
            result += `&nbsp;&nbsp;&nbsp;- Tokens to collect: ${tokensRemainingExtra < 0 ? 0 : tokensRemainingExtra}x ${name}\n`;
            if (tokensRemainingExtra > 0) {
                result += `&nbsp;&nbsp;&nbsp;- Days remaining: ${tokensRemainingExtra / tokensPerDay} (does not take achievement gating into account)\n`;
            }
        }
        result += `\n`;
    }
    return result;
}

module.exports = (terminal, api) => {
    _terminal = terminal;
    _api = api;
    return dungeonCollection;
};
