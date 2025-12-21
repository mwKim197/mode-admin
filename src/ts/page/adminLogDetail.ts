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
    if (!wrapper) return;

    // 🔥 description은 무조건 원본문자열을 그대로 표시
    // JSON이어도 문자열 그대로 화면에 표시됨
    wrapper.innerText = log.description || "설명 없음";

    // Diff 비교용 데이터가 없으면 종료
    if (!log.description) {
        hideDiffBoxes();
        return;
    }

    let desc = log.description;

    // 🔍 1) JSON 구조인지 검사
    if (!isJsonString(desc)) {
        hideDiffBoxes();
        return;
    }

    // 🔍 2) JSON 파싱
    const diffData = JSON.parse(desc);

    const before = diffData["기존데이터"] || {};
    const after = diffData["수정데이터"] || {};

    // 🔍 정렬된 클린 데이터 생성
    const sortedBefore = sortObjectKeys(before);
    const sortedAfter = sortObjectKeys(after);

    // 🔍 diff 렌더링
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

function sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) {
        // 배열인 경우 각 요소를 재귀적으로 정렬
        return obj.map(item => sortObjectKeys(item));
    }

    if (typeof obj === "object" && obj !== null) {
        // 객체인 경우 key를 정렬
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortObjectKeys(obj[key]);
                return acc;
            }, {} as any);
    }

    return obj; // 기본 타입은 그대로 반환
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

