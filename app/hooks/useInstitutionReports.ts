import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { Institution } from "../components/report/reportData";
import type { PublicReport } from "./publicReportTypes";

export function useInstitutionReports(slug: string) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance
      .get(`/api/public/institutions/${slug}`)
      .then((res) => {
        if (cancelled) return;
        setInstitution(res.data.institution);
        setReports(res.data.reports);
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
  }, [slug]);

  return { institution, reports, loading, error };
}
