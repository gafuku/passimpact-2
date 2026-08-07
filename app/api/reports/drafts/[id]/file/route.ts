import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const draft = await withDbRetry(() =>
      prisma.draftReport.findUnique({ where: { id }, select: { fileUrl: true, fileName: true } })
    );

    if (!draft?.fileUrl) {
      return NextResponse.json({ error: "No file on record for this draft" }, { status: 404 });
    }

    const match = draft.fileUrl.match(/^data:([^;]+);base64,([\s\S]*)$/);
    if (!match) {
      return NextResponse.json({ error: "Stored file is in an unexpected format" }, { status: 500 });
    }
    const [, mimeType, base64] = match;
    const bytes = Buffer.from(base64, "base64");

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${(draft.fileName ?? "report.pdf").replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return apiError(error, "GET /api/reports/drafts/[id]/file");
  }
}
