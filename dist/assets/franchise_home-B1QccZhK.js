import{c as f,a as g,e as h}from"./main-B9X5czot.js";let o=1,c="";const r=20;async function S(){const t=await f();c=t==null?void 0:t.franchiseId,await i(c),I(),w(),y()}async function i(t=""){const n=document.getElementById("searchKeyword").value.trim();let a=(await(await g(`/model_admin_franchise?func=list-stores-summary&franchiseId=${t}`)).json()).stores??[];n&&(a=a.filter(u=>u.adminId.includes(n)));const d=Math.ceil(Math.max(a.length,1)/r);o>d&&(o=d);const l=(o-1)*r,m=a.slice(l,l+r);p(m),b(o,d)}function p(t){const n=document.getElementById("store-table-body");n.innerHTML="",t.forEach(e=>{var s,a;n.innerHTML+=`
            <tr>
                <td>${e.adminId}</td>          
                <td>${((s=e.todaySales)==null?void 0:s.toLocaleString())??0}</td>
                <td>${((a=e.monthSales)==null?void 0:a.toLocaleString())??0}</td>
                <td>${new Date(e.createdAt).toLocaleDateString()}</td>
                <td>
                    <button 
                        class="btn blue store-open-btn"
                        data-admin="${e.adminId}"
                    >원격</button>
                </td>
            </tr>
        `})}function y(){document.addEventListener("click",async t=>{const n=t.target;if(n.classList.contains("store-open-btn")){const e=n.dataset.admin;console.log(e),E(e)}})}function w(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{o>1&&(o--,i(c))}),document.querySelector("[data-page='next']").addEventListener("click",()=>{o++,i(c)})}function b(t,n){document.getElementById("page-info").textContent=`${t} / ${n}`}function I(){document.getElementById("filterBtn").addEventListener("click",()=>{o=1,i(c)})}async function E(t){const e=await(await h("/model_admin_login?func=impersonate-store",{storeUserId:t})).json();if(!e.accessToken){alert("매장 계정 로그인 생성 실패");return}const s=encodeURIComponent(e.accessToken);window.open(`/html/home.html?impersonate_token=${s}`,"_blank")||alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.")}export{S as initFranchiseHome};
