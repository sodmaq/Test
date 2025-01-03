import { User } from "../../db/models";
import { ReqQueryOptions } from "../../interfaces/misc.interface";

declare module "express" {
  export interface Request {
    queryOpts?: ReqQueryOptions;
    user?: User;
    // userPermissionSlugs?: string[];
  }
}
