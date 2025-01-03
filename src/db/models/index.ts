import { Sequelize } from "sequelize";
import User, { initUser, associateUser } from "./user.model";
import Auth, { initAuth, auth } from "./auth.model";
import Profile, { initProfile, associateProfile } from "./profile.index";

function associate() {
  auth();
  associateUser();
  associateProfile();
}

export function init(connection: Sequelize) {
  initUser(connection);
  initAuth(connection);
  initProfile(connection);
  associate();
}

export { User, Auth, Profile };
