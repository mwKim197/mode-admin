// categoryAndMenuMerge.ts
// 간단 UI/헬퍼: Lambda duplicate-categories-and-menu 를 호출하는 클라이언트 유틸
// 사용법: import { duplicateCategoryAndMenu } from './categoryAndMenuMerge';

export async function duplicateCategoryAndMenu({ sourceUserId, targetUserId, menuIds = null, includeImages = true, overwrite = false }) {
  if (!sourceUserId || !targetUserId) throw new Error('sourceUserId and targetUserId are required');

  // 토큰 획득: localStorage 또는 전역 ENV에서 취득하도록 시도
  const token = (typeof window !== 'undefined' && (localStorage.getItem('accessToken') || window['__ENV']?.accessToken)) || '';
  if (!token) throw new Error('Authorization token not found in localStorage or window.__ENV.accessToken');

  const payload = { sourceUserId, targetUserId, menuIds, includeImages, overwrite };

  const url = (window && window.location && window.location.origin)
    ? `${window.location.origin}/model_admin_menu?func=duplicate-categories-and-menu`
    : '/model_admin_menu?func=duplicate-categories-and-menu';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text || '{}');
    if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
    return json;
  } catch (err) {
    // 응답이 JSON이 아닐 경우
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    return text;
  }
}

// 간단한 UI 트리거 예시: 버튼에 연결해서 사용
export function attachDuplicateButton(buttonElem, optsProvider) {
  if (!buttonElem) return;
  buttonElem.addEventListener('click', async () => {
    try {
      const opts = typeof optsProvider === 'function' ? optsProvider() : optsProvider;
      buttonElem.disabled = true;
      const result = await duplicateCategoryAndMenu(opts);
      console.log('복제 결과:', result);
      alert('복제 성공: ' + (result?.menuResult?.inserted ?? '완료'));
    } catch (e) {
      console.error('복제 실패:', e);
      alert('복제 실패: ' + (e.message || e));
    } finally {
      buttonElem.disabled = false;
    }
  });
}
