import "dotenv/config";
import express from "express";
import path from "path";
import apiRouter from "./routes/api";
import hookRouter from "./routes/hook";
import PostgresClient from "./controllers/postgresql";
import MongoClient from "./controllers/mongo";
import { RDSSecret, PGConfig } from "./types";
import { getAWSSecret } from "./utils";

const app = express();
const PORT = process.env.PORT || 3000;
const { RDS_SECRET, REGION } = process.env;

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
  let secret: RDSSecret | undefined;
  if (typeof RDS_SECRET === "string" && typeof REGION === "string") {
    secret = await getAWSSecret(RDS_SECRET, REGION);
  }

  const config: PGConfig = {
    user: secret?.username ?? process.env.PGUSER, // default process.env.USER
    password: secret?.password ?? process.env.PGPASSWORD, //default process.env.PGPASSWORD
    host: secret?.host ?? process.env.PGHOST,
    port: secret?.port ?? Number(process.env.PGPORT),
    database: "postgres", // connect to the default postgres db
  };

  const pg = new PostgresClient(config);
  const mongo = new MongoClient();
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
