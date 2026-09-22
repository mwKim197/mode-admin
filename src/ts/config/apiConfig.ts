const requireUrl = (name: string, value: string | undefined): string => {
    const normalized = value?.trim().replace(/\/+$/, "");
    if (!normalized) {
        throw new Error(`${name} is not configured`);
    }
    return normalized;
};

export const API_BASE_URL = requireUrl(
    "VITE_API_BASE_URL",
    import.meta.env.VITE_API_BASE_URL,
);

export const APP_BASE_URL = requireUrl(
    "VITE_APP_BASE_URL",
    import.meta.env.VITE_APP_BASE_URL,
);

export const IMAGE_BASE_URL = requireUrl(
    "VITE_IMAGE_BASE_URL",
    import.meta.env.VITE_IMAGE_BASE_URL,
);

export const API_HOST = new URL(API_BASE_URL).host;
