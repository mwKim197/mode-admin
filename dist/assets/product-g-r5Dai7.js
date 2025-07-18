import{g as d,a as g,e as l}from"./main-DpKRU6Gj.js";const a=[];function k(){const e=d();if(!e){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}async function o(){return(await(await g(`/model_admin_menu?userId=${e==null?void 0:e.userId}&func=get-all-menu`)).json()).items}function n(t){const s=document.getElementById("menu-table-body");s&&(a.length=0,s.innerHTML=t.map(r=>{var c;const w=((c=r.image)==null?void 0:c.split("\\").pop())??"",m=encodeURIComponent(w),h=`https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${r.userId}/${m}`;return`
      <tr>
        <td>${r.no}</td>
        <td><img src="${h}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
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
          <span class="tag blue" data-menu='${encodeURIComponent(JSON.stringify(r))}' onclick="onAdminOder(this)">제조</span>
          <span class="tag red" onclick="onDeleteClick(${r.menuId}, event)">삭제</span>
        </td>
      </tr>
    `}).join(""))}(async function(){try{const s=await o();n(s),a.length=0}catch(s){console.error("❌ 메뉴 목록 불러오기 실패",s),window.showToast(`❌ 메뉴 목록 불러오기 실패: ${s}`,3e3,"error")}})()}const i=document.getElementById("saveBtn");i&&i.addEventListener("click",()=>{if(a.length===0){window.showToast("변경된 내용이 없습니다.",3e3,"warning");return}confirm("수정사항을 저장하시겠습니까?")&&$().catch(()=>{window.showToast("❌ 수정에 실패했습니다.",3e3,"error")})});function p(e,o){u(e,{empty:o?"no":"yes"})}function f(e,o){u(e,{delete:!0});const n=o.target.closest("tr");n&&n.classList.add("tr-disabled")}function I(e){const o=decodeURIComponent(e.dataset.menu||"{}"),n=JSON.parse(o),t=y(n);T("order",t)}function y(e){return{orderData:{orderList:[{orderId:`${e.menuId}-${e.userId}`,userId:e.userId,menuId:e.menuId,name:e.name,count:1}]}}}function u(e,o){const n=a.findIndex(t=>t.menuId===e);n!==-1?a[n]={...a[n],...o}:a.push({menuId:e,...o})}async function $(){const e=d();if(!e)return;const o={userId:e.userId,items:a};try{const n=await l("/model_admin_menu?func=bulk-update-or-delete",o);if(n.ok)window.showToast("변경 사항 저장 완료"),location.reload();else{const t=await n.json();console.error("❌ 저장 실패:",t.message),window.showToast(`❌ 저장 실패: ${t.message} `,3e3,"error")}}catch(n){console.error("❌ 저장 오류:",n),window.showToast(`❌ 저장 오류: ${n} `,3e3,"error")}}async function T(e,o={}){const n=d();if(!n){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}const t={func:e,userId:n.userId,orderData:o.orderData};l("/model_machine_controll",t).then(()=>{window.showToast("제조 명령 전송 완료")}).catch(s=>{window.showToast(`❌ 명령 전송 실패: ${s} `,3e3,"error")}),window.showToast("제조 명령 전송")}window.onToggleChange=p;window.onDeleteClick=f;window.onAdminOder=I;export{k as initProduct};
