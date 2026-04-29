import{a as g,d as w,e as b}from"./main-Is4DOWvj.js";let o=1;const f=20;let r=[];async function T(){console.log("📌 일반 매장 권한관리 초기화"),await y(),await i(),k(),$(),E()}async function y(){r=(await(await g("/model_admin_franchise?func=list-franchise")).json()).franchises??[];const c=document.getElementById("filterFranchise");c.innerHTML='<option value="">전체 프랜차이즈</option>',r.forEach(t=>{const e=document.createElement("option");e.value=t.franchiseId,e.textContent=t.name,c.appendChild(e)})}async function i(){const a=document.getElementById("searchKeyword").value.trim(),s=document.getElementById("filterFranchise").value;let e=(await(await g("/model_admin_user?func=get-admins")).json()).admins??[];const h=new Map;r.forEach(n=>{h.set(n.franchiseId,n.name)}),e=e.map(n=>({...n,franchiseName:n.franchiseId?h.get(n.franchiseId)??"-":"-"})),e=e.filter(n=>{var u;const d=!a||n.adminId.includes(a)||((u=n.franchiseName)==null?void 0:u.includes(a)),m=!s||n.franchiseId===s;return d&&m}),e=e.filter(n=>n.grade===4),e.sort((n,d)=>{const m=n.createdAt?new Date(n.createdAt).getTime():0;return(d.createdAt?new Date(d.createdAt).getTime():0)-m});const l=Math.ceil(Math.max(e.length,1)/f);o>l&&(o=l);const p=(o-1)*f,I=e.slice(p,p+f);v(I),L(o,l)}function v(a){const s=document.getElementById("store-table-body");s.innerHTML="";const c=t=>['<option value="">선택 없음</option>',...r.map(e=>`
                <option value="${e.franchiseId}" 
                    ${t.franchiseId===e.franchiseId?"selected":""}>
                    ${e.name}
                </option>
            `)].join("");a.forEach(t=>{s.innerHTML+=`
            <tr>
                <td>${t.adminId}</td>

                <!-- 프랜차이즈 셀렉트 -->
                
                <td>
                    <div class="select-box">
                        <select 
                            class="store-franchise-select"
                            data-admin="${t.adminId}"
                        >
                            ${c(t)}
                        </select>
                    </div>    
                </td>

                <!-- 권한 표시 (text) -->
                <td>${_(t.grade)}</td>

                <!-- 변경 버튼 -->
                <td>
                    <button 
                        class="btn btn-edit store-update-btn"
                        data-admin="${t.adminId}"
                    >변경</button>
                    
                    <button 
                        class="btn btn-primary store-open-btn"
                        data-admin="${t.adminId}"
                    >매장관리</button>
                </td>
                
            </tr>
        `})}function E(){document.addEventListener("click",async a=>{const s=a.target;if(s.classList.contains("store-update-btn")){const c=s.dataset.admin,e=document.querySelector(`.store-franchise-select[data-admin="${c}"]`).value||null;if(!confirm("정말 이 계정 정보를 변경하시겠습니까?"))return;await w("/model_admin_user?func=update-admin",{adminId:c,franchiseId:e}),alert("변경 완료되었습니다."),i();return}if(s.classList.contains("store-open-btn")){const c=s.dataset.admin;console.log(c),j(c)}})}function $(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{o>1&&(o--,i())}),document.querySelector("[data-page='next']").addEventListener("click",()=>{o++,i()})}function L(a,s){document.getElementById("page-info").textContent=`${a} / ${s}`}function k(){document.getElementById("filterBtn").addEventListener("click",()=>{o=1,i()})}function _(a){switch(a){case 1:return"총괄관리자";case 2:return"관리자";case 3:return"프랜차이즈";case 4:return"일반매장";default:return"미지정"}}async function j(a){const c=await(await b("/model_admin_login?func=impersonate-store",{storeUserId:a})).json();if(!c.accessToken){alert("매장 계정 로그인 생성 실패");return}const t=encodeURIComponent(c.accessToken);window.open(`/html/home.html?impersonate_token=${t}`,"_blank")||alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.")}export{T as empowermentStore};
