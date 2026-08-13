const cache = new Map();

export function cachedRequest(key, request, ttlMs = 30000) {
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && existing.expiresAt > now) return existing.promise;
  const promise = Promise.resolve().then(request).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

export function invalidateRequest(key) { cache.delete(key); }
