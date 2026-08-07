import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

const toggleSchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const parsed = toggleSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    const fund = await withDbRetry(() => prisma.namedFund.findUnique({ where: { id: parsed.data.id } }));
    if (!fund) {
      return NextResponse.json({ error: "Named fund not found" }, { status: 404 });
    }

    const existing = await withDbRetry(() =>
      prisma.followedFund.findUnique({ where: { userId_fundId: { userId: session.user.id, fundId: fund.id } } })
    );

    if (existing) {
      await withDbRetry(() => prisma.followedFund.delete({ where: { id: existing.id } }));
      return NextResponse.json({ following: false });
    }

    await withDbRetry(() => prisma.followedFund.create({ data: { userId: session.user.id, fundId: fund.id } }));
    return NextResponse.json({ following: true });
  } catch (error) {
    return apiError(error, "POST /api/portal/follows/funds");
  }
}
