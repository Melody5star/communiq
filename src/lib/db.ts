import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DsqlSigner, DsqlSignerConfig } from "@aws-sdk/dsql-signer";

const DSQL_HOST = process.env.DSQL_HOST ?? "srt2xwnlrf5qxdg7ffcdxzkrum.dsql.us-east-1.on.aws";
const DSQL_REGION = process.env.DSQL_REGION ?? "us-east-1";

async function createClient(): Promise<PrismaClient> {
  // On Vercel (or local dev): use explicit credentials from env vars
  // On Amplify: no credentials needed — uses AmplifySSRCommuniqRole execution role
  const signerConfig: DsqlSignerConfig = { hostname: DSQL_HOST, region: DSQL_REGION };

  const accessKeyId = process.env.COMMUNIQ_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID_DSQL;
  const secretAccessKey = process.env.COMMUNIQ_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY_DSQL;

  if (accessKeyId && secretAccessKey) {
    signerConfig.credentials = { accessKeyId, secretAccessKey };
  }

  const signer = new DsqlSigner(signerConfig);
  const token = await signer.getDbConnectAdminAuthToken();

  const pool = new Pool({
    host: DSQL_HOST,
    port: 5432,
    database: "postgres",
    user: "admin",
    password: token,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

let _client: PrismaClient | undefined;

export async function getDb(): Promise<PrismaClient> {
  if (!_client) {
    _client = await createClient();
  }
  return _client;
}
