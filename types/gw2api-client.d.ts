declare module 'gw2api-client' {
    export class LibGw2ApiClient {
        schema(schema: string): LibGw2ApiClient
        language(lang: string): LibGw2ApiClient
        authenticate(apiKey: string): LibGw2ApiClient
        cacheStorage(caches: any): LibGw2ApiClient
        debugging(flag: boolean): LibGw2ApiClient

        account(): Gw2AccountEndpoint
        achievements(): Gw2AchievementsEndpoint
        backstory(): any // TODO
        build(): any // TODO
        cats(): any // TODO
        characters(): Gw2CharactersEndpoint
        colors(): any // TODO
        commerce(): any // TODO
        continents(): any // TODO
        currencies(): any // TODO
        dailycrafting(): any // TODO
        dungeons(): any // TODO
        emblem(): any // TODO
        events(): any // TODO
        files(): any // TODO
        finishers(): any // TODO
        gliders(): any // TODO
        guild(): any // TODO
        home(): any // TODO
        items(): Gw2ItemsEndpoint
        itemstats(): any // TODO
        legends(): any // TODO
        mailcarriers(): any // TODO
        mapchests(): any // TODO
        maps(): any // TODO
        masteries(): any // TODO
        materials(): any // TODO
        minis(): any // TODO
        mounts(): any // TODO
        nodes(): any // TODO
        novelties(): any // TODO
        outfits(): any // TODO
        pets(): any // TODO
        professions(): any // TODO
        pvp(): any // TODO
        quaggans(): any // TODO
        quests(): any // TODO
        races(): any // TODO
        raids(): any // TODO
        recipes(): any // TODO
        skills(): any // TODO
        skins(): any // TODO
        specializations(): any // TODO
        stories(): any // TODO
        titles(): any // TODO
        tokeninfo(): any // TODO
        traits(): any // TODO
        worldbosses(): any // TODO
        worlds(): any // TODO
        wvw(): any // TODO
    }

    abstract class Gw2AbstractBlobEndpoint<TObject> {
        schema(schema: string): this
        language(lang: string): this
        authenticate(apiKey: string): this
        debugging(flag: boolean): this
        live(): this

        get(): Promise<TObject>;
    }

    abstract class Gw2AbstractEndpoint<TId, TObject> {
        schema(schema: string): this
        language(lang: string): this
        authenticate(apiKey: string): this
        debugging(flag: boolean): this
        live(): this

        ids(): Promise<TId[]>
        get(id: TId | string): Promise<TObject>
        get(id: TId | string, url?: string): Promise<TObject>
        many(ids: Array<TId | string>): Promise<TObject[]>
        page(page: number): Promise<TObject[]>
        page(page: number, size: number): Promise<TObject[]>
        all(): Promise<TObject[]>
    }

    class Gw2AccountEndpoint extends Gw2AbstractBlobEndpoint<Gw2Account> {
        // TODO
        achievements(): Gw2AccountAchievementsEndpoint
        bank(): Gw2AccountBankEndpoint
        inventory(): Gw2AccountInventoryEndpoint
        mastery(): Gw2AccountMasteryEndpoint
        materials(): Gw2AccountMaterialsEndpoint
        wallet(): Gw2AccountWalletEndpoint
    }
    class Gw2Account {
        id: string
        name: string
        age: number
        world: number
        guilds: string[]
        guild_leader: string[]
        last_modified: string
        created: string
        access: Array<'None' | 'PlayForFree' | 'GuildWars2' | 'HeartOfThorns' | 'PathOfFire'>
        commander: boolean
        fractal_level?: number
        daily_ap?: number
        monthly_ap?: number
        wvw_rank?: number
        build_storage_slots?: number
    }
    class Gw2AccountAchievementsEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountAchievement[]> {
        get(): Promise<Gw2AccountAchievement[]>
        get(id: number): Promise<Gw2AccountAchievement>
        get(id: number, url?: string): Promise<Gw2AccountAchievement>
        many(ids: number[]): Promise<Gw2AccountAchievement[]>
        page(page: number): Promise<Gw2AccountAchievement[]>
        page(page: number, size: number): Promise<Gw2AccountAchievement[]>
        all(): Promise<Gw2AccountAchievement[]>
    }
    class Gw2AccountAchievement {
        id: number
        bits?: number[]
        current: number
        max: number
        done: boolean
        repeated?: number
        unlocked?: boolean
    }
    class Gw2AccountBankEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountItem[]> { }
    class Gw2AccountItem {
        id: number
        count: number
        charges?: number
        skin?: number
        equipment_item_stats?: Gw2EquipmentItemStats
        upgrades?: number[]
        infusions?: number[]
        binding?: 'Account' | 'Character'
        bound_to?: string
    }
    class Gw2AccountInventoryEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountItem[]> { }
    class Gw2AccountMasteryEndpoint {
        points(): Gw2AccountMasteryPointsEndpoint
    }
    class Gw2AccountMasteryPointsEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountMasteryPoint> { }
    class Gw2AccountMasteryPoint {
        totals: {
            region: string
            spent: number
            earned: number
        }[]
        unlocked: number[]
    }
    class Gw2AccountMaterialsEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountMaterial[]> { }
    class Gw2AccountMaterial {
        id: number
        category: number
        binding?: 'Unknown' | 'Account' | 'Character'
        count: number
    }
    class Gw2AccountWalletEndpoint extends Gw2AbstractBlobEndpoint<Gw2AccountCurrency[]> { }
    class Gw2AccountCurrency {
        id: number
        value: number
    }

    class Gw2AchievementsEndpoint extends Gw2AbstractEndpoint<number, Gw2Achievement> { }
    class Gw2Achievement {
        id: number
        icon: string
        name: string
        descirption: string
        requirement: string
        locked_text: string
        type: 'Default' | 'ItemSet'
        flags: Array<'Pvp' | 'CategoryDisplay' | 'MoveToTop' | 'IgnoreNearlyComplete' | 'Repeatable' | 'Hidden' | 'RequiresUnlock' | 'RepairOnLogin' | 'Daily' | 'Weekly' | 'Monthly' | 'Permanent'>
        bits?: {
            type: 'Item' | 'Minipet' | 'Skin' | 'Text'
            id?: number
            text?: string
        }[]
        tiers?: {
            count: number
            points: number
        }
        prerequisites?: number[]
        point_cap?: number
        rewards?: any[] // TODO
    }

    class Gw2CharactersEndpoint extends Gw2AbstractEndpoint<string, Gw2Character> { }
    class Gw2Character {
        name: string
        race: string
        gender: 'Male' | 'Female'
        flags: Array<'Beta'>
        profession: string
        level: number
        guild?: string
        age: number
        last_modified: string
        created: string
        deaths: number
        crafting: {
            discipline: 'Artificer' | 'Armorsmith' | 'Chef' | 'Jeweler' | 'Huntsman' | 'Leatherworker' | 'Scribe' | 'Tailor' | 'Weaponsmith'
            rating: number
            active: boolean
        }[]
        title: string
        backstory: string[]
        wvw_abilities: {
            id: number
            rank: number
        }[]
        build_tabs_unlocked?: number
        active_build_tab?: number
        build_tabs?: {
            tab: number
            is_active: boolean
            build: {
                name?: string
                profession?: string
                specializations: {
                    id?: number
                    traits: (number | null)[]
                }[]
                skills: {
                    heal?: number
                    utilities: (number | null)[]
                    elite?: number
                }
                aquatic_skills: {
                    heal?: number
                    utilities: (number | null)[]
                    elite?: number
                }
                pets: {
                    terrestrial: (number | null)[]
                    aquatic: (number | null)[]
                }
                legends?: (string | null)[]
                aquatic_legends?: (string | null)[]
            }
        }[]
        equipment?: {
            id: number
            location: 'Equipped' | 'Armory'
            slot: 'HelmAquatic' | 'Backpack' | 'Coat' | 'Boots' | 'Gloves' | 'Helm' | 'Leggings' | 'Shoulders' | 'Accessory1' | 'Accessory2' | 'Ring1' | 'Ring2' | 'Amulet' | 'WeaponAquaticA' | 'WeaponAquaticB' | 'WeaponA1' | 'WeaponA2' | 'WeaponB1' | 'WeaponB2' | 'Sickle' | 'Axe' | 'Pick'
            tabs?: number[]
            upgrades?: number[]
            infusions?: number[]
            skin?: number
            stats?: Gw2EquipmentItemStats
            binding?: 'Account' | 'Character'
            boundTo?: string
            dyes?: Array<number | null>
        }[]
        equipment_tabs_unlocked?: number
        active_equipment_tab?: number
        equipment_tabs?: {
            // TODO
        }[]
        recipes?: number[]
        equipment_pvp?: {
            // TODO
        }
        training?: {
            // TODO
        }[]
        bags?: {
            id: number
            size: number
            inventory: (Gw2AccountItem | null)[]
        }[]
    }

    class Gw2ItemsEndpoint extends Gw2AbstractEndpoint<number, Gw2Item> { }
    class Gw2Item {
        name: string
        description?: string
        type: 'Armor' | 'Back' | 'Bag' | 'Consumable' | 'CraftingMaterial' | 'Container' | 'Gathering' | 'Gizmo' | 'Key' | 'MiniPet' | 'Tool' | 'Trait' | 'Trinket' | 'Trophy' | 'UpgradeComponent' | 'Weapon'
        level: number
        rarity: 'Junk' | 'Basic' | 'Fine' | 'Masterwork' | 'Rare' | 'Exotic' | 'Ascended' | 'Legendary'
        vendor_Value: number
        default_skin?: number
        game_types: Array<'Activity' | 'Dungeon' | 'Pve' | 'Pvp' | 'PvpLobby' | 'Wvw'>
        restrictions: Array<'Asura' | 'Charr' | 'Human' | 'Norn' | 'Sylvari' | 'Elementalist' | 'Engineer' | 'Guardian' | 'Mesmer' | 'Necromancer' | 'Ranger' | 'Revenant' | 'Thief' | 'Warrior' | 'Female'>
        id: number
        chat_link: string
        icon: string

        details: {
            // Shared
            infusion_slots?: {
                flags: Array<'Defense' | 'Offense' | 'Utility' | 'Agony' | 'Enrichment' | 'Infusion'>
                item_id?: number
            }[]
            infix_upgrade?: {
                // TODO
            }
            suffix_item_id?: number
            secondary_suffix_item_id?: string
            stat_choices?: number[]

            type?: 'AppearanceChange' | 'Booze' | 'ContractNpc' | 'Food' | 'Generic' | 'Halloween' | 'Immediate' | 'Transmutation' | 'Unlock' | 'UpgradeRemoval' | 'Utility' | 'TeleportToFriend' | 'Currency' | 'RandomUnlock' | 'MountRandomUnlock' |
            'Axe' | 'Dagger' | 'Mace' | 'Pistol' | 'Scepter' | 'Sword' | 'Focus' | 'Shield' | 'Torch' | 'Warhorn' | 'Greatsword' | 'Hammer' | 'LongBow' | 'Rifle' | 'ShortBow' | 'Staff' | 'Harpoon' | 'Speargun' | 'Trident' | 'LargeBundle' | 'SmallBundle' | 'Toy' | 'ToyTwoHanded'

            // Bag
            size?: number
            no_sell_or_sort?: boolean

            // Consumable
            description?: string
            duration_ms?: number
            unlock_type?: 'BagSlot' | 'BankTab' | 'CollectibleCapacity' | 'Content' | 'CraftingRecipe' | 'Dye' | 'Outfit' | 'GliderSkin' | 'Champion' | 'RandomUlock' | 'SharedSlot' | 'Minipet' | 'Ms'
            color_id?: number
            recipe_id?: number
            guild_upgrade_id?: number
            apply_Count?: number
            name?: string
            skins?: (number | null)[]

            // Weapon
            damage_type: 'Fire' | 'Ice' | 'Lightning' | 'Physical' | 'Choking'
            min_power: number
            max_power: number
            defense: number
        }
    }

    class Gw2EquipmentItemStats {
        id: number
        item_attributes: {
            Power?: number
            Precision?: number
            CritDamage?: number
            Toughness?: number
            Vitality?: number
            ConditionDamage?: number
            ConditionDuration?: number
            Healing?: number
            BoonDuration?: number
        }
    }

    function client(): LibGw2ApiClient
    export default client
}
