import { Sequelize } from "sequelize";
import User, { initUser } from "./user.model";
import Auth, { initAuth, auth } from "./auth.model";

function associate() {
  auth();
}

export function init(connection: Sequelize) {
  initUser(connection);
  initAuth(connection);
  associate();
}

export { User, Auth };
