import{c as h,a as p,e as w}from"./main-B39EgYpI.js";let o=1,s="";const l=20;async function $(){const t=await h();s=t==null?void 0:t.franchiseId,await d(s),L(),I(),b()}async function d(t=""){const n=document.getElementById("searchKeyword").value.trim();let a=(await(await p(`/model_admin_franchise?func=list-stores-summary&franchiseId=${t}`)).json()).stores??[];n&&(a=a.filter(i=>i.adminId.includes(n))),a.sort((i,u)=>{const g=i.createdAt?new Date(i.createdAt).getTime():0;return(u.createdAt?new Date(u.createdAt).getTime():0)-g});const r=Math.ceil(Math.max(a.length,1)/l);o>r&&(o=r);const m=(o-1)*l,f=a.slice(m,m+l);y(f),E(o,r)}function y(t){const n=document.getElementById("store-table-body");n.innerHTML="",t.forEach(e=>{var c,a;n.innerHTML+=`
            <tr>
                <td>${e.adminId}</td>          
                <td>${((c=e.todaySales)==null?void 0:c.toLocaleString())??0}</td>
                <td>${((a=e.monthSales)==null?void 0:a.toLocaleString())??0}</td>
                <td>${new Date(e.createdAt).toLocaleDateString()}</td>
                <td>
                    <button 
                        class="btn blue store-open-btn"
                        data-admin="${e.adminId}"
                    >원격</button>
                </td>
            </tr>
        `})}function b(){document.addEventListener("click",async t=>{const n=t.target;if(n.classList.contains("store-open-btn")){const e=n.dataset.admin;console.log(e),S(e)}})}function I(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{o>1&&(o--,d(s))}),document.querySelector("[data-page='next']").addEventListener("click",()=>{o++,d(s)})}function E(t,n){document.getElementById("page-info").textContent=`${t} / ${n}`}function L(){document.getElementById("filterBtn").addEventListener("click",()=>{o=1,d(s)})}async function S(t){const e=await(await w("/model_admin_login?func=impersonate-store",{storeUserId:t})).json();if(!e.accessToken){alert("매장 계정 로그인 생성 실패");return}const c=encodeURIComponent(e.accessToken);window.open(`/html/home.html?impersonate_token=${c}`,"_blank")||alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.")}export{$ as initFranchiseHome};
