import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC_DIR = 'src';
const LINE_LIMIT = 180;
const VALID_EXT = new Set(['.ts', '.tsx', '.css']);

const collectFiles = (dir, acc = []) => {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, acc);
      continue;
    }

    const ext = fullPath.slice(fullPath.lastIndexOf('.'));
    if (VALID_EXT.has(ext)) {
      acc.push(fullPath);
    }
  }
  return acc;
};

const countLines = (filePath) => readFileSync(filePath, 'utf8').split(/\r?\n/).length;

const offenders = collectFiles(SRC_DIR)
  .map((filePath) => ({ filePath, lines: countLines(filePath) }))
  .filter((item) => item.lines > LINE_LIMIT)
  .sort((a, b) => b.lines - a.lines);

if (offenders.length > 0) {
  console.error(`Found ${offenders.length} files over ${LINE_LIMIT} lines:`);
  offenders.forEach((item) => {
    console.error(`- ${relative(process.cwd(), item.filePath)} (${item.lines})`);
  });
  process.exit(1);
}

console.log(`All src files are within ${LINE_LIMIT} lines.`);
