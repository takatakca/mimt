import { useCallback, useEffect, useRef, useState } from "react";
import { toErrorKey } from "../api/errors";
import type { TKey } from "../i18n";

/** Loads data on mount and on reload(); exposes a translated error key. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const value = await load();
      if (alive.current) {
        setData(value);
        setErrorKey(null);
      }
    } catch (e) {
      if (alive.current) setErrorKey(toErrorKey(e));
    } finally {
      if (alive.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    alive.current = true;
    reload();
    return () => {
      alive.current = false;
    };
  }, [reload]);

  return { data, setData, errorKey, loading, reload };
}
