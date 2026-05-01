import { useEffect, useState } from "react";
import type { RateFile } from "@/lib/schema/rates";
import { RateStorage } from "@/lib/storage/idb";

export function useRateData(url: string) {
  const [data, setData] = useState<RateFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        setError(null);

        let finalUrl = url;

        // Legacy URL migration: Redirect old .yaml URLs to compiled .json assets
        if (finalUrl === "/rates/gepi-2020-2023.yaml") {
          finalUrl = "/rates/dist/gepi-2020-2023.json";
        }

        if (finalUrl.startsWith("local://")) {
          const id = url.replace("local://", "");
          const record = await RateStorage.getRate(id);
          if (!record) throw new Error("Custom rate schedule not found");
          setData(record.data);
        } else {
          const response = await fetch(finalUrl);
          if (!response.ok) throw new Error(`Failed to fetch rates: ${response.statusText}`);

          const contentType = response.headers.get("content-type");
          if (!contentType?.includes("application/json")) {
            const text = await response.text();
            console.error("Expected JSON but received:", text.slice(0, 100));
            throw new Error("Server returned non-JSON response. Ensure the rates are compiled.");
          }

          const json = await response.json();
          setData(json as RateFile);
        }
        setLoading(false);
      } catch (err: unknown) {
        console.error("Rate Loading Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load rate schedule");
        setLoading(false);
      }
    }

    if (url) {
      fetchRates();
    }
  }, [url]);

  return { data, loading, error };
}
