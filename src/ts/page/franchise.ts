import {apiGet, apiPost, apiPut, apiDelete} from "../api/apiHelpers.ts";

export function franchiseEdit() {
    interface Franchise {
        franchiseId: string;
        name: string;
        createdAt?: string;
    }

    const API_BASE = "/model_admin_franchise";

    const franchiseModal = document.getElementById("franchiseModal") as HTMLElement;
    const franchiseList = document.getElementById("franchiseList") as HTMLElement;

    const modalTitle = document.getElementById("modalTitle") as HTMLElement;
    const modalFranchiseId = document.getElementById("modalFranchiseId") as HTMLInputElement;
    const modalFranchiseName = document.getElementById("modalFranchiseName") as HTMLInputElement;

    const openCreateBtn = document.getElementById("openCreateBtn") as HTMLButtonElement;
    const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
    const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;

    let isEdit = false;

    // ------------------------------
    // 1) 프랜차이즈 리스트 로드
    // ------------------------------
    async function loadFranchiseList() {
        const res = await apiGet(`${API_BASE}?func=list-franchise`);
        const data = await res.json(); // ⭐ 너의 방식

        const list: Franchise[] = data.franchises ?? [];
        franchiseList.innerHTML = "";

        list.forEach((f) => {
            const div = document.createElement("div");
            div.className = "franchise-item";

            div.innerHTML = `
                <div>
                    <strong>${f.franchiseId}</strong><br/>
                    ${f.name}
                </div>
                <div class="franchise-actions">
                    <button class="btn btn-edit" data-edit="${f.franchiseId}">수정</button>
                    <button class="btn btn-delete" data-delete="${f.franchiseId}">삭제</button>

                </div>
            `;

            franchiseList.appendChild(div);
        });

        attachListEvents();
    }

    // ------------------------------
    // 2) 수정/삭제 버튼 이벤트 연결
    // ------------------------------
    function attachListEvents() {
        document.querySelectorAll("[data-edit]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = (btn as HTMLElement).dataset.edit!;
                openEditModal(id);
            });
        });

        document.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = (btn as HTMLElement).dataset.delete!;
                if (!confirm("정말 삭제하시겠습니까?")) return;

                await apiDelete(`${API_BASE}?func=delete-franchise&franchiseId=${id}`);
                await loadFranchiseList();
            });
        });
    }

    // ------------------------------
    // 3) 신규 생성 모달 열기
    // ------------------------------
    function openCreateModal() {
        isEdit = false;

        modalTitle.innerText = "신규 프랜차이즈 생성";
        modalFranchiseId.disabled = false;

        modalFranchiseId.value = "";
        modalFranchiseName.value = "";

        franchiseModal.classList.add("active");
    }

    // ------------------------------
    // 4) 수정 모달 열기
    // ------------------------------
    async function openEditModal(id: string) {
        isEdit = true;

        modalTitle.innerText = "프랜차이즈 수정";
        modalFranchiseId.disabled = true;
        modalFranchiseId.value = id;

        const res = await apiGet(`${API_BASE}?func=get-franchise&franchiseId=${id}`);
        const data = await res.json();

        modalFranchiseName.value = data.franchise.name;

        franchiseModal.classList.add("active");
    }

    // ------------------------------
    // 5) 저장 (신규 or 수정)
    // ------------------------------
    async function saveFranchise() {
        const franchiseId = modalFranchiseId.value.trim();
        const name = modalFranchiseName.value.trim();

        if (!franchiseId || !name) {
            alert("프랜차이즈 ID와 이름을 모두 입력하세요.");
            return;
        }

        if (isEdit) {
            await apiPut(`${API_BASE}?func=update-franchise`, {franchiseId, name});
        } else {
            await apiPost(`${API_BASE}?func=create-franchise`, {franchiseId, name});
        }

        closeModal();
        await loadFranchiseList();
    }

    // ------------------------------
    // 6) 모달 닫기
    // ------------------------------
    function closeModal() {
        franchiseModal.classList.remove("active");
    }

    // ------------------------------
    // 7) 이벤트 등록
    // ------------------------------
    openCreateBtn.addEventListener("click", openCreateModal);
    saveBtn.addEventListener("click", saveFranchise);
    cancelBtn.addEventListener("click", closeModal);

    // ------------------------------
    // 초기 실행
    // ------------------------------
    loadFranchiseList();
}
