import{a as m,d as f,b as p}from"./main-Cb9rmgPK.js";async function $(){console.log("📌 adminEmpowermentDetail 초기화");const t=(await(await m("/model_admin_user?func=get-admins")).json()).admins??[],i=(await(await m("/model_admin_franchise?func=list-franchise")).json()).franchises??[];let n=t.filter(a=>a.grade!==4);n=n.sort((a,c)=>{const u=[1,2,3],r=!u.includes(a.grade),l=!u.includes(c.grade);return r&&!l?-1:!r&&l?1:r&&l?0:a.grade-c.grade}),g(n,i),h()}function g(o,s){const t=document.getElementById("admin-table-body");t.innerHTML="",o.forEach(e=>{const d=e.grade===1,i=e.grade===3;t.innerHTML+=`
        <tr>
            <td>${e.adminId}</td>

            <!-- 권한 Select -->
            <td>
                <div class="select-box">
                    <select 
                        class="grade-select contest-filter1"
                        data-admin="${e.adminId}"
                        ${d?"disabled":""}
                    >
                        <!-- 총괄관리자 -->
                        <option value="1" 
                            ${e.grade===1?"selected":""}
                            ${i?"":"disabled"}
                        >
                            총괄관리자
                        </option>

                        <!-- 매니저 -->
                        <option value="2" 
                            ${e.grade===2?"selected":""}
                        >
                            관리자
                        </option>

                        <!-- 프랜차이즈 -->
                        <option value="3" 
                            ${e.grade===3?"selected":""}
                        >
                            프랜차이즈
                        </option>
                    </select>
                </div>
            </td>

            <!-- 프랜차이즈 선택 Select -->
            <td>
                <div class="select-box">
                    <select 
                        class="franchise-select"
                        data-admin="${e.adminId}"
                        ${i?"":"disabled"}
                    >
                        <option value="">선택 없음</option>
                        ${s.map(n=>`
                            <option value="${n.franchiseId}"
                                ${e.franchiseId===n.franchiseId?"selected":""}
                            >
                                ${n.name}
                            </option>
                        `).join("")}
                    </select>
                </div>
            </td>
        </tr>
    `})}function h(){document.addEventListener("change",async s=>{const t=s.target,e=t.dataset.admin;if(!e)return;const d=t.closest("tr"),i=d==null?void 0:d.querySelector(".grade-select"),n=Number(i==null?void 0:i.value);if(n===1){alert("총괄관리자는 권한 및 프랜차이즈 변경이 불가능합니다."),location.reload();return}if(t.classList.contains("grade-select")){const a=t.value,c=a===""?null:Number(a);await f("/model_admin_user?func=update-admin",{adminId:e,grade:c}),alert("권한이 변경되었습니다."),location.reload()}if(t.classList.contains("franchise-select")){if(n!==3){alert("프랜차이즈 관리자는 프랜차이즈를 설정할 수 있습니다."),location.reload();return}const a=t.value||null;await f("/model_admin_user?func=update-admin",{adminId:e,franchiseId:a}),alert("프랜차이즈가 변경되었습니다.")}}),document.addEventListener("click",async s=>{const t=s.target;if(t.classList.contains("btn-delete-admin")){const e=t.dataset.id;await o(e)}});async function o(s){if(!confirm("정말 삭제하시겠습니까?"))return;const t=await p(`/model_admin_user?func=delete-admin&adminId=${s}`),e=await t.json();if(!t.ok){alert(e.error||"삭제 중 오류가 발생했습니다.");return}alert("삭제가 완료되었습니다."),location.reload()}}export{$ as adminEmpowermentDetail};
