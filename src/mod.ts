import { DependencyContainer } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";

class DExpandedTaskText implements IPostDBLoadMod, IPreAkiLoadMod
{
    private database: DatabaseServer;
    private logger: ILogger;
    private mod;
    private modConfig = require("../config/config.json");
    private dbEN: JSON = require("../db/TasklocaleEN.json");

    private tasks: Record<string, IQuest>;
    private locale: Record<string, Record<string, string>>;

    private newLine = "\n";

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
    }

    private getAllTasks(database: IDatabaseTables): void
    {
        this.tasks = database.templates.quests;
        this.locale = database.locales.global;
    }

    private updateAllTasksText(database: IDatabaseTables)
    {
        Object.keys(this.tasks).forEach(key =>
        {
            if (this.dbEN[key].IsKeyRequired == true && this.tasks[key]._id == key)
            {
                for (const localeID in this.locale)
                {
                    const originalDesc = this.locale[localeID][`${key} description`];
                    const keyDesc = `Required key(s): ${this.dbEN[key].RequiredKey}, Optional key(s): ${this.dbEN[key].OptionalKey} \n \n`

                    database.locales.global[localeID][`${key} description`] = keyDesc + originalDesc;
                }
                
                this.logger.logWithColor(`${this.dbEN[key].QuestName} Information updated.`, LogTextColor.GREEN);
            }
        });
    }
}

module.exports = { mod: new DExpandedTaskText() }