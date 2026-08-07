import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import type { PublicAnalytics } from "../lib/analytics";

export function usePublicAnalytics() {
  const [analytics, setAnalytics] = useState<PublicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/api/public/analytics")
      .then((res) => {
        if (!cancelled) setAnalytics(res.data);
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

  return { analytics, loading, error };
}
