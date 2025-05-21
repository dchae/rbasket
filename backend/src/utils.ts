import { IncomingHttpHeaders } from "http";
import { QueryResult } from "pg";
import PostgresController from "./controllers/postgresql";
import { Request, PostgresRequestRow } from "./types";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export function generateRandomString() {
  return Math.random().toString(36).substring(2);
}

export async function generateToken(): Promise<string> {
  let token: string = "";
  const pg = new PostgresController();
  pg.connect();
  let result: QueryResult;

  try {
    do {
      const segments: string[] = Array.from({ length: 3 }, () =>
        generateRandomString(),
      );
      token = segments.join("");

      result = await pg.getToken(token);
    } while ((result.rowCount ?? 0) > 0);
    return token;
  } catch (err) {
    console.error("Error generating token:", err);
    throw new Error("Failed to generate token");
  }
}

export function headersToString(headers: IncomingHttpHeaders): string {
  let headerString = "";
  for (const key in headers) {
    headerString += `${key}: ${headers[key]}\n`;
  }

  return headerString;
}

export function normalizeRequest(request: PostgresRequestRow): Request {
  return {
    basketName: request["basket_name"],
    sentAt: request["sent_at"],
    method: request["method"],
    headers: request["headers"],
    bodyMongoId: request["body_mongo_id"],
  };
}

// const secret_name = "rds-psql";
// region: "ap-northeast-2",
export async function getAWSSecret(secret_name: string, region: string) {
  const client = new SecretsManagerClient({ region });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      }),
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  const secretStr = response.SecretString;
  console.log(secretStr);

  return JSON.parse(secretStr ?? "{}");
}
