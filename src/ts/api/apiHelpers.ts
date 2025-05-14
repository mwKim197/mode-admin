import { fetchWithAuth } from "./api"; // 너의 기존 fetchWithAuth

export const apiDelete = async (url: string) => {
    return await fetchWithAuth(url, { method: "DELETE" });
};

export const apiGet = async (url: string) => {
    return await fetchWithAuth(url, { method: "GET" });
};

export const apiPost = async (url: string, data: any) => {
    return await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const apiPut = async (url: string, data: any) => {
    return await fetchWithAuth(url, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};
