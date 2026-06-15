import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

function detectRegion(req: NextRequest): string {
  // Amplify/CloudFront forwards the viewer's region in this header
  const cfRegion = req.headers.get("cloudfront-viewer-country-region");
  const cfCountry = req.headers.get("cloudfront-viewer-country");
  if (cfCountry === "IN") return "ap-south-1";
  if (cfCountry === "GB" || cfCountry === "DE" || cfCountry === "FR") return "eu-west-1";
  if (cfCountry === "AU" || cfCountry === "SG" || cfCountry === "JP") return "ap-southeast-1";
  if (cfRegion) return `region-${cfRegion.toLowerCase()}`;
  return process.env.DSQL_REGION ?? "us-east-1";
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, displayName, email } = await req.json();
    if (!tenantId || !displayName || !email) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.member.findFirst({ where: { tenantId, email } });
    if (existing) return NextResponse.json({ success: true, alreadyMember: true });

    const region = detectRegion(req);

    await db.member.create({
      data: {
        id: randomUUID(),
        tenantId,
        email,
        displayName,
        role: "member",
        region,
      },
    });

    return NextResponse.json({ success: true, region });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
