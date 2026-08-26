import { readFileSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const versionArg = process.argv[2];
const twaManifestPath = join(projectRoot, 'twa-manifest.json');
const twaManifest = JSON.parse(readFileSync(twaManifestPath, 'utf8'));
const version = versionArg || twaManifest.appVersionName || twaManifest.appVersion || 'demo';

const envPath = join(projectRoot, '.env');
const envFromFile = (() => {
  try {
    return readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .reduce((acc, line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
          return acc;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) {
          acc[key] = value;
        }
        return acc;
      }, /** @type {Record<string, string>} */ ({}));
  } catch {
    return {};
  }
})();

const keystorePassword = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD || envFromFile.BUBBLEWRAP_KEYSTORE_PASSWORD;
const keyPassword = process.env.BUBBLEWRAP_KEY_PASSWORD || envFromFile.BUBBLEWRAP_KEY_PASSWORD || keystorePassword;

const bubblewrapArgs = ['build'];
const buildResult = spawnSync('bubblewrap', bubblewrapArgs, {
  cwd: projectRoot,
  stdio: ['inherit', 'inherit', 'inherit'],
  env: keystorePassword
    ? {
        ...process.env,
        BUBBLEWRAP_KEYSTORE_PASSWORD: keystorePassword,
        BUBBLEWRAP_KEY_PASSWORD: keyPassword || keystorePassword,
      }
    : process.env,
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const signedApk = join(projectRoot, 'app-release-signed.apk');
const downloadsDir = join(projectRoot, 'public', 'downloads');
const versionedFileName = `mtg-demo-v${version}.apk`;
const stableFileName = 'mtg-demo-latest.apk';
const versionedApk = join(downloadsDir, versionedFileName);
const stableApk = join(downloadsDir, stableFileName);
const latestMetadataPath = join(downloadsDir, 'latest.json');

mkdirSync(downloadsDir, { recursive: true });
copyFileSync(signedApk, versionedApk);
copyFileSync(signedApk, stableApk);

writeFileSync(
  latestMetadataPath,
  JSON.stringify(
    {
      version,
      fileName: versionedFileName,
      downloadUrl: `/downloads/${versionedFileName}`,
      latestDownloadUrl: `/downloads/${stableFileName}`,
      versionedDownloadUrl: `/downloads/${versionedFileName}`,
    },
    null,
    2,
  ) + '\n',
);

console.log(`Copied APK to ${versionedApk}`);
console.log(`Updated ${latestMetadataPath}`);
