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

/** 기존데이터 - 수정데이터 비교 + description 표시 */
function renderDescriptionDiff(log: any) {
    const wrapper = document.getElementById("descriptionText");
    if (!wrapper) return; // ❗ null 대응

    wrapper.innerText = log.description || "설명 없음";


    if (!log.description) {
        wrapper.innerText = "설명 없음";
        hideDiffBoxes();
        return;
    }

    let desc = log.description;

    // 📌 1) JSON인지 검사
    const isJson = isJsonString(desc);

    // 📌 2) JSON이 아닐 경우 → 문자열 그대로 표시
    if (!isJson) {
        wrapper.innerText = desc; // ← 여기서 설명문 출력됨
        hideDiffBoxes();
        return;
    }

    // 📌 3) JSON일 경우 → 파싱 후 diff 비교
    desc = JSON.parse(desc);
    wrapper.innerText = desc.description ?? "변경 내역 상세";

    const before = desc["기존데이터"] || {};
    const after = desc["수정데이터"] || {};

    const sortedBefore = sortObjectKeys(before);
    const sortedAfter = sortObjectKeys(after);

    renderKeyValue("beforeData", sortedBefore, sortedAfter);
    renderKeyValue("afterData", sortedAfter, sortedBefore);
}


function isJsonString(str: string) {
    if (typeof str !== "string") return false;
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === "object" && parsed !== null;
    } catch (e) {
        return false;
    }
}

function hideDiffBoxes() {
    document.getElementById("beforeData")!.innerHTML = "변경 기록 없음";
    document.getElementById("afterData")!.innerHTML = "변경 기록 없음";
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

