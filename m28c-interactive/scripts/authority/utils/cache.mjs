import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from './logger.mjs';

const CACHE_DIR = 'c:/Users/johna/Desktop/Veterans/vocrehab_ch31/m28c-interactive/.tmp/cache';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getCacheKey(url) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function fetchWithCache(url, options = {}) {
  const ttl = options.ttl || DEFAULT_TTL_MS;
  const bypassCache = options.bypassCache || false;
  
  if (bypassCache) {
    logger.info(`Bypassing cache for: ${url}`);
    return fetch(url);
  }

  const key = getCacheKey(url);
  const cachePath = path.join(CACHE_DIR, `${key}.cache`);
  const metaPath = path.join(CACHE_DIR, `${key}.json`);

  if (fs.existsSync(cachePath) && fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const age = Date.now() - meta.timestamp;
      
      if (age < ttl) {
        logger.info(`Cache HIT for: ${url}`);
        const content = fs.readFileSync(cachePath, 'utf8');
        return {
          ok: true,
          status: 200,
          text: async () => content,
          json: async () => JSON.parse(content)
        };
      } else {
        logger.info(`Cache EXPIRED for: ${url}`);
      }
    } catch (err) {
      logger.warn(`Failed to read cache for: ${url}. Error: ${err.message}`);
    }
  }

  logger.info(`Cache MISS. Fetching over network: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    logger.warn(`Network request failed with status ${response.status} for: ${url}`);
    return response;
  }

  try {
    const text = await response.text();
    fs.writeFileSync(cachePath, text, 'utf8');
    fs.writeFileSync(metaPath, JSON.stringify({
      url,
      timestamp: Date.now()
    }, null, 2), 'utf8');
    logger.success(`Cached response for: ${url}`);
    
    return {
      ok: true,
      status: 200,
      text: async () => text,
      json: async () => JSON.parse(text)
    };
  } catch (err) {
    logger.warn(`Failed to write cache for: ${url}. Error: ${err.message}`);
    return response;
  }
}
