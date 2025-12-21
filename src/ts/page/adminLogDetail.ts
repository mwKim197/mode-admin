export function initAdmionDetailLog() {
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
    const backBox = document.querySelector('.back-box') as HTMLElement;
    if (backBox) {
        backBox.style.display = 'flex';
    }
    
    const box = document.getElementById("basicInfo");
    if (!box) return;

    const date = log.timestamp.replace("T", " ").replace("+09:00", "");

    box.innerHTML = `
        <div class="detail-row"><div class="key">로그 ID</div><div>${log.logId}</div></div>
        <div class="detail-row"><div class="key">관리자 ID</div><div>${log.adminId}</div></div>
        <div class="detail-row"><div class="key">작업 종류</div><div>${log.actionType}</div></div>
        <div class="detail-row"><div class="key">대상</div><div>${log.target}</div></div>
        <div class="detail-row"><div class="key">날짜</div><div>${date}</div></div>
        <div class="detail-row"><div class="key">IP</div><div>${log.meta?.ip || "-"}</div></div>
        <div class="detail-row"><div class="key">UserAgent</div><div>${log.meta?.userAgent || "-"}</div></div>
    `;
}

/** 기존데이터 - 수정데이터 비교 */
function renderDescriptionDiff(log: any) {
    if (!log.description) return;

    let desc = log.description;
    if (typeof desc === "string") desc = JSON.parse(desc);

    const before = desc["기존데이터"] || {};
    const after = desc["수정데이터"] || {};

    const sortedBefore = sortObjectKeys(before);
    const sortedAfter = sortObjectKeys(after);

    renderKeyValue("beforeData", sortedBefore, sortedAfter);
    renderKeyValue("afterData", sortedAfter, sortedBefore);
}

function sortObjectKeys(obj: any) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return obj;
    }
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = sortObjectKeys(obj[key]); // 내부 객체도 재귀적으로 정렬
            return acc;
        }, {} as any);
}

/** JSON Key-Value 표기 + 변경 강조 */
function renderKeyValue(elementId: string, data: any, compareData: any) {
    const box = document.getElementById(elementId);
    if (!box) return;

    let html = "";

    for (const key in data) {

        let rawValue = data[key];
        let displayValue = "";

        const changed =
            JSON.stringify(sortObjectKeys(data[key])) !==
            JSON.stringify(sortObjectKeys(compareData[key]));

        // 이미지 관련 필드 처리
        if (key === "image" || key === "imageBase64" || key === "originalFileName") {
            displayValue = changed ? "수정됨" : "변경 없음";
        } else if (typeof rawValue === "string") {
            // 🔥 문자열은 한 줄로 출력
            displayValue = rawValue;
        } else {
            // 🔥 객체/배열만 줄바꿈 JSON 출력
            displayValue = JSON.stringify(rawValue, null, 2);
        }

        html += `
            <div class="detail-row">
                <div class="key">${key}</div>
                <div class="${changed ? "changed" : ""}"
                     style="white-space: ${typeof rawValue === "string" ? "normal" : "pre-wrap"}; 
                            word-break: break-word;">
                    ${displayValue}
                </div>
            </div>
        `;
    }

    box.innerHTML = html;
}

