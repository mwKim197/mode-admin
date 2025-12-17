import {apiGet, apiPost} from "../api/apiHelpers";
import {getUserData} from "../common/auth.ts";

let currentPage = 1;
let franchiseId: string | undefined = "";
const pageSize = 20;


// 초기 로드 함수
export async function initFranchiseHome() {
    const adminInfo = await getUserData();
    franchiseId = adminInfo?.franchiseId;
    await loadStoreList(franchiseId);       // 매장 목록 로드

    attachFilterEvents();
    attachPaginationEvents();
    attachRowEvents();           // 변경 버튼 이벤트
}


/* =======================================
   2) 프랜차이즈 매장 리스트 로드 + 필터 + 페이징
======================================= */
async function loadStoreList(franchiseId: string = "") {
    const keyword = (document.getElementById("searchKeyword") as HTMLInputElement).value.trim();

    const res = await apiGet(`/model_admin_franchise?func=list-stores-summary&franchiseId=${franchiseId}`);
    const json = await res.json();

    // 📌 Lambda 응답 구조 반영
    let list: any[] = json.stores ?? [];
    // 🔍 검색 기능
    if (keyword) {
        list = list.filter((u) => u.adminId.includes(keyword));
    }

    list.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da; // 최신순
    });

    // 페이징 처리
    const totalPages = Math.ceil(Math.max(list.length, 1) / pageSize);
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageData = list.slice(start, start + pageSize);

    renderStoreTable(pageData);
    updatePageInfo(currentPage, totalPages);
}


/* =======================================
   3) 테이블 렌더링
======================================= */
function renderStoreTable(list: any[]) {
    const tbody = document.getElementById("store-table-body")!;
    tbody.innerHTML = "";

    list.forEach((store) => {
        tbody.innerHTML += `
            <tr>
                <td>${store.adminId}</td>          
                <td>${store.todaySales?.toLocaleString() ?? 0}</td>
                <td>${store.monthSales?.toLocaleString() ?? 0}</td>
                <td>${new Date(store.createdAt).toLocaleDateString()}</td>
                <td>
                    <button 
                        class="btn blue store-open-btn"
                        data-admin="${store.adminId}"
                    >원격</button>
                </td>
            </tr>
        `;
    });
}

/* =======================================
   4) 매장관리 버튼 클릭 이벤트
======================================= */
function attachRowEvents() {
    document.addEventListener("click", async (e) => {
        const btn = e.target as HTMLElement;

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
            loadStoreList(franchiseId);
        }
    });
    document.querySelector("[data-page='next']")!.addEventListener("click", () => {
        currentPage++;
        loadStoreList(franchiseId);
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
        loadStoreList(franchiseId);
    });
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
