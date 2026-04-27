import {apiGet, apiPost} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {getUserData} from "../common/auth.ts";

export async function initCategoryAndMenuMerge() {
    console.log("✅ categoryAndMenuMerge.ts 로드됨");
    await loadAccountList();
    initEventListeners();
}

async function loadAccountList() {
    try {
        const adminInfo = await getUserData();
        if (!adminInfo) return;

        let users = [];

        if (adminInfo.grade <= 2) {
            const response = await apiGet("/model_user_setting?func=get-users");
            const data = await response.json();
            users = data.users ?? [];
        } else if (adminInfo.grade === 3) {
            const fid = adminInfo.franchiseId;
            if (!fid) return;
            const response = await apiGet(
                `/model_admin_franchise?func=list-stores-summary&franchiseId=${fid}`
            );
            const data = await response.json();
            users = data.stores ?? [];
        } else {
            window.showToast("해당 기능을 사용할 권한이 없습니다.", 3000, "warning");
            return;
        }

        populateAccountSelects(users);
    } catch (err) {
        console.error("계정 목록 로드 실패:", err);
        window.showToast("계정 목록을 불러오는데 실패했습니다.", 3000, "error");
    }
}

function populateAccountSelects(users: any[]) {
    const sourceSelect = document.getElementById("sourceAccount") as HTMLSelectElement;
    const targetSelect = document.getElementById("targetAccount") as HTMLSelectElement;

    if (sourceSelect) {
        sourceSelect.innerHTML = '<option value="">계정을 선택해주세요</option>';
        users.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.userId;
            option.textContent = user.storeName ? `${user.userId}/${user.storeName}` : user.userId;
            sourceSelect.appendChild(option);
        });
        new window.Choices(sourceSelect, {
            shouldSort: false,
            searchEnabled: true,
            position: "auto",
            classNames: {
                containerOuter: "custom-select",
                containerInner: "custom-select-inner",
                input: "custom-select-input",
                itemChoice: "custom-select-item",
                listDropdown: "custom-select-dropdown",
                placeholder: "custom-select-placeholder",
            },
        });
    }

    if (targetSelect) {
        targetSelect.innerHTML = '<option value="">계정을 선택해주세요</option>';
        users.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.userId;
            option.textContent = `${user.storeName ? user.storeName : user.userId} (${user.userId})`;
            targetSelect.appendChild(option);
        });
        new window.Choices(targetSelect, {
            shouldSort: false,
            searchEnabled: true,
            position: "auto",
            classNames: {
                containerOuter: "custom-select",
                containerInner: "custom-select-inner",
                input: "custom-select-input",
                itemChoice: "custom-select-item",
                listDropdown: "custom-select-dropdown",
                placeholder: "custom-select-placeholder",
            },
        });
    }
}

function initEventListeners() {
    const doMerge = document.getElementById("doMerge");
    const clearLog = document.getElementById("clearLog");
    const sourceSelect = document.getElementById("sourceAccount") as HTMLSelectElement;
    const targetSelect = document.getElementById("targetAccount") as HTMLSelectElement;
    const includeImages = document.getElementById("includeImages") as HTMLInputElement;
    const overwrite = document.getElementById("overwrite") as HTMLInputElement;
    const logEl = document.getElementById("log");

    if (clearLog && logEl) {
        clearLog.addEventListener("click", () => {
            logEl.textContent = "";
        });
    }

    if (doMerge) {
        doMerge.addEventListener("click", async () => {
            const src = sourceSelect?.value;
            const tgt = targetSelect?.value;
            if (!src || !tgt) {
                window.showToast("보내는 계정과 받는 계정을 모두 선택해주세요.", 3000, "warning");
                return;
            }

            const body: any = {
                sourceUserId: src,
                targetUserId: tgt,
                // menuIds omitted -> copy all
                renameImageWithNewMenuId: false,
                copyImages: includeImages?.checked ?? true,
                overwrite: overwrite?.checked ?? false,
            };

            if (!confirm(`계정 ${src} 의 전체 메뉴를 ${tgt} 로 복사하시겠습니까?`)) return;

            try {
                const res = await apiPost("/model_admin_menu?func=duplicate-categories-and-menu", body);
                const data = await res.json();
                if (res.ok) {
                    window.showToast("전체 카테고리·메뉴 복사가 완료되었습니다.", 3000, "success");
                    if (logEl) logEl.textContent = JSON.stringify(data, null, 2);
                } else {
                    window.showToast(`복사 실패: ${data.message || '오류' }`, 5000, "error");
                    if (logEl) logEl.textContent = JSON.stringify(data, null, 2);
                }
            } catch (err) {
                console.error("복사 요청 실패:", err);
                window.showToast("복사 요청 중 오류가 발생했습니다.", 3000, "error");
                if (logEl) logEl.textContent = String(err);
            }
        });
    }
}
