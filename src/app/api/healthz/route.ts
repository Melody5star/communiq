import { NextResponse } from "next/server";
import { DsqlSigner, DsqlSignerConfig } from "@aws-sdk/dsql-signer";
import { Pool } from "pg";

const DSQL_HOST = process.env.DSQL_HOST ?? "srt2xwnlrf5qxdg7ffcdxzkrum.dsql.us-east-1.on.aws";
const DSQL_REGION = process.env.DSQL_REGION ?? "us-east-1";

export async function GET() {
  const info: Record<string, unknown> = {
    dsqlHost: DSQL_HOST,
    dsqlRegion: DSQL_REGION,
    hasAccessKey: !!process.env.COMMUNIQ_ACCESS_KEY_ID,
    accessKeyPrefix: process.env.COMMUNIQ_ACCESS_KEY_ID?.slice(0, 8) ?? "none",
    hasSecretKey: !!process.env.COMMUNIQ_SECRET_ACCESS_KEY,
  };

  try {
    const signerConfig: DsqlSignerConfig = { hostname: DSQL_HOST, region: DSQL_REGION };
    const accessKeyId = process.env.COMMUNIQ_ACCESS_KEY_ID;
    const secretAccessKey = process.env.COMMUNIQ_SECRET_ACCESS_KEY;
    if (accessKeyId && secretAccessKey) {
      signerConfig.credentials = { accessKeyId, secretAccessKey };
    }

    const signer = new DsqlSigner(signerConfig);
    const token = await signer.getDbConnectAdminAuthToken();
    info.tokenGenerated = true;
    info.tokenLength = token.length;

    const pool = new Pool({
      host: DSQL_HOST,
      port: 5432,
      database: "postgres",
      user: "admin",
      password: token,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    });

    const client = await pool.connect();
    const result = await client.query("SELECT 1 as ok");
    client.release();
    await pool.end();

    info.dbConnected = true;
    info.queryResult = result.rows[0];

    return NextResponse.json({ status: "ok", ...info });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.constructor.name : "unknown",
        ...info,
      },
      { status: 500 }
    );
  }
}
