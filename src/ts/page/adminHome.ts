import {apiGet, apiPost} from "../api/apiHelpers";
import {fetchWithoutLoading} from "../api/api";
import {showToast} from "../../main";

const installedTokens = new Set<string>();
let installingToken = false;

let currentPage = 1;
const pageSize = 20;


// 초기 로드 함수
export async function initAdminHome() {
    await loadStoreList();       // 매장 목록 로드

    attachFilterEvents();
    attachPaginationEvents();
    attachRowEvents();           // 변경 버튼 이벤트
}


/* =======================================
   2) 프랜차이즈 매장 리스트 로드 + 필터 + 페이징
======================================= */
async function loadStoreList() {
    const keyword = (document.getElementById("searchKeyword") as HTMLInputElement).value.trim();

    const res = await apiGet("/model_admin_user?func=get-admins");
    const json = await res.json();

    // 📌 Lambda 응답 구조 반영
    let list: any[] = json.admins ?? [];
    // 🔍 검색 기능
    if (keyword) {
        list = list.filter((u) => u.adminId.includes(keyword));
    }

    // 🔥 일반매장(4)
    list = list.filter((u) => u.grade === 4);

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

    list.forEach((admin) => {
        const row = (tbody as HTMLTableSectionElement).insertRow();
        row.insertCell().textContent = admin.adminId;
        row.insertCell().textContent = new Date(admin.createdAt).toLocaleDateString();
        const actions = row.insertCell();
        const remote = document.createElement("button");
        remote.type = "button";
        remote.className = "btn blue store-open-btn";
        remote.dataset.admin = admin.adminId;
        remote.textContent = "원격";
        const token = document.createElement("button");
        token.type = "button";
        token.className = "btn blue store-token-btn";
        token.dataset.admin = admin.adminId;
        token.textContent = installedTokens.has(admin.adminId) ? "등록 완료" : "토큰 등록";
        actions.append(remote, " ", token);
    });
}

/* =======================================
   4) 매장관리 버튼 클릭 이벤트
======================================= */
function attachRowEvents() {
    const dialog = document.querySelector<HTMLDialogElement>("#machine-token-dialog")!;
    const input = document.querySelector<HTMLInputElement>("#machine-token-password")!;
    const target = document.querySelector<HTMLElement>("#machine-token-target")!;
    let selectedId = "";
    const form = dialog.querySelector("form")!;
    const submit = dialog.querySelector<HTMLButtonElement>("#machine-token-submit")!;
    const cancel = dialog.querySelector<HTMLButtonElement>("#machine-token-cancel")!;
    const errorMessage = dialog.querySelector<HTMLElement>("#machine-token-error")!;
    cancel.onclick = () => dialog.close();
    dialog.oncancel = (event) => { if (installingToken) event.preventDefault(); };
    dialog.onclose = () => { input.value = ""; selectedId = ""; };
    form.onsubmit = async (event) => {
        event.preventDefault();
        const password = input.value;
        const userId = selectedId;
        if (!password || !userId || installingToken) return;
        installingToken = true;
        errorMessage.hidden = true;
        input.value = "";
        input.disabled = cancel.disabled = submit.disabled = true;
        submit.textContent = "등록 중…";
        try {
            const res = await fetchWithoutLoading("/model_user_setting?func=admin-install-machine-token", {
                method: "POST", body: JSON.stringify({userId, password}),
            });
            const result = await res.json();
            if (!res.ok || result?.success !== true) throw new Error(result?.message || "머신 토큰 등록에 실패했습니다.");
            installedTokens.add(userId);
            document.querySelectorAll<HTMLButtonElement>(".store-token-btn").forEach((button) => {
                if (button.dataset.admin === userId) button.textContent = "등록 완료";
            });
            dialog.close();
            showToast(`${userId} 머신에 토큰을 저장했습니다.`, 4000, "success");
        } catch (error) {
            errorMessage.textContent = error instanceof Error ? error.message : "머신 토큰 등록에 실패했습니다.";
            errorMessage.hidden = false;
        } finally {
            installingToken = false;
            input.disabled = cancel.disabled = submit.disabled = false;
            submit.textContent = "등록";
            if (dialog.open) input.focus();
        }
    };
    document.addEventListener("click", async (e) => {
        const btn = e.target as HTMLElement;
        if (btn.classList.contains("store-token-btn")) {
            if (installingToken || dialog.open || selectedId || !btn.dataset.admin) return;
            selectedId = btn.dataset.admin;
            target.textContent = selectedId;
            errorMessage.hidden = true;
            input.value = "";
            dialog.showModal();
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
