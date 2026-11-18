import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const owner = 'dmmulroy';
const repo = 'anti-slop';
const commit = 'c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b';
const sourceRoot = 'skills/install-anti-slop/assets/anti-slop';
const destinationRoot = 'tools/oxlint/anti-slop';

const treeResponse = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/git/trees/${commit}?recursive=1`,
  { headers: { Accept: 'application/vnd.github+json' } },
);
if (!treeResponse.ok) throw new Error(`Unable to read anti-slop tree: ${treeResponse.status}`);

const tree = await treeResponse.json();
const files = tree.tree
  .filter((entry) => entry.type === 'blob' && entry.path.startsWith(`${sourceRoot}/`))
  .map((entry) => entry.path);

if (files.length === 0) throw new Error('No anti-slop skill assets found upstream.');

await rm(destinationRoot, { recursive: true, force: true });

for (const sourcePath of files) {
  const relativePath = sourcePath.slice(`${sourceRoot}/`.length);
  const destination = join(destinationRoot, relativePath);
  const response = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${commit}/${sourcePath}`,
  );
  if (!response.ok) throw new Error(`Unable to download ${sourcePath}: ${response.status}`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, await response.text(), 'utf8');
}

await writeFile(
  join(destinationRoot, 'UPSTREAM.md'),
  `# Anti-slop provenance\n\n- Source: https://github.com/${owner}/${repo}\n- Source commit: ${commit}\n- Vendored source root: ${sourceRoot}\n- Installed path: ${destinationRoot}\n- Installation method: copied from the upstream install skill assets\n- Intentional deviations: none\n`,
  'utf8',
);

console.log(`Vendored ${files.length} anti-slop files from ${commit}.`);
