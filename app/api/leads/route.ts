import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { seedDatabaseIfEmpty } from "@/src/services/seed";

export async function GET(req: NextRequest) {
  await seedDatabaseIfEmpty();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const subreddit = searchParams.get("subreddit");
  const minScore = searchParams.get("minScore");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (subreddit && subreddit !== "ALL") {
    where.subreddit = subreddit;
  }
  if (minScore) {
    where.score = { gte: parseInt(minScore, 10) };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { author: { contains: search } },
      { summary: { contains: search } },
      { body: { contains: search } },
    ];
  }

  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAtUtc: "desc" },
    take: limit,
  });

  const totalCount = await db.lead.count({ where });

  return NextResponse.json({
    leads,
    totalCount,
  });
}
