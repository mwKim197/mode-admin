import{g,a as u}from"./main-eiH4XnTY.js";function A(){console.log("✅ franchise.ts 로드됨");const o=g();if(o)f(o);else{const e=document.getElementById("noticeBox");e.style.display="none"}h(),I()}async function f(o){try{const e=await u(`/model_payment?func=get-sales-summary&userId=${o.userId}`),t=await e.json();if(!e.ok)throw new Error(t.message);const r=document.getElementById("today"),n=document.getElementById("yesterday"),a=document.getElementById("month"),s=document.getElementById("highest");r==null||r.setAttribute("data-target",t.todaySales||0),n==null||n.setAttribute("data-target",t.yesterdaySales||0),a==null||a.setAttribute("data-target",t.monthSales||0),s==null||s.setAttribute("data-target",t.highestSale||0),y()}catch(e){console.error("❌ 매출 요약 불러오기 실패:",e)}}function y(){document.querySelectorAll(".countbox h4").forEach(e=>{var c;const r=+(((c=e.getAttribute("data-target"))==null?void 0:c.replace(/,/g,""))||"0"),n=e.querySelector(".number"),a=r.toLocaleString().replace(/,/g,"").length,s=()=>{if(!n)return;let d=+n.innerText.replace(/[^0-9]/g,"")||0;const l=Math.ceil(r/100);d<r?(d+=l,d>r&&(d=r),n.innerText=i(d,a),setTimeout(s,10)):n.innerText=i(r,a)},i=(d,l)=>d.toString().padStart(l,"0").replace(/\B(?=(\d{3})+(?!\d))/g,",");s()})}async function h(){try{const o=await u("/model_admin_notice?func=get-posts"),e=await o.json();if(!o.ok)throw new Error(e.message);e.sort((n,a)=>new Date(a.timestamp).getTime()-new Date(n.timestamp).getTime());const t=document.querySelector(".notice-flex");if(!t)return;t.innerHTML="",e.forEach((n,a)=>{const s=m(n.noticeType),i=`
                <div class="box notice-item" data-content-id="${n.contentId}">
                  <div class="num">${a+1}</div>
                  <label class="tag ${s.color}">${s.label}</label>
                  <div class="textBox">
                    <h4>${n.title}</h4>
                    <span>${b(n.timestamp)}</span>
                  </div>
                </div>
              `;t.insertAdjacentHTML("beforeend",i)}),document.querySelectorAll(".notice-item").forEach(n=>{n.addEventListener("click",()=>{var i;const a=n.getAttribute("data-content-id"),s=e.find(c=>c.contentId==a);if(s){const c=p(s);(i=document.getElementById("popupArea"))==null||i.appendChild(c)}})});const r=document.getElementById("noticeSlider");if(!r)return;r.innerHTML="",e.forEach(n=>{const a=m(n.noticeType),s=`
                    <div class="notice-item box flex gap-1 mb20" data-content-id="${n.contentId}">
                      <img src="/img/notice_icon.svg" alt="" />
                      <label class="tag ${a.color} none-bg">${a.label}</label>
                      <p>${S(n.timestamp)} / <br class="br-s" />${n.title}</p>
                    </div>
                    `;r.insertAdjacentHTML("beforeend",s)}),r.querySelectorAll(".notice-item").forEach(n=>{n.addEventListener("click",()=>{var i;const a=n.getAttribute("data-content-id"),s=e.find(c=>c.contentId==a);if(s){const c=p(s);(i=document.getElementById("popupArea"))==null||i.appendChild(c)}})})}catch(o){console.error("❌ 공지사항 불러오기 실패:",o)}x()}function m(o){switch(o){case"emergency":return{label:"긴급",color:"red"};case"patch":return{label:"패치",color:"blue"};case"event":return{label:"이벤트",color:"org"};default:return{label:"안내",color:""}}}function b(o){const e=new Date(o),t=new Date(e.getTime()+9*60*60*1e3),r=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0"),s=String(t.getHours()).padStart(2,"0"),i=String(t.getMinutes()).padStart(2,"0"),c=String(t.getSeconds()).padStart(2,"0");return`${r}.${n}.${a} ${s}:${i}:${c}`}function S(o){const e=new Date(o),t=new Date(e.getTime()+9*60*60*1e3),r=String(t.getMonth()+1).padStart(2,"0"),n=String(t.getDate()).padStart(2,"0");return`${r}-${n}`}function x(){const o=document.getElementById("noticeSlider");if(!o)return;const e=o.children,t=e.length;if(t===0)return;let r=0;const n=e[0].cloneNode(!0);o.appendChild(n);function a(){r++,o&&(o.style.transition="transform 0.5s ease-in-out",o.style.transform=`translateX(-${r*100}%)`,r===t&&setTimeout(()=>{o.style.transition="none",o.style.transform="translateX(0)",r=0},600))}setInterval(a,5e3)}async function I(){const o=document.getElementById("popupArea");try{const e=new Date,t=new Date;t.setDate(e.getDate()+7);const r=e.toISOString().split("T")[0],n=t.toISOString().split("T")[0],a=await u(`/model_admin_notice?func=get-posts&startDate=${r}&endDate=${n}`),s=await a.json();if(!a.ok||s.length===0){console.log("❌ 표시할 팝업이 없습니다.");return}let i=!1;s.forEach(c=>{if(!w(`popup_${c.contentId}`)){const d=p(c);o.appendChild(d),i=!0}}),i?o.classList.remove("hidden"):o.classList.add("hidden")}catch(e){console.error("❌ 팝업 로드 오류:",e)}}function p(o){var r,n;const e=document.getElementById("popupArea");e&&(e.classList.remove("hidden"),e.style.display="flex");const t=document.createElement("div");return t.id=`popup_${o.contentId}`,t.className="popup_module",Object.assign(t.style,{position:"fixed",top:"47%",left:"50%",transform:"translate(-50%, -50%)",backgroundColor:"#000",color:"#fff",padding:"1.5rem",borderRadius:"12px",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.4)",border:"2px solid #888",maxWidth:"360px",width:"70%",zIndex:"9999",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"220px"}),document.getElementById("popupArea").style.backgroundColor="rgba(0, 0, 0, 0.6)",document.getElementById("popupArea").style.position="fixed",document.getElementById("popupArea").style.top="0",document.getElementById("popupArea").style.left="0",document.getElementById("popupArea").style.width="100%",document.getElementById("popupArea").style.height="100%",document.getElementById("popupArea").style.zIndex="9998",t.innerHTML=`
        <div class="popup_module_wrap" style="flex: 1; display: flex; flex-direction: column;">
            <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.5rem;">공지사항</h2>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; ">제목: ${o.title}</h3>
            <div class="popup_module_content" style="flex: 1; margin-bottom: 1rem; overflow-y: auto; padding-bottom: 0.5rem;">
                ${o.content}
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
                    <input type="checkbox" class="todayClose" data-popup-id="popup_${o.contentId}" style="margin-right: 0.5rem;">
                    오늘 하루 이 창 보지 않음
                </label>
                <button class="__popupClose" data-popup-id="popup_${o.contentId}" style="
                    color: #ff5353;
                    border: 1px solid #ff5353;
                    background: transparent;
                    border-radius: 4px;
                    padding: 0.3rem 0.8rem;
                    cursor: pointer;
                ">닫기</button>
            </div>
        </div>
    `,(r=t.querySelector(".__popupClose"))==null||r.addEventListener("click",()=>{t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden"),document.querySelector(".popup_module")||e&&(e.classList.add("hidden"),e.style.display="none")}),(n=t.querySelector(".todayClose"))==null||n.addEventListener("change",a=>{a.target.checked&&($(`popup_${o.contentId}`,"hidden",1),t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden")),document.querySelector(".popup_module")||e&&(e.classList.add("hidden"),e.style.display="none")}),t}function $(o,e,t){const r=new Date;r.setTime(r.getTime()+t*24*60*60*1e3),document.cookie=`${o}=${e}; expires=${r.toUTCString()}; path=/`}function w(o){const e=o+"=",t=document.cookie.split(";");for(let r=0;r<t.length;r++){let n=t[r].trim();if(n.indexOf(e)===0)return n.substring(e.length,n.length)}return null}export{A as initHome};
