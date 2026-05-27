'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCachedDataOptions<T> {
  ttl?: number; // Time-to-live in milliseconds
  enabled?: boolean; // Set to false to disable fetching
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

interface CachePayload<T> {
  data: T;
  timestamp: number;
}

// Track keys that have been revalidated during the current JS runtime session (reset on browser reload)
const hasRevalidatedInSession: Record<string, boolean> = {};

export function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options?: UseCachedDataOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<any>(null);

  // Use refs to avoid re-triggering effects when callbacks change
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Read cache payload with defensive check
  const readCache = useCallback((): CachePayload<T> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      
      // Verify parsed object is a valid payload containing both data and timestamp
      if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
        return parsed as CachePayload<T>;
      }
      
      // Clear legacy or invalid format
      localStorage.removeItem(cacheKey);
      return null;
    } catch (e) {
      console.warn(`Failed to read cache for key: ${cacheKey}`, e);
      return null;
    }
  }, [cacheKey]);

  // Write cache
  const writeCache = useCallback((newData: T) => {
    if (typeof window === 'undefined') return;
    try {
      const payload: CachePayload<T> = {
        data: newData,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (e) {
      console.warn(`Failed to write cache for key: ${cacheKey}`, e);
    }
  }, [cacheKey]);

  // Fetch function
  const fetchData = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const freshData = await fetchFnRef.current();
      setData(freshData);
      writeCache(freshData);
      optionsRef.current?.onSuccess?.(freshData);
    } catch (err: any) {
      setError(err);
      optionsRef.current?.onError?.(err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [writeCache]);

  const enabled = options?.enabled !== false;

  // 1. Load cache immediately on hydrate/mount (independent of auth/enabled)
  useEffect(() => {
    const cached = readCache();
    if (cached !== null) {
      setData(cached.data);
      setIsLoading(false);
    }
  }, [readCache]);

  // 2. Fetch or revalidate once auth/enabled is ready
  useEffect(() => {
    if (!enabled) return;

    const cached = readCache();
    if (cached !== null) {
      // Determine if cache is stale and needs background refresh
      const ttl = optionsRef.current?.ttl;
      const hasRevalidated = hasRevalidatedInSession[cacheKey];
      
      const isStale = ttl !== undefined
        ? Date.now() - cached.timestamp >= ttl
        : true; // Default to always background revalidate if no TTL is set
        
      if (isStale || !hasRevalidated) {
        fetchData(true);
        hasRevalidatedInSession[cacheKey] = true;
      }
    } else {
      fetchData(false);
      hasRevalidatedInSession[cacheKey] = true;
    }
  }, [readCache, fetchData, enabled, cacheKey]);

  // Manual mutation helper
  const mutate = useCallback(
    (newData: T | ((prev: T | null) => T), shouldRevalidate = true) => {
      setData((prev) => {
        const updated = typeof newData === 'function' 
          ? (newData as any)(prev) 
          : newData;
        writeCache(updated);
        return updated;
      });
      if (shouldRevalidate) {
        fetchData(true);
      }
    },
    [writeCache, fetchData]
  );

  return {
    data,
    isLoading,
    isRefetching,
    error,
    mutate,
    refetch: () => fetchData(true),
  };
}
