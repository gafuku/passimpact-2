import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

const toggleSchema = z.object({ slug: z.string().min(1) });

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

    const institution = await withDbRetry(() => prisma.institution.findUnique({ where: { slug: parsed.data.slug } }));
    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    const existing = await withDbRetry(() =>
      prisma.followedInstitution.findUnique({
        where: { userId_institutionId: { userId: session.user.id, institutionId: institution.id } },
      })
    );

    if (existing) {
      await withDbRetry(() => prisma.followedInstitution.delete({ where: { id: existing.id } }));
      return NextResponse.json({ following: false });
    }

    await withDbRetry(() =>
      prisma.followedInstitution.create({ data: { userId: session.user.id, institutionId: institution.id } })
    );
    return NextResponse.json({ following: true });
  } catch (error) {
    return apiError(error, "POST /api/portal/follows/institutions");
  }
}
