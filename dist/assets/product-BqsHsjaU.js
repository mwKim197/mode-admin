import{g as m,a as $,e as y}from"./main-DOk1qqnK.js";const d=[];function O(){const e=m();if(!e){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}async function t(){return(await(await $(`/model_admin_menu?userId=${e==null?void 0:e.userId}&func=get-all-menu`)).json()).items}function n(o){const r=document.getElementById("menu-table-body");r&&(d.length=0,r.innerHTML=o.map(s=>{var u;const T=((u=s.image)==null?void 0:u.split("\\").pop())??"",b=encodeURIComponent(T),k=`https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${s.userId}/${b}`;return`
      <tr>
        <td>${s.no}</td>
        <td><img src="${k}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
        <td class="product-name w-[100px] whitespace-normal break-all text-sm" onclick="window.location.href='./product-detail.html?menuId=${s.menuId}'">
          ${s.name}
        </td>
        <td>${Number(s.price).toLocaleString()}</td>
        <td>
          <label class="toggle-switch">
            <input
              type="checkbox"
              ${s.empty==="no"?"checked":""}
              onchange="onToggleChange(${s.menuId}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <span class="tag blue" data-menu='${encodeURIComponent(JSON.stringify(s))}' onclick="onAdminOder(this)">제조</span>
          <span class="tag red" onclick="onDeleteClick(${s.menuId}, event)">삭제</span>
        </td>
      </tr>
    `}).join(""))}(async function(){try{const r=await t();n(r),d.length=0}catch(r){console.error("❌ 메뉴 목록 불러오기 실패",r),window.showToast(`❌ 메뉴 목록 불러오기 실패: ${r}`,3e3,"error")}})()}const p=document.getElementById("saveBtn");p&&p.addEventListener("click",()=>{if(d.length===0){window.showToast("변경된 내용이 없습니다.",3e3,"warning");return}confirm("수정사항을 저장하시겠습니까?")&&L().catch(()=>{window.showToast("❌ 수정에 실패했습니다.",3e3,"error")})});function D(e,t){I(e,{empty:t?"no":"yes"})}function E(e,t){I(e,{delete:!0});const n=t.target.closest("tr");n&&n.classList.add("tr-disabled")}function C(e){return{orderData:{orderList:[{orderId:`${e.menuId}-${e.userId}`,userId:e.userId,menuId:e.menuId,name:e.name,count:1}]}}}function I(e,t){const n=d.findIndex(o=>o.menuId===e);n!==-1?d[n]={...d[n],...t}:d.push({menuId:e,...t})}async function L(){const e=m();if(!e)return;const t={userId:e.userId,items:d};try{const n=await y("/model_admin_menu?func=bulk-update-or-delete",t);if(n.ok)window.showToast("변경 사항 저장 완료"),location.reload();else{const o=await n.json();console.error("❌ 저장 실패:",o.message),window.showToast(`❌ 저장 실패: ${o.message} `,3e3,"error")}}catch(n){console.error("❌ 저장 오류:",n),window.showToast(`❌ 저장 오류: ${n} `,3e3,"error")}}async function a(e,t={}){const n=m();if(!n){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}const o={func:e,userId:n.userId,...e==="order"?{orderData:t.orderData}:{},...e==="drink"?{orderData:{recipe:t}}:{},...e==="ice"?{orderData:{recipe:{iceTime:t.iceTime,waterTime:t.waterTime,name:t.name}}}:{}};y("/model_machine_controll",o).then(()=>{window.showToast(`${e} 명령 전송 완료`)}).catch(r=>{console.error(`❌ ${e} 명령 전송 실패:`,r),window.showToast(`❌ ${e} 명령 전송 실패: ${r} `,3e3,"error")}),window.showToast(`${e} 명령 전송`)}window.onToggleChange=D;window.onDeleteClick=E;window.onAdminOder=v;let i=null;function v(e){const t=decodeURIComponent(e.dataset.menu||"{}");i=JSON.parse(t);const o=document.getElementById("adminActionPopup");o&&(o.style.display="block")}function c(){const e=document.getElementById("adminActionPopup");e&&(e.style.display="none")}const w=document.getElementById("btnPopupTotalOrder");w&&w.addEventListener("click",()=>{if(i){const e=C(i);a("order",e),c()}});const f=document.getElementById("btnCupDispense");f&&f.addEventListener("click",()=>{if(i){const e=i.cup;e==="plastic"?confirm("플라스틱 컵을 배출하시겠습니까?")&&(a("pl"),c()):e==="paper"&&confirm("종이컵을 배출하시겠습니까?")&&(a("pa"),c())}});const g=document.getElementById("btnIceWaterDispense");g&&g.addEventListener("click",()=>{i&&confirm("얼음/물을 배출하시겠습니까?")&&(a("ice",i),c())});const h=document.getElementById("btnPopupDrinkOrder");h&&h.addEventListener("click",()=>{confirm("현재 설정으로 음료를 투출하시겠습니까?")&&i&&(a("drink",i),c())});const l=document.getElementById("adminActionPopup");l&&l.addEventListener("click",e=>{e.target===l&&(l.style.display="none")});export{O as initProduct};
