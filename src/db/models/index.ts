import { Sequelize } from "sequelize";
import User, { initUser } from "./user.model";

function associate() {}

export function init(connection: Sequelize) {
  initUser(connection);
  associate();
}

export { User };
