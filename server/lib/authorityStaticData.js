import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTHORITY_PUBLIC_DIR = path.resolve(__dirname, '../../client/public/authority');

function loadJsonAsset(filename) {
  const filePath = path.join(AUTHORITY_PUBLIC_DIR, filename);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return {
      data: JSON.parse(raw),
      error: null,
      filePath
    };
  } catch (error) {
    return {
      data: null,
      error,
      filePath
    };
  }
}

const manifestAsset = loadJsonAsset('index.json');
const crosswalkAsset = loadJsonAsset('topic-crosswalk.json');
const coverageAsset = loadJsonAsset('coverage-report.json');

function assertAssetLoaded(asset, label) {
  if (asset.error) {
    const wrappedError = new Error(`Failed to load ${label} asset from ${asset.filePath}: ${asset.error.message}`);
    wrappedError.cause = asset.error;
    throw wrappedError;
  }

  return asset.data;
}

export function getManifestMetadata() {
  const manifest = assertAssetLoaded(manifestAsset, 'authority manifest');
  return {
    version: manifest.version || '1.0.0',
    lastUpdated: manifest.lastUpdated || null
  };
}

export function getTopicCrosswalk() {
  return assertAssetLoaded(crosswalkAsset, 'topic crosswalk');
}

export function getCoverageReport() {
  return assertAssetLoaded(coverageAsset, 'coverage report');
}
