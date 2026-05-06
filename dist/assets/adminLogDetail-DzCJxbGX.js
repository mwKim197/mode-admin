function S(){const e=localStorage.getItem("selectedLog");if(!e){alert("로그 데이터가 없습니다.");return}const t=JSON.parse(e);y(t),v(t)}function y(e){var s,n;const t=document.querySelector(".back-box");t&&(t.style.display="flex");const r=document.getElementById("basicInfo");if(!r)return;const i=e.timestamp?e.timestamp.replace("T"," ").replace("+09:00",""):"-";r.innerHTML=`
        <div class="detail-row"><div class="key">로그 ID</div><div>${e.logId||"-"}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${e.adminId||"-"}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${e.actionType||"-"}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${e.target||"-"}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${i}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${((s=e.meta)==null?void 0:s.ip)||"-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${((n=e.meta)==null?void 0:n.userAgent)||"-"}</div></div>
    `}function v(e){const t=document.getElementById("descriptionText");if(!t)return;t.innerText=g(e.description);const r=o(e.description);if(r!=null&&r.기존데이터&&(r!=null&&r.수정데이터)){const i=a(r.기존데이터),s=a(r.수정데이터);f("beforeData",i,s),f("afterData",s,i);return}w()}function g(e){if(m(e))return"설명 없음";if(typeof e=="object")return JSON.stringify(e,null,2);if(typeof e!="string")return String(e);const t=o(e);if(t)return JSON.stringify(t,null,2);const r=p(e);if(Object.keys(r).length>0)return JSON.stringify(r,null,2);const i=e.match(/^(.*?)\s*:\s*(\[.*\])$/s);if(i)try{return`${i[1]}:
${JSON.stringify(JSON.parse(i[2]),null,2)}`}catch{return e}return e}function o(e){if(!e)return null;if(typeof e=="object")return e;if(typeof e!="string")return null;try{return JSON.parse(e)}catch{return null}}function m(e){return!e||typeof e=="object"&&!Array.isArray(e)&&Object.keys(e).length===0}function p(e){const t={},r=/(\w+)=({[\s\S]*?})(?=\s+\w+=|$)/g;let i;for(;(i=r.exec(e))!==null;)try{t[i[1]]=JSON.parse(i[2])}catch{t[i[1]]=i[2]}return t}function w(){const e=document.getElementById("beforeData"),t=document.getElementById("afterData");e&&(e.innerHTML="변경 기록 없음"),t&&(t.innerHTML="변경 기록 없음")}function a(e){return Array.isArray(e)?e.map(t=>a(t)):typeof e=="object"&&e!==null?Object.keys(e).sort().reduce((t,r)=>(t[r]=a(e[r]),t),{}):e}function f(e,t,r){const i=document.getElementById(e);if(!i)return;let s="";for(const n in t){const l=t[n];let c="";const d=JSON.stringify(a(t[n]))!==JSON.stringify(a(r==null?void 0:r[n]));n==="image"||n==="imageBase64"||n==="originalFileName"?c=d?"수정됨":"변경 없음":typeof l=="string"?c=l:c=JSON.stringify(l,null,2),s+=`
            <div class="detail-row">
                <div class="key">${u(n)}</div>
                <div class="${d?"changed":""}"
                     style="white-space: ${typeof l=="string"?"normal":"pre-wrap"};
                            word-break: break-word;">
                    ${u(c)}
                </div>
            </div>
        `}i.innerHTML=s}function u(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}export{S as initAdminDetailLog};
