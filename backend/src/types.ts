import { Document } from "mongoose";

export interface MockRequest {
  basketName: string;
  method: string;
  sentAt: string;
  headers: string;
  requestBodyContentType: string;
  requestBody: string;
}

export interface Basket {
  name: string;
  token: string;
}

export interface RequestBody extends Document {
  id: string;
  request: any;
}

export interface Request {
  basketName: string;
  sentAt: string;
  method: string;
  headers: string;
  bodyMongoId: string | null;
}

export interface PostgresRequestRow {
  basket_name: string;
  sent_at: string;
  method: string;
  headers: string;
  body_mongo_id: string;
}

export interface RDSSecret {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbInstanceIdentifier: string;
}

export interface PGConfig {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
}

export interface MongoSecret {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  ssl: boolean;
  dbClusterIdentifier: string;
}

// export interface MongoConfig {
//   user?: string;
//   pass?: string;
//   dbName?: string;
//   tls?: boolean;
//   tlsCAFile?: string;
//   replicaSet?: string;
//   readPreference?: string;
//   retryWrites?: boolean;
//   authSource?: "admin";
// }
