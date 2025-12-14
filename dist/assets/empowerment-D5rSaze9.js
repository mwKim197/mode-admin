import{a as p,d as w,e as v}from"./main-DtQ1aUSs.js";let i=1;const m=20;let d=[];async function F(){console.log("📌 일반 매장 권한관리 초기화"),await E(),await r(),j(),k(),L()}async function E(){d=(await(await p("/model_admin_franchise?func=list-franchise")).json()).franchises??[];const e=document.getElementById("filterFranchise");e.innerHTML='<option value="">전체 프랜차이즈</option>',d.forEach(t=>{const c=document.createElement("option");c.value=t.franchiseId,c.textContent=t.name,e.appendChild(c)})}async function r(){const n=document.getElementById("searchKeyword").value.trim(),a=document.getElementById("filterFranchise").value,e=document.getElementById("filterGrade").value;let o=(await(await p("/model_admin_user?func=get-admins")).json()).admins??[];const u=new Map;d.forEach(s=>{u.set(s.franchiseId,s.name)}),o=o.map(s=>({...s,franchiseName:s.franchiseId?u.get(s.franchiseId)??"-":"-"})),o=o.filter(s=>{var h;const I=!n||s.adminId.includes(n)||((h=s.franchiseName)==null?void 0:h.includes(n)),b=!a||s.franchiseId===a,y=!e||s.grade===Number(e);return I&&b&&y}),o=o.filter(s=>s.grade===4||s.grade===3);const l=Math.ceil(Math.max(o.length,1)/m);i>l&&(i=l);const f=(i-1)*m,g=o.slice(f,f+m);$(g),_(i,l)}function $(n){const a=document.getElementById("store-table-body");a.innerHTML="";const e=t=>['<option value="">선택 없음</option>',...d.map(c=>`
                <option value="${c.franchiseId}" 
                    ${t.franchiseId===c.franchiseId?"selected":""}>
                    ${c.name}
                </option>
            `)].join("");n.forEach(t=>{a.innerHTML+=`
            <tr>
                <td>${t.adminId}</td>

                <!-- 프랜차이즈 셀렉트 -->
                
                <td>
                    <div class="select-box">
                        <select 
                            class="store-franchise-select"
                            data-admin="${t.adminId}"
                        >
                            ${e(t)}
                        </select>
                    </div>    
                </td>

                <!-- 권한 표시 (text) -->
                <td>${B(t.grade)}</td>

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
        `})}function L(){document.addEventListener("click",async n=>{const a=n.target;if(a.classList.contains("store-update-btn")){const e=a.dataset.admin,c=document.querySelector(`.store-franchise-select[data-admin="${e}"]`).value||null;if(!confirm("정말 이 계정 정보를 변경하시겠습니까?"))return;await w("/model_admin_user?func=update-admin",{adminId:e,franchiseId:c}),alert("변경 완료되었습니다."),r();return}if(a.classList.contains("store-open-btn")){const e=a.dataset.admin;console.log(e),S(e)}})}function k(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{i>1&&(i--,r())}),document.querySelector("[data-page='next']").addEventListener("click",()=>{i++,r()})}function _(n,a){document.getElementById("page-info").textContent=`${n} / ${a}`}function j(){document.getElementById("filterBtn").addEventListener("click",()=>{i=1,r()})}function B(n){switch(n){case 1:return"총괄관리자";case 2:return"관리자";case 3:return"프랜차이즈";case 4:return"일반매장";default:return"미지정"}}async function S(n){const e=await(await v("/model_admin_login?func=impersonate-store",{storeUserId:n})).json();if(!e.accessToken){alert("매장 계정 로그인 생성 실패");return}const t=encodeURIComponent(e.accessToken);window.open(`/html/home.html?impersonate_token=${t}`,"_blank")||alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.")}export{F as empowermentStore};
