/**
 * Asset compression pipeline reference (adapted from brunosimon/folio-2025).
 * Requires `gltf-transform` and `toktx` (KTX-Software) installed on PATH.
 *
 * Usage:
 *   node scripts/compress-assets.mjs public/assets/
 */
import path from 'node:path';
import { spawn } from 'node:child_process';
import { glob } from 'glob';

const targetDir = path.resolve(process.cwd(), process.argv[2] || 'public/assets');

const glbFiles = await glob(`${targetDir}/**/*.glb`, {
  ignore: ['**/*-compressed.glb', '**/*-draco.glb', '**/*-ktx.glb'],
});

for (const inputFile of glbFiles) {
  const outFile = inputFile.replace('.glb', '-compressed.glb');
  console.log(`Compressing GLB: ${inputFile} -> ${outFile}`);
  await new Promise((resolve, reject) => {
    const proc = spawn('gltf-transform', ['etc1s', inputFile, outFile, '--quality', '255'], {
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`gltf-transform etc1s failed with ${code}`));
      const draco = spawn(
        'gltf-transform',
        [
          'draco',
          outFile,
          outFile,
          '--method',
          'edgebreaker',
          '--quantization-volume',
          'mesh',
          '--quantize-position',
          '12',
          '--quantize-normal',
          '6',
          '--quantize-texcoord',
          '6',
        ],
        { stdio: 'inherit' }
      );
      draco.on('close', (dCode) =>
        dCode === 0 ? resolve(null) : reject(new Error(`draco failed with ${dCode}`))
      );
    });
  });
}

console.log('Asset compression check complete.');

