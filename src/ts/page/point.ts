import {Pagination} from "../utils/pagination";
import {MileageHistoryItem, PageKey, PointItem} from "../types/point.ts";
import {apiDelete, apiGet, apiPost, apiPut} from "../api/apiHelpers.ts";
import {getStoredUser} from "../utils/userStorage.ts";
import {getUserData} from "../common/auth.ts";
import {renderClassicPagination} from "../utils/paginationServer.ts";
import {fetchUserInfo} from "../common/userAuth.ts";

let allChecked = false;
let items: PointItem[] = []; // ← 전역 변수
let selectedItem: PointItem | undefined;
let currentHistoryPage = 1;
const historyLimit = 10;
let pageKeyMap: { [page: number]: PageKey } = {};
let isEditMode = false; // 신규등록
let searchTimeout: NodeJS.Timeout | null = null; // ✅ 실시간 검색을 위한 타이머 추가
type PointMode = "create" | "update"; // 포인트 저장, 수정

// 클래스 import
export async function initPoint() {
    // localstorage에 저장된 user 정보를 불러옴
    const user = getStoredUser();

    if (!user) {
        window.showToast("사용자 정보가 없습니다.", 2000, "error");
        return;
    }

    // mileageNo 포멧 적용 user.isPhone
    applyMileageNoInputBehavior(user?.isPhone ?? true);

    // tel 포멧 적용
    const telInput = document.getElementById("popupTel") as HTMLInputElement;
    if (telInput) applyPhoneInputFormat(telInput);

    //--- 마일리지 기본정보 세팅 ---//
    (document.getElementById("earnMileage") as HTMLInputElement).value = String(
        user.earnMileage ?? ""
    );
    (document.getElementById("mileageNumber") as HTMLInputElement).value = String(
        user.mileageNumber ?? ""
    );
    (document.getElementById("isPhone") as HTMLInputElement).checked =
        user.isPhone ?? false;
    //--- 마일리지 기본정보 세팅 ---//

    //--- 마일리지 체크박스 세팅 ---//
    const agreeCheckbox = document.getElementById("isPhone") as HTMLInputElement;
    const mileageInput = document.getElementById(
        "mileageNumber"
    ) as HTMLInputElement;

    if (agreeCheckbox && mileageInput) {
        agreeCheckbox.addEventListener("change", () => {
            if (agreeCheckbox.checked) {
                mileageInput.value = "11";
                mileageInput.disabled = true;
                mileageInput.placeholder = "휴대폰번호 11자리 고정";
            } else {
                mileageInput.disabled = false;
                mileageInput.value = "";
                mileageInput.placeholder = "4-12";
            }
        });

        // 페이지 로드시 체크 상태 반영
        if (agreeCheckbox.checked) {
            mileageInput.value = "11";
            mileageInput.disabled = true;
            mileageInput.placeholder = "휴대폰번호 11자리 고정";
        }
    }
    //--- 마일리지 체크박스 세팅 ---//
    //--- 마일리지 전체선택 버튼 세팅 ---//
    const selectAllBtn = document.getElementById(
        "selectAllBtn"
    ) as HTMLButtonElement;

    if (!selectAllBtn) return;

    selectAllBtn.addEventListener("click", function () {
        allChecked = !allChecked;

        const checkboxes =
            document.querySelectorAll<HTMLInputElement>("input.row-checkbox");
        checkboxes.forEach((checkbox) => {
            checkbox.checked = allChecked;
        });

        selectAllBtn.className = allChecked ? "btn-s mb10" : "btn-s blue mb10";
        selectAllBtn.textContent = allChecked ? "전체해제" : "전체선택";
    });
    //--- 마일리지 전체선택 버튼 세팅 ---//
    //--- 마일리지 정보 저장 버튼 세팅 ---//
    const pointInfoSave = document.getElementById(
        "pointInfoSave"
    ) as HTMLButtonElement;

    pointInfoSave.addEventListener("click", async function () {
        await setPointInfo();
    });
    //--- 마일리지 정보 저장 버튼 세팅 ---//
    //--- 마일리지 써치 세팅 ---//
    const searchInput = document.getElementById(
        "searchNumber"
    ) as HTMLInputElement;
    const searchBtn = document.getElementById(
        "searchButton"
    ) as HTMLButtonElement;
    const resetBtn = document.getElementById("searchReset") as HTMLButtonElement;

    searchBtn.addEventListener("click", () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            window.showToast("검색어를 입력해주세요.", 2000, "warning");
            return;
        }
        performSearch(keyword, true); // 검색 버튼 클릭 시 토스트 메시지 표시
    });

    resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        renderTable(items); // 전체 리스트로 초기화
    });

    // ✅ Enter 키로 검색 (기존 기능과 동일)
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                window.showToast("검색어를 입력해주세요.", 2000, "warning");
                return;
            }
            performSearch(keyword, true); // Enter 키 시에도 토스트 메시지 표시
        }
    });

    // ✅ 실시간 검색 기능 추가
    searchInput.addEventListener("input", function () {
        const keyword = searchInput.value.trim();

        // 기존 타이머가 있으면 취소 (디바운스 효과)
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // 300ms 후에 검색 실행 (너무 빠른 타이핑에 대한 성능 최적화)
        searchTimeout = setTimeout(() => {
            performSearch(keyword, false); // 실시간 검색 시 토스트 메시지 표시하지 않음
        }, 300);
    });
    //--- 마일리지 검색 기능 수정 ---//

    //--- 마일리지 상세 세팅 ---//
    const closeButtons = document.querySelectorAll(".popupCloseBtn");

    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closePopup();
        });
    });

    const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
    saveButton.addEventListener("click", async () => {
        if (isEditMode) {
            await savePoint("update"); // 포인트 수정
        } else {
            await savePoint("create"); // 포인트 등록
        }
    });
    //--- 마일리지 상세 세팅 ---//
    //--- 마일리지 등록 세팅 ---//
    const createPointBtn = document.getElementById(
        "createPointBtn"
    ) as HTMLButtonElement;
    createPointBtn.addEventListener("click", () => {
        selectedItem = undefined; // 신규 등록으로 간주
        isEditMode = false;
        openPopup(); // 초기화된 빈 팝업 열기
    });
    //--- 마일리지 등록 세팅 ---//
    //--- 마일리지 삭제 세팅 ---//
    const deleteButton = document.getElementById(
        "deleteButton"
    ) as HTMLButtonElement;

    if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
            const checkboxes = document.querySelectorAll<HTMLInputElement>(
                "input.row-checkbox:checked"
            );

            if (checkboxes.length === 0) {
                window.showToast("삭제할 항목을 선택해주세요.", 2000, "warning");
                return;
            }

            const confirmDelete = confirm(
                `선택한 ${checkboxes.length}개 항목을 삭제하시겠습니까?`
            );
            if (!confirmDelete) return;

            const user = getStoredUser();
            if (!user) {
                window.showToast("사용자 정보가 없습니다.", 2000, "error");
                return;
            }

            const userId = user.userId;

            let failed = 0;

            for (const checkbox of checkboxes) {
                const uniqueMileageNo = checkbox.dataset.id;
                if (!uniqueMileageNo) continue;

                const res = await apiDelete(
                    `/model_admin_mileage?func=mileage-delete&userId=${userId}&uniqueMileageNo=${uniqueMileageNo}`
                );

                if (!res.ok) {
                    failed++;
                    console.error(`❌ 삭제 실패: ${uniqueMileageNo}`);
                }
            }

            if (failed > 0) {
                window.showToast(`❌ ${failed}건 삭제 실패`, 2000, "error");
            } else {
                window.showToast("✅ 선택된 마일리지를 모두 삭제했습니다.");
            }

            await getPointList(); // 목록 갱신
        });
    }

    //--- 마일리지 삭제 세팅 ---//
    await getPointList();
}

// ✅ 검색 기능을 통합하는 새로운 함수
function performSearch(keyword: string, showToast: boolean) {
    let filtered;

    if (keyword.length > 0) {
        filtered = items.filter(
            (item) => item.mileageNo?.includes(keyword) || item.tel?.includes(keyword)
        );
    } else {
        // 검색어가 없으면 전체 목록 표시
        filtered = items;
    }

    renderTable(filtered);

    // 검색 버튼이나 Enter 키를 눌렀을 때만 토스트 메시지 표시
    if (showToast && filtered.length === 0 && keyword.length > 0) {
        window.showToast(`"${keyword}"에 대한 검색 결과가 없습니다.`, 2000, "warning");
    }
}

// 팝업 오픈
async function openPopup() {
    const popupOverlay = document.querySelector(".popup-overlay") as HTMLElement;
    popupOverlay.style.display = "flex";

    // 버튼 라벨 처리
    const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
    saveButton.textContent = isEditMode ? "수정" : "저장";

    (document.getElementById("mileageNo") as HTMLInputElement).value = "";
    (document.getElementById("popupTel") as HTMLInputElement).value = "";
    (document.getElementById("popupPassword") as HTMLInputElement).value = "";
    (document.getElementById("popupMileage") as HTMLInputElement).value = "";
    (document.getElementById("popupCount") as HTMLInputElement).value = "";
    (document.getElementById("popupAmount") as HTMLInputElement).value = "";
    (document.getElementById("myTextarea") as HTMLTextAreaElement).value = "";
}

function closePopup() {
    const popupOverlay = document.querySelector(".popup-overlay") as HTMLElement;
    popupOverlay.style.display = "none";
}

async function setPointInfo() {
    // localstorage 에 저장된 user 정보를 불러옴
    const user = getStoredUser();

    if (!user) {
        window.showToast("사용자 정보가 없습니다.", 2000, "error");
        return;
    }

    const admin = await getUserData();
    const adminId = admin?.adminId;
    const earnMileage = parseInt((document.getElementById("earnMileage") as HTMLInputElement).value, 10);
    const mileageNumber = parseInt((document.getElementById("mileageNumber") as HTMLInputElement).value, 10);
    const isPhone = document.getElementById("isPhone") as HTMLInputElement;

    if (!earnMileage) {
        window.showToast("마일리지 적립률을 입력해주세요.", 2000, "warning");
        return;
    }

    if (100 < earnMileage) {
        window.showToast("마일리지 적립률은 0~100 사이로 입력해주세요.", 2000, "warning");
        return;
    }

    if (!mileageNumber) {
        window.showToast("마일리지 적립 번호 자리수를 입력해주세요.", 2000, "warning");
        return;
    }

    if (4 > mileageNumber || 12 < mileageNumber) {
        window.showToast("마일리지 적립번호 자리수는 4-12자리 이내로 입력해주세요.", 2000, "warning");
        return;
    }

    const payload = {
        userId: user.userId,
        adminId: adminId,
        isPhone: isPhone.checked,
        earnMileage: earnMileage,
        mileageNumber: mileageNumber,
    };

    const res = await apiPut(`/model_user_setting?func=update-user`, payload);

    if (!res.ok) {
        console.error("❌ 데이터 가져오기 실패");
        return;
    }

    const userRes = await fetchUserInfo(user.userId); // fetchUserInfo 내부에서 이미 await 처리됨
    if (userRes) {
        localStorage.setItem("userInfo", JSON.stringify(userRes));
        window.showToast("✅ 사용자 정보 저장 완료");
    }
}

// 포인트 목록조회
async function getPointList() {
    // localstorage에 저장된 user 정보를 불러옴
    const user = getStoredUser();
    if (!user) {
        window.showToast("사용자 정보가 없습니다.", 2000, "error");
        return;
    }
    const userId = user.userId;
    const res = await apiGet(`/model_admin_mileage?userId=${userId}&func=mileage&limit=2000`);

    if (!res.ok) {
        console.error("❌ 데이터 가져오기 실패");
        return;
    }

    const body: { items: PointItem[] } = await res.json(); // ✅ 타입 지정

    items = body.items || []; // ✅ items 배열 꺼내기
    await renderTable(items);
}

// 포인트 테이블 렌더러
async function renderTable(data: PointItem[]) {
    new Pagination<PointItem>({
        data,
        pageSize: 10,
        blockSize: 5,
        containerId: "pagination",
        onPageChange: (pageData, page) => {
            const tableBody = document.querySelector("tbody");
            const selectAllBtn = document.getElementById(
                "selectAllBtn"
            ) as HTMLButtonElement;
            if (!tableBody || !selectAllBtn) return;

            allChecked = false;
            selectAllBtn.textContent = "전체선택";
            tableBody.innerHTML = "";

            const popupAmountInput = document.getElementById("popupAmount") as HTMLInputElement;

            popupAmountInput.addEventListener("click", () => {
                popupAmountInput.value = popupAmountInput.value.replace(/[^0-9]/g, '');
            });

            // 포커스 아웃 시 쉼표 + p 붙임
            popupAmountInput.addEventListener("blur", () => {
                const rawValue = popupAmountInput.value.replace(/[^0-9]/g, '');
                if (rawValue) {
                    popupAmountInput.value =
                        Number(rawValue).toLocaleString() + 'p';
                } else {
                    popupAmountInput.value = '0p'; // 빈값이면 0p 표시
                }
            });

            pageData.forEach((item, index) => {
                const tr = document.createElement("tr");
                const amount = item.amount ?? 0;
                tr.innerHTML = `
                  <td><input type="checkbox" class="row-checkbox" data-id="${
                    item.uniqueMileageNo
                }"></td>
                  <td>${index + 1 + (page - 1) * 10}</td>
                  <td>${formatPhoneNumber(item.mileageNo)}</td>
                  <td>${Number(amount).toLocaleString()}p</td>
                  <td><button class="btn-delete" data-id="${
                    item.uniqueMileageNo
                }">삭제</button></td>
                `;

                tr.addEventListener("click", async (e) => {
                    const target = e.target as HTMLElement;

                    // ✅ 체크박스나 삭제 버튼 클릭 시는 무시하고 return
                    if (
                        target.closest("input[type='checkbox']") ||
                        target.closest(".btn-delete")
                    ) {
                        return;
                    }

                    const detail = item;
                    selectedItem = detail;
                    isEditMode = true; // ✅ 수정 모드 지정
                    await openPopup(); // ← 상세 데이터 전달

                    const history = await loadMileageHistory(selectedItem, currentHistoryPage);

                    // 👇 개수 표시
                    const historyCount = history?.total || 0;
                    (document.getElementById("popupCount") as HTMLInputElement).value = `${historyCount}건`;
                    (document.getElementById("popupCount") as HTMLInputElement).readOnly = true;
                    (document.getElementById("mileageNo") as HTMLInputElement).value =
                        formatPhoneNumber(detail.mileageNo ?? "");
                    (document.getElementById("popupTel") as HTMLInputElement).value =
                        formatPhoneNumber(detail.tel ?? "");
                    (document.getElementById("popupPassword") as HTMLInputElement).value =
                        detail.password ?? "";
                    (document.getElementById("popupMileage") as HTMLInputElement).value =
                        String(Number(amount).toLocaleString() ?? "0") + "p";
                    (document.getElementById("popupAmount") as HTMLInputElement).value =
                        String(Number(amount).toLocaleString() ?? "0") + "p";
                    (document.getElementById("myTextarea") as HTMLInputElement).value =
                        detail.note ?? "";
                });

                const deleteBtn = tr.querySelector(".btn-delete") as HTMLButtonElement;
                deleteBtn.onclick = async () => {
                    const confirmDelete = confirm("정말 삭제하시겠습니까?");
                    if (!confirmDelete) return;

                    const user = getStoredUser();

                    if (!user) {
                        window.showToast("사용자 정보가 없습니다.", 2000, "error");
                        return;
                    }
                    const userId = user.userId;

                    const res = await apiDelete(`/model_admin_mileage?userId=${userId}&func=mileage-delete&uniqueMileageNo=${item.uniqueMileageNo}`);
                    if (!res.ok) {
                        window.showToast("❌ 삭제 실패", 2000, "error");
                        return;
                    }

                    window.showToast("✅ 삭제 완료");
                    await getPointList(); // 삭제 후 목록 다시 로딩
                };

                tableBody.appendChild(tr);
            });
        },
    });
}

// 마일리지 정보 저장
async function savePoint(mode: PointMode) {
    try {
        const mileageNoRaw = (
            document.getElementById("mileageNo") as HTMLInputElement
        ).value.trim();
        const tel = (
            document.getElementById("popupTel") as HTMLInputElement
        ).value.trim();
        const password = (
            document.getElementById("popupPassword") as HTMLInputElement
        ).value.trim();
        const pointStr = (
            document.getElementById("popupAmount") as HTMLInputElement
        ).value.trim();

        // '원'과 쉼표를 제거하고 숫자만 추출
        const cleanPointStr = pointStr.replace(/[^0-9]/g, "");

        const note = (
            document.getElementById("myTextarea") as HTMLTextAreaElement
        ).value.trim();

        const user = getStoredUser();
        if (!user) {
            window.showToast("사용자 정보가 없습니다.", 2000, "error");
            return;
        }

        const {userId, isPhone, mileageNumber} = user;

        if (!userId || isPhone === undefined || mileageNumber === undefined) {
            window.showToast("📌 고객번호 설정이 누락되었습니다.\n[휴대폰 여부 / 자릿수] 정보를 먼저 등록해주세요.", 2000, "warning");
            return;
        }

        // mileage 번호 유효성 검사
        const msg = validateMileageNo(mileageNoRaw, isPhone, mileageNumber);
        if (msg) {
            window.showToast(msg, 2000, "warning");
            return;
        }

        const mileageNo = isPhone ? mileageNoRaw.replace(/-/g, "") : mileageNoRaw;


        if (mode === "create") {

            const item = tel ? (password ? (pointStr ? null : "포인트") : "패스워드") : "전화번호";

            // 필수 필드 검사
            if (item) {

                window.showToast(`필수 항목 ${item} 를 입력해주세요.`, 2000, "warning");
                return;
            }
        } else {
            const item = tel ? (password ? null : "패스워드") : "전화번호";

            // 필수 필드 검사
            if (item) {
                window.showToast(`필수 항목 ${item} 를 입력해주세요.`, 2000, "warning");
                return;
            }
        }

        if (!/^\d+$/.test(password)) {
            window.showToast("비밀번호는 숫자만 입력해주세요.", 2000, "warning");
            return;
        }

        if (cleanPointStr) {

            if (!/^\d+$/.test(cleanPointStr)) {
                window.showToast("포인트는 숫자만 입력해주세요.", 2000, "warning");
                return;
            }
        }

        // payload 구성
        const payload: Record<string, any> = {
            userId,
            mileageNo,
            password,
            points: cleanPointStr,
            tel,
        };

        if (note) payload.note = note;

        // 수정일 경우 uniqueMileageNo 포함, password는 newPassword로 변경
        if (mode === "update") {
            if (!selectedItem?.uniqueMileageNo) {
                window.showToast("선택된 항목이 없습니다.", 2000, "warning");
                return;
            }

            payload.uniqueMileageNo = selectedItem.uniqueMileageNo;
            payload.newPassword = password;
            delete payload.password;
        }

        const url =
            mode === "create"
                ? `/model_admin_mileage?userId=${userId}&func=mileage-add`
                : `/model_admin_mileage?func=mileage-update`;

        const res =
            mode === "create"
                ? await apiPost(url, payload)
                : await apiPut(url, payload);

        if (!res.ok) {
            try {
                const errorBody = await res.json();
                const errorMessage = errorBody?.message ?? `${mode === "create" ? "등록" : "수정"} 중 오류가 발생했습니다.`;
                window.showToast(`❌ ${errorMessage}`, 2000, "error");
            } catch (e) {
                window.showToast(`❌ ${mode === "create" ? "등록" : "수정"} 실패`, 2000, "error");
            }
            return;
        }

        window.showToast(`✅ ${mode === "create" ? "등록" : "수정"} 완료`);
        closePopup();
        await getPointList();

    } catch (e) {
        console.error(`❌ ${mode} 오류:`, e);
        window.showToast(`서버 오류로 ${mode === "create" ? "등록" : "수정"}에 실패했습니다.`, 2000, "error");
    }
}

// 마일리지 상세 목록 조회
async function loadMileageHistory(point: PointItem, page = 1) {
    const user = getStoredUser();
    if (!user) return;

    const startKey = pageKeyMap[page - 1]; // 이전 페이지의 키를 사용

    let query = `/model_admin_mileage?func=mileage-history&userId=${user.userId}&uniqueMileageNo=${point.uniqueMileageNo}&limit=${historyLimit}`;
    if (startKey) {
        query += `&lastEvaluatedKey=${encodeURIComponent(
            JSON.stringify(startKey)
        )}`;
    }

    const res = await apiGet(query);

    const {items, total, pageKeys: rawKeys} = await res.json();

    // 👉 pageKeyMap 초기화 및 저장
    pageKeyMap = {};
    if (rawKeys) {
        try {
            const parsedKeys: PageKey[] = JSON.parse(rawKeys);
            parsedKeys.forEach((key, index) => {
                pageKeyMap[index + 1] = key;
            });
        } catch (e) {
            console.warn("⚠️ pageKeys 파싱 실패:", e);
        }
    }

    // 👉 테이블 렌더링
    const historyTableBody = document.getElementById("historyTableBody");

    if (!historyTableBody) return;

    historyTableBody.innerHTML = "";
    items.forEach((item: MileageHistoryItem, index: number) => {
        const tr = document.createElement("tr");
        const date = item.timestamp.split("T")[0]; // "2025-07-15"
        const time = item.timestamp.split("T")[1].split(".")[0]; // "16:34:15"
        tr.innerHTML = `
            <td>${index + 1 + (page - 1) * historyLimit}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>${Number(item.totalAmt ?? 0).toLocaleString()}원</td>
            <td>${item.points}p</td>
            <td>${Number(item.amount).toLocaleString()}p</td>
        `;
        historyTableBody.appendChild(tr);
    });

    // 👉 페이지네이션 렌더링
    renderClassicPagination({
        data: {
            items,
            total,
            pageKeys: rawKeys,
        },
        currentPage: page,
        limit: historyLimit,
        containerId: "historyPagination",
        onPageChange: (pageKey, pageNumber) => {
            // 다음 페이지 이동 시, 서버에서 받은 키를 등록
            pageKeyMap[pageNumber - 1] = pageKey as PageKey;
            loadMileageHistory(point, pageNumber);
        },
    });

    return {
        items, total
    }
}

// 마일리지넘버 체크
function validateMileageNo(
    mileageNo: string,
    isPhone: boolean,
    requiredLength: number
): string | null {
    const raw = mileageNo.trim();
    const cleaned = isPhone ? raw.replace(/-/g, "") : raw;

    if (!/^\d+$/.test(cleaned)) {
        return "포인트 번호는 숫자만 입력해주세요.";
    }

    if (cleaned.length !== requiredLength) {
        return `포인트 번호는 ${requiredLength}자리여야 합니다.`;
    }

    return null;
}

// mileageNo 휴대폰 or 숫자 포멧 적용
function applyMileageNoInputBehavior(isPhone: boolean) {
    const input = document.getElementById("mileageNo") as HTMLInputElement;
    if (!input) return;

    input.value = ""; // 초기화
    input.placeholder = isPhone ? "010-1234-5678" : "숫자만 입력";

    input.addEventListener("input", (e) => {
        let value = (e.target as HTMLInputElement).value.replace(/\D/g, ""); // 숫자만

        if (isPhone) {
            // 휴대폰 번호 포맷: 010-XXXX-XXXX
            applyPhoneInputFormat(input);
        } else {
            // 숫자만
            input.value = value;
        }
    });
}

// 전화번호 입력 시 포맷 적용 (ex: 01012345678 → 010-1234-5678)
export function applyPhoneInputFormat(input: HTMLInputElement) {
    input.addEventListener("input", () => {
        const value = input.value.replace(/\D/g, "").slice(0, 11); // 숫자만, 최대 11자리

        if (value.length <= 3) {
            input.value = value;
        } else if (value.length <= 7) {
            input.value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else {
            input.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }
    });
}

// 휴대폰 포멧
function formatPhoneNumber(number: string): string {
    const cleaned = number.replace(/\D/g, "");

    if (cleaned.startsWith("02")) {
        if (cleaned.length === 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
        if (cleaned.length === 10) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;

    return cleaned;
}