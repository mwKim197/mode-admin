import {defineConfig} from "vite";
import {resolve, dirname} from "path"; // ✅ 여기서 dirname도 import 해줘야 함
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({

    base: "./", // ✅ 경로를 상대 경로로 설정 (필수!)
    optimizeDeps: {
        include: ["suneditor"],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true, // ✅ CommonJS 패키지를 ESM으로 변환
        },
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"), // 기본 페이지
                home: resolve(__dirname, "html/home.html"), // 사용자 기본페이지
                login: resolve(__dirname, "html/log.html"), // 기본 페이지
                dashboard: resolve(__dirname, "html/dashboard.html"), // 추가: 데시보드
                kakao: resolve(__dirname, "html/kakao-callback.html"), // 추가: 카카오 콜백
                account: resolve(__dirname, "html/link-account.html"), // 추가: 연동
                notice: resolve(__dirname, "html/01.notice.html"), // ✅ 공지 페이지
                noticeEdit: resolve(__dirname, "html/01.notice-edit.html"), // ✅ 공지 등록
                adminNotice: resolve(__dirname, "html/notice.html"), // ✅ 관리자 공지 등록
                empowerment: resolve(__dirname, "html/empowerment.html"), // 추가: 권한관리
                register: resolve(__dirname, "html/register.html"), // 추가: 회원가입 페이지
                point: resolve(__dirname, "html/point.html"), // 추가: 포인트(마일리지) 페이지
                product: resolve(__dirname, "html/product.html"), // 추가: 상품 목록 페이지
                productDetail: resolve(__dirname, "html/product-detail.html"), // 추가: 상품 상세 페이지
                productAdd: resolve(__dirname, "html/product-add.html"), // 추가: 상품 등록 페이지
                franchise: resolve(__dirname, "html/franchise_dashboard.html"), // 추가: 프렌차이즈 메인 페이지
                store: resolve(__dirname, "html/store_dashboard.html"), // 추가: 회원 메인 페이지
                sales: resolve(__dirname, "html/sales.html"), // 추가: 매출 페이지
                normalSet: resolve(__dirname, "html/normalSet.html"), // 추가: 회원 기본정보
                deviceManage: resolve(__dirname, "html/deviceManage.html"), // 추가: 회원 기본정보
                couponList: resolve(__dirname, "html/couponList.html"), // 추가: 쿠폰목록 페이지
                couponDetail: resolve(__dirname, "html/couponDetail.html"), // 추가: 쿠폰상세 페이지
                noticeList: resolve(__dirname, "html/noticeList.html"), // 추가: 공지사항목록 페이지
                noticeDetail: resolve(__dirname, "html/noticeDetail.html"), // 추가: 공지사항 페이지
                menuMerge: resolve(__dirname, "html/menuMerge.html"), // 메뉴 병합
                userRegister: resolve(__dirname, "html/user-register.html"), // 매장계정생성
                // 다른 html들도 여기에 추가 가능
            },
        },
    },
});
