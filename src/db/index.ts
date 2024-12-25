import { Sequelize } from "sequelize";
import config from "../config";
import { init } from "./models";

class DB {
  public sequelize: Sequelize;

  async connect() {
    try {
      //get DB connection details
      this.sequelize = config.DBConfig();

      //initialize models
      init(this.sequelize);
      config.DEBUG("Database connected");
      return this.sequelize;
    } catch (error) {
      config.DEBUG(`failed to connect to database: ${error}`);
      throw error;
    }
  }
}

export default new DB();
