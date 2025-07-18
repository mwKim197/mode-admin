import{g as p,a as $,e as y}from"./main-BZgyfFOO.js";const a=[];function P(){const e=p();if(!e){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}async function t(){return(await(await $(`/model_admin_menu?userId=${e==null?void 0:e.userId}&func=get-all-menu`)).json()).items}function n(o){const s=document.getElementById("menu-table-body");s&&(a.length=0,s.innerHTML=o.map(r=>{var u;const b=((u=r.image)==null?void 0:u.split("\\").pop())??"",T=encodeURIComponent(b),k=`https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${r.userId}/${T}`;return`
      <tr>
        <td>${r.no}</td>
        <td><img src="${k}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
        <td class="product-name w-[100px] whitespace-normal break-all text-sm" onclick="window.location.href='./product-detail.html?menuId=${r.menuId}'">
          ${r.name}
        </td>
        <td>${Number(r.price).toLocaleString()}</td>
        <td>
          <label class="toggle-switch">
            <input
              type="checkbox"
              ${r.empty==="no"?"checked":""}
              onchange="onToggleChange(${r.menuId}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          ${r.cupYn==="yes"?'<span class="tag gray disabled">제조</span>':`<span class="tag blue" data-menu='${encodeURIComponent(JSON.stringify(r))}' onclick="onAdminOder(this)">제조</span>`}
          <span class="tag red" onclick="onDeleteClick(${r.menuId}, event)">삭제</span>
        </td>
      </tr>
    `}).join(""))}(async function(){try{const s=await t();n(s),a.length=0}catch(s){console.error("❌ 메뉴 목록 불러오기 실패",s),window.showToast(`❌ 메뉴 목록 불러오기 실패: ${s}`,3e3,"error")}})()}const m=document.getElementById("saveBtn");m&&m.addEventListener("click",()=>{if(a.length===0){window.showToast("변경된 내용이 없습니다.",3e3,"warning");return}confirm("수정사항을 저장하시겠습니까?")&&L().catch(()=>{window.showToast("❌ 수정에 실패했습니다.",3e3,"error")})});function D(e,t){I(e,{empty:t?"no":"yes"})}function E(e,t){I(e,{delete:!0});const n=t.target.closest("tr");n&&n.classList.add("tr-disabled")}function C(e){return{orderData:{orderList:[{orderId:`${e.menuId}-${e.userId}`,userId:e.userId,menuId:e.menuId,name:e.name,count:1}]}}}function I(e,t){const n=a.findIndex(o=>o.menuId===e);n!==-1?a[n]={...a[n],...t}:a.push({menuId:e,...t})}async function L(){const e=p();if(!e)return;const t={userId:e.userId,items:a};try{const n=await y("/model_admin_menu?func=bulk-update-or-delete",t);if(n.ok)window.showToast("변경 사항 저장 완료"),location.reload();else{const o=await n.json();console.error("❌ 저장 실패:",o.message),window.showToast(`❌ 저장 실패: ${o.message} `,3e3,"error")}}catch(n){console.error("❌ 저장 오류:",n),window.showToast(`❌ 저장 오류: ${n} `,3e3,"error")}}async function c(e,t={}){const n=p();if(!n){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}const o={func:e,userId:n.userId,...e==="order"?{orderData:t.orderData}:{},...e==="drink"?{orderData:{recipe:t}}:{},...e==="ice"?{orderData:{recipe:{iceTime:t.iceTime,waterTime:t.waterTime,name:t.name}}}:{}};y("/model_machine_controll",o).then(()=>{window.showToast(`${e} 명령 전송 완료`)}).catch(s=>{console.error(`❌ ${e} 명령 전송 실패:`,s),window.showToast(`❌ ${e} 명령 전송 실패: ${s} `,3e3,"error")}),window.showToast(`${e} 명령 전송`)}window.onToggleChange=D;window.onDeleteClick=E;window.onAdminOder=v;let i=null;function v(e){const t=decodeURIComponent(e.dataset.menu||"{}");i=JSON.parse(t);const o=document.getElementById("adminActionPopup");o&&(o.style.display="block")}function d(){const e=document.getElementById("adminActionPopup");e&&(e.style.display="none")}const w=document.getElementById("btnPopupTotalOrder");w&&w.addEventListener("click",()=>{if(i){const e=C(i);c("order",e),d()}});const f=document.getElementById("btnCupDispense");f&&f.addEventListener("click",()=>{if(i){const e=i.cup;e==="plastic"?confirm("플라스틱 컵을 배출하시겠습니까?")&&(c("pl"),d()):e==="paper"&&confirm("종이컵을 배출하시겠습니까?")&&(c("pa"),d())}});const g=document.getElementById("btnIceWaterDispense");g&&g.addEventListener("click",()=>{i&&confirm("얼음/물을 배출하시겠습니까?")&&(c("ice",i),d())});const h=document.getElementById("btnPopupDrinkOrder");h&&h.addEventListener("click",()=>{confirm("현재 설정으로 음료를 투출하시겠습니까?")&&i&&(c("drink",i),d())});const l=document.getElementById("adminActionPopup");l&&l.addEventListener("click",e=>{e.target===l&&(l.style.display="none")});window.closeAdminPopup=d;export{P as initProduct};
