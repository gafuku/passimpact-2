import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

// Full hydrate for the portal's "what am I tracking" state — called once per
// signed-in session (and again whenever the signed-in user changes) rather than
// trusting anything left over in the browser from a previous account.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ institutionSlugs: [], fundIds: [] });
    }

    const [institutions, funds] = await Promise.all([
      withDbRetry(() =>
        prisma.followedInstitution.findMany({ where: { userId: session.user.id }, include: { institution: true } })
      ),
      withDbRetry(() => prisma.followedFund.findMany({ where: { userId: session.user.id } })),
    ]);

    return NextResponse.json({
      institutionSlugs: institutions.map((f) => f.institution.slug),
      fundIds: funds.map((f) => f.fundId),
    });
  } catch (error) {
    return apiError(error, "GET /api/portal/follows");
  }
}
