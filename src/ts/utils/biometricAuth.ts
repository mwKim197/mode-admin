import { Capacitor } from "@capacitor/core";
import {
    AccessControl,
    NativeBiometric,
} from "@capgo/capacitor-native-biometric";
import {API_HOST} from "../config/apiConfig.ts";

const BIOMETRIC_SERVER = API_HOST;
const REFRESH_TOKEN_USERNAME = "refreshToken";

function isNativeApp() {
    return Capacitor.isNativePlatform();
}

export async function saveRefreshTokenToSecureStore(refreshToken?: string | null) {
    if (!isNativeApp() || !refreshToken) return;

    try {
        const availability = await NativeBiometric.isAvailable({useFallback: true});
        if (!availability.isAvailable) return;

        await NativeBiometric.setCredentials({
            server: BIOMETRIC_SERVER,
            username: REFRESH_TOKEN_USERNAME,
            password: refreshToken,
            accessControl: AccessControl.BIOMETRY_ANY,
        });
    } catch (error) {
        console.warn("생체 로그인 토큰 저장 실패:", error);
    }
}

export async function deleteSecureRefreshToken() {
    if (!isNativeApp()) return;

    try {
        await NativeBiometric.deleteCredentials({server: BIOMETRIC_SERVER});
    } catch (error) {
        console.warn("생체 로그인 토큰 삭제 실패:", error);
    }
}

export async function getRefreshTokenForAutoLogin(): Promise<string | null> {
    if (!isNativeApp()) {
        return localStorage.getItem("refreshToken");
    }

    try {
        const saved = await NativeBiometric.isCredentialsSaved({
            server: BIOMETRIC_SERVER,
        });

        if (saved.isSaved) {
            const credentials = await NativeBiometric.getSecureCredentials({
                server: BIOMETRIC_SERVER,
                reason: "관리자 자동 로그인을 위해 본인 인증이 필요합니다.",
                title: "생체 로그인",
                subtitle: "Model Admin",
                description: "저장된 로그인 정보를 사용합니다.",
                negativeButtonText: "취소",
            });

            if (credentials.username === REFRESH_TOKEN_USERNAME) {
                localStorage.setItem("refreshToken", credentials.password);
                return credentials.password;
            }
        }
    } catch (error) {
        console.warn("생체 로그인 인증 실패 또는 취소:", error);
        return null;
    }

    return localStorage.getItem("refreshToken");
}
