import {apiGet} from "../api/apiHelpers";

let logs: any[] = [];               // 전체 로그
let filteredLogs: any[] = [];       // 필터 적용 후 로그
let currentPage = 1;
const pageSize = 20;

/** ⭐ 초기 실행 */
export function initAdmionLog() {
    const saved = sessionStorage.getItem("adminLogListState");

    if (saved) {
        restoreLogState(JSON.parse(saved));
    } else {
        renderEmpty(); // 처음 진입
    }
    attachEvents();

}

function restoreLogState(state: any) {
    logs = state.logs;
    filteredLogs = state.filteredLogs;
    currentPage = state.currentPage;

    // 입력값 복원
    (document.getElementById("userIdInput") as HTMLInputElement).value = state.lastSearchUserId || "";
    (document.getElementById("startDate") as HTMLInputElement).value = state.startDate || "";
    (document.getElementById("endDate") as HTMLInputElement).value = state.endDate || "";
    (document.getElementById("limitSelect") as HTMLSelectElement).value = state.limit || "50";
    (document.getElementById("filterKeyword") as HTMLInputElement).value = state.filterKeyword || "";

    render(); // 리스트 즉시 복원
}


/** ⭐ 빈 화면 출력 */
function renderEmpty() {
    const listEl = document.getElementById("logList");
    if (!listEl) return;

    listEl.innerHTML = `
        <p style="color:#888; padding: 10px;">조회된 로그가 없습니다.</p>
    `;
    updatePageInfo();
}

/** ⭐ userId 기반 API 호출 */
async function loadLogs(userId: string, startDate?: string, endDate?: string, limit?: number) {

    let url = `/model_admin_controll?func=list-admin-log&userId=${userId}`;

    if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    if (limit) {
        url += `&limit=${limit}`;
    }

    const res = await apiGet(url);
    const json = await res.json();

    logs = json.logs || [];
    filteredLogs = [...logs];
}


/** ⭐ 이벤트 바인딩 */
function attachEvents() {

    /** 1) 계정 검색 버튼 */
    document.getElementById("userSearchBtn")?.addEventListener("click", async () => {
        const userId = (document.getElementById("userIdInput") as HTMLInputElement).value.trim();
        const startDate = (document.getElementById("startDate") as HTMLInputElement).value;
        const endDate = (document.getElementById("endDate") as HTMLInputElement).value;
        const limit = Number((document.getElementById("limitSelect") as HTMLSelectElement).value);

        if (!userId) {
            window.showToast("조회할 계정을 입력하세요.", 2000, "warning");
            return;
        }

        await loadLogs(userId, startDate, endDate, limit);

        if (logs.length === 0) {
            renderEmpty();
            return;
        }

        currentPage = 1;
        render();
    });

    /** 2) 필터 검색 */
    document.getElementById("filterBtn")?.addEventListener("click", () => {
        const input = document.getElementById("filterKeyword") as HTMLInputElement;
        const keyword = input?.value.trim().toLowerCase();

        if (!keyword) {
            filteredLogs = [...logs]; // 전체 복원
        } else {
            filteredLogs = logs.filter(log =>
                JSON.stringify(log).toLowerCase().includes(keyword)
            );
        }
        console.log(filteredLogs);
        currentPage = 1;
        render();
    });

    /** 3) 페이지 이동 버튼 */
    document.querySelectorAll(".pagination button").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.getAttribute("data-page");
            const totalPage = Math.ceil(filteredLogs.length / pageSize);

            if (type === "prev" && currentPage > 1) currentPage--;
            if (type === "next" && currentPage < totalPage) currentPage++;

            render();
        });
    });
}

/** ⭐ 로그 리스트 렌더링 */
function render() {
    const listEl = document.getElementById("logList");
    if (!listEl) return;

    if (filteredLogs.length === 0) {
        renderEmpty();
        return;
    }

    const start = (currentPage - 1) * pageSize;
    const pageData = filteredLogs.slice(start, start + pageSize);

    listEl.innerHTML = pageData
        .map(log => {
            const date = log.timestamp?.replace("T", " ").replace("+09:00", "") || "";
            const encoded = encodeURIComponent(JSON.stringify(log));

            return `
                <div class="log-row" data-log="${encoded}">
                    <div class="log-type">[${log.actionType}]</div>
                    <div class="log-date">${date}</div>
                </div>
            `;
        })
        .join("");

    // 상세 페이지 이동 처리
    listEl.querySelectorAll(".log-row").forEach(row => {
        row.addEventListener("click", () => {
            const data = row.getAttribute("data-log");
            if (!data) return;

            const log = JSON.parse(decodeURIComponent(data));
            openDetail(log);
        });
    });

    updatePageInfo();
}

/** ⭐ 리스트 데이터 저장 이동 */
function saveLogListState() {
    const state = {
        logs,
        filteredLogs,
        currentPage,
        lastSearchUserId: (document.getElementById("userIdInput") as HTMLInputElement).value,
        startDate: (document.getElementById("startDate") as HTMLInputElement).value,
        endDate: (document.getElementById("endDate") as HTMLInputElement).value,
        limit: (document.getElementById("limitSelect") as HTMLSelectElement).value,
        filterKeyword: (document.getElementById("filterKeyword") as HTMLInputElement).value
    };

    sessionStorage.setItem("adminLogListState", JSON.stringify(state));
}

/** ⭐ 상세 보기 페이지 이동 */
function openDetail(log: any) {
    saveLogListState();
    localStorage.setItem("selectedLog", JSON.stringify(log));
    window.location.href = "/html/adminLogDetail.html";
}

/** ⭐ 페이지 정보 업데이트 */
function updatePageInfo() {
    const totalPage = Math.ceil(filteredLogs.length / pageSize);
    const pageInfoEl = document.getElementById("page-info");

    if (pageInfoEl) {
        pageInfoEl.textContent = `${totalPage === 0 ? 0 : currentPage} / ${totalPage}`;
    }
}
