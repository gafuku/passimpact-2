import type { Report } from "../components/report/reportData";

// The live API includes the real Prisma report id (needed for chat history),
// which the illustrative mock catalog's Report type never had a use for.
export type PublicReport = Report & { id: string };
