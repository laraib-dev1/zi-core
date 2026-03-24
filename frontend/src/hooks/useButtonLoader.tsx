import { useState, useCallback } from "react";

/**
 * Hook to manage loading state for buttons
 * Automatically handles loading state when button is clicked
 */
export function useButtonLoader<T extends (...args: any[]) => Promise<any> | any>(
  asyncFn: T,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
    immediate?: boolean;
  }
) {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      if (loading) return;
      
      setLoading(true);
      try {
        const result = await asyncFn(...args);
        options?.onSuccess?.();
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, loading, options]
  );

  return { loading, execute };
}

/**
 * Hook to manage loading state for multiple buttons
 */
export function useMultipleButtonLoaders() {
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoaders((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getLoading = useCallback(
    (key: string) => loaders[key] || false,
    [loaders]
  );

  const createLoader = useCallback(
    <T extends (...args: any[]) => Promise<any> | any>(
      key: string,
      asyncFn: T,
      options?: {
        onSuccess?: () => void;
        onError?: (error: any) => void;
      }
    ) => {
      return async (...args: Parameters<T>) => {
        if (loaders[key]) return;

        setLoading(key, true);
        try {
          const result = await asyncFn(...args);
          options?.onSuccess?.();
          return result;
        } catch (error) {
          options?.onError?.(error);
          throw error;
        } finally {
          setLoading(key, false);
        }
      };
    },
    [loaders, setLoading]
  );

  return { getLoading, createLoader, setLoading };
}











