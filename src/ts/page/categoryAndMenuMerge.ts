import { apiPost } from "../api/apiHelpers.ts";
import { getStoredUser } from "../ts/utils/userStorage";

export function initCategoryAndMenuMerge() {
  console.log('✅ categoryAndMenuMerge.ts 로드됨');

  const doMerge = document.getElementById('doMerge');
  const clearLog = document.getElementById('clearLog');
  const logEl = document.getElementById('log');
  const srcEl = document.getElementById('sourceUserId') as HTMLInputElement | null;
  const tgtEl = document.getElementById('targetUserId') as HTMLInputElement | null;
  const menuIdsEl = document.getElementById('menuIds') as HTMLInputElement | null;
  const includeImagesEl = document.getElementById('includeImages') as HTMLInputElement | null;
  const overwriteEl = document.getElementById('overwrite') as HTMLInputElement | null;

  function log(msg: string) {
    if (!logEl) return;
    if (logEl.textContent === '(waiting)') logEl.textContent = '';
    logEl.textContent = logEl.textContent + '\n' + msg;
  }

  if (doMerge) {
    doMerge.addEventListener('click', async () => {
      try {
        const sourceUserId = srcEl?.value.trim() || '';
        const targetUserId = tgtEl?.value.trim() || '';
        const menuIdsRaw = menuIdsEl?.value.trim() || '';
        const includeImages = includeImagesEl?.checked ?? true;
        const overwrite = overwriteEl?.checked ?? false;

        if (!sourceUserId || !targetUserId) { alert('sourceUserId and targetUserId are required'); return; }

        const menuIds = menuIdsRaw ? menuIdsRaw.split(',').map(s=>s.trim()).filter(Boolean).map(Number) : null;

        const token = localStorage.getItem('accessToken');
        if (!token) { alert('accessToken not found in localStorage. Please login via app first.'); return; }

        const payload = { sourceUserId, targetUserId, menuIds, includeImages, overwrite };

        log('Sending request...');

        const res = await fetch('/model_admin_menu?func=duplicate-categories-and-menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        try{
          const json = JSON.parse(text || '{}');
          log('HTTP ' + res.status + ' JSON response: ' + JSON.stringify(json, null, 2));
        }catch(e){
          log('HTTP ' + res.status + ' text response: ' + text);
        }
      } catch (err: any) {
        log('Error: ' + (err?.message || err));
      }
    });
  }

  if (clearLog) {
    clearLog.addEventListener('click', () => { if (logEl) logEl.textContent = '(waiting)'; });
  }
}
