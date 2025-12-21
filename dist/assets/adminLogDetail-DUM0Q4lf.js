function y(){const e=localStorage.getItem("selectedLog");if(!e){alert("로그 데이터가 없습니다.");return}const i=JSON.parse(e);v(i),f(i)}function v(e){var s,t;const i=document.querySelector(".back-box");i&&(i.style.display="flex");const d=document.getElementById("basicInfo");if(!d)return;const r=e.timestamp.replace("T"," ").replace("+09:00","");d.innerHTML=`
        <div class="detail-row"><div class="key">로그 ID</div><div>${e.logId}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${e.adminId}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${e.actionType}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${e.target}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${r}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${((s=e.meta)==null?void 0:s.ip)||"-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${((t=e.meta)==null?void 0:t.userAgent)||"-"}</div></div>
    `}function f(e){if(!e.description)return;let i=e.description;typeof i=="string"&&(i=JSON.parse(i));const d=i.기존데이터||{},r=i.수정데이터||{},s=a(d),t=a(r);o("beforeData",s,t),o("afterData",t,s)}function a(e){return typeof e!="object"||e===null||Array.isArray(e)?e:Object.keys(e).sort().reduce((i,d)=>(i[d]=a(e[d]),i),{})}function o(e,i,d){const r=document.getElementById(e);if(!r)return;let s="";for(const t in i){let n=i[t],c="";const l=JSON.stringify(a(i[t]))!==JSON.stringify(a(d[t]));t==="image"||t==="imageBase64"||t==="originalFileName"?c=l?"수정됨":"변경 없음":typeof n=="string"?c=n:c=JSON.stringify(n,null,2),s+=`
            <div class="detail-row">
                <div class="key">${t}</div>
                <div class="${l?"changed":""}"
                     style="white-space: ${typeof n=="string"?"normal":"pre-wrap"}; 
                            word-break: break-word;">
                    ${c}
                </div>
            </div>
        `}r.innerHTML=s}export{y as initAdmionDetailLog};
