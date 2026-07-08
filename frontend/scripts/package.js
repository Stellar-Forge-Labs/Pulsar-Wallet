import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const distDir = path.resolve('dist');
const outputFile = path.resolve('dist', 'pulsar-wallet-extension.zip');

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found. Run npm run build first.');
  process.exit(1);
}

const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('end', () => {
  const stats = fs.statSync(outputFile);
  console.log(`Package created: ${outputFile} (${stats.size} bytes)`);
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
