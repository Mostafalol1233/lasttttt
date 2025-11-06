import fs from 'fs';
import path from 'path';

// Copy image assets from attached_assets to dist/public/assets so Netlify serves them
const projectRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const attachedDir = path.resolve(projectRoot, 'attached_assets');
const destDir = path.resolve(projectRoot, 'dist', 'public', 'assets');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(srcDir, outDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      ensureDir(destPath);
      copyRecursive(srcPath, destPath);
    } else {
      // Only copy common image types
      if (/\.(png|jpg|jpeg|gif|webp|jfif|svg)$/i.test(entry.name)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`copied ${srcPath} -> ${destPath}`);
        } catch (err) {
          console.error(`failed to copy ${srcPath}:`, err);
        }
      }
    }
  }
}

ensureDir(destDir);
copyRecursive(attachedDir, destDir);
console.log('copy-assets: done');
