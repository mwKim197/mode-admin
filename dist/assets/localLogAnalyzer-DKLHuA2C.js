import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */let L=[],F="";function B(){const t=d("logFileInput"),e=d("dropZone"),s=d("keywordInput"),n=d("levelFilter"),r=d("focusFilter"),i=d("maxLines"),a=d("clearBtn");t==null||t.addEventListener("change",()=>{var u;const l=(u=t.files)==null?void 0:u[0];l&&k(l)}),e==null||e.addEventListener("dragover",l=>{l.preventDefault(),e.classList.add("dragover")}),e==null||e.addEventListener("dragleave",()=>{e.classList.remove("dragover")}),e==null||e.addEventListener("drop",l=>{var c,b;l.preventDefault(),e.classList.remove("dragover");const u=(b=(c=l.dataTransfer)==null?void 0:c.files)==null?void 0:b[0];u&&k(u)}),s==null||s.addEventListener("input",v),n==null||n.addEventListener("change",v),r==null||r.addEventListener("change",v),i==null||i.addEventListener("change",v),a==null||a.addEventListener("click",()=>{L=[],F="",t&&(t.value=""),s&&(s.value=""),n&&(n.value="all"),r&&(r.value="all"),U("fileName","TXT 로그 파일을 선택하세요."),a.disabled=!0,v()}),v()}async function k(t){const e=await t.text();F=`${t.name} (${ft(t.size)})`,L=W(e),U("fileName",F);const s=d("clearBtn");s&&(s.disabled=!1),v()}function W(t){const e=t.split(/\r?\n/),s=[];let n=null;for(let r=0;r<e.length;r++){const i=e[r],a=r+1;if(!i.trim())continue;if(j(i)||n===null){n&&s.push({start:n.start,end:n.end,raw:n.lines.join(`
`)}),n={start:a,end:a,lines:[i]};continue}n&&(n.lines.push(i),n.end=a)}return n&&s.push({start:n.start,end:n.end,raw:n.lines.join(`
`)}),s.map(r=>z(r.raw,r.start,r.end))}function j(t){return!!(A(t)||/^\s*(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i.test(t)||/^\[[^\]]+\]\s*(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i.test(t))}function z(t,e,s){return{lineNumber:e,endLineNumber:s,raw:t,normalizedMessage:J(t),level:G(t),timestamp:A(t),durationMs:K(t),httpStatus:Y(t),url:q(t),exception:V(t),ids:X(t),modelTags:_(t)}}function G(t){return/\b(error|fatal|exception|fail|failed|stacktrace)\b/i.test(t)?"error":/\b(warn|warning)\b/i.test(t)?"warn":/\b(info|notice)\b/i.test(t)?"info":/\b(debug|trace|verbose)\b/i.test(t)?"debug":"unknown"}function A(t){const e=t.match(/(\d{4}[-/.]\d{2}[-/.]\d{2})[ T](\d{2}:\d{2}:\d{2})(?:[.,](\d{1,6}))?/);if(!e)return null;const s=e[1].replace(/[/.]/g,"-"),n=e[3]?e[3].slice(0,3).padEnd(3,"0"):"000",r=new Date(`${s}T${e[2]}.${n}`);return Number.isNaN(r.getTime())?null:r}function K(t){const e=t.match(/\b(?:duration|elapsed|took|latency|time|cost)\s*[=:]\s*(\d+(?:\.\d+)?)\s*(ms|s|sec|second|seconds)?\b/i);if(e){const i=Number(e[1]);return(e[2]||"ms").toLowerCase().startsWith("s")?i*1e3:i}const s=t.match(/\b(\d+(?:\.\d+)?)\s*(ms|s|sec|second|seconds)\b/i);if(!s)return null;const n=Number(s[1]);return s[2].toLowerCase().startsWith("s")?n*1e3:n}function Y(t){const e=t.match(/\b(?:status|statusCode|httpStatus)\s*[=:]\s*([1-5]\d{2})\b/i);if(e)return e[1];const s=t.match(/\bHTTP\/\d(?:\.\d)?\s+([1-5]\d{2})\b/i);if(s)return s[1];const n=t.match(/\b([1-5]\d{2})\s+(?:GET|POST|PUT|PATCH|DELETE|HTTP|error|failed)\b/i);return n?n[1]:null}function q(t){const e=t.match(/https?:\/\/[^\s"'<>]+/i);if(e)return O(e[0]);const s=t.match(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+([/?][^\s"'<>]+)/i);if(s)return O(s[1]);const n=t.match(/\b(?:url|uri|path|endpoint)\s*[=:]\s*([^\s"'<>]+)/i);return n?O(n[1]):null}function V(t){const e=t.match(/\b([A-Za-z_$][\w.$]*(?:Exception|Error))\b/);if(e)return e[1];const s=t.match(/Caused by:\s*([A-Za-z_$][\w.$]+)/);return s?s[1]:null}function X(t){const e=new Set,s=/\b([a-zA-Z][\w.-]*(?:Id|ID|No|Key|Code|Token|UUID|Trace|TraceId|RequestId|OrderId|UserId))\s*[=:]\s*([^\s,;"'<>]+)/g;let n;for(;(n=s.exec(t))!==null;)e.add(`${n[1]}=${pt(n[2])}`);return[...e].slice(0,8)}function _(t){const e=new Set;return/컵\s*센서.*time\s*out|컵\s*센서.*120\/\s*120|컵\s*센서.*invalid/i.test(t)&&e.add("컵센서 대기/타임아웃"),/컵\s*추출이 완료|컵\s*투출|GoCupOut|컵\s*디스펜서/i.test(t)&&e.add("컵 투출 흐름"),/얼음을 받아주세요|ice-time command response|출빙 요청이 완료|제빙기/i.test(t)&&e.add("얼음/물 출빙 흐름"),/커피\s*정지\s*상태\s*감지\s*실패|머신 동작확인 타임아웃.*정지/i.test(t)&&e.add("커피 정지 감지 실패"),/제조 명령 응답:\s*COFFEE|재조 명령\s*:\s*COFFEE|커피 추출 요청/i.test(t)&&e.add("커피 명령 흐름"),/커피 추출 완료/i.test(t)&&e.add("커피 추출 완료"),/\[RETRY\].*(?:시도\s*)?11\/11/i.test(t)&&e.add("11회 재시도 도달"),/\[RETRY\].*(커피|시럽|가루차|컵)/i.test(t)&&e.add("제조 재시도"),/시럽 투출 시도|가루차 투출 시도/i.test(t)&&e.add("비커피 재료 투출 문제"),/어드민.*(음료|세척|전체 세척|요청)|관리자|원격/i.test(t)&&e.add("어드민/원격 조치"),/제조완료 menu|주문 처리 완료/i.test(t)&&e.add("주문 정상 완료"),/주문 처리 중 실패|전체 주문 처리 중 실패|\[ERROR\].*추출 실패|제조.*실패/i.test(t)&&e.add("주문/제조 실패"),/FLUSH\d|SYFLU\d|세척 작업 완료|세척 시작/i.test(t)&&e.add("세척 흐름"),/boilerFlowRate":0|coffeeSolValve":"OFF"|grinderComplete":"대기중"|autoOperationState":"커피"/i.test(t)&&e.add("머신 상태 스냅샷"),[...e]}function J(t){return t.split(`
`)[0].replace(/\d{4}[-/.]\d{2}[-/.]\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,6})?/g,"{timestamp}").replace(/https?:\/\/[^\s"'<>]+/gi,"{url}").replace(/\b[0-9a-f]{8,}\b/gi,"{hex}").replace(/\b\d+\b/g,"{number}").replace(/\s+/g," ").trim()}function v(){const t=Q();y(t),tt(t)}function Q(){var n,r,i;const t=((n=d("keywordInput"))==null?void 0:n.value.trim().toLowerCase())||"",e=((r=d("levelFilter"))==null?void 0:r.value)||"all",s=((i=d("focusFilter"))==null?void 0:i.value)||"all";return L.filter(a=>{const l=e==="all"||a.level===e,u=!t||a.raw.toLowerCase().includes(t),c=Z(a,s);return l&&u&&c})}function Z(t,e){return e==="all"?!0:e==="problem"?t.level==="error"||t.level==="warn"||M(t.httpStatus):e==="machine"?t.modelTags.length>0:e==="slow"?t.durationMs!==null:e==="http"?t.httpStatus!==null||t.url!==null:e==="exception"?t.exception!==null:!0}function y(t){const e=d("summaryGrid");if(!e)return;const s=D(t,l=>l.level),n=I(t,"first"),r=I(t,"last"),i=C(t,1)[0],a=t.filter(l=>g(l,["컵센서 대기/타임아웃","커피 정지 감지 실패","11회 재시도 도달","주문/제조 실패","비커피 재료 투출 문제"])).length;e.innerHTML=[$("필터 결과",`${t.length.toLocaleString()}건`),$("ERROR",String(s.get("error")||0),"level-error"),$("WARN",String(s.get("warn")||0),"level-warn"),$("제조/장비 이슈",String(a),a>0?"level-error":""),$("최장 소요",i?N(i.durationMs):"-"),$("시간 범위",dt(n,r))].join("")}function tt(t){var r;const e=d("analysisGrid");if(!e)return;if(L.length===0){e.innerHTML=R("분석 대기","TXT 로그 파일을 선택하면 상세 분석 결과가 표시됩니다.");return}if(t.length===0){e.innerHTML=R("검색 결과 없음","현재 필터에 맞는 로그 항목이 없습니다.");return}const s=Number(((r=d("maxLines"))==null?void 0:r.value)||"50"),n=P(t).slice(0,s);e.innerHTML=[et(t),nt(t),it(t),f("제조/장비 패턴 TOP 10",m(ct(t),i=>i,10)),f("레벨 분포",m(t,i=>i.level.toUpperCase())),f("시간대 분포",m(t.filter(i=>i.timestamp),i=>ut(i.timestamp))),f("예외 TOP 10",m(t.filter(i=>i.exception),i=>i.exception||"UNKNOWN",10)),f("HTTP 상태 TOP 10",m(t.filter(i=>i.httpStatus),i=>i.httpStatus||"UNKNOWN",10)),f("URL/Endpoint TOP 10",m(t.filter(i=>i.url),i=>i.url||"UNKNOWN",10)),f("ID/키 TOP 10",m(lt(t),i=>i,10)),f("반복 메시지 TOP 10",m(t,i=>i.normalizedMessage,10)),at(t),ot(t),w(`문제 후보 ${n.length.toLocaleString()}건`,n),w(`전체/필터 결과 미리보기 ${Math.min(t.length,s).toLocaleString()}건`,t.slice(0,s))].join("")}function et(t){const e=t.filter(c=>c.level==="error"),s=t.filter(c=>c.level==="warn"),n=t.filter(c=>M(c.httpStatus)),r=m(t,c=>c.normalizedMessage,1)[0],i=m(t.filter(c=>c.exception),c=>c.exception||"UNKNOWN",1)[0],a=C(t,1)[0],l=P(t)[0];return`
        <section class="card span-2">
            <h2 class="card-title">원인 후보 요약</h2>
            <div class="rank-list">
                ${[`에러 비율: ${S(e.length,t.length)} (${e.length.toLocaleString()}건)`,`경고 비율: ${S(s.length,t.length)} (${s.length.toLocaleString()}건)`,`HTTP 4xx/5xx 비율: ${S(n.length,t.length)} (${n.length.toLocaleString()}건)`,i?`가장 많은 예외: ${i.label} (${i.count.toLocaleString()}건)`:"예외명 추출 없음",a?`가장 느린 항목: ${N(a.durationMs)} / ${E(a)}`:"소요시간 추출 없음",r?`최다 반복 메시지: ${r.count.toLocaleString()}회`:"반복 메시지 없음",l?`첫 문제 후보: ${E(l)}`:"문제 후보 없음"].map(c=>`<div class="rank-row"><span>${o(c)}</span></div>`).join("")}
            </div>
        </section>
    `}function nt(t){const e=p(t,"컵센서 대기/타임아웃"),s=p(t,"커피 정지 감지 실패"),n=p(t,"11회 재시도 도달"),r=p(t,"비커피 재료 투출 문제"),i=p(t,"어드민/원격 조치"),a=p(t,"세척 흐름"),l=p(t,"커피 추출 완료"),u=p(t,"주문 정상 완료"),c=st({cupTimeout:e,stopFail:s,retry11:n,materialFail:r,adminAction:i,cleanFlow:a,coffeeDone:l,orderDone:u}),b=[["컵센서 대기/타임아웃",e],["커피 정지 감지 실패",s],["11회 재시도 도달",n],["시럽/가루차 투출 문제",r],["어드민/원격 조치",i],["세척 흐름",a],["커피 추출 완료",l],["주문 정상 완료",u]];return`
        <section class="card span-2">
            <h2 class="card-title">자판기 장애 패턴 요약</h2>
            <div class="diagnosis">${o(c)}</div>
            <div class="rank-list">
                ${b.map(([H,x])=>`
                    <div class="rank-row">
                        <span>${o(H)}</span>
                        <span class="rank-count">${Number(x).toLocaleString()}</span>
                    </div>
                `).join("")}
            </div>
        </section>
    `}function st(t){return t.cupTimeout>0&&t.stopFail===0?"컵/얼음 이후 컵센서 대기에서 멈춘 패턴입니다. 실제 투출 상태와 컵센서 감지 상태를 우선 확인하세요.":t.stopFail>0&&t.retry11>0?"커피 명령 응답 후 머신 정지 상태 감지가 실패하며 재시도 한도에 도달한 패턴입니다. 제조 명령 통신보다 머신 상태 전환/제조부 동작 확인이 핵심입니다.":t.materialFail>0&&t.retry11>0?"시럽 또는 가루차 투출이 반복 재시도된 패턴입니다. 해당 재료 투출 모듈과 세척 이후 회복 여부를 함께 확인하세요.":t.adminAction>0||t.cleanFlow>0?t.orderDone>0?"어드민 조치 또는 세척 이후 정상 완료 기록이 함께 보입니다. 조치 전후 주문을 비교하면 회복 시점을 잡을 수 있습니다.":"어드민 조치 또는 세척 기록이 있습니다. 직전 실패 주문과 직후 정상 주문을 이어서 확인하세요.":t.coffeeDone>0||t.orderDone>0?"주문/제조 완료 기록이 확인됩니다. 고객 증상과 다르면 실제 음료량 센싱이 로그에 남지 않는 물리적 문제 가능성을 분리해서 보세요.":"지금까지 정의한 자판기 장애 패턴은 뚜렷하게 잡히지 않았습니다. 키워드나 시간대를 좁혀 다시 확인하세요."}function it(t){const e=rt(t).slice(-12).reverse();return`
        <section class="card wide">
            <h2 class="card-title">주문별 제조 흐름</h2>
            <div class="order-list">${e.length?e.map(n=>{const r=n.result==="completed"?"level-info":n.result==="failed"?"level-error":"level-warn",i=[n.cupOk?"컵완료":"",n.iceOk?"얼음/물":"",n.coffeeCommandOk?`COFFEE ${n.coffeeCommandOk}`:"",n.coffeeComplete?`커피완료 ${n.coffeeComplete}`:"",n.retry11?`11회재시도 ${n.retry11}`:"",n.stopFail?`정지감지실패 ${n.stopFail}`:"",n.cupSensorTimeout?`컵센서타임아웃 ${n.cupSensorTimeout}`:"",n.adminAction?`어드민 ${n.adminAction}`:""].filter(Boolean).join(" / ");return`
                <div class="order-row">
                    <div>
                        <strong>${o(n.menuName)}</strong>
                        <span>${o(`${h(n.startTime)} ${n.orderId} / menu ${n.menuId}`)}</span>
                    </div>
                    <div class="${r}">${o(n.result.toUpperCase())}</div>
                    <div>${o(i||"특이 이벤트 없음")}</div>
                    <div>${o(`#${n.startLine}-${n.endLine}`)}</div>
                </div>
            `}).join(""):'<div class="empty">주문 처리 시작 패턴을 찾지 못했습니다.</div>'}</div>
        </section>
    `}function rt(t){const e=[];let s=null;return t.forEach(n=>{const r=n.raw.match(/주문 처리 시작 \([^)]*\):\s*(.+?)\s*-\s*\[메뉴 ID:\s*(\d+),\s*주문 ID:\s*([^\]]+)\]/);if(r&&(s={startLine:n.lineNumber,endLine:n.endLineNumber,startTime:n.timestamp,endTime:null,menuName:r[1].trim(),menuId:r[2],orderId:r[3],result:"incomplete",cupOk:!1,iceOk:!1,coffeeCommandOk:0,coffeeComplete:0,retry11:0,stopFail:0,cupSensorTimeout:0,adminAction:0},e.push(s)),!s)return;s.endLine=n.endLineNumber,s.endTime=n.timestamp||s.endTime,n.raw.includes("컵 추출이 완료")&&(s.cupOk=!0),g(n,["얼음/물 출빙 흐름"])&&(s.iceOk=!0),n.raw.includes("제조 명령 응답: COFFEE")&&(s.coffeeCommandOk+=1),n.raw.includes("커피 추출 완료")&&(s.coffeeComplete+=1),g(n,["11회 재시도 도달"])&&(s.retry11+=1),g(n,["커피 정지 감지 실패"])&&(s.stopFail+=1),g(n,["컵센서 대기/타임아웃"])&&(s.cupSensorTimeout+=1),g(n,["어드민/원격 조치","세척 흐름"])&&(s.adminAction+=1),g(n,["주문/제조 실패"])&&(s.result="failed");const i=n.raw.match(/주문 처리 완료 .*?\[메뉴 ID:\s*(\d+),\s*주문 ID:\s*([^\]]+)\]/);i&&i[2]===s.orderId&&(s.result="completed",s.endTime=n.timestamp,s.endLine=n.endLineNumber,s=null)}),e}function at(t){const e=C(t,10);return`
        <section class="card">
            <h2 class="card-title">느린 요청 TOP 10</h2>
            <div class="rank-list">${e.length?e.map(n=>`
            <div class="rank-row">
                <span>${o(`${E(n)} ${n.url||n.normalizedMessage}`)}</span>
                <span class="rank-count">${o(N(n.durationMs))}</span>
            </div>
        `).join(""):'<div class="empty">소요시간 패턴을 찾지 못했습니다.</div>'}</div>
        </section>
    `}function ot(t){const e=m(t.filter(s=>s.timestamp&&(s.level==="error"||s.level==="warn")),s=>mt(s.timestamp),10);return f("문제 급증 분 단위 TOP 10",e)}function f(t,e){const s=Math.max(...e.map(r=>r.count),1),n=e.length?e.map(r=>`
            <div class="rank-row">
                <span>${o(r.label)}</span>
                <span class="rank-count">${r.count.toLocaleString()}</span>
            </div>
            <div class="bar"><span style="width:${Math.max(4,r.count/s*100)}%"></span></div>
        `).join(""):'<div class="empty">데이터 없음</div>';return`
        <section class="card">
            <h2 class="card-title">${o(t)}</h2>
            <div class="rank-list">${n}</div>
        </section>
    `}function w(t,e){const s=e.length?e.map(n=>`
            <div class="log-line">
                <div class="line-meta">
                    <span>${o(E(n))}</span>
                    <span class="level-${n.level}">${n.level.toUpperCase()}</span>
                    <span>${o(h(n.timestamp))}</span>
                    ${n.httpStatus?`<span>HTTP ${o(n.httpStatus)}</span>`:""}
                    ${n.durationMs!==null?`<span>${o(N(n.durationMs))}</span>`:""}
                    ${n.exception?`<span>${o(n.exception)}</span>`:""}
                </div>
                <div>${o(n.raw)}</div>
            </div>
        `).join(""):'<div class="empty">표시할 로그가 없습니다.</div>';return`
        <section class="card wide">
            <h2 class="card-title">${o(t)}</h2>
            <div class="line-list">${s}</div>
        </section>
    `}function R(t,e){return`
        <section class="card wide">
            <h2 class="card-title">${o(t)}</h2>
            <div class="empty">${o(e)}</div>
        </section>
    `}function $(t,e,s=""){return`
        <div class="card metric">
            <span>${o(t)}</span>
            <strong class="${s}">${o(e)}</strong>
        </div>
    `}function m(t,e,s=5){return[...D(t,e).entries()].map(([r,i])=>({label:r,count:i})).sort((r,i)=>i.count-r.count||r.label.localeCompare(i.label)).slice(0,s)}function D(t,e){const s=new Map;return t.forEach(n=>{const r=e(n)||"UNKNOWN";s.set(r,(s.get(r)||0)+1)}),s}function P(t){return t.filter(e=>e.level==="error"||e.level==="warn"||e.exception!==null||M(e.httpStatus)||g(e,["컵센서 대기/타임아웃","커피 정지 감지 실패","11회 재시도 도달","주문/제조 실패","비커피 재료 투출 문제"]))}function C(t,e){return t.filter(s=>s.durationMs!==null).sort((s,n)=>(n.durationMs||0)-(s.durationMs||0)).slice(0,e)}function lt(t){return t.flatMap(e=>e.ids)}function ct(t){return t.flatMap(e=>e.modelTags)}function p(t,e){return t.filter(s=>s.modelTags.includes(e)).length}function g(t,e){return e.some(s=>t.modelTags.includes(s))}function M(t){return t?Number(t)>=400:!1}function I(t,e){const s=t.map(n=>n.timestamp).filter(n=>n!==null).sort((n,r)=>n.getTime()-r.getTime());return e==="first"?s[0]||null:s[s.length-1]||null}function dt(t,e){return!t||!e?"-":t.getTime()===e.getTime()?h(t):`${h(t)} ~ ${h(e)}`}function ut(t){return t?`${String(t.getHours()).padStart(2,"0")}시`:"UNKNOWN"}function mt(t){return t?`${h(t).slice(0,16)}`:"UNKNOWN"}function h(t){return t?`${t.getFullYear()}-${T(t.getMonth()+1)}-${T(t.getDate())} ${T(t.getHours())}:${T(t.getMinutes())}:${T(t.getSeconds())}`:"-"}function N(t){return t===null?"-":t>=1e3?`${(t/1e3).toFixed(2)}s`:`${t.toFixed(t%1===0?0:1)}ms`}function S(t,e){return e===0?"0%":`${(t/e*100).toFixed(1)}%`}function ft(t){return t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:`${(t/1024/1024).toFixed(1)} MB`}function E(t){return t.lineNumber===t.endLineNumber?`#${t.lineNumber}`:`#${t.lineNumber}-${t.endLineNumber}`}function O(t){return t.replace(/[),.;\]]+$/g,"")}function pt(t){return t.replace(/[),.;\]]+$/g,"")}function T(t){return String(t).padStart(2,"0")}function U(t,e){const s=document.getElementById(t);s&&(s.textContent=e)}function d(t){return document.getElementById(t)}function o(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}document.addEventListener("DOMContentLoaded",B);
