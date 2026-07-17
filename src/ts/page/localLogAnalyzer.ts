type LogLevel = "error" | "warn" | "info" | "debug" | "unknown";
type FocusFilter = "all" | "problem" | "machine" | "slow" | "http" | "exception";

type ParsedLogEntry = {
    lineNumber: number;
    endLineNumber: number;
    raw: string;
    normalizedMessage: string;
    level: LogLevel;
    timestamp: Date | null;
    durationMs: number | null;
    httpStatus: string | null;
    url: string | null;
    exception: string | null;
    ids: string[];
    modelTags: string[];
};

type RankItem = {
    label: string;
    count: number;
};

type OrderFlow = {
    startLine: number;
    endLine: number;
    startTime: Date | null;
    endTime: Date | null;
    menuName: string;
    menuId: string;
    orderId: string;
    result: "completed" | "failed" | "incomplete";
    cupOk: boolean;
    iceOk: boolean;
    coffeeCommandOk: number;
    coffeeComplete: number;
    retry11: number;
    stopFail: number;
    cupSensorTimeout: number;
    adminAction: number;
};

let parsedEntries: ParsedLogEntry[] = [];
let currentFileName = "";

export function initLocalLogAnalyzer() {
    const fileInput = getEl<HTMLInputElement>("logFileInput");
    const dropZone = getEl<HTMLElement>("dropZone");
    const keywordInput = getEl<HTMLInputElement>("keywordInput");
    const levelFilter = getEl<HTMLSelectElement>("levelFilter");
    const focusFilter = getEl<HTMLSelectElement>("focusFilter");
    const maxLines = getEl<HTMLSelectElement>("maxLines");
    const clearBtn = getEl<HTMLButtonElement>("clearBtn");

    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file) void loadFile(file);
    });

    dropZone?.addEventListener("dragover", event => {
        event.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone?.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone?.addEventListener("drop", event => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
        const file = event.dataTransfer?.files?.[0];
        if (file) void loadFile(file);
    });

    keywordInput?.addEventListener("input", render);
    levelFilter?.addEventListener("change", render);
    focusFilter?.addEventListener("change", render);
    maxLines?.addEventListener("change", render);

    clearBtn?.addEventListener("click", () => {
        parsedEntries = [];
        currentFileName = "";
        if (fileInput) fileInput.value = "";
        if (keywordInput) keywordInput.value = "";
        if (levelFilter) levelFilter.value = "all";
        if (focusFilter) focusFilter.value = "all";
        setText("fileName", "TXT 로그 파일을 선택하세요.");
        clearBtn.disabled = true;
        render();
    });

    render();
}

async function loadFile(file: File) {
    const text = await file.text();
    currentFileName = `${file.name} (${formatBytes(file.size)})`;
    parsedEntries = parseLogText(text);
    setText("fileName", currentFileName);

    const clearBtn = getEl<HTMLButtonElement>("clearBtn");
    if (clearBtn) clearBtn.disabled = false;

    render();
}

function parseLogText(text: string): ParsedLogEntry[] {
    const rawLines = text.split(/\r?\n/);
    const blocks: Array<{ start: number; end: number; raw: string }> = [];
    let current: { start: number; end: number; lines: string[] } | null = null;

    for (let index = 0; index < rawLines.length; index++) {
        const line = rawLines[index];
        const lineNumber = index + 1;
        if (!line.trim()) continue;

        const startsEntry = isLikelyEntryStart(line) || current === null;

        if (startsEntry) {
            if (current) {
                blocks.push({
                    start: current.start,
                    end: current.end,
                    raw: current.lines.join("\n")
                });
            }
            current = {start: lineNumber, end: lineNumber, lines: [line]};
            continue;
        }

        if (!current) continue;
        current.lines.push(line);
        current.end = lineNumber;
    }

    if (current) {
        blocks.push({
            start: current.start,
            end: current.end,
            raw: current.lines.join("\n")
        });
    }

    return blocks.map(block => parseEntry(block.raw, block.start, block.end));
}

function isLikelyEntryStart(line: string): boolean {
    if (parseTimestamp(line)) return true;
    if (/^\s*(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i.test(line)) return true;
    if (/^\[[^\]]+\]\s*(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\b/i.test(line)) return true;
    return false;
}

function parseEntry(raw: string, lineNumber: number, endLineNumber: number): ParsedLogEntry {
    return {
        lineNumber,
        endLineNumber,
        raw,
        normalizedMessage: normalizeMessage(raw),
        level: detectLevel(raw),
        timestamp: parseTimestamp(raw),
        durationMs: parseDurationMs(raw),
        httpStatus: parseHttpStatus(raw),
        url: parseUrl(raw),
        exception: parseException(raw),
        ids: parseIds(raw),
        modelTags: detectModelTags(raw)
    };
}

function detectLevel(text: string): LogLevel {
    if (/\b(error|fatal|exception|fail|failed|stacktrace)\b/i.test(text)) return "error";
    if (/\b(warn|warning)\b/i.test(text)) return "warn";
    if (/\b(info|notice)\b/i.test(text)) return "info";
    if (/\b(debug|trace|verbose)\b/i.test(text)) return "debug";
    return "unknown";
}

function parseTimestamp(text: string): Date | null {
    const match = text.match(
        /(\d{4}[-/.]\d{2}[-/.]\d{2})[ T](\d{2}:\d{2}:\d{2})(?:[.,](\d{1,6}))?/
    );
    if (!match) return null;

    const datePart = match[1].replace(/[/.]/g, "-");
    const millis = match[3] ? match[3].slice(0, 3).padEnd(3, "0") : "000";
    const date = new Date(`${datePart}T${match[2]}.${millis}`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function parseDurationMs(text: string): number | null {
    const durationMatch = text.match(/\b(?:duration|elapsed|took|latency|time|cost)\s*[=:]\s*(\d+(?:\.\d+)?)\s*(ms|s|sec|second|seconds)?\b/i);
    if (durationMatch) {
        const value = Number(durationMatch[1]);
        const unit = (durationMatch[2] || "ms").toLowerCase();
        return unit.startsWith("s") ? value * 1000 : value;
    }

    const trailingMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(ms|s|sec|second|seconds)\b/i);
    if (!trailingMatch) return null;

    const value = Number(trailingMatch[1]);
    const unit = trailingMatch[2].toLowerCase();
    return unit.startsWith("s") ? value * 1000 : value;
}

function parseHttpStatus(text: string): string | null {
    const explicit = text.match(/\b(?:status|statusCode|httpStatus)\s*[=:]\s*([1-5]\d{2})\b/i);
    if (explicit) return explicit[1];

    const generic = text.match(/\bHTTP\/\d(?:\.\d)?\s+([1-5]\d{2})\b/i);
    if (generic) return generic[1];

    const statusOnly = text.match(/\b([1-5]\d{2})\s+(?:GET|POST|PUT|PATCH|DELETE|HTTP|error|failed)\b/i);
    return statusOnly ? statusOnly[1] : null;
}

function parseUrl(text: string): string | null {
    const fullUrl = text.match(/https?:\/\/[^\s"'<>]+/i);
    if (fullUrl) return trimUrl(fullUrl[0]);

    const path = text.match(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+([/?][^\s"'<>]+)/i);
    if (path) return trimUrl(path[1]);

    const keyValue = text.match(/\b(?:url|uri|path|endpoint)\s*[=:]\s*([^\s"'<>]+)/i);
    return keyValue ? trimUrl(keyValue[1]) : null;
}

function parseException(text: string): string | null {
    const exception = text.match(/\b([A-Za-z_$][\w.$]*(?:Exception|Error))\b/);
    if (exception) return exception[1];

    const causedBy = text.match(/Caused by:\s*([A-Za-z_$][\w.$]+)/);
    return causedBy ? causedBy[1] : null;
}

function parseIds(text: string): string[] {
    const ids = new Set<string>();
    const regex = /\b([a-zA-Z][\w.-]*(?:Id|ID|No|Key|Code|Token|UUID|Trace|TraceId|RequestId|OrderId|UserId))\s*[=:]\s*([^\s,;"'<>]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        ids.add(`${match[1]}=${trimToken(match[2])}`);
    }

    return [...ids].slice(0, 8);
}

function detectModelTags(text: string): string[] {
    const tags = new Set<string>();

    if (/컵\s*센서.*time\s*out|컵\s*센서.*120\/\s*120|컵\s*센서.*invalid/i.test(text)) tags.add("컵센서 대기/타임아웃");
    if (/컵\s*추출이 완료|컵\s*투출|GoCupOut|컵\s*디스펜서/i.test(text)) tags.add("컵 투출 흐름");
    if (/얼음을 받아주세요|ice-time command response|출빙 요청이 완료|제빙기/i.test(text)) tags.add("얼음/물 출빙 흐름");
    if (/커피\s*정지\s*상태\s*감지\s*실패|머신 동작확인 타임아웃.*정지/i.test(text)) tags.add("커피 정지 감지 실패");
    if (/제조 명령 응답:\s*COFFEE|재조 명령\s*:\s*COFFEE|커피 추출 요청/i.test(text)) tags.add("커피 명령 흐름");
    if (/커피 추출 완료/i.test(text)) tags.add("커피 추출 완료");
    if (/\[RETRY\].*(?:시도\s*)?11\/11/i.test(text)) tags.add("11회 재시도 도달");
    if (/\[RETRY\].*(커피|시럽|가루차|컵)/i.test(text)) tags.add("제조 재시도");
    if (/시럽 투출 시도|가루차 투출 시도/i.test(text)) tags.add("비커피 재료 투출 문제");
    if (/어드민.*(음료|세척|전체 세척|요청)|관리자|원격/i.test(text)) tags.add("어드민/원격 조치");
    if (/제조완료 menu|주문 처리 완료/i.test(text)) tags.add("주문 정상 완료");
    if (/주문 처리 중 실패|전체 주문 처리 중 실패|\[ERROR\].*추출 실패|제조.*실패/i.test(text)) tags.add("주문/제조 실패");
    if (/FLUSH\d|SYFLU\d|세척 작업 완료|세척 시작/i.test(text)) tags.add("세척 흐름");
    if (/boilerFlowRate":0|coffeeSolValve":"OFF"|grinderComplete":"대기중"|autoOperationState":"커피"/i.test(text)) tags.add("머신 상태 스냅샷");

    return [...tags];
}

function normalizeMessage(text: string): string {
    return text
        .split("\n")[0]
        .replace(/\d{4}[-/.]\d{2}[-/.]\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,6})?/g, "{timestamp}")
        .replace(/https?:\/\/[^\s"'<>]+/gi, "{url}")
        .replace(/\b[0-9a-f]{8,}\b/gi, "{hex}")
        .replace(/\b\d+\b/g, "{number}")
        .replace(/\s+/g, " ")
        .trim();
}

function render() {
    const filtered = getFilteredEntries();
    renderSummary(filtered);
    renderAnalysis(filtered);
}

function getFilteredEntries() {
    const keyword = getEl<HTMLInputElement>("keywordInput")?.value.trim().toLowerCase() || "";
    const level = (getEl<HTMLSelectElement>("levelFilter")?.value || "all") as LogLevel | "all";
    const focus = (getEl<HTMLSelectElement>("focusFilter")?.value || "all") as FocusFilter;

    return parsedEntries.filter(entry => {
        const levelMatched = level === "all" || entry.level === level;
        const keywordMatched = !keyword || entry.raw.toLowerCase().includes(keyword);
        const focusMatched = matchesFocus(entry, focus);
        return levelMatched && keywordMatched && focusMatched;
    });
}

function matchesFocus(entry: ParsedLogEntry, focus: FocusFilter) {
    if (focus === "all") return true;
    if (focus === "problem") return entry.level === "error" || entry.level === "warn" || isBadHttpStatus(entry.httpStatus);
    if (focus === "machine") return entry.modelTags.length > 0;
    if (focus === "slow") return entry.durationMs !== null;
    if (focus === "http") return entry.httpStatus !== null || entry.url !== null;
    if (focus === "exception") return entry.exception !== null;
    return true;
}

function renderSummary(entries: ParsedLogEntry[]) {
    const summary = getEl<HTMLElement>("summaryGrid");
    if (!summary) return;

    const counts = countBy(entries, entry => entry.level);
    const firstTimestamp = findEdgeTimestamp(entries, "first");
    const lastTimestamp = findEdgeTimestamp(entries, "last");
    const slowest = getSlowEntries(entries, 1)[0];
    const modelIssues = entries.filter(entry => hasAnyTag(entry, [
        "컵센서 대기/타임아웃",
        "커피 정지 감지 실패",
        "11회 재시도 도달",
        "주문/제조 실패",
        "비커피 재료 투출 문제"
    ])).length;

    summary.innerHTML = [
        metricCard("필터 결과", `${entries.length.toLocaleString()}건`),
        metricCard("ERROR", String(counts.get("error") || 0), "level-error"),
        metricCard("WARN", String(counts.get("warn") || 0), "level-warn"),
        metricCard("제조/장비 이슈", String(modelIssues), modelIssues > 0 ? "level-error" : ""),
        metricCard("최장 소요", slowest ? formatDuration(slowest.durationMs) : "-"),
        metricCard("시간 범위", formatRange(firstTimestamp, lastTimestamp))
    ].join("");
}

function renderAnalysis(entries: ParsedLogEntry[]) {
    const grid = getEl<HTMLElement>("analysisGrid");
    if (!grid) return;

    if (parsedEntries.length === 0) {
        grid.innerHTML = emptyCard("분석 대기", "TXT 로그 파일을 선택하면 상세 분석 결과가 표시됩니다.");
        return;
    }

    if (entries.length === 0) {
        grid.innerHTML = emptyCard("검색 결과 없음", "현재 필터에 맞는 로그 항목이 없습니다.");
        return;
    }

    const max = Number(getEl<HTMLSelectElement>("maxLines")?.value || "50");
    const problemEntries = getProblemEntries(entries).slice(0, max);

    grid.innerHTML = [
        insightCard(entries),
        modelIncidentCard(entries),
        orderFlowCard(entries),
        rankCard("제조/장비 패턴 TOP 10", rankBy(flattenModelTags(entries), value => value, 10)),
        rankCard("레벨 분포", rankBy(entries, entry => entry.level.toUpperCase())),
        rankCard("시간대 분포", rankBy(entries.filter(entry => entry.timestamp), entry => formatHour(entry.timestamp))),
        rankCard("예외 TOP 10", rankBy(entries.filter(entry => entry.exception), entry => entry.exception || "UNKNOWN", 10)),
        rankCard("HTTP 상태 TOP 10", rankBy(entries.filter(entry => entry.httpStatus), entry => entry.httpStatus || "UNKNOWN", 10)),
        rankCard("URL/Endpoint TOP 10", rankBy(entries.filter(entry => entry.url), entry => entry.url || "UNKNOWN", 10)),
        rankCard("ID/키 TOP 10", rankBy(flattenIds(entries), value => value, 10)),
        rankCard("반복 메시지 TOP 10", rankBy(entries, entry => entry.normalizedMessage, 10)),
        slowCard(entries),
        burstCard(entries),
        lineCard(`문제 후보 ${problemEntries.length.toLocaleString()}건`, problemEntries),
        lineCard(`전체/필터 결과 미리보기 ${Math.min(entries.length, max).toLocaleString()}건`, entries.slice(0, max))
    ].join("");
}

function insightCard(entries: ParsedLogEntry[]) {
    const errors = entries.filter(entry => entry.level === "error");
    const warns = entries.filter(entry => entry.level === "warn");
    const badHttp = entries.filter(entry => isBadHttpStatus(entry.httpStatus));
    const topRepeated = rankBy(entries, entry => entry.normalizedMessage, 1)[0];
    const topException = rankBy(entries.filter(entry => entry.exception), entry => entry.exception || "UNKNOWN", 1)[0];
    const slowest = getSlowEntries(entries, 1)[0];
    const firstProblem = getProblemEntries(entries)[0];

    const insights = [
        `에러 비율: ${formatPercent(errors.length, entries.length)} (${errors.length.toLocaleString()}건)`,
        `경고 비율: ${formatPercent(warns.length, entries.length)} (${warns.length.toLocaleString()}건)`,
        `HTTP 4xx/5xx 비율: ${formatPercent(badHttp.length, entries.length)} (${badHttp.length.toLocaleString()}건)`,
        topException ? `가장 많은 예외: ${topException.label} (${topException.count.toLocaleString()}건)` : "예외명 추출 없음",
        slowest ? `가장 느린 항목: ${formatDuration(slowest.durationMs)} / ${formatLineRange(slowest)}` : "소요시간 추출 없음",
        topRepeated ? `최다 반복 메시지: ${topRepeated.count.toLocaleString()}회` : "반복 메시지 없음",
        firstProblem ? `첫 문제 후보: ${formatLineRange(firstProblem)}` : "문제 후보 없음"
    ];

    return `
        <section class="card span-2">
            <h2 class="card-title">원인 후보 요약</h2>
            <div class="rank-list">
                ${insights.map(item => `<div class="rank-row"><span>${escapeHtml(item)}</span></div>`).join("")}
            </div>
        </section>
    `;
}

function modelIncidentCard(entries: ParsedLogEntry[]) {
    const cupTimeout = countEntriesWithTag(entries, "컵센서 대기/타임아웃");
    const stopFail = countEntriesWithTag(entries, "커피 정지 감지 실패");
    const retry11 = countEntriesWithTag(entries, "11회 재시도 도달");
    const materialFail = countEntriesWithTag(entries, "비커피 재료 투출 문제");
    const adminAction = countEntriesWithTag(entries, "어드민/원격 조치");
    const cleanFlow = countEntriesWithTag(entries, "세척 흐름");
    const coffeeDone = countEntriesWithTag(entries, "커피 추출 완료");
    const orderDone = countEntriesWithTag(entries, "주문 정상 완료");

    const diagnosis = inferModelDiagnosis({cupTimeout, stopFail, retry11, materialFail, adminAction, cleanFlow, coffeeDone, orderDone});
    const rows = [
        ["컵센서 대기/타임아웃", cupTimeout],
        ["커피 정지 감지 실패", stopFail],
        ["11회 재시도 도달", retry11],
        ["시럽/가루차 투출 문제", materialFail],
        ["어드민/원격 조치", adminAction],
        ["세척 흐름", cleanFlow],
        ["커피 추출 완료", coffeeDone],
        ["주문 정상 완료", orderDone]
    ];

    return `
        <section class="card span-2">
            <h2 class="card-title">자판기 장애 패턴 요약</h2>
            <div class="diagnosis">${escapeHtml(diagnosis)}</div>
            <div class="rank-list">
                ${rows.map(([label, count]) => `
                    <div class="rank-row">
                        <span>${escapeHtml(label)}</span>
                        <span class="rank-count">${Number(count).toLocaleString()}</span>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}

function inferModelDiagnosis(counts: {
    cupTimeout: number;
    stopFail: number;
    retry11: number;
    materialFail: number;
    adminAction: number;
    cleanFlow: number;
    coffeeDone: number;
    orderDone: number;
}) {
    if (counts.cupTimeout > 0 && counts.stopFail === 0) {
        return "컵/얼음 이후 컵센서 대기에서 멈춘 패턴입니다. 실제 투출 상태와 컵센서 감지 상태를 우선 확인하세요.";
    }

    if (counts.stopFail > 0 && counts.retry11 > 0) {
        return "커피 명령 응답 후 머신 정지 상태 감지가 실패하며 재시도 한도에 도달한 패턴입니다. 제조 명령 통신보다 머신 상태 전환/제조부 동작 확인이 핵심입니다.";
    }

    if (counts.materialFail > 0 && counts.retry11 > 0) {
        return "시럽 또는 가루차 투출이 반복 재시도된 패턴입니다. 해당 재료 투출 모듈과 세척 이후 회복 여부를 함께 확인하세요.";
    }

    if (counts.adminAction > 0 || counts.cleanFlow > 0) {
        return counts.orderDone > 0
            ? "어드민 조치 또는 세척 이후 정상 완료 기록이 함께 보입니다. 조치 전후 주문을 비교하면 회복 시점을 잡을 수 있습니다."
            : "어드민 조치 또는 세척 기록이 있습니다. 직전 실패 주문과 직후 정상 주문을 이어서 확인하세요.";
    }

    if (counts.coffeeDone > 0 || counts.orderDone > 0) {
        return "주문/제조 완료 기록이 확인됩니다. 고객 증상과 다르면 실제 음료량 센싱이 로그에 남지 않는 물리적 문제 가능성을 분리해서 보세요.";
    }

    return "지금까지 정의한 자판기 장애 패턴은 뚜렷하게 잡히지 않았습니다. 키워드나 시간대를 좁혀 다시 확인하세요.";
}

function orderFlowCard(entries: ParsedLogEntry[]) {
    const flows = buildOrderFlows(entries).slice(-12).reverse();
    const body = flows.length
        ? flows.map(flow => {
            const statusClass = flow.result === "completed" ? "level-info" : flow.result === "failed" ? "level-error" : "level-warn";
            const tags = [
                flow.cupOk ? "컵완료" : "",
                flow.iceOk ? "얼음/물" : "",
                flow.coffeeCommandOk ? `COFFEE ${flow.coffeeCommandOk}` : "",
                flow.coffeeComplete ? `커피완료 ${flow.coffeeComplete}` : "",
                flow.retry11 ? `11회재시도 ${flow.retry11}` : "",
                flow.stopFail ? `정지감지실패 ${flow.stopFail}` : "",
                flow.cupSensorTimeout ? `컵센서타임아웃 ${flow.cupSensorTimeout}` : "",
                flow.adminAction ? `어드민 ${flow.adminAction}` : ""
            ].filter(Boolean).join(" / ");

            return `
                <div class="order-row">
                    <div>
                        <strong>${escapeHtml(flow.menuName)}</strong>
                        <span>${escapeHtml(`${formatTimestamp(flow.startTime)} ${flow.orderId} / menu ${flow.menuId}`)}</span>
                    </div>
                    <div class="${statusClass}">${escapeHtml(flow.result.toUpperCase())}</div>
                    <div>${escapeHtml(tags || "특이 이벤트 없음")}</div>
                    <div>${escapeHtml(`#${flow.startLine}-${flow.endLine}`)}</div>
                </div>
            `;
        }).join("")
        : `<div class="empty">주문 처리 시작 패턴을 찾지 못했습니다.</div>`;

    return `
        <section class="card wide">
            <h2 class="card-title">주문별 제조 흐름</h2>
            <div class="order-list">${body}</div>
        </section>
    `;
}

function buildOrderFlows(entries: ParsedLogEntry[]): OrderFlow[] {
    const flows: OrderFlow[] = [];
    let current: OrderFlow | null = null;

    entries.forEach(entry => {
        const start = entry.raw.match(/주문 처리 시작 \([^)]*\):\s*(.+?)\s*-\s*\[메뉴 ID:\s*(\d+),\s*주문 ID:\s*([^\]]+)\]/);

        if (start) {
            current = {
                startLine: entry.lineNumber,
                endLine: entry.endLineNumber,
                startTime: entry.timestamp,
                endTime: null,
                menuName: start[1].trim(),
                menuId: start[2],
                orderId: start[3],
                result: "incomplete",
                cupOk: false,
                iceOk: false,
                coffeeCommandOk: 0,
                coffeeComplete: 0,
                retry11: 0,
                stopFail: 0,
                cupSensorTimeout: 0,
                adminAction: 0
            };
            flows.push(current);
        }

        if (!current) return;

        current.endLine = entry.endLineNumber;
        current.endTime = entry.timestamp || current.endTime;

        if (entry.raw.includes("컵 추출이 완료")) current.cupOk = true;
        if (hasAnyTag(entry, ["얼음/물 출빙 흐름"])) current.iceOk = true;
        if (entry.raw.includes("제조 명령 응답: COFFEE")) current.coffeeCommandOk += 1;
        if (entry.raw.includes("커피 추출 완료")) current.coffeeComplete += 1;
        if (hasAnyTag(entry, ["11회 재시도 도달"])) current.retry11 += 1;
        if (hasAnyTag(entry, ["커피 정지 감지 실패"])) current.stopFail += 1;
        if (hasAnyTag(entry, ["컵센서 대기/타임아웃"])) current.cupSensorTimeout += 1;
        if (hasAnyTag(entry, ["어드민/원격 조치", "세척 흐름"])) current.adminAction += 1;
        if (hasAnyTag(entry, ["주문/제조 실패"])) current.result = "failed";

        const done = entry.raw.match(/주문 처리 완료 .*?\[메뉴 ID:\s*(\d+),\s*주문 ID:\s*([^\]]+)\]/);
        if (done && done[2] === current.orderId) {
            current.result = "completed";
            current.endTime = entry.timestamp;
            current.endLine = entry.endLineNumber;
            current = null;
        }
    });

    return flows;
}

function slowCard(entries: ParsedLogEntry[]) {
    const slowEntries = getSlowEntries(entries, 10);
    const body = slowEntries.length
        ? slowEntries.map(entry => `
            <div class="rank-row">
                <span>${escapeHtml(`${formatLineRange(entry)} ${entry.url || entry.normalizedMessage}`)}</span>
                <span class="rank-count">${escapeHtml(formatDuration(entry.durationMs))}</span>
            </div>
        `).join("")
        : `<div class="empty">소요시간 패턴을 찾지 못했습니다.</div>`;

    return `
        <section class="card">
            <h2 class="card-title">느린 요청 TOP 10</h2>
            <div class="rank-list">${body}</div>
        </section>
    `;
}

function burstCard(entries: ParsedLogEntry[]) {
    const buckets = rankBy(
        entries.filter(entry => entry.timestamp && (entry.level === "error" || entry.level === "warn")),
        entry => formatMinute(entry.timestamp),
        10
    );

    return rankCard("문제 급증 분 단위 TOP 10", buckets);
}

function rankCard(title: string, items: RankItem[]) {
    const max = Math.max(...items.map(item => item.count), 1);
    const body = items.length
        ? items.map(item => `
            <div class="rank-row">
                <span>${escapeHtml(item.label)}</span>
                <span class="rank-count">${item.count.toLocaleString()}</span>
            </div>
            <div class="bar"><span style="width:${Math.max(4, (item.count / max) * 100)}%"></span></div>
        `).join("")
        : `<div class="empty">데이터 없음</div>`;

    return `
        <section class="card">
            <h2 class="card-title">${escapeHtml(title)}</h2>
            <div class="rank-list">${body}</div>
        </section>
    `;
}

function lineCard(title: string, entries: ParsedLogEntry[]) {
    const body = entries.length
        ? entries.map(entry => `
            <div class="log-line">
                <div class="line-meta">
                    <span>${escapeHtml(formatLineRange(entry))}</span>
                    <span class="level-${entry.level}">${entry.level.toUpperCase()}</span>
                    <span>${escapeHtml(formatTimestamp(entry.timestamp))}</span>
                    ${entry.httpStatus ? `<span>HTTP ${escapeHtml(entry.httpStatus)}</span>` : ""}
                    ${entry.durationMs !== null ? `<span>${escapeHtml(formatDuration(entry.durationMs))}</span>` : ""}
                    ${entry.exception ? `<span>${escapeHtml(entry.exception)}</span>` : ""}
                </div>
                <div>${escapeHtml(entry.raw)}</div>
            </div>
        `).join("")
        : `<div class="empty">표시할 로그가 없습니다.</div>`;

    return `
        <section class="card wide">
            <h2 class="card-title">${escapeHtml(title)}</h2>
            <div class="line-list">${body}</div>
        </section>
    `;
}

function emptyCard(title: string, message: string) {
    return `
        <section class="card wide">
            <h2 class="card-title">${escapeHtml(title)}</h2>
            <div class="empty">${escapeHtml(message)}</div>
        </section>
    `;
}

function metricCard(label: string, value: string, valueClass = "") {
    return `
        <div class="card metric">
            <span>${escapeHtml(label)}</span>
            <strong class="${valueClass}">${escapeHtml(value)}</strong>
        </div>
    `;
}

function rankBy<T>(items: T[], getKey: (item: T) => string, limit = 5): RankItem[] {
    const counts = countBy(items, getKey);

    return [...counts.entries()]
        .map(([label, count]) => ({label, count}))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, limit);
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
    const counts = new Map<string, number>();

    items.forEach(item => {
        const key = getKey(item) || "UNKNOWN";
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return counts;
}

function getProblemEntries(entries: ParsedLogEntry[]) {
    return entries.filter(entry =>
        entry.level === "error" ||
        entry.level === "warn" ||
        entry.exception !== null ||
        isBadHttpStatus(entry.httpStatus) ||
        hasAnyTag(entry, [
            "컵센서 대기/타임아웃",
            "커피 정지 감지 실패",
            "11회 재시도 도달",
            "주문/제조 실패",
            "비커피 재료 투출 문제"
        ])
    );
}

function getSlowEntries(entries: ParsedLogEntry[], limit: number) {
    return entries
        .filter(entry => entry.durationMs !== null)
        .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
        .slice(0, limit);
}

function flattenIds(entries: ParsedLogEntry[]) {
    return entries.flatMap(entry => entry.ids);
}

function flattenModelTags(entries: ParsedLogEntry[]) {
    return entries.flatMap(entry => entry.modelTags);
}

function countEntriesWithTag(entries: ParsedLogEntry[], tag: string) {
    return entries.filter(entry => entry.modelTags.includes(tag)).length;
}

function hasAnyTag(entry: ParsedLogEntry, tags: string[]) {
    return tags.some(tag => entry.modelTags.includes(tag));
}

function isBadHttpStatus(status: string | null) {
    return status ? Number(status) >= 400 : false;
}

function findEdgeTimestamp(entries: ParsedLogEntry[], edge: "first" | "last") {
    const timestamps = entries
        .map(entry => entry.timestamp)
        .filter((value): value is Date => value !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    return edge === "first" ? timestamps[0] || null : timestamps[timestamps.length - 1] || null;
}

function formatRange(start: Date | null, end: Date | null) {
    if (!start || !end) return "-";
    if (start.getTime() === end.getTime()) return formatTimestamp(start);
    return `${formatTimestamp(start)} ~ ${formatTimestamp(end)}`;
}

function formatHour(date: Date | null) {
    return date ? `${String(date.getHours()).padStart(2, "0")}시` : "UNKNOWN";
}

function formatMinute(date: Date | null) {
    if (!date) return "UNKNOWN";
    return `${formatTimestamp(date).slice(0, 16)}`;
}

function formatTimestamp(date: Date | null) {
    if (!date) return "-";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDuration(value: number | null) {
    if (value === null) return "-";
    if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}ms`;
}

function formatPercent(value: number, total: number) {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatLineRange(entry: ParsedLogEntry) {
    return entry.lineNumber === entry.endLineNumber
        ? `#${entry.lineNumber}`
        : `#${entry.lineNumber}-${entry.endLineNumber}`;
}

function trimUrl(value: string) {
    return value.replace(/[),.;\]]+$/g, "");
}

function trimToken(value: string) {
    return value.replace(/[),.;\]]+$/g, "");
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function setText(id: string, text: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function getEl<T extends HTMLElement>(id: string) {
    return document.getElementById(id) as T | null;
}

function escapeHtml(value: unknown): string {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", initLocalLogAnalyzer);
