import{g as m}from"./main-Bf-UK50S.js";import{a as p}from"./apiHelpers-DHI6Lj2I.js";function D(){console.log("✅ franchise.ts 로드됨");const e=m();if(e)g(e);else{const t=document.getElementById("noticeBox");t.style.display="none"}y(),S()}async function g(e){try{const t=await p(`/model_payment?func=get-sales-summary&userId=${e.userId}`),n=await t.json();if(!t.ok)throw new Error(n.message);console.log("📦 매출 요약 데이터:",n);const o=document.getElementById("today"),r=document.getElementById("yesterday"),a=document.getElementById("month"),s=document.getElementById("highest");o==null||o.setAttribute("data-target",n.todaySales||0),r==null||r.setAttribute("data-target",n.yesterdaySales||0),a==null||a.setAttribute("data-target",n.monthSales||0),s==null||s.setAttribute("data-target",n.highestSale||0),f()}catch(t){console.error("❌ 매출 요약 불러오기 실패:",t)}}function f(){document.querySelectorAll(".countbox h4").forEach(t=>{var c;const o=+(((c=t.getAttribute("data-target"))==null?void 0:c.replace(/,/g,""))||"0"),r=t.querySelector(".number"),a=o.toLocaleString().replace(/,/g,"").length,s=()=>{if(!r)return;let l=+r.innerText.replace(/[^0-9]/g,"")||0;const d=Math.ceil(o/100);l<o?(l+=d,l>o&&(l=o),r.innerText=i(l,a),setTimeout(s,20)):r.innerText=i(o,a)},i=(l,d)=>l.toString().padStart(d,"0").replace(/\B(?=(\d{3})+(?!\d))/g,",");s()})}async function y(){try{const e=await p("/model_admin_notice?func=get-posts"),t=await e.json();if(!e.ok)throw new Error(t.message);console.log("📦 공지사항 데이터:",t),t.sort((r,a)=>new Date(a.timestamp).getTime()-new Date(r.timestamp).getTime());const n=document.querySelector(".notice-flex");if(!n)return;n.innerHTML="",t.forEach((r,a)=>{const s=u(r.noticeType),i=`
                <div class="box">
                  <div class="num">${a+1}</div>
                  <label class="tag ${s.color}">${s.label}</label>
                  <div class="textBox">
                    <h4>${r.title}</h4>
                    <span>${h(r.timestamp)}</span>
                  </div>
                </div>
              `;n.insertAdjacentHTML("beforeend",i)});const o=document.getElementById("noticeSlider");if(!o)return;o.innerHTML="",t.forEach(r=>{const a=u(r.noticeType),s=`
                    <div class="notice-item box flex gap-1 mb20">
                      <img src="/img/notice_icon.svg" alt="" />
                      <label class="tag ${a.color} none-bg">${a.label}</label>
                      <p>${b(r.timestamp)} / <br class="br-s" />${r.title}</p>
                    </div>
                    `;o.insertAdjacentHTML("beforeend",s)})}catch(e){console.error("❌ 공지사항 불러오기 실패:",e)}x()}function u(e){switch(e){case"emergency":return{label:"긴급",color:"red"};case"patch":return{label:"패치",color:"blue"};case"event":return{label:"이벤트",color:"org"};default:return{label:"안내",color:""}}}function h(e){const t=new Date(e),n=new Date(t.getTime()+9*60*60*1e3),o=n.getFullYear(),r=String(n.getMonth()+1).padStart(2,"0"),a=String(n.getDate()).padStart(2,"0"),s=String(n.getHours()).padStart(2,"0"),i=String(n.getMinutes()).padStart(2,"0"),c=String(n.getSeconds()).padStart(2,"0");return`${o}.${r}.${a} ${s}:${i}:${c}`}function b(e){const t=new Date(e),n=new Date(t.getTime()+9*60*60*1e3),o=String(n.getMonth()+1).padStart(2,"0"),r=String(n.getDate()).padStart(2,"0");return`${o}-${r}`}function x(){const e=document.getElementById("noticeSlider");if(!e)return;const t=e.children,n=t.length;if(n===0)return;let o=0;const r=t[0].cloneNode(!0);e.appendChild(r);function a(){o++,e&&(e.style.transition="transform 0.5s ease-in-out",e.style.transform=`translateX(-${o*100}%)`,o===n&&setTimeout(()=>{e.style.transition="none",e.style.transform="translateX(0)",o=0},600))}setInterval(a,5e3)}async function S(){const e=document.getElementById("popupArea");try{const t=new Date,n=new Date;n.setDate(t.getDate()+7);const o=t.toISOString().split("T")[0],r=n.toISOString().split("T")[0],a=await p(`/model_admin_notice?func=get-posts&startDate=${o}&endDate=${r}`),s=await a.json();if(!a.ok||s.length===0){console.log("❌ 표시할 팝업이 없습니다.");return}let i=!1;s.forEach(c=>{if(!$(`popup_${c.contentId}`)){const l=I(c);e.appendChild(l),i=!0}}),i?e.classList.remove("hidden"):e.classList.add("hidden")}catch(t){console.error("❌ 팝업 로드 오류:",t)}}function I(e){var n,o;const t=document.createElement("div");return t.id=`popup_${e.contentId}`,t.className="popup_module",Object.assign(t.style,{position:"fixed",top:"30%",left:"50%",transform:"translate(-50%, -50%)",backgroundColor:"#000",color:"#fff",padding:"1.5rem",borderRadius:"12px",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.4)",border:"2px solid #888",maxWidth:"500px",width:"90%",zIndex:"9999",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"300px"}),document.getElementById("popupArea").style.backgroundColor="rgba(0, 0, 0, 0.6)",document.getElementById("popupArea").style.position="fixed",document.getElementById("popupArea").style.top="0",document.getElementById("popupArea").style.left="0",document.getElementById("popupArea").style.width="100%",document.getElementById("popupArea").style.height="100%",document.getElementById("popupArea").style.zIndex="9998",t.innerHTML=`
        <div class="popup_module_wrap" style="flex: 1; display: flex; flex-direction: column;">
            <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; padding-bottom: 0.5rem;">공지사항</h2>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; border-bottom: 1px solid #555; ">제목: ${e.title}</h3>
            <div class="popup_module_content" style="flex: 1; margin-bottom: 1rem; overflow-y: auto; padding-bottom: 0.5rem;">
                ${e.content}
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
                    <input type="checkbox" class="todayClose" data-popup-id="popup_${e.contentId}" style="margin-right: 0.5rem;">
                    오늘 하루 이 창 보지 않음
                </label>
                <button class="__popupClose" data-popup-id="popup_${e.contentId}" style="
                    color: #ff5353;
                    border: 1px solid #ff5353;
                    background: transparent;
                    border-radius: 4px;
                    padding: 0.3rem 0.8rem;
                    cursor: pointer;
                ">닫기</button>
            </div>
        </div>
    `,(n=t.querySelector(".__popupClose"))==null||n.addEventListener("click",()=>{t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden")}),(o=t.querySelector(".todayClose"))==null||o.addEventListener("change",r=>{r.target.checked&&(w(`popup_${e.contentId}`,"hidden",1),t.remove(),document.querySelector(".popup_module")||document.getElementById("popupArea").classList.add("hidden"))}),t}function w(e,t,n){const o=new Date;o.setTime(o.getTime()+n*24*60*60*1e3),document.cookie=`${e}=${t}; expires=${o.toUTCString()}; path=/`}function $(e){const t=e+"=",n=document.cookie.split(";");for(let o=0;o<n.length;o++){let r=n[o].trim();if(r.indexOf(t)===0)return r.substring(t.length,r.length)}return null}export{D as initHome};
