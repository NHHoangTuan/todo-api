// Simple in-memory caching implementation
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

exports.getCachedTasks = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  // Return null if cache has expired
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

exports.setCachedTasks = (key, value) => {
  const expiry = Date.now() + CACHE_TTL;
  cache.set(key, { value, expiry });
};

exports.clearTaskCache = () => {
  // Clear all cached task data when updates happen
  cache.clear();
};
