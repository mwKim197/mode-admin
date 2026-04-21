import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
let root = path.resolve(__dirname, '..');
// normalize Windows leading slash from file URL
if (process.platform === 'win32' && root.startsWith('/')) {
  root = root.slice(1);
}
const cfgPath = path.join(root, '.dev-assistant.json');
if (!fs.existsSync(cfgPath)) {
  console.error('.dev-assistant.json not found — skipping check');
  process.exit(0);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const typesDir = path.join(root, cfg.typePolicy.typesDir || 'src/ts/types');

// Get staged files
let staged = '';
try {
  staged = execSync('git diff --cached --name-only', { cwd: root }).toString();
} catch (e) {
  console.error('failed to get staged files:', e.message);
  process.exit(1);
}

const files = staged.split('\n').map(s => s.trim()).filter(Boolean);
if (files.length === 0) process.exit(0);

// Read all type files content
let typesContent = '';
if (fs.existsSync(typesDir)) {
  const tfiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts') || f.endsWith('.d.ts'));
  for (const f of tfiles) {
    typesContent += fs.readFileSync(path.join(typesDir, f), 'utf8') + '\n';
  }
}

// Collect candidate property names from staged TS/JS/HTML files
const candidates = new Set();
const propDotRe = /\.([A-Za-z_$][A-Za-z0-9_$]*)/g;
const propBracketRe = /\[['"]([A-Za-z0-9_\-]+)['\"]\]/g;
for (const file of files) {
  if (!file.match(/\.(ts|tsx|js|jsx|html)$/)) continue;
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  let m;
  while ((m = propDotRe.exec(content)) !== null) {
    candidates.add(m[1]);
  }
  while ((m = propBracketRe.exec(content)) !== null) {
    candidates.add(m[1]);
  }
}

// Filter candidate to ones that look like api fields: contain 'kakao' or endWith 'Number' or include 'kakao' substring
const interesting = Array.from(candidates).filter(n => /kakao/i.test(n) || /Number$/.test(n));
if (interesting.length === 0) {
  process.exit(0);
}

// Check each interesting exists in typesContent
const missing = interesting.filter(n => !new RegExp(`\\b${n}\\b`).test(typesContent));
if (missing.length > 0) {
  console.error('타입 검사 실패: 다음 필드가 타입 정의에 없습니다:');
  for (const m of missing) console.error('  -', m);
  console.error('\n규칙: 새 API/필드를 사용하기 전에 types 디렉터리에 해당 필드를 추가하세요.');
  process.exit(1);
}

process.exit(0);
