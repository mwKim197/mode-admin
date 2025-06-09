import{g as i}from"./userStorage-DqYcZspP.js";import{a as g,d as p}from"./apiHelpers-Cj0oONL2.js";import"./main-oRYtEfGT.js";const a=[];function I(){const e=i();if(!e){alert("사용자 정보가 없습니다.");return}async function n(){return(await(await g(`/model_admin_menu?userId=${e==null?void 0:e.userId}&func=get-all-menu`)).json()).items}function t(s){const c=document.getElementById("menu-table-body");c&&(a.length=0,c.innerHTML=s.map(o=>{var r;const u=((r=o.image)==null?void 0:r.split("\\").pop())??"",m=`https://model-narrow-road.s3.ap-northeast-2.amazonaws.com/model/${o.userId}/${u}`;return`
      <tr>
        <td>${o.no}</td>
        <td><img src="${m}" alt="상품 이미지" style="width:36px;height:46px; object-fit:cover;"></td>
        <td class="product-name w-[100px] whitespace-normal break-all text-sm" onclick="window.open('./product-detail.html?menuId=${o.menuId}', '_blank')">
          ${o.name}
        </td>
        <td>${Number(o.price).toLocaleString()}</td>
        <td>
          <label class="toggle-switch">
            <input
              type="checkbox"
              ${o.empty==="no"?"checked":""}
              onchange="onToggleChange(${o.menuId}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <span class="tag blue">제조</span>
          <span class="tag red" onclick="onDeleteClick(${o.menuId}, event)">삭제</span>
        </td>
      </tr>
    `}).join(""))}(async function(){try{const c=await n();t(c),a.length=0}catch(c){console.error("❌ 메뉴 목록 불러오기 실패",c)}})()}const l=document.getElementById("saveBtn");l&&l.addEventListener("click",()=>{if(a.length===0){alert("변경된 내용이 없습니다.");return}confirm("수정사항을 저장하시겠습니까?")&&w().catch(()=>{alert("수정에 실패했습니다.")})});function h(e,n){d(e,{empty:n?"no":"yes"}),console.log("changeList: ",a)}function f(e,n){d(e,{delete:!0});const t=n.target.closest("tr");t&&t.classList.add("tr-disabled")}function d(e,n){const t=a.findIndex(s=>s.menuId===e);t!==-1?a[t]={...a[t],...n}:a.push({menuId:e,...n})}async function w(){const e=i();if(!e)return;const n={userId:e.userId,items:a};try{const t=await p("/model_admin_menu?func=bulk-update-or-delete",n);if(t.ok)alert("✅ 변경 사항 저장 완료"),location.reload();else{const s=await t.json();alert(`❌ 저장 실패: ${s.message}`)}}catch(t){console.error("❌ 저장 오류:",t),alert("서버 오류로 저장에 실패했습니다.")}}window.onToggleChange=h;window.onDeleteClick=f;export{I as initProduct};
