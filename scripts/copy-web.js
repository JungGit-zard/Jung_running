/**
 * 게임 리소스를 www/로 복사 (Capacitor webDir)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const DIRS = ['css', 'js', 'bgm', 'effect_sound', 'graphic_resource'];
const FILES = ['index.html'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(WWW)) fs.mkdirSync(WWW, { recursive: true });

for (const f of FILES) {
  const s = path.join(ROOT, f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(WWW, f));
}

for (const d of DIRS) {
  const s = path.join(ROOT, d);
  if (fs.existsSync(s)) copyRecursive(s, path.join(WWW, d));
}

console.log('copy-web: www/ 준비됨');
