import {apiDelete, apiGet, apiPut} from "../api/apiHelpers.ts";

interface AdminUser {
    adminId: string;
    grade: number;
    franchiseId?: string | null;
    createdAt?: string;
}


export async function adminEmpowermentDetail() {
    console.log("📌 adminEmpowermentDetail 초기화");

    // 관리자 리스트
    const adminRes = await apiGet("/model_admin_user?func=get-admins");
    const adminJson = await adminRes.json();
    const adminList: AdminUser[] = adminJson.admins ?? [];

    // 프랜차이즈 리스트
    const franchiseRes = await apiGet("/model_admin_franchise?func=list-franchise");
    const franchiseJson = await franchiseRes.json();
    const franchiseList = franchiseJson.franchises ?? [];

    // 필터링 (grade !== 4)
    let upperAdmins = adminList.filter((u: AdminUser) => u.grade !== 4);

    // 정렬: 미지정 → 1 → 2 → 3
    upperAdmins = upperAdmins.sort((a, b) => {
        const validGrades = [1, 2, 3];

        const aIsUndefined = !validGrades.includes(a.grade);
        const bIsUndefined = !validGrades.includes(b.grade);

        // 1) 미지정이 위로
        if (aIsUndefined && !bIsUndefined) return -1;
        if (!aIsUndefined && bIsUndefined) return 1;

        // 2) 둘 다 미지정이면 그냥 순서 유지
        if (aIsUndefined && bIsUndefined) return 0;

        // 3) 1 → 2 → 3 순 정렬
        return a.grade - b.grade;
    });

    // 렌더링
    renderAdminTable(upperAdmins, franchiseList);

    // 이벤트 연결
    attachEvents();
}

/* ===========================================
   상단 테이블 렌더링
=========================================== */
function renderAdminTable(adminList: AdminUser[], franchiseList: any[]) {
    const tbody = document.getElementById("admin-table-body") as HTMLElement;
    tbody.innerHTML = "";

    adminList.forEach(admin => {

        const isSuperAdmin = admin.grade === 1;
        const isFranchiseAdmin = admin.grade === 3;

        // ⭐ 이걸 절대 유지해야 함
        tbody.innerHTML += `
        <tr>
            <td>${admin.adminId}</td>

            <!-- 권한 Select -->
            <td>
                <div class="select-box">
                    <select 
                        class="grade-select contest-filter1"
                        data-admin="${admin.adminId}"
                        ${isSuperAdmin ? "disabled" : ""}
                    >
                        <!-- 총괄관리자 -->
                        <option value="1" 
                            ${admin.grade === 1 ? "selected" : ""}
                            ${!isFranchiseAdmin ? "disabled" : ""}
                        >
                            총괄관리자
                        </option>

                        <!-- 매니저 -->
                        <option value="2" 
                            ${admin.grade === 2 ? "selected" : ""}
                        >
                            관리자
                        </option>

                        <!-- 프랜차이즈 -->
                        <option value="3" 
                            ${admin.grade === 3 ? "selected" : ""}
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
                        data-admin="${admin.adminId}"
                        ${isFranchiseAdmin ? "" : "disabled"}
                    >
                        <option value="">선택 없음</option>
                        ${franchiseList.map(f => `
                            <option value="${f.franchiseId}"
                                ${admin.franchiseId === f.franchiseId ? "selected" : ""}
                            >
                                ${f.name}
                            </option>
                        `).join("")}
                    </select>
                </div>
            </td>
        </tr>
    `;
    });

}


/* ===========================================
   이벤트: 권한/프랜차이즈 변경 + 삭제
=========================================== */
function attachEvents() {
    document.addEventListener("change", async (e) => {
        const target = e.target as HTMLSelectElement;
        const adminId = target.dataset.admin;
        if (!adminId) return;

        // 현재 row의 grade 가져오기
        const row = target.closest("tr");
        const gradeSelect = row?.querySelector(".grade-select") as HTMLSelectElement;
        const currentGrade = Number(gradeSelect?.value);

        // 🔒 총괄관리자는 변경 불가
        if (currentGrade === 1) {
            alert("총괄관리자는 권한 및 프랜차이즈 변경이 불가능합니다.");
            location.reload();
            return;
        }

        /* ───────── 권한 변경 ───────── */
        if (target.classList.contains("grade-select")) {
            const value = target.value;
            const newGrade = value === "" ? null : Number(value);

            await apiPut("/model_admin_user?func=update-admin", {
                adminId,
                grade: newGrade,
            });

            alert("권한이 변경되었습니다.");
            location.reload();
        }

        /* ───────── 프랜차이즈 변경 ───────── */
        if (target.classList.contains("franchise-select")) {

            // 🔒 프랜차이즈는 grade 3만 가능
            if (currentGrade !== 3) {
                alert("프랜차이즈 관리자는 프랜차이즈를 설정할 수 있습니다.");
                location.reload();
                return;
            }

            const franchiseId = target.value || null;

            await apiPut("/model_admin_user?func=update-admin", {
                adminId,
                franchiseId,
            });

            alert("프랜차이즈가 변경되었습니다.");
        }
    });


    /* ───────── 🔥 삭제 버튼 클릭 ───────── */
    document.addEventListener("click", async (e) => {
        const target = e.target as HTMLElement;

        if (target.classList.contains("btn-delete-admin")) {
            const adminId = target.dataset.id;
            await handleDelete(adminId!);
        }
    });

    async function handleDelete(adminId: string) {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        const res = await apiDelete(`/model_admin_user?func=delete-admin&adminId=${adminId}`);
        const json = await res.json();

        if (!res.ok) {
            alert(json.error || "삭제 중 오류가 발생했습니다.");
            return;
        }

        alert("삭제가 완료되었습니다.");
        location.reload();
    }
}
