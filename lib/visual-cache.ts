import { LRUCache } from "lru-cache"

// Cache configuration: 
// max: 100 items (to avoid high memory usage)
// ttl: 5 minutes (300,000 ms)
const options = {
  max: 100,
  ttl: 1000 * 60 * 5,
}

export const visualCache = new LRUCache<string, Buffer>(options)
