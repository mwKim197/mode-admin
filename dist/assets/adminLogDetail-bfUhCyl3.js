function p(){const e=localStorage.getItem("selectedLog");if(!e){alert("로그 데이터가 없습니다.");return}const i=JSON.parse(e);f(i),u(i)}function f(e){var r,n;const i=document.querySelector(".back-box");i&&(i.style.display="flex");const t=document.getElementById("basicInfo");if(!t)return;const a=e.timestamp.replace("T"," ").replace("+09:00","");t.innerHTML=`
        <div class="detail-row"><div class="key">로그 ID</div><div>${e.logId}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${e.adminId}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${e.actionType}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${e.target}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${a}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${((r=e.meta)==null?void 0:r.ip)||"-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${((n=e.meta)==null?void 0:n.userAgent)||"-"}</div></div>
    `}function u(e){const i=document.getElementById("descriptionText");if(!i)return;if(i.innerText=e.description||"설명 없음",!e.description){i.innerText="설명 없음",l();return}let t=e.description;if(!y(t)){i.innerText=t,l();return}t=JSON.parse(t),i.innerText=t.description??"변경 내역 상세";const r=t.기존데이터||{},n=t.수정데이터||{},s=c(r),d=c(n);v("beforeData",s,d),v("afterData",d,s)}function y(e){if(typeof e!="string")return!1;try{const i=JSON.parse(e);return typeof i=="object"&&i!==null}catch{return!1}}function l(){document.getElementById("beforeData").innerHTML="변경 기록 없음",document.getElementById("afterData").innerHTML="변경 기록 없음"}function c(e){return typeof e!="object"||e===null||Array.isArray(e)?e:Object.keys(e).sort().reduce((i,t)=>(i[t]=c(e[t]),i),{})}function v(e,i,t){const a=document.getElementById(e);if(!a)return;let r="";for(const n in i){let s=i[n],d="";const o=JSON.stringify(c(i[n]))!==JSON.stringify(c(t[n]));n==="image"||n==="imageBase64"||n==="originalFileName"?d=o?"수정됨":"변경 없음":typeof s=="string"?d=s:d=JSON.stringify(s,null,2),r+=`
            <div class="detail-row">
                <div class="key">${n}</div>
                <div class="${o?"changed":""}"
                     style="white-space: ${typeof s=="string"?"normal":"pre-wrap"}; 
                            word-break: break-word;">
                    ${d}
                </div>
            </div>
        `}a.innerHTML=r}export{p as initAdmionDetailLog};
