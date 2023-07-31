import { DependencyContainer } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
import { IHandbookBase } from "@spt-aki/models/eft/common/tables/IHandbookBase";

class DExpandedTaskText implements IPostDBLoadMod, IPreAkiLoadMod
{
    private database: DatabaseServer;
    private logger: ILogger;
    private mod;
    private modConfig = require("../config/config.json");
    private dbEN: JSON = require("../db/TasklocaleEN.json");
    private hbEN: JSON = require("../db/HandBookEN.json");

    private tasks: Record<string, IQuest>;
    private locale: Record<string, Record<string, string>>;
    private handBook: IHandbookBase;

    public preAkiLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.mod = require("../package.json");
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        // get database from server
        const database = container.resolve<DatabaseServer>("DatabaseServer").getTables();

        this.getAllTasks(database);
        this.updateAllTasksText(database);
        this.updateHandbook(database);
    }

    private getAllTasks(database: IDatabaseTables): void
    {
        this.tasks = database.templates.quests;
        this.locale = database.locales.global;
        this.handBook = database.templates.handbook;
    }

    private updateAllTasksText(database: IDatabaseTables)
    {
        Object.keys(this.tasks).forEach(key =>
        {

            for (const localeID in this.locale)
            {
                const originalDesc = this.locale[localeID][`${key} description`];
                let keyDesc;
                let collector;
                let lightKeeper;
                let durability;
                let requiredParts;
                let timeUntilNext;

                if (this.dbEN[key]?.IsKeyRequired == true && this.tasks[key]?._id == key)
                {
                    if (this.dbEN[key]?.OptionalKey == "")
                    {
                        keyDesc = `Required key(s): ${this.dbEN[key].RequiredKey} \n`;
                    }
                    else if (this.dbEN[key]?.RequiredKey == "")
                    {
                        keyDesc = `Optional key(s): ${this.dbEN[key].OptionalKey} \n`;
                    }
                    else
                    {
                        keyDesc = `Required Key(s):  ${this.dbEN[key].RequiredKey} \n Optional Key(s): ${this.dbEN[key].OptionalKey} \n`
                    }
                }
                    
                if (this.dbEN[key]?.RequiredCollector || this.dbEN[key]?.RequiredLightkeeper)
                {
                    collector = `Required for Collector: ${this.dbEN[key].RequiredCollector} \n`;
                    lightKeeper = `Required for Lightkeeper: ${this.dbEN[key].RequiredLightkeeper} \n \n`;
                }

                if (this.dbEN[key]?.RequiredParts && this.dbEN[key]?.RequiredDurability)
                {
                    durability = `Required Durability: ${this.dbEN[key].RequiredDurability} \n`;
                    requiredParts = `Required Parts: \n ${this.dbEN[key].RequiredParts} \n`;
                }

                if (this.dbEN[key]?.TimeUntilNext)
                {
                    timeUntilNext = `Time until next task unlocks: ${this.dbEN[key].TimeUntilNext} \n`
                }

                if (keyDesc == undefined)
                {
                    keyDesc = "";
                }

                if (collector == undefined)
                {
                    collector = "";
                }

                if (lightKeeper == undefined)
                {
                    lightKeeper = "";
                }

                if (requiredParts == undefined)
                {
                    requiredParts = "";
                }

                if (durability == undefined)
                {
                    durability = "";
                }

                if (timeUntilNext == undefined)
                {
                    timeUntilNext = "";
                }
                
                database.locales.global[localeID][`${key} description`] = timeUntilNext + durability + requiredParts + keyDesc + collector + lightKeeper + originalDesc;
            }
            
            if (this.dbEN[key]?.QuestName == undefined)
            {
                return;
            }
            this.logger.logWithColor(`${this.dbEN[key].QuestName} Information updated.`, LogTextColor.GREEN);
        });
    }

    private updateHandbook(database: IDatabaseTables): void
    {
        Object.keys(this.hbEN).forEach(key => 
        {
            database.templates.handbook.Categories += this.hbEN[key].Categories;
        });
    }
}

module.exports = { mod: new DExpandedTaskText() }