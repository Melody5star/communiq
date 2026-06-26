import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DsqlSigner, DsqlSignerConfig } from "@aws-sdk/dsql-signer";

const DSQL_HOST = (process.env.DSQL_HOST ?? "srt2xwnlrf5qxdg7ffcdxzkrum.dsql.us-east-1.on.aws").trim();
const DSQL_REGION = (process.env.DSQL_REGION ?? "us-east-1").trim();

let _client: PrismaClient | undefined;

export async function getDb(): Promise<PrismaClient> {
  if (!_client) {
    const signerConfig: DsqlSignerConfig = { hostname: DSQL_HOST, region: DSQL_REGION };

    const accessKeyId = process.env.COMMUNIQ_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID_DSQL;
    const secretAccessKey = process.env.COMMUNIQ_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY_DSQL;

    if (accessKeyId && secretAccessKey) {
      signerConfig.credentials = { accessKeyId, secretAccessKey };
    }

    const signer = new DsqlSigner(signerConfig);

    // Pass password as a function so pg.Pool fetches a fresh IAM token per connection.
    // A static token expires in ~5 min and breaks warm lambda reuse.
    const pool = new Pool({
      host: DSQL_HOST,
      port: 5432,
      database: "postgres",
      user: "admin",
      password: () => signer.getDbConnectAdminAuthToken(),
      ssl: { rejectUnauthorized: false },
      max: 5,
    });

    const adapter = new PrismaPg(pool);
    _client = new PrismaClient({ adapter });
  }
  return _client;
}
