import {PageKey, PaginateOptions} from "../types/point.ts";

export function renderClassicPagination<T>({
                                               data,
                                               currentPage,
                                               limit,
                                               onPageChange,
                                               containerId,
                                           }: PaginateOptions<T>) {
    const totalPages = Math.ceil(data.total / limit);
    const pageKeys: PageKey[] = data.pageKeys ? JSON.parse(data.pageKeys) : [];
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // 초기화

    const visiblePages = 5; // 한 번에 보일 페이지 번호 수
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // ◀ 이전 버튼
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "&lt;";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1 === 1 ? null : pageKeys[currentPage - 3] || null, currentPage - 1);
        }
    });
    container.appendChild(prevBtn);

    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.setAttribute("data-page", String(i));
        btn.innerText = String(i);
        btn.style.display = "inline-block";

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => {
            const key = i === 1 ? null : pageKeys[i - 2] || null;
            onPageChange(key, i);
        });

        container.appendChild(btn);
    }

    // ▶ 다음 버튼
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "&gt;";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            onPageChange(pageKeys[currentPage - 1] || null, currentPage + 1);
        }
    });
    container.appendChild(nextBtn);
}
