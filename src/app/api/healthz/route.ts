import { NextResponse } from "next/server";
import { DsqlSigner, DsqlSignerConfig } from "@aws-sdk/dsql-signer";
import { Pool } from "pg";

const DSQL_HOST = (process.env.DSQL_HOST ?? "srt2xwnlrf5qxdg7ffcdxzkrum.dsql.us-east-1.on.aws").trim();
const DSQL_REGION = (process.env.DSQL_REGION ?? "us-east-1").trim();

export async function GET() {
  const info: Record<string, unknown> = {
    dsqlHost: DSQL_HOST,
    dsqlRegion: DSQL_REGION,
    hasAccessKey: !!process.env.COMMUNIQ_ACCESS_KEY_ID,
    accessKeyPrefix: process.env.COMMUNIQ_ACCESS_KEY_ID?.trim().slice(0, 8) ?? "none",
    hasSecretKey: !!process.env.COMMUNIQ_SECRET_ACCESS_KEY,
  };

  try {
    const signerConfig: DsqlSignerConfig = { hostname: DSQL_HOST, region: DSQL_REGION };
    const accessKeyId = process.env.COMMUNIQ_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.COMMUNIQ_SECRET_ACCESS_KEY?.trim();
    if (accessKeyId && secretAccessKey) {
      signerConfig.credentials = { accessKeyId, secretAccessKey };
    }

    const signer = new DsqlSigner(signerConfig);
    const token = await signer.getDbConnectAdminAuthToken();
    info.tokenGenerated = true;

    const pool = new Pool({
      host: DSQL_HOST,
      port: 5432,
      database: "postgres",
      user: "admin",
      password: token,
      ssl: { rejectUnauthorized: false },
      max: 2,
      connectionTimeoutMillis: 8000,
    });

    const client = await pool.connect();
    const [ping, members, tenants] = await Promise.all([
      client.query("SELECT 1 as ok"),
      client.query(`SELECT email, "displayName", role FROM "Member" ORDER BY email LIMIT 30`),
      client.query(`SELECT slug, name FROM "Tenant"`),
    ]);
    client.release();
    await pool.end();

    info.dbConnected = true;
    info.ping = ping.rows[0];
    info.tenants = tenants.rows;
    info.members = members.rows;

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
