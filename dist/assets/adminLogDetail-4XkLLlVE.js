function p(){const e=localStorage.getItem("selectedLog");if(!e){alert("로그 데이터가 없습니다.");return}const i=JSON.parse(e);f(i),u(i)}function f(e){var d,t;const i=document.querySelector(".back-box");i&&(i.style.display="flex");const r=document.getElementById("basicInfo");if(!r)return;const n=e.timestamp.replace("T"," ").replace("+09:00","");r.innerHTML=`
        <div class="detail-row"><div class="key">로그 ID</div><div>${e.logId}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${e.adminId}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${e.actionType}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${e.target}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${n}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${((d=e.meta)==null?void 0:d.ip)||"-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${((t=e.meta)==null?void 0:t.userAgent)||"-"}</div></div>
    `}function u(e){const i=document.getElementById("descriptionText");if(!i)return;if(i.innerText=e.description||"설명 없음",!e.description){l();return}let r=e.description;if(!y(r)){l();return}const n=JSON.parse(r),d=n.기존데이터||{},t=n.수정데이터||{},s=c(d),a=c(t);v("beforeData",s,a),v("afterData",a,s)}function y(e){if(typeof e!="string")return!1;try{const i=JSON.parse(e);return typeof i=="object"&&i!==null}catch{return!1}}function l(){document.getElementById("beforeData").innerHTML="변경 기록 없음",document.getElementById("afterData").innerHTML="변경 기록 없음"}function c(e){return Array.isArray(e)?e.map(i=>c(i)):typeof e=="object"&&e!==null?Object.keys(e).sort().reduce((i,r)=>(i[r]=c(e[r]),i),{}):e}function v(e,i,r){const n=document.getElementById(e);if(!n)return;let d="";for(const t in i){let s=i[t],a="";const o=JSON.stringify(c(i[t]))!==JSON.stringify(c(r[t]));t==="image"||t==="imageBase64"||t==="originalFileName"?a=o?"수정됨":"변경 없음":typeof s=="string"?a=s:a=JSON.stringify(s,null,2),d+=`
            <div class="detail-row">
                <div class="key">${t}</div>
                <div class="${o?"changed":""}"
                     style="white-space: ${typeof s=="string"?"normal":"pre-wrap"}; 
                            word-break: break-word;">
                    ${a}
                </div>
            </div>
        `}n.innerHTML=d}export{p as initAdmionDetailLog};
