import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { NamedFund } from "../components/report/reportData";

export function usePublicNamedFunds() {
  const [namedFunds, setNamedFunds] = useState<NamedFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/api/public/named-funds")
      .then((res) => {
        if (!cancelled) setNamedFunds(res.data.namedFunds);
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

  return { namedFunds, loading, error };
}
