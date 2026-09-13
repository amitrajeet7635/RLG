import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { seedDatabaseIfEmpty } from "@/src/services/seed";

export async function GET() {
  await seedDatabaseIfEmpty();
  const subreddits = await db.subreddit.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ subreddits });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, minScore, description, enabled } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
    }

    const cleanName = name.trim().replace(/^r\//i, "");

    const sub = await db.subreddit.upsert({
      where: { name: cleanName },
      update: {
        minScore: minScore !== undefined ? parseInt(minScore, 10) : undefined,
        description: description !== undefined ? description : undefined,
        enabled: enabled !== undefined ? Boolean(enabled) : undefined,
      },
      create: {
        name: cleanName,
        minScore: minScore ? parseInt(minScore, 10) : 70,
        description: description || `Monitored subreddit r/${cleanName}`,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
      },
    });

    return NextResponse.json({ subreddit: sub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Subreddit ID required" }, { status: 400 });
  }

  await db.subreddit.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
