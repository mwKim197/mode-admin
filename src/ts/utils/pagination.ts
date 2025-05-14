interface PaginationOptions<T> {
    data: T[];               // 전체 데이터
    pageSize?: number;       // 한 페이지에 보여줄 아이템 수 (기본 10)
    blockSize?: number;      // 페이지 번호 블럭 크기 (기본 5)
    containerId: string;     // 페이지 버튼 렌더링할 div ID
    onPageChange: (pageData: T[], page: number) => void; // 페이지 변경시 콜백
}

export class Pagination<T> {
    private data: T[];
    private pageSize: number;
    private blockSize: number;
    private container: HTMLElement;
    private onPageChange: (pageData: T[], page: number) => void;
    private currentPage: number;

    constructor(options: PaginationOptions<T>) {
        this.data = options.data;
        this.pageSize = options.pageSize || 10;
        this.blockSize = options.blockSize || 5;
        this.container = document.getElementById(options.containerId)!;
        this.onPageChange = options.onPageChange;
        this.currentPage = 1;

        this.render();
        this.movePage(1);
    }

    private get totalPages() {
        return Math.ceil(this.data.length / this.pageSize);
    }

    private render() {
        this.container.innerHTML = "";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.onclick = () => this.moveBlock(-1);
        this.container.appendChild(prevBtn);

        for (let i = 1; i <= this.totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = String(i);
            btn.dataset.page = String(i);
            btn.onclick = () => this.movePage(i);
            this.container.appendChild(btn);
        }

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.onclick = () => this.moveBlock(1);
        this.container.appendChild(nextBtn);

        this.updateVisibleButtons();
    }

    private movePage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const startIdx = (page - 1) * this.pageSize;
        const endIdx = startIdx + this.pageSize;
        const pageData = this.data.slice(startIdx, endIdx);
        this.onPageChange(pageData, page);
        this.updateActiveButton();
        this.updateVisibleButtons();
    }

    private moveBlock(direction: number) {
        const currentBlock = Math.floor((this.currentPage - 1) / this.blockSize);
        const newBlock = currentBlock + direction;
        const newPage = newBlock * this.blockSize + 1;
        if (newPage < 1 || newPage > this.totalPages) return;
        this.movePage(newPage);
    }

    private updateActiveButton() {
        const buttons = this.container.querySelectorAll("button");
        buttons.forEach((btn) => {
            if (btn.dataset.page) {
                btn.classList.toggle("active", Number(btn.dataset.page) === this.currentPage);
            }
        });
    }

    private updateVisibleButtons() {
        const buttons = this.container.querySelectorAll("button");
        const currentBlock = Math.floor((this.currentPage - 1) / this.blockSize);

        buttons.forEach((btn) => {
            if (!btn.dataset.page) return; // < > 버튼 제외

            const page = Number(btn.dataset.page);
            const start = currentBlock * this.blockSize + 1;
            const end = start + this.blockSize - 1;

            if (page >= start && page <= end) {
                btn.style.display = "inline-block";
            } else {
                btn.style.display = "none";
            }
        });
    }
}
