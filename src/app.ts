import cors, { CorsOptions } from "cors";
import express, { Application, Express } from "express";
import config from "./config";
import compression from "compression";
import helmet from "helmet";
import { ServerEnvOptions } from "./utils/enums/config.enums";
import morgan from "morgan";
import fs from "fs";
import customMiddleware from "./middlewares/custom.middleware";
import routes from "./routes";
import errorMiddleware from "./middlewares/error.middleware";
import db from "./db";
import http from "http";

class Server {
  public app: Application;
  public port: number;
  private corsOption: CorsOptions;
  private server: http.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = config.PORT;
    this.corsOption = {
      origin: config.ALLOWED_ORIGINS,
    };
    this.initializeDB();
    this.initializeSystemMiddleware();
    this.routes();
    this.errorHandlingMiddleware();
  }

  //connect to database
  private async initializeDB(): Promise<void> {
    await db.connect();
  }

  //system middleware
  private initializeSystemMiddleware(): void {
    //compression middleware
    this.app.use(compression());

    //cross origin middleware
    this.app.use(cors(this.corsOption));

    //parse json request body
    this.app.use(
      express.json({
        limit: "5mb",
      })
    );

    //parse urlencoded request body
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "5mb",
      })
    );

    //helmet middleware
    this.app.use(helmet());

    //morgan middleware
    if (config.NODE.ENV !== ServerEnvOptions.TESTING) {
      this.app.use(morgan("dev"));

      if (
        [
          ServerEnvOptions.STAGING,
          ServerEnvOptions.PRODUCTION,
          ServerEnvOptions.DEVELOPMENT,
          ServerEnvOptions.TESTING,
        ].includes(config.NODE.ENV)
      ) {
        if (!fs.existsSync("logs/morgan")) {
          fs.mkdirSync("logs/morgan");
        }
        this.app.use(
          morgan("combined", {
            stream: fs.createWriteStream("logs/morgan/requests.log", {
              flags: "a",
            }),
          })
        );
      }
    }

    // Winston Logger Middleware
    this.app.use(customMiddleware.requestLogger);
  }

  //initialize routes
  private routes(): void {
    this.app.use(routes);
  }

  //initialize error middleware
  // public errorHandlingMiddleware(): void {
  //   this.app.use(errorMiddleware.errorHandler);
  // }
  public errorHandlingMiddleware(): void {
    this.app.use(errorMiddleware.errorHandler.bind(errorMiddleware));
  }
  //start express application
  public start(): void {
    this.app
      .listen(this.port, () => {
        config.DEBUG(
          `Server running on http://localhost:${this.port} in ${config.NODE.ENV} mode. \nPress ctrl+c to kill server process.`
        );
      })
      .on("error", (error: Error) => {
        if (error.name === "EADDRINUSE") {
          // Handle error if port already in use
          config.DEBUG(
            `Error: Port ${this.port} is already in use.  Trying next port....`
          );
          this.port++;
          this.start();
        }
      });
  }
  public getApp(): Application {
    return this.app;
  }
}

const server = new Server();
if (process.env.NODE_ENV !== "test") server.start();
export default server;
