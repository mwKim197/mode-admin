import{g as m,a as p}from"./main-lxJioydd.js";function T(){console.log("✅ franchise.ts 로드됨");const n=m();if(n)g(n);else{const t=document.getElementById("noticeBox");t.style.display="none"}y(),x()}async function g(n){try{const t=await p(`/model_payment?func=get-sales-summary&userId=${n.userId}`),e=await t.json();if(!t.ok)throw new Error(e.message);const r=document.getElementById("today"),o=document.getElementById("yesterday"),a=document.getElementById("month"),s=document.getElementById("highest");r==null||r.setAttribute("data-target",e.todaySales||0),o==null||o.setAttribute("data-target",e.yesterdaySales||0),a==null||a.setAttribute("data-target",e.monthSales||0),s==null||s.setAttribute("data-target",e.highestSale||0),f()}catch(t){console.error("❌ 매출 요약 불러오기 실패:",t)}}function f(){document.querySelectorAll(".countbox h4").forEach(t=>{var d;const r=+(((d=t.getAttribute("data-target"))==null?void 0:d.replace(/,/g,""))||"0"),o=t.querySelector(".number"),a=r.toLocaleString().replace(/,/g,"").length,s=()=>{if(!o)return;let c=+o.innerText.replace(/[^0-9]/g,"")||0;const l=Math.ceil(r/100);c<r?(c+=l,c>r&&(c=r),o.innerText=i(c,a),setTimeout(s,10)):o.innerText=i(r,a)},i=(c,l)=>c.toString().padStart(l,"0").replace(/\B(?=(\d{3})+(?!\d))/g,",");s()})}async function y(){try{const n=await p("/model_admin_notice?func=get-posts"),t=await n.json();if(!n.ok)throw new Error(t.message);t.sort((o,a)=>new Date(a.timestamp).getTime()-new Date(o.timestamp).getTime());const e=document.querySelector(".notice-flex");if(!e)return;e.innerHTML="",t.forEach((o,a)=>{const s=u(o.noticeType),i=`
                <div class="box notice-item" data-content-id="${o.contentId}">
                  <div class="num">${a+1}</div>
                  <label class="tag ${s.color}">${s.label}</label>
                  <div class="textBox">
                    <h4>${o.title}</h4>
                    <span>${h(o.timestamp)}</span>
                  </div>
                </div>
              `;e.insertAdjacentHTML("beforeend",i)}),document.querySelectorAll(".notice-item").forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-content-id");a&&(window.location.href=`/html/noticeDetail.html?id=${a}`)})});const r=document.getElementById("noticeSlider");if(!r)return;r.innerHTML="",t.forEach(o=>{const a=u(o.noticeType),s=`
                    <div class="notice-item box flex gap-1 mb20" data-content-id="${o.contentId}">
                      <img src="/img/notice_icon.svg" alt="" />
                      <label class="tag ${a.color} none-bg">${a.label}</label>
                      <p>${b(o.timestamp)} / <br class="br-s" />${o.title}</p>
                    </div>
                    `;r.insertAdjacentHTML("beforeend",s)}),r.querySelectorAll(".notice-item").forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-content-id");a&&(window.location.href=`/html/noticeDetail.html?id=${a}`)})})}catch(n){console.error("❌ 공지사항 불러오기 실패:",n)}S()}function u(n){switch(n){case"emergency":return{label:"긴급",color:"red"};case"patch":return{label:"패치",color:"blue"};case"event":return{label:"이벤트",color:"org"};default:return{label:"안내",color:""}}}function h(n){const t=new Date(n),e=new Date(t.getTime()+9*60*60*1e3),r=e.getFullYear(),o=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),s=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),d=String(e.getSeconds()).padStart(2,"0");return`${r}.${o}.${a} ${s}:${i}:${d}`}function b(n){const t=new Date(n),e=new Date(t.getTime()+9*60*60*1e3),r=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0");return`${r}-${o}`}function S(){const n=document.getElementById("noticeSlider");if(!n)return;const t=n.children,e=t.length;if(e===0)return;let r=0;const o=t[0].cloneNode(!0);n.appendChild(o);function a(){r++,n&&(n.style.transition="transform 0.5s ease-in-out",n.style.transform=`translateX(-${r*100}%)`,r===e&&setTimeout(()=>{n.style.transition="none",n.style.transform="translateX(0)",r=0},600))}setInterval(a,5e3)}async function x(){const n=document.getElementById("popupArea");try{const t=new Date,e=new Date;e.setDate(t.getDate()+7);const r=t.toISOString().split("T")[0],o=e.toISOString().split("T")[0],a=await p(`/model_admin_notice?func=get-posts&startDate=${r}&endDate=${o}`),s=await a.json();if(!a.ok||s.length===0){console.log("❌ 표시할 팝업이 없습니다.");return}let i=!1;s.forEach(d=>{if(!$(`popup_${d.contentId}`)){const c=I(d);n.appendChild(c),i=!0}}),i?n.classList.remove("hidden"):n.classList.add("hidden")}catch(t){console.error("❌ 팝업 로드 오류:",t)}}function I(n){var r,o;const t=document.getElementById("popupArea");t&&(t.classList.remove("hidden"),t.style.display="flex");const e=document.createElement("div");return e.id=`popup_${n.contentId}`,e.className="popup_module",Object.assign(e.style,{position:"fixed",top:"47%",left:"50%",transform:"translate(-50%, -50%)",backgroundColor:"#000",color:"#fff",padding:"1.5rem",borderRadius:"12px",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.4)",border:"2px solid #888",maxWidth:"360px",width:"70%",zIndex:"9999",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"220px"}),document.getElementById("popupArea").style.backgroundColor="rgba(0, 0, 0, 0.6)",document.getElementById("popupArea").style.position="fixed",document.getElementById("popupArea").style.top="0",document.getElementById("popupArea").style.left="0",document.getElementById("popupArea").style.width="100%",document.getElementById("popupArea").style.height="100%",document.getElementById("popupArea").style.zIndex="9998",e.innerHTML=`
        <div class="popup_module_wrap" style="flex: 1; display: flex; flex-direction: column;">
            <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.5rem;">공지사항</h2>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; ">제목: ${n.title}</h3>
            <div class="popup_module_content" style="flex: 1; margin-bottom: 1rem; overflow-y: auto; padding-bottom: 0.5rem;">
                ${n.content}
            </div>
            <div class="popup_module_footer" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1rem;
                padding-top: 0.5rem;
                border-top: 1px solid #555;
            ">
                <label style="display: flex; align-items: center; font-size: 0.9rem; color: #ccc;">
                    <input type="checkbox" class="todayClose" data-popup-id="popup_${n.contentId}" style="margin-right: 0.5rem;">
                    오늘 하루 이 창 보지 않음
                </label>
                <button class="__popupClose" data-popup-id="popup_${n.contentId}" style="
                    color: #ff5353;
                    border: 1px solid #ff5353;
                    background: transparent;
                    border-radius: 4px;
                    padding: 0.3rem 0.8rem;
                    cursor: pointer;
                ">닫기</button>
            </div>
        </div>
    `,(r=e.querySelector(".__popupClose"))==null||r.addEventListener("click",()=>{e.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden"),document.querySelector(".popup_module")||t&&(t.classList.add("hidden"),t.style.display="none")}),(o=e.querySelector(".todayClose"))==null||o.addEventListener("change",a=>{a.target.checked&&(w(`popup_${n.contentId}`,"hidden",1),e.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden")),document.querySelector(".popup_module")||t&&(t.classList.add("hidden"),t.style.display="none")}),e}function w(n,t,e){const r=new Date;r.setTime(r.getTime()+e*24*60*60*1e3),document.cookie=`${n}=${t}; expires=${r.toUTCString()}; path=/`}function $(n){const t=n+"=",e=document.cookie.split(";");for(let r=0;r<e.length;r++){let o=e[r].trim();if(o.indexOf(t)===0)return o.substring(t.length,o.length)}return null}export{T as initHome};
