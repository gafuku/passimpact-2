import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDonorActivity, getPublicAnalytics } from "@/app/lib/analytics";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [analytics, activity] = await Promise.all([
      withDbRetry(() => getPublicAnalytics()),
      withDbRetry(() => getDonorActivity(session.user.id)),
    ]);

    return NextResponse.json({ ...analytics, activity });
  } catch (error) {
    return apiError(error, "GET /api/portal/analytics");
  }
}
