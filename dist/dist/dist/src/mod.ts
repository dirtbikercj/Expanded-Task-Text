import { DependencyContainer } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { text } from "stream/consumers";

class DExpandedTaskText implements IPostDBLoadMod, IPreAkiLoadMod
{
    private database: DatabaseServer;
    private logger: ILogger;
    private mod;
    private modConfig = require("../config/config.json");

    private tasks;

    private newLine = "/n"

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
        this.listAllTasks();
    }

    public getAllTasks(database: IDatabaseTables): void
    {
        this.tasks = database.templates.quests;
    }

    public listAllTasks()
    {
        Object.keys(this.tasks).forEach(key =>
        {
            this.logger.logWithColor(key + this.newLine + this.tasks[key].QuestName, LogTextColor.GREEN);
        });
    }
}

module.exports = { mod: new DExpandedTaskText() }