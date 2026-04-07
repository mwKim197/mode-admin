import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(__dirname, '..');
const cfgPath = path.join(root, '.dev-assistant.json');
if (!fs.existsSync(cfgPath)) {
  console.error('.dev-assistant.json not found');
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const lines = [];
lines.push('# 리포지토리 관리 규칙 (자동 생성)');
lines.push('');
lines.push('이 파일은 .dev-assistant.json을 기반으로 자동 생성됩니다. 변경하려면 .dev-assistant.json을 수정하세요.');
lines.push('');

lines.push('## 커밋 메시지 규칙');
lines.push(`- 언어: ${cfg.commitMessage.language}`);
lines.push(`- 접두사: ${cfg.commitMessage.prefix}`);
lines.push('');

lines.push('## 타입 정책');
lines.push(`- 타입 정의 디렉터리: \`${cfg.typePolicy.typesDir}\``);
lines.push(`- 새 필드 추가 전 타입 파일을 먼저 업데이트해야 합니다: ${cfg.typePolicy.requireBeforeField ? '예' : '아니오'}`);
lines.push(`- 타입 누락 시 경고: ${cfg.typePolicy.warningOnMissing ? '예' : '아니오'}`);
lines.push('');

lines.push('## 필드 명명 규칙');
lines.push(`- HTML id: ${cfg.fieldConventions.htmlId}`);
lines.push(`- API 필드(백엔드): ${cfg.fieldConventions.apiField}`);
lines.push('');

lines.push('## 카카오 알림톡 설정(프로젝트별 예시)');
lines.push(`- API 필드명: \`${cfg.kakao.apiField}\``);
lines.push(`- HTML id: \`${cfg.kakao.htmlId}\``);
lines.push('');

lines.push('## 워크플로우');
lines.push('- 새 API/필드를 추가할 때는 반드시 먼저 types 디렉터리에 타입을 추가하세요.');
lines.push('- 변경 후에는 generate-rm.js를 실행해 RM.md를 갱신할 수 있습니다(자동화 예정).');

const out = lines.join('\n');
fs.writeFileSync(path.join(root, 'RM.md'), out, 'utf8');
console.log('RM.md generated');
