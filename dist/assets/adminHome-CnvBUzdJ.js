import{a as f,e as g}from"./main-BhPhcrsp.js";let o=1;const d=20;async function v(){await i(),h(),b(),w()}async function i(){const t=document.getElementById("searchKeyword").value.trim();let a=(await(await f("/model_admin_user?func=get-admins")).json()).admins??[];t&&(a=a.filter(c=>c.adminId.includes(t))),a=a.filter(c=>c.grade===4),a.sort((c,l)=>{const u=c.createdAt?new Date(c.createdAt).getTime():0;return(l.createdAt?new Date(l.createdAt).getTime():0)-u});const s=Math.ceil(Math.max(a.length,1)/d);o>s&&(o=s);const r=(o-1)*d,m=a.slice(r,r+d);p(m),y(o,s)}function p(t){const n=document.getElementById("store-table-body");n.innerHTML="",t.forEach(e=>{n.innerHTML+=`
            <tr>
                <td>${e.adminId}</td>          
                <td>${new Date(e.createdAt).toLocaleDateString()}</td>
                <td>
                    <button 
                        class="btn blue store-open-btn"
                        data-admin="${e.adminId}"
                    >원격</button>
                </td>
            </tr>
        `})}function w(){document.addEventListener("click",async t=>{const n=t.target;if(n.classList.contains("store-open-btn")){const e=n.dataset.admin;console.log(e),E(e)}})}function b(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{o>1&&(o--,i())}),document.querySelector("[data-page='next']").addEventListener("click",()=>{o++,i()})}function y(t,n){document.getElementById("page-info").textContent=`${t} / ${n}`}function h(){document.getElementById("filterBtn").addEventListener("click",()=>{o=1,i()})}async function E(t){const e=await(await g("/model_admin_login?func=impersonate-store",{storeUserId:t})).json();if(!e.accessToken){alert("매장 계정 로그인 생성 실패");return}const a=encodeURIComponent(e.accessToken);window.open(`/html/home.html?impersonate_token=${a}`,"_blank")||alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.")}export{v as initAdminHome};
