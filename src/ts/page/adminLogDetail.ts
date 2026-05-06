export function initAdminDetailLog() {
    const logRaw = localStorage.getItem("selectedLog");
    if (!logRaw) {
        alert("로그 데이터가 없습니다.");
        return;
    }
    
    const log = JSON.parse(logRaw);
    
    renderBasicInfo(log);
    renderDescriptionDiff(log);
}

/** 기본 정보 표시 */
function renderBasicInfo(log: any) {
    const backBox = document.querySelector(".back-box") as HTMLElement;
    if (backBox) {
        backBox.style.display = "flex";
    }
    
    const box = document.getElementById("basicInfo");
    if (!box) return;
    
    const date = log.timestamp
        ? log.timestamp.replace("T", " ").replace("+09:00", "")
        : "-";
    
    box.innerHTML = `
        <div class="detail-row"><div class="key">로그 ID</div><div>${log.logId || "-"}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${log.adminId || "-"}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${log.actionType || "-"}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${log.target || "-"}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${date}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${log.meta?.ip || "-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${log.meta?.userAgent || "-"}</div></div>
    `;
}

/** description 표시 + 기존/수정 비교 */
function renderDescriptionDiff(log: any) {
    const wrapper = document.getElementById("descriptionText");
    if (!wrapper) return;
    
    wrapper.innerText = formatDescription(log.description);
    
    const parsed = parseDescription(log.description);
    
    if (parsed?.["기존데이터"] && parsed?.["수정데이터"]) {
        const before = sortObjectKeys(parsed["기존데이터"]);
        const after = sortObjectKeys(parsed["수정데이터"]);
        
        renderKeyValue("beforeData", before, after);
        renderKeyValue("afterData", after, before);
        return;
    }
    
    hideDiffBoxes();
}

/** description 보기 좋게 변환 */
function formatDescription(description: any): string {
    if (isEmptyDescription(description)) {
        return "설명 없음";
    }
    
    if (typeof description === "object") {
        return JSON.stringify(description, null, 2);
    }
    
    if (typeof description !== "string") {
        return String(description);
    }
    
    // 기존데이터/수정데이터 JSON 문자열
    const parsedJson = parseDescription(description);
    if (parsedJson) {
        return JSON.stringify(parsedJson, null, 2);
    }
    
    // inventory={...} spec={...} config={...} soldOut={...}
    const parsedKeyValue = parseKeyValueJsonText(description);
    if (Object.keys(parsedKeyValue).length > 0) {
        return JSON.stringify(parsedKeyValue, null, 2);
    }
    
    // 재고100% 보충 : [{...}]
    const arrayMatch = description.match(/^(.*?)\s*:\s*(\[.*\])$/s);
    if (arrayMatch) {
        try {
            return `${arrayMatch[1]}:\n${JSON.stringify(JSON.parse(arrayMatch[2]), null, 2)}`;
        } catch {
            return description;
        }
    }
    
    return description;
}

/** description JSON 파싱 */
function parseDescription(description: any): any {
    if (!description) return null;
    
    if (typeof description === "object") {
        return description;
    }
    
    if (typeof description !== "string") {
        return null;
    }
    
    try {
        return JSON.parse(description);
    } catch {
        return null;
    }
}

/** 빈 description 체크 */
function isEmptyDescription(description: any): boolean {
    if (!description) return true;
    
    if (
        typeof description === "object" &&
        !Array.isArray(description) &&
        Object.keys(description).length === 0
    ) {
        return true;
    }
    
    return false;
}

/** inventory={...} spec={...} 형태 파싱 */
function parseKeyValueJsonText(text: string) {
    const result: Record<string, any> = {};
    const regex = /(\w+)=({[\s\S]*?})(?=\s+\w+=|$)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        try {
            result[match[1]] = JSON.parse(match[2]);
        } catch {
            result[match[1]] = match[2];
        }
    }
    
    return result;
}

/** diff 영역 숨김/기본값 */
function hideDiffBoxes() {
    const beforeBox = document.getElementById("beforeData");
    const afterBox = document.getElementById("afterData");
    
    if (beforeBox) beforeBox.innerHTML = "변경 기록 없음";
    if (afterBox) afterBox.innerHTML = "변경 기록 없음";
}

/** 객체 key 정렬 */
function sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => sortObjectKeys(item));
    }
    
    if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortObjectKeys(obj[key]);
                return acc;
            }, {} as any);
    }
    
    return obj;
}

/** JSON Key-Value 표기 + 변경 강조 */
function renderKeyValue(elementId: string, data: any, compareData: any) {
    const box = document.getElementById(elementId);
    if (!box) return;
    
    let html = "";
    
    for (const key in data) {
        const rawValue = data[key];
        let displayValue = "";
        
        const changed =
            JSON.stringify(sortObjectKeys(data[key])) !==
            JSON.stringify(sortObjectKeys(compareData?.[key]));
        
        if (key === "image" || key === "imageBase64" || key === "originalFileName") {
            displayValue = changed ? "수정됨" : "변경 없음";
        } else if (typeof rawValue === "string") {
            displayValue = rawValue;
        } else {
            displayValue = JSON.stringify(rawValue, null, 2);
        }
        
        html += `
            <div class="detail-row">
                <div class="key">${escapeHtml(key)}</div>
                <div class="${changed ? "changed" : ""}"
                     style="white-space: ${typeof rawValue === "string" ? "normal" : "pre-wrap"};
                            word-break: break-word;">
                    ${escapeHtml(displayValue)}
                </div>
            </div>
        `;
    }
    
    box.innerHTML = html;
}
function escapeHtml(value: any): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}