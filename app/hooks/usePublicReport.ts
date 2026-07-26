import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { Institution } from "../components/report/reportData";
import type { PublicReport } from "./publicReportTypes";

export function usePublicReport(slug: string, year: number) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [report, setReport] = useState<PublicReport | null>(null);
  const [previousReport, setPreviousReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !year) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance
      .get(`/api/public/institutions/${slug}/reports/${year}`)
      .then((res) => {
        if (cancelled) return;
        setInstitution(res.data.institution);
        setReport(res.data.report);
        setPreviousReport(res.data.previousReport);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, year]);

  return { institution, report, previousReport, loading, error };
}
