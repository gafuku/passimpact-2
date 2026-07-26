import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { Institution } from "../components/report/reportData";
import type { PublicReport } from "./publicReportTypes";

export type InstitutionWithLatest = Institution & { latest: PublicReport | null };

export function usePublicInstitutions() {
  const [institutions, setInstitutions] = useState<InstitutionWithLatest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/api/public/institutions")
      .then((res) => {
        if (!cancelled) setInstitutions(res.data.institutions);
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
  }, []);

  return { institutions, loading, error };
}
