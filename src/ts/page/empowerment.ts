import {apiGet, apiPost, apiPut} from "../api/apiHelpers";

interface StoreUser {
    adminId: string;
    grade: number;
    franchiseId?: string | null;
    franchiseName?: string | null;
}

interface Franchise {
    franchiseId: string;
    name: string;
}

let currentPage = 1;
const pageSize = 20;

// 🔥 프랜차이즈 목록 전역으로 보관
let franchiseList: Franchise[] = [];

// 초기 로드 함수
export async function empowermentStore() {
    console.log("📌 일반 매장 권한관리 초기화");

    await loadFranchiseList();   // 프랜차이즈 목록 + 필터 select 채우기
    await loadStoreList();       // 매장 목록 로드

    attachFilterEvents();
    attachPaginationEvents();
    attachRowEvents();           // 변경 버튼 이벤트
}

/* =======================================
   1) 프랜차이즈 목록 로드 + 필터 select 채우기
======================================= */
async function loadFranchiseList() {
    const res = await apiGet("/model_admin_franchise?func=list-franchise");
    const json = await res.json();

    franchiseList = json.franchises ?? [];

    const select = document.getElementById("filterFranchise") as HTMLSelectElement;
    select.innerHTML = `<option value="">전체 프랜차이즈</option>`;

    franchiseList.forEach((f: Franchise) => {
        const opt = document.createElement("option");
        opt.value = f.franchiseId;
        opt.textContent = f.name;
        select.appendChild(opt);
    });
}

/* =======================================
   2) 매장 리스트 로드 + 필터 + 페이징
======================================= */
async function loadStoreList() {
    const keyword = (document.getElementById("searchKeyword") as HTMLInputElement).value.trim();
    const franchiseFilter = (document.getElementById("filterFranchise") as HTMLSelectElement).value;
    const gradeFilter = (document.getElementById("filterGrade") as HTMLSelectElement).value;

    // 🔥 매장 계정 전체 로드
    const res = await apiGet("/model_admin_user?func=get-admins");
    const json = await res.json();
    let list: StoreUser[] = json.admins ?? [];

    // 🔥 프랜차이즈 이름 매핑
    const franchiseMap = new Map<string, string>();
    franchiseList.forEach((f) => {
        franchiseMap.set(f.franchiseId, f.name);
    });

    list = list.map((store) => ({
        ...store,
        franchiseName: store.franchiseId ? franchiseMap.get(store.franchiseId) ?? "-" : "-",
    }));

    // 🔍 검색/필터 적용
    list = list.filter((u) => {
        const matchKeyword =
            !keyword ||
            u.adminId.includes(keyword) ||
            (u.franchiseName?.includes(keyword));

        const matchFranchise =
            !franchiseFilter || u.franchiseId === franchiseFilter;

        const matchGrade =
            !gradeFilter || u.grade === Number(gradeFilter);

        return matchKeyword && matchFranchise && matchGrade;
    });

    // 🔥 일반매장(4) + 프랜차이즈매장(3)만
    list = list.filter((u) => u.grade === 4 || u.grade === 3);

    // 🔄 페이징
    const totalPages = Math.ceil(Math.max(list.length, 1) / pageSize);
    if (currentPage > totalPages) currentPage = totalPages; // 마지막 페이지 넘어가지 않도록

    const start = (currentPage - 1) * pageSize;
    const pageData = list.slice(start, start + pageSize);

    // 🎨 렌더링
    renderStoreTable(pageData);
    updatePageInfo(currentPage, totalPages);
}

/* =======================================
   3) 테이블 렌더링
======================================= */
function renderStoreTable(list: StoreUser[]) {
    const tbody = document.getElementById("store-table-body")!;
    tbody.innerHTML = "";

    const franchiseOptionsHtml = (store: StoreUser) =>
        [
            `<option value="">선택 없음</option>`,
            ...franchiseList.map(
                (f) => `
                <option value="${f.franchiseId}" 
                    ${store.franchiseId === f.franchiseId ? "selected" : ""}>
                    ${f.name}
                </option>
            `
            ),
        ].join("");

    list.forEach((store) => {
        tbody.innerHTML += `
            <tr>
                <td>${store.adminId}</td>

                <!-- 프랜차이즈 셀렉트 -->
                
                <td>
                    <div class="select-box">
                        <select 
                            class="store-franchise-select"
                            data-admin="${store.adminId}"
                        >
                            ${franchiseOptionsHtml(store)}
                        </select>
                    </div>    
                </td>

                <!-- 권한 표시 (text) -->
                <td>${gradeName(store.grade)}</td>

                <!-- 변경 버튼 -->
                <td>
                    <button 
                        class="btn btn-edit store-update-btn"
                        data-admin="${store.adminId}"
                    >변경</button>
                    
                    <button 
                        class="btn btn-primary store-open-btn"
                        data-admin="${store.adminId}"
                    >매장관리</button>
                </td>
                
            </tr>
        `;
    });
}

/* =======================================
   4) 변경/매장관리 버튼 클릭 이벤트
======================================= */
function attachRowEvents() {
    document.addEventListener("click", async (e) => {
        const btn = e.target as HTMLElement;

        // 🔹 1) 기존 변경 버튼
        if (btn.classList.contains("store-update-btn")) {
            const adminId = btn.dataset.admin!;
            const select = document.querySelector(
                `.store-franchise-select[data-admin="${adminId}"]`
            ) as HTMLSelectElement;

            const franchiseId = select.value || null;

            if (!confirm("정말 이 계정 정보를 변경하시겠습니까?")) return;

            await apiPut("/model_admin_user?func=update-admin", {
                adminId,
                franchiseId,
            });

            alert("변경 완료되었습니다.");
            loadStoreList();
            return;
        }

        // 🔹 2) 매장관리 열기 (대리 로그인)
        if (btn.classList.contains("store-open-btn")) {
            const adminId = btn.dataset.admin!;
            console.log(adminId);
            openStoreDashboard(adminId);
        }
    });
}

/* =======================================
   5) 페이징 이벤트
======================================= */
function attachPaginationEvents() {
    document.querySelector("[data-page='prev']")!.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            loadStoreList();
        }
    });
    document.querySelector("[data-page='next']")!.addEventListener("click", () => {
        currentPage++;
        loadStoreList();
    });
}

function updatePageInfo(current: number, total: number) {
    document.getElementById("page-info")!.textContent = `${current} / ${total}`;
}

/* =======================================
   6) 검색 버튼 이벤트
======================================= */
function attachFilterEvents() {
    document.getElementById("filterBtn")!.addEventListener("click", () => {
        currentPage = 1;
        loadStoreList();
    });
}

/* =======================================
   7) 권한 이름 변환
======================================= */
function gradeName(grade: number) {
    switch (grade) {
        case 1:
            return "총괄관리자";
        case 2:
            return "관리자";
        case 3:
            return "프랜차이즈";
        case 4:
            return "일반매장";
        default:
            return "미지정";
    }
}

/* =======================================
   8) 관리>매장 로그인
======================================= */
async function openStoreDashboard(storeAdminId: string) {
    const res = await apiPost("/model_admin_login?func=impersonate-store", {
        storeUserId: storeAdminId
    });

    const data = await res.json();

    if (!data.accessToken) {
        alert("매장 계정 로그인 생성 실패");
        return;
    }

    const token = encodeURIComponent(data.accessToken);

    // 매장 페이지 오픈 + 토큰 파라미터 전달
    const newWin = window.open(`/html/home.html?impersonate_token=${token}`, "_blank");

    if (!newWin) {
        alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    }
}
