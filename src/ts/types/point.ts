export type PointItem = {
    password: string;
    mileageNo: string;
    userId: string;
    uniqueMileageNo: string;
    timestamp: string; // 나중에 필요하면 Date로 변환 가능
    tel: string;
    amount: number;
    note: string;
}

export interface MileageHistoryItem {
    userId: string;
    uniqueMileageNo_timestamp: string; // PK
    timestamp: string;                 // ISO 날짜 문자열
    points: number;                    // 증감된 포인트 (예: -15)
    amount: number;                    // 변경 후 보유 포인트
    totalAmt: number;                  // 결제 금액
    type: string;                      // 예: 'use' 등
    note?: string;                     // 메모 (선택)
}

// 서버페이징용
export interface PageKey {
    userId: string;
    uniqueMileageNo_timestamp: string;
}

// 서버페이징용
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    lastEvaluatedKey?: string | null;
    pageKeys?: string | null;
}

// 서버페이징용
export interface PaginateOptions<T> {
    data: PaginatedResult<T>;
    currentPage: number;
    limit: number;
    onPageChange: (pageKey: PageKey | null, page: number) => void;
    containerId: string;
}

// 서버페이징용