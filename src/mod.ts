import { DependencyContainer } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { text } from "stream/consumers";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";

class DExpandedTaskText implements IPostDBLoadMod, IPreAkiLoadMod
{
    private database: DatabaseServer;
    private logger: ILogger;
    private mod;
    private modConfig = require("../config/config.json");
    private dbEN = require("../db/localeEN.json")

    private tasks: Record<string, IQuest>;

    private newLine = "\n"

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
        this.updateAllTasksText();
    }

    public getAllTasks(database: IDatabaseTables): void
    {
        this.tasks = database.templates.quests;
    }

    public updateAllTasksText()
    {
        Object.keys(this.tasks).forEach(key =>
        {
            this.logger.logWithColor(key + this.newLine + this.tasks[key].QuestName, LogTextColor.GREEN);

            //this.tasks[key].description.concat(this.newLine + )

        });
    }
}

module.exports = { mod: new DExpandedTaskText() }