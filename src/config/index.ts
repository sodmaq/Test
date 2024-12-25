import { config } from "dotenv";
import Joi from "joi";
import { DebugOptions, ServerEnvOptions } from "../utils/enums/config.enums";
import debug from "debug";
import { Sequelize } from "sequelize";

config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .default(ServerEnvOptions.DEVELOPMENT)
      .valid(...Object.values(ServerEnvOptions)),
    PORT: Joi.number().default(3000),
    DEBUG_MODE: Joi.string()
      .default(DebugOptions.DEVELOPMENT)
      .valid(...Object.values(DebugOptions)),
    AllOWED_ORIGINS: Joi.string().default("*"),
    DB_ALTER: Joi.boolean().default(false),
    DB_RUN_DEFAULT_MIGRATIONS: Joi.boolean().default(false),
    DB_SYNC: Joi.boolean().default(false),
    DB_URI: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    V1_URL: Joi.string().required(),
    PAYMENT_URL: Joi.string().required(),
    ADMIN_URL: Joi.string().required(),
    DECRYPT_KEY: Joi.string().required(),
    ENCRYPT_KEY: Joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

class ServerConfig {
  //V1 URL
  public V1_URL = envVars.V1_URL;
  // Payment URL
  public PAYMENT_URL = envVars.PAYMENT_URL;
  // Admin URL
  public ADMIN_URL = envVars.ADMIN_URL;
  // Node Info
  public NODE = {
    ENV: envVars.NODE_ENV,
    SERVICE: envVars.npm_package_name,
    VERSION: envVars.npm_package_version,
    DEVELOPER: envVars.npm_package_author,
    LICENSE: envVars.npm_package_license,
  };
  // Debug
  public DEBUG = debug(envVars.DEBUG_MODE);
  // Port
  public PORT = envVars.PORT;
  // Cors
  public ALLOWED_ORIGINS = envVars.ALLOWED_ORIGINS;
  // DB Details
  public DB = {
    ALTER: envVars.DB_ALTER,
    RUN_DEFAULT_MIGRATIONS: envVars.DB_RUN_DEFAULT_MIGRATIONS,
    SYNC: envVars.DB_SYNC,
    URI: envVars.DB_URI,
    PORT: envVars.DB_PORT,
    USER: envVars.DB_USERNAME,
    PASSWORD: envVars.DB_PASSWORD,
    HOST: envVars.DB_HOST,
    NAME: envVars.DB_NAME,
  };

  // Database Configuration (Controls Application Connection)
  public DBConfig(): Sequelize {
    const sequelize: Sequelize = new Sequelize(this.DB.URI, {
      native: true,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          // ca: rootCert,
        },
      },
      logging: [ServerEnvOptions.DEVELOPMENT].includes(this.NODE.ENV)
        ? console.log
        : false,
    });

    return sequelize;
  }
  // Migration Object (Controls Migration Connection)
  public DBMigrationConfig = {
    development: {
      url: this.DB.URI,
      dialect: "postgres",
    },
    staging: {
      url: this.DB.URI,
      dialect: "postgres",
      native: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          // ca: rootCert, // Again ensure SSL for staging
        },
      },
    },
    production: {
      url: this.DB.URI,
      dialect: "postgres",
      native: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          // ca: rootCert, // Same for production
        },
      },
    },
  };
  // JWT object
  public JWTKeys = {
    encryptKey: envVars.ENCRYPT_KEY,
    decryptKey: envVars.DECRYPT_KEY,
  };
}

export default new ServerConfig();
