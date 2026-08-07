import { NextResponse } from "next/server";
import { getPublicAnalytics } from "@/app/lib/analytics";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET() {
  try {
    const analytics = await withDbRetry(() => getPublicAnalytics());
    return NextResponse.json(analytics);
  } catch (error) {
    return apiError(error, "GET /api/public/analytics");
  }
}
