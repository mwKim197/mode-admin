import{d as g,e as $,a as h,b}from"./main-CPfBtj8J.js";function M(){const a="/model_admin_franchise",s=document.getElementById("franchiseModal"),f=document.getElementById("franchiseList"),m=document.getElementById("modalTitle"),n=document.getElementById("modalFranchiseId"),i=document.getElementById("modalFranchiseName"),v=document.getElementById("openCreateBtn"),E=document.getElementById("saveBtn"),I=document.getElementById("cancelBtn");let d=!1;async function o(){const r=(await(await h(`${a}?func=list-franchise`)).json()).franchises??[];f.innerHTML="",r.forEach(c=>{const l=document.createElement("div");l.className="franchise-item",l.innerHTML=`
                <div>
                    <strong>${c.franchiseId}</strong><br/>
                    ${c.name}
                </div>
                <div class="franchise-actions">
                    <button class="btn btn-edit" data-edit="${c.franchiseId}">수정</button>
                    <button class="btn btn-delete" data-delete="${c.franchiseId}">삭제</button>

                </div>
            `,f.appendChild(l)}),B()}function B(){document.querySelectorAll("[data-edit]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.edit;L(t)})}),document.querySelectorAll("[data-delete]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.delete;confirm("정말 삭제하시겠습니까?")&&(await b(`${a}?func=delete-franchise&franchiseId=${t}`),await o())})})}function y(){d=!1,m.innerText="신규 프랜차이즈 생성",n.disabled=!1,n.value="",i.value="",s.classList.add("active")}async function L(e){d=!0,m.innerText="프랜차이즈 수정",n.disabled=!0,n.value=e;const r=await(await h(`${a}?func=get-franchise&franchiseId=${e}`)).json();i.value=r.franchise.name,s.classList.add("active")}async function p(){const e=n.value.trim(),t=i.value.trim();if(!e||!t){alert("프랜차이즈 ID와 이름을 모두 입력하세요.");return}d?await g(`${a}?func=update-franchise`,{franchiseId:e,name:t}):await $(`${a}?func=create-franchise`,{franchiseId:e,name:t}),u(),await o()}function u(){s.classList.remove("active")}v.addEventListener("click",y),E.addEventListener("click",p),I.addEventListener("click",u),o()}export{M as franchiseEdit};
