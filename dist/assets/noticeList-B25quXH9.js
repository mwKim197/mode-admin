import{g as s,a as i}from"./main-Bqfk0G7A.js";function w(){if(console.log("공지사항 목록 페이지 초기화"),!s()){window.showToast("❌ 사용자 정보가 없습니다.",3e3,"error");return}d()}async function d(){try{const t=await i("/model_admin_notice?func=get-notice-list&contentType=admin");if(t.ok){const e=await t.json();l(e)}else window.showToast("공지사항을 불러오는데 실패했습니다.",3e3,"error")}catch(t){console.error("공지사항 목록 로드 실패:",t),window.showToast("공지사항을 불러오는데 실패했습니다.",3e3,"error")}}function l(t){const e=document.getElementById("notice-table-body");if(!e)return;if(!t||t.length===0){e.innerHTML=`
      <tr>
        <td colspan="4" class="text-center">등록된 공지사항이 없습니다.</td>
      </tr>
    `;return}const o=t.sort((n,r)=>{const a=new Date(n.timestamp).getTime();return new Date(r.timestamp).getTime()-a});e.innerHTML=o.map((n,r)=>{const a=f(n.noticeType),c=g(n.timestamp);return`
      <tr data-content-id="${n.contentId}">
        <td>${r+1}</td>
        <td><span class="notice-tag ${a.color}">${a.label}</span></td>
        <td>${n.title}</td>
        <td>${c}</td>
      </tr>
    `}).join(""),u()}function u(){document.querySelectorAll("#notice-table-body tr[data-content-id]").forEach(e=>{e.addEventListener("click",()=>{const o=e.getAttribute("data-content-id");o&&(window.location.href=`./noticeDetail.html?id=${o}`)})})}function f(t){switch(t){case"emergency":return{label:"긴급",color:"red"};case"patch":return{label:"패치",color:"blue"};case"event":return{label:"이벤트",color:"org"};default:return{label:"안내",color:""}}}function g(t){if(!t)return"";const e=new Date(t),o=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0");return`${o}.${n}.${r}`}export{w as initNoticeList};
