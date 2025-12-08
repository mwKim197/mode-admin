import{a as p,d as E}from"./main-BOnR6R5Y.js";let o=1;const m=20;let r=[];async function M(){console.log("📌 일반 매장 권한관리 초기화"),await w(),await d(),j(),$(),L()}async function w(){r=(await(await p("/model_admin_franchise?func=list-franchise")).json()).franchises??[];const c=document.getElementById("filterFranchise");c.innerHTML='<option value="">전체 프랜차이즈</option>',r.forEach(n=>{const i=document.createElement("option");i.value=n.franchiseId,i.textContent=n.name,c.appendChild(i)})}async function d(){const t=document.getElementById("searchKeyword").value.trim(),a=document.getElementById("filterFranchise").value,c=document.getElementById("filterGrade").value;let s=(await(await p("/model_admin_user?func=get-admins")).json()).admins??[];const u=new Map;r.forEach(e=>{u.set(e.franchiseId,e.name)}),s=s.map(e=>({...e,franchiseName:e.franchiseId?u.get(e.franchiseId)??"-":"-"})),s=s.filter(e=>{var h;const I=!t||e.adminId.includes(t)||((h=e.franchiseName)==null?void 0:h.includes(t)),y=!a||e.franchiseId===a,v=!c||e.grade===Number(c);return I&&y&&v}),s=s.filter(e=>e.grade===4||e.grade===3);const l=Math.ceil(Math.max(s.length,1)/m);o>l&&(o=l);const f=(o-1)*m,g=s.slice(f,f+m);b(g),B(o,l)}function b(t){const a=document.getElementById("store-table-body");a.innerHTML="";const c=n=>['<option value="">선택 없음</option>',...r.map(i=>`
                <option value="${i.franchiseId}" 
                    ${n.franchiseId===i.franchiseId?"selected":""}>
                    ${i.name}
                </option>
            `)].join("");t.forEach(n=>{a.innerHTML+=`
            <tr>
                <td>${n.adminId}</td>

                <!-- 프랜차이즈 셀렉트 -->
                
                <td>
                    <div class="select-box">
                        <select 
                            class="store-franchise-select"
                            data-admin="${n.adminId}"
                        >
                            ${c(n)}
                        </select>
                    </div>    
                </td>

                <!-- 권한 표시 (text) -->
                <td>${x(n.grade)}</td>

                <!-- 변경 버튼 -->
                <td>
                    <button 
                        class="btn btn-edit store-update-btn"
                        data-admin="${n.adminId}"
                    >변경</button>
                </td>
            </tr>
        `})}function L(){document.addEventListener("click",async t=>{const a=t.target;if(!a.classList.contains("store-update-btn"))return;const c=a.dataset.admin,i=document.querySelector(`.store-franchise-select[data-admin="${c}"]`).value||null;confirm("정말 이 계정 정보를 변경하시겠습니까?")&&(await E("/model_admin_user?func=update-admin",{adminId:c,franchiseId:i}),alert("변경 완료되었습니다."),d())})}function $(){document.querySelector("[data-page='prev']").addEventListener("click",()=>{o>1&&(o--,d())}),document.querySelector("[data-page='next']").addEventListener("click",()=>{o++,d()})}function B(t,a){document.getElementById("page-info").textContent=`${t} / ${a}`}function j(){document.getElementById("filterBtn").addEventListener("click",()=>{o=1,d()})}function x(t){switch(t){case 1:return"총괄관리자";case 2:return"관리자";case 3:return"프랜차이즈";case 4:return"일반매장";default:return"미지정"}}export{M as empowermentStore};
