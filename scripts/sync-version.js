
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const manifestJsonPath = path.resolve(__dirname, '../public/manifest.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));

if (packageJson.version !== manifestJson.version) {
  console.log(`Updating manifest version from ${manifestJson.version} to ${packageJson.version}`);
  manifestJson.version = packageJson.version;
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n');
} else {
  console.log('Manifest version is already up to date.');
}
