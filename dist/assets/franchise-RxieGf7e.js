import{h as $,i as b,c as v,e as w}from"./main-Bf0NETSS.js";function F(){const a="/model_admin_franchise",i=document.getElementById("franchiseModal"),h=document.getElementById("franchiseList"),f=document.getElementById("modalTitle"),s=document.getElementById("modalFranchiseId"),d=document.getElementById("modalFranchiseName"),o=document.getElementById("modalShoppingMall"),E=document.getElementById("openCreateBtn"),g=document.getElementById("saveBtn"),I=document.getElementById("cancelBtn");let l=!1;async function r(){const c=(await(await v(`${a}?func=list-franchise`)).json()).franchises??[];h.innerHTML="",c.forEach(n=>{var p;const m=document.createElement("div");m.className="franchise-item",m.innerHTML=`
                <div>
                    <strong>${n.franchiseId}</strong><br/>
                    ${n.name}
                </div>
                <div>
                  <span class="option-tag">쇼핑몰: ${(p=n.options)!=null&&p.shoppingMall?"ON":"OFF"}</span>
                </div>
                <div class="franchise-actions">
                    <button class="btn btn-edit" data-edit="${n.franchiseId}">수정</button>
                    <button class="btn btn-delete" data-delete="${n.franchiseId}">삭제</button>

                </div>
            `,h.appendChild(m)}),B()}function B(){document.querySelectorAll("[data-edit]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.edit;L(t)})}),document.querySelectorAll("[data-delete]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.delete;confirm("정말 삭제하시겠습니까?")&&(await w(`${a}?func=delete-franchise&franchiseId=${t}`),await r())})})}function y(){l=!1,f.innerText="신규 프랜차이즈 생성",s.disabled=!1,s.value="",d.value="",i.classList.add("active")}async function L(e){var n;l=!0,f.innerText="프랜차이즈 수정",s.disabled=!0,s.value=e;const c=await(await v(`${a}?func=get-franchise&franchiseId=${e}`)).json();d.value=c.franchise.name,o.checked=((n=c.franchise.options)==null?void 0:n.shoppingMall)??!1,i.classList.add("active")}async function M(){const e=s.value.trim(),t=d.value.trim();if(!e||!t){alert("프랜차이즈 ID와 이름을 모두 입력하세요.");return}l?await $(`${a}?func=update-franchise`,{franchiseId:e,name:t,options:{shoppingMall:o.checked}}):await b(`${a}?func=create-franchise`,{franchiseId:e,name:t,options:{shoppingMall:o.checked}}),u(),await r()}function u(){i.classList.remove("active")}E.addEventListener("click",y),g.addEventListener("click",M),I.addEventListener("click",u),r()}export{F as franchiseEdit};
