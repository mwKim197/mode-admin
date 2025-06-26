// ts/api/machineApi.ts
export async function fetchMachine(endpoint: string, options: RequestInit = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                ...(options.headers || {}),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorMsg = `⚠️ 머신 API 오류: ${response.status}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error: any) {
        console.error("❌ 머신 API 호출 실패:", error.message);
        throw error;
    }
}
