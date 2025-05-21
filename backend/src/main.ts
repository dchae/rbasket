import "dotenv/config";
import express from "express";
import path from "path";
import apiRouter from "./routes/api";
import hookRouter from "./routes/hook";
import PostgresClient from "./controllers/postgresql";
import MongoClient from "./controllers/mongo";
import { RDSSecret, PGConfig, MongoSecret } from "./types";
import type { ConnectOptions as MongoConfig } from "mongoose";
import { getAWSSecret } from "./utils";

const app = express();
const PORT = process.env.PORT || 3000;
const { RDS_SECRET, MONGO_SECRET, REGION } = process.env;

// Middleware to store raw data in the request
app.use((req, _res, next) => {
  let data = "";

  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    (req as any).rawBody = data;
    next();
  });
});

app.use(express.json());
app.use(express.static("dist"));

const initApp = async () => {
  let pgSecret: RDSSecret | undefined;
  if (typeof RDS_SECRET === "string" && typeof REGION === "string") {
    pgSecret = await getAWSSecret(RDS_SECRET, REGION);
  }

  const pgConfig: PGConfig = {
    user: pgSecret?.username ?? process.env.PGUSER, // default process.env.USER
    password: pgSecret?.password ?? process.env.PGPASSWORD, //default process.env.PGPASSWORD
    host: pgSecret?.host ?? process.env.PGHOST,
    port: pgSecret?.port ?? Number(process.env.PGPORT),
    database: "postgres", // connect to the default postgres db
  };

  const pg = new PostgresClient(pgConfig);

  let mongoSecret: MongoSecret | undefined;
  if (typeof MONGO_SECRET === "string" && typeof REGION === "string") {
    mongoSecret = await getAWSSecret(MONGO_SECRET, REGION);
  }

  const mongoConfig: MongoConfig = {
    user: mongoSecret?.username ?? process.env.MONGO_USER, // default process.env.USER
    pass: mongoSecret?.password ?? process.env.MONGO_PASS, //default process.env.PGPASSWORD
    dbName: "requestBodies",
    tls: true,
    tlsCAFile: process.env.MONGO_CA_PATH,
    replicaSet: "rs0",
    readPreference: "secondaryPreferred",
    retryWrites: false,
    authSource: "admin",
  };

  const host = mongoSecret?.host ?? process.env.MONGOHOST ?? "localhost";
  const port = mongoSecret?.port ?? Number(process.env.MONGO_PORT) ?? 27017;

  const mongo = new MongoClient(host, port, mongoConfig);
  await mongo.connectToDatabase();

  app.use("/api", apiRouter(pg, mongo));
  app.use("/hook", hookRouter(pg, mongo));

  // Catch-all route enabling react refresh
  // express v5 requires * wildcard to have a name
  app.get("/*path", (_, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initApp();
