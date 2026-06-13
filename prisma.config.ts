import "dotenv/config";
import { defineConfig } from "prisma/config";
import { DsqlSigner } from "@aws-sdk/dsql-signer";

const DSQL_HOST = "srt2xwnlrf5qxdg7ffcdxzkrum.dsql.us-east-1.on.aws";

async function buildDsqlUrl(): Promise<string> {
  if (!process.env.COMMUNIQ_ACCESS_KEY_ID) {
    return `postgresql://admin:dummy@${DSQL_HOST}:5432/postgres?sslmode=require`;
  }
  const credentials = {
    accessKeyId: process.env.COMMUNIQ_ACCESS_KEY_ID,
    secretAccessKey: process.env.COMMUNIQ_SECRET_ACCESS_KEY!,
  };
  const signer = new DsqlSigner({ hostname: DSQL_HOST, region: "us-east-1", credentials });
  const token = await signer.getDbConnectAdminAuthToken();
  return `postgresql://admin:${encodeURIComponent(token)}@${DSQL_HOST}:5432/postgres?sslmode=require`;
}

const dsqlUrl = await buildDsqlUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dsqlUrl,
  },
});
