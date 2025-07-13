import{g,a as u}from"./main-DwyHQ2nh.js";function A(){console.log("✅ franchise.ts 로드됨");const n=g();if(n)f(n);else{const e=document.getElementById("noticeBox");e.style.display="none"}h(),I()}async function f(n){try{const e=await u(`/model_payment?func=get-sales-summary&userId=${n.userId}`),t=await e.json();if(!e.ok)throw new Error(t.message);console.log("📦 매출 요약 데이터:",t);const r=document.getElementById("today"),o=document.getElementById("yesterday"),a=document.getElementById("month"),s=document.getElementById("highest");r==null||r.setAttribute("data-target",t.todaySales||0),o==null||o.setAttribute("data-target",t.yesterdaySales||0),a==null||a.setAttribute("data-target",t.monthSales||0),s==null||s.setAttribute("data-target",t.highestSale||0),y()}catch(e){console.error("❌ 매출 요약 불러오기 실패:",e)}}function y(){document.querySelectorAll(".countbox h4").forEach(e=>{var c;const r=+(((c=e.getAttribute("data-target"))==null?void 0:c.replace(/,/g,""))||"0"),o=e.querySelector(".number"),a=r.toLocaleString().replace(/,/g,"").length,s=()=>{if(!o)return;let d=+o.innerText.replace(/[^0-9]/g,"")||0;const l=Math.ceil(r/100);d<r?(d+=l,d>r&&(d=r),o.innerText=i(d,a),setTimeout(s,20)):o.innerText=i(r,a)},i=(d,l)=>d.toString().padStart(l,"0").replace(/\B(?=(\d{3})+(?!\d))/g,",");s()})}async function h(){try{const n=await u("/model_admin_notice?func=get-posts"),e=await n.json();if(!n.ok)throw new Error(e.message);console.log("📦 공지사항 데이터:",e),e.sort((o,a)=>new Date(a.timestamp).getTime()-new Date(o.timestamp).getTime());const t=document.querySelector(".notice-flex");if(!t)return;t.innerHTML="",e.forEach((o,a)=>{const s=m(o.noticeType),i=`
                <div class="box notice-item" data-content-id="${o.contentId}">
                  <div class="num">${a+1}</div>
                  <label class="tag ${s.color}">${s.label}</label>
                  <div class="textBox">
                    <h4>${o.title}</h4>
                    <span>${b(o.timestamp)}</span>
                  </div>
                </div>
              `;t.insertAdjacentHTML("beforeend",i)}),document.querySelectorAll(".notice-item").forEach(o=>{o.addEventListener("click",()=>{var i;const a=o.getAttribute("data-content-id"),s=e.find(c=>c.contentId==a);if(s){const c=p(s);(i=document.getElementById("popupArea"))==null||i.appendChild(c)}})});const r=document.getElementById("noticeSlider");if(!r)return;r.innerHTML="",e.forEach(o=>{const a=m(o.noticeType),s=`
                    <div class="notice-item box flex gap-1 mb20" data-content-id="${o.contentId}">
                      <img src="/img/notice_icon.svg" alt="" />
                      <label class="tag ${a.color} none-bg">${a.label}</label>
                      <p>${S(o.timestamp)} / <br class="br-s" />${o.title}</p>
                    </div>
                    `;r.insertAdjacentHTML("beforeend",s)}),r.querySelectorAll(".notice-item").forEach(o=>{o.addEventListener("click",()=>{var i;const a=o.getAttribute("data-content-id"),s=e.find(c=>c.contentId==a);if(s){const c=p(s);(i=document.getElementById("popupArea"))==null||i.appendChild(c)}})})}catch(n){console.error("❌ 공지사항 불러오기 실패:",n)}x()}function m(n){switch(n){case"emergency":return{label:"긴급",color:"red"};case"patch":return{label:"패치",color:"blue"};case"event":return{label:"이벤트",color:"org"};default:return{label:"안내",color:""}}}function b(n){const e=new Date(n),t=new Date(e.getTime()+9*60*60*1e3),r=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),s=String(t.getHours()).padStart(2,"0"),i=String(t.getMinutes()).padStart(2,"0"),c=String(t.getSeconds()).padStart(2,"0");return`${r}.${o}.${a} ${s}:${i}:${c}`}function S(n){const e=new Date(n),t=new Date(e.getTime()+9*60*60*1e3),r=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0");return`${r}-${o}`}function x(){const n=document.getElementById("noticeSlider");if(!n)return;const e=n.children,t=e.length;if(t===0)return;let r=0;const o=e[0].cloneNode(!0);n.appendChild(o);function a(){r++,n&&(n.style.transition="transform 0.5s ease-in-out",n.style.transform=`translateX(-${r*100}%)`,r===t&&setTimeout(()=>{n.style.transition="none",n.style.transform="translateX(0)",r=0},600))}setInterval(a,5e3)}async function I(){const n=document.getElementById("popupArea");try{const e=new Date,t=new Date;t.setDate(e.getDate()+7);const r=e.toISOString().split("T")[0],o=t.toISOString().split("T")[0],a=await u(`/model_admin_notice?func=get-posts&startDate=${r}&endDate=${o}`),s=await a.json();if(!a.ok||s.length===0){console.log("❌ 표시할 팝업이 없습니다.");return}let i=!1;s.forEach(c=>{if(!w(`popup_${c.contentId}`)){const d=p(c);n.appendChild(d),i=!0}}),i?n.classList.remove("hidden"):n.classList.add("hidden")}catch(e){console.error("❌ 팝업 로드 오류:",e)}}function p(n){var r,o;const e=document.getElementById("popupArea");e&&(e.classList.remove("hidden"),e.style.display="flex");const t=document.createElement("div");return t.id=`popup_${n.contentId}`,t.className="popup_module",Object.assign(t.style,{position:"fixed",top:"30%",left:"50%",transform:"translate(-50%, -50%)",backgroundColor:"#000",color:"#fff",padding:"1.5rem",borderRadius:"12px",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.4)",border:"2px solid #888",maxWidth:"500px",width:"90%",zIndex:"9999",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"300px"}),document.getElementById("popupArea").style.backgroundColor="rgba(0, 0, 0, 0.6)",document.getElementById("popupArea").style.position="fixed",document.getElementById("popupArea").style.top="0",document.getElementById("popupArea").style.left="0",document.getElementById("popupArea").style.width="100%",document.getElementById("popupArea").style.height="100%",document.getElementById("popupArea").style.zIndex="9998",t.innerHTML=`
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
    `,(r=t.querySelector(".__popupClose"))==null||r.addEventListener("click",()=>{t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden"),document.querySelector(".popup_module")||e&&(e.classList.add("hidden"),e.style.display="none")}),(o=t.querySelector(".todayClose"))==null||o.addEventListener("change",a=>{a.target.checked&&($(`popup_${n.contentId}`,"hidden",1),t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden")),document.querySelector(".popup_module")||e&&(e.classList.add("hidden"),e.style.display="none")}),t}function $(n,e,t){const r=new Date;r.setTime(r.getTime()+t*24*60*60*1e3),document.cookie=`${n}=${e}; expires=${r.toUTCString()}; path=/`}function w(n){const e=n+"=",t=document.cookie.split(";");for(let r=0;r<t.length;r++){let o=t[r].trim();if(o.indexOf(e)===0)return o.substring(e.length,o.length)}return null}export{A as initHome};
