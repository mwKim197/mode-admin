export type AdminUserInfo = {
    adminId: string;
    name: string;
    grade: number;
    franchiseId?: string;
    kakaoId?: string;
    createdAt?: string;
    userId?: string;      // 단일 연결 사용자
    userIds?: string[];   // 다중 연결 사용자 목록
};

export type DecodedToken = {
    adminId: string;
    grade: number;
    sessionId: string;
    iat: number;
    exp: number;
}