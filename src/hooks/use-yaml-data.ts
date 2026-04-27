import { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { RateFileSchema, type RateFile } from '@/lib/schema/rates';

export function useYamlData(url: string) {
  const [data, setData] = useState<RateFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchYaml() {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch rates: ${response.statusText}`);
        
        const text = await response.text();
        const parsed = yaml.load(text);
        
        const validated = RateFileSchema.parse(parsed);
        setData(validated);
        setLoading(false);
      } catch (err: any) {
        console.error('YAML Loading Error:', err);
        setError(err.message || 'Failed to load rate schedule');
        setLoading(false);
      }
    }

    if (url) {
      fetchYaml();
    }
  }, [url]);

  return { data, loading, error };
}
