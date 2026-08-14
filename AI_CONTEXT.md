# AI Context for `mode-admin`

This document is a compact project map for AI agents working on this repo.
Read it before editing code.

## Project Summary

`mode-admin` is a Vite + TypeScript multi-page admin web app for the Model kiosk
platform. It manages stores, menus, products, coupons, mileage/points, sales,
notices, franchises, admin permissions, device commands, and machine inventory.

It is primarily a browser frontend, with a Capacitor Android wrapper added for
mobile app testing. Backend APIs are hosted at:

```text
https://api.narrowroad-model.com
```

The project builds static files into `dist/` and deploys them to S3/CloudFront.

## Local Repo

- Local path: `C:\Users\perop\WebstormProjects\mode-admin`
- Current branch seen locally: `master`
- Package name: `mode-admin`
- App type: Vite 6 + TypeScript 5, ESM
- Main entry: `src/main.ts`
- HTML pages: `html/*.html`
- Build output: `dist/`
- Capacitor config: `capacitor.config.ts`
- Capacitor webDir: `dist`
- Android native project: `android/`

## Commands

Use `npm.cmd` in PowerShell.

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

Capacitor Android commands:

```powershell
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```

Debug APK build from PowerShell:

```powershell
cd android
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat assembleDebug
```

Debug APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Verified locally:

```powershell
npm.cmd run build
```

Build succeeds. It runs:

```text
tsc && vite build
```

Current build warnings:

- `html/log.html` includes `../public/js/jquery-3.6.0.js` without `type="module"`, so Vite cannot bundle that script.
- `deviceManage.ts` is both statically and dynamically imported by `main.ts`, so Vite warns it cannot split that module into a separate chunk.

Android debug APK build note:

- Capacitor/Android Gradle currently requires Java 21. The local terminal may
  default to Java 17, which causes `invalid source release: 21`.
- Use Android Studio's bundled JBR:
  `C:\Program Files\Android\Android Studio\jbr`.

## Deployment

GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

On push to `master`, it deploys `./dist/` to:

```text
s3://zeroadmin.kr
```

Then invalidates CloudFront distribution:

```text
E2F4R34LX88V05
```

README says not to push directly to `master` for regular work; use feature
branches such as `feature/name-task`.

## Capacitor Android App

Capacitor has been added to wrap the existing Vite multi-page app.

Files and settings:

- `capacitor.config.ts`
  - `appId`: `com.narrowroad.model.admin`
  - `appName`: `Model Admin`
  - `webDir`: `dist`
- `android/`
  - Generated Android native project.
- `package.json`
  - `@capacitor/core`
  - `@capacitor/android`
  - `@capacitor/cli`
  - `@capgo/capacitor-native-biometric`

Important rules:

- Keep the existing web build/deploy flow unchanged.
- Do not edit `dist/` manually.
- Run `npm.cmd run build` before `npx.cmd cap sync android`.
- `index.html` is included in Vite inputs and routes to `/html/log.html`, so
  Capacitor has a valid app entry point.
- Android Studio should open the `android/` project for running/emulator work.
- iOS can be added with the same webDir model, but actual iOS build/test
  requires macOS + Xcode. Add `NSFaceIDUsageDescription` to iOS `Info.plist`
  before using Face ID.

## App Architecture

This is not a single-page router app. It is a Vite multi-page app:

- Every page is an HTML file under `html/`.
- `vite.config.ts` declares many HTML entry points in `build.rollupOptions.input`.
- Shared page bootstrapping lives in `src/main.ts`.
- `src/main.ts` checks `window.location.pathname` and dynamically imports the page module for that path.

Examples:

- `/html/log.html` -> `src/ts/page/login.ts`
- `/html/home.html` -> `src/ts/page/home.ts`
- `/html/product.html` -> `src/ts/page/product.ts`
- `/html/product-detail.html` -> `src/ts/page/productDetail.ts`
- `/html/product-add.html` -> `src/ts/page/productAdd.ts`
- `/html/sales.html` -> `src/ts/page/sales.ts`
- `/html/deviceManage.html` -> `src/ts/page/deviceManage.ts`
- `/html/normalSet.html` -> `src/ts/page/normalSet.ts`
- `/html/point.html` -> `src/ts/page/point.ts`
- `/html/couponList.html` -> `src/ts/page/couponList.ts`
- `/html/couponDetail.html` -> `src/ts/page/couponDetail.ts`
- `/html/menuMerge.html` -> `src/ts/page/menuMerge.ts`
- `/html/categoryAndMenuMerge.html` -> `src/ts/page/categoryAndMenuMerge.ts`
- `/html/adminHome.html` -> `src/ts/page/adminHome.ts`
- `/html/franchiseHome.html` -> `src/ts/page/franchiseHome.ts`
- `/html/adminLog.html` -> `src/ts/page/adminLog.ts`

## Main Bootstrap Flow

`src/main.ts` does most global initialization:

1. Imports global CSS.
2. Exposes global helpers:
   - `window.showLoading`
   - `window.hideLoading`
   - `window.showToast`
   - `window.sendMachineCommand`
   - `window.Choices`
3. Applies impersonation token from `impersonate_token` URL param into `sessionStorage`.
4. On `DOMContentLoaded`:
   - Attempts auto-login from refresh token when needed.
   - Calls `checkUserAccess`.
   - Calls `loadPartials` for shared layout.
   - Binds global machine command events.
   - Loads admin user info with `getUserData`.
   - Loads current store/user info with `getUserInfo`.
   - Adjusts logo home link by user grade.
   - Renders side menu by grade and store options.
   - Dynamically imports the page module matching the current path.
5. On `load`, makes `document.body` visible.

## Auth And User State

Important files:

- `src/ts/api/api.ts`
- `src/ts/api/apiHelpers.ts`
- `src/ts/common/auth.ts`
- `src/ts/common/userAuth.ts`
- `src/ts/utils/userStorage.ts`
- `src/ts/page/login.ts`

Token storage:

- `accessToken`: `sessionStorage` or `localStorage`
- `refreshToken`: `localStorage`
- Capacitor app refresh token: also saved to the app secure store via
  `@capgo/capacitor-native-biometric`
- Impersonation mode: `sessionStorage.impersonationMode === "true"`
- Store/user info: `localStorage.userInfo`

Native biometric auto-login:

- Utility file: `src/ts/utils/biometricAuth.ts`
- On web, refresh token behavior stays compatible with existing `localStorage`.
- On Capacitor native platforms, login success stores the refresh token in
  Android Keystore / iOS Keychain using:
  `NativeBiometric.setCredentials(..., accessControl: BIOMETRY_ANY)`.
- On app start/login page entry, saved credentials are read through
  `NativeBiometric.getSecureCredentials()`, which prompts biometric/device
  authentication.
- The retrieved refresh token is then used with
  `/model_admin_login?func=refresh` to get a new access token.
- Biometric auth is a local convenience gate, not server-side identity proof.

`fetchWithAuth(endpoint, options, showLoading)`:

- Adds `Authorization: Bearer <accessToken>`.
- Adds `Content-Type: application/json`.
- Calls `window.showLoading` / `window.hideLoading` unless disabled.
- If token is missing or expired, attempts refresh via `bootstrapAuth`.
- On auth failure, calls `logout`.

`apiHelpers.ts` wraps `fetchWithAuth`:

- `apiGet`
- `apiPost`
- `apiPut`
- `apiDelete`

## User Grades / Permissions

Known grades:

- `1`: top/admin manager
- `2`: operations/admin manager
- `3`: franchise manager
- `4`: normal store user

`src/ts/common/auth.ts` contains route access rules in `pageAccess`.

Side menu is built in `src/main.ts`:

- Admin users get admin menu.
- Franchise users get franchise menu.
- Store users get general menu.
- Store options can insert `point`, `coupon`, and shopping mall links.

Store switching / impersonation:

- Admin/franchise pages call `/model_admin_login?func=impersonate-store`.
- The returned token can be passed as `impersonate_token` in the URL.
- `main.ts` stores it in `sessionStorage.accessToken`.

## Important Directories

- `html/`
  - Static HTML entry pages.
  - Vite build inputs are listed in `vite.config.ts`.

- `src/main.ts`
  - Global bootstrap, auth, side menu, dynamic page module loading.

- `src/ts/page/`
  - Page-specific modules.
  - Most modules export `initXxx()` or a similarly named function called by `main.ts`.

- `src/ts/api/`
  - Authenticated fetch helpers and machine fetch helper.

- `src/ts/common/`
  - Auth and user info helpers.

- `src/ts/utils/`
  - Pagination, local user storage, image upload, validation, layout loading, barcode helpers.

- `src/ts/types/`
  - TypeScript interfaces for users, products, points, inventory, common types.

- `src/css/`
  - Page/global CSS files.

- `public/`
  - Static assets copied/served by Vite.

- `postman/`
  - API test collections and environment template.

- `scripts/postman-to-node/`
  - Node runner for selected Postman collection requests.

## Major Pages

### Login

Files:

- `html/log.html`
- `src/ts/page/login.ts`

Responsibilities:

- Admin login.
- Kakao login.
- Token save/refresh bootstrap.
- User/store context setup after login.

### Home / Dashboards

Files:

- `html/home.html`
- `html/adminHome.html`
- `html/franchiseHome.html`
- `src/ts/page/home.ts`
- `src/ts/page/adminHome.ts`
- `src/ts/page/franchiseHome.ts`

Responsibilities:

- Store/admin/franchise landing pages.
- Sales summaries, notices, store lists, impersonation into stores.

### Products / Menus

Files:

- `html/product.html`
- `html/product-detail.html`
- `html/product-add.html`
- `src/ts/page/product.ts`
- `src/ts/page/productDetail.ts`
- `src/ts/page/productAdd.ts`
- `src/ts/form/renderProductForm.ts`
- `src/ts/components/ItemBlock.ts`

Responsibilities:

- Menu/product list.
- Product add/edit.
- Image upload.
- Barcode scan/claim flow.
- Machine test actions from products.

Backend endpoints include:

- `/model_admin_menu?func=get-all-menu`
- `/model_admin_menu?func=get-menu-by-id`
- `/model_admin_menu?func=set-new-menu`
- `/model_admin_menu?func=put-update-menu`
- `/model_admin_menu?func=bulk-update-or-delete`
- `/model_barcode_scan?func=barcode-claim-latest`
- `/model_machine_controll`

### Sales

Files:

- `html/sales.html`
- `src/ts/page/sales.ts`

Responsibilities:

- Sales summary.
- Menu statistics.
- Payment history.
- Date/detail filters.
- Excel download.

Endpoints include:

- `/model_payment?func=get-payment`
- `/model_payment?func=get-menu-statistics`
- `/model_payment?func=get-payment-excel`
- `/model_payment?func=get-menu-statistics-excel`

### Device / Machine Management

Files:

- `html/deviceManage.html`
- `src/ts/page/deviceManage.ts`
- `src/ts/api/machineApi.ts`

Responsibilities:

- Machine command controls.
- Inventory/runtime display.
- Ingredient/cup refill state.
- Draft selected refill items in `localStorage`.
- Sends machine control and inventory refill commands.

Important functions:

- `initDeviceManage`
- `sendMachineCommand`
- `sendRefillInventory`

Endpoints include:

- `/model_machine_registry?func=get-machine-status`
- `/model_machine_controll`
- `/model_inventory_calculate?func=get-runtime`
- `/model_inventory_calculate?func=refill-inventory`

`main.ts` also binds global `[data-func]` and `[data-type][data-value]` machine buttons.

### Normal Settings

Files:

- `html/normalSet.html`
- `src/ts/page/normalSet.ts`

Responsibilities:

- Store settings.
- Category settings.
- Mileage/coupon/options.
- Password update.
- Inventory config/runtime settings.
- File/image uploads.
- Machine control side effects for some setting changes.

This is one of the largest and riskiest page modules.

### Mileage / Points

Files:

- `html/point.html`
- `src/ts/page/point.ts`

Responsibilities:

- Mileage list/search.
- Add/update/delete mileage.
- Mileage history.
- Phone formatting helper.

Endpoints include:

- `/model_admin_mileage?func=mileage`
- `/model_admin_mileage?func=mileage-add`
- `/model_admin_mileage?func=mileage-update`
- `/model_admin_mileage?func=mileage-delete`
- `/model_admin_mileage?func=mileage-history`

### Coupons

Files:

- `html/couponList.html`
- `html/couponDetail.html`
- `src/ts/page/couponList.ts`
- `src/ts/page/couponDetail.ts`

Responsibilities:

- Coupon listing/search/detail.
- Coupon issue/create.
- Coupon barcode rendering/printing/screenshot helpers.
- Product/menu lookup for coupon binding.

Endpoints include:

- `/model_coupon?func=coupon`
- `/model_coupon?func=couponDetail`
- `/model_coupon?func=setCoupon`
- `/model_admin_menu?func=get-menu-by-id`

### Notices / Content

Files:

- `html/notice.html`
- `html/noticeList.html`
- `html/noticeDetail.html`
- `src/ts/page/notice.ts`
- `src/ts/page/noticeList.ts`
- `src/ts/page/noticeDetail.ts`

Responsibilities:

- Admin notices and homepage content.
- Content type variants via query string, such as admin/news/machine/store.
- Uses SunEditor.

Endpoints include:

- `/model_home_page`
- `/model_admin_notice`

### Franchise / Permissions / Admin Accounts

Files:

- `html/franchise.html`
- `html/empowerment.html`
- `html/adminEmpowerment.html`
- `html/register.html`
- `html/user-register.html`
- `src/ts/page/franchise.ts`
- `src/ts/page/empowerment.ts`
- `src/ts/page/adminEmpowerment.ts`
- `src/ts/page/register.ts`
- `src/ts/page/user-register.ts`

Responsibilities:

- Franchise CRUD.
- Admin account creation.
- Admin permission assignment.
- Store account creation.
- Impersonation into stores.

Endpoints include:

- `/model_admin_franchise`
- `/model_admin_user`
- `/model_admin_login?func=impersonate-store`
- `/model_new_store`

### Menu Copy / Merge

Files:

- `html/menuMerge.html`
- `html/categoryAndMenuMerge.html`
- `src/ts/page/menuMerge.ts`
- `src/ts/page/categoryAndMenuMerge.ts`

Responsibilities:

- Copy selected menu items between stores.
- Copy category + menu sets.
- Store/franchise scoped selection.

Endpoints include:

- `/model_user_setting?func=get-users`
- `/model_admin_franchise?func=list-stores-summary`
- `/model_admin_menu?func=duplicate-selected`
- `/model_admin_menu?func=duplicate-categories-and-menu`

## Backend API Style

Most endpoints use API Gateway/Lambda style query parameters:

```text
/model_admin_menu?func=get-all-menu
/model_user_setting?func=get-user&userId=...
/model_payment?func=get-payment
```

Most calls go through:

```ts
apiGet("/path?func=...")
apiPost("/path?func=...", body)
apiPut("/path?func=...", body)
apiDelete("/path?func=...")
```

These add auth automatically. Direct `fetch` exists in login and a few special flows.

## Static Assets / Libraries

Dependencies:

- `choices.js`: select/dropdown UI
- `suneditor`: rich text editor
- `html2canvas`: coupon/image capture
- `jsbarcode`: barcode rendering
- `jwt-decode`: token decoding
- `@aws-sdk/client-s3`: S3 interactions, likely for direct upload helpers
- `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`: Capacitor app wrapper
- `@capgo/capacitor-native-biometric`: native biometric prompt and secure credential storage

Global exposure:

- `window.Choices = Choices`

## Testing / API Collections

There is no unit test script in `package.json`.

Postman collections:

- `postman/login.collection.json`
- `postman/modelUser.collection.json`
- `postman/adminControll.collection.json`
- `postman/env.template.json`

Runner:

```text
scripts/postman-to-node/run.js
```

Example from `README_TESTING.md`:

```powershell
node ./scripts/postman-to-node/run.js --collection login --req "admin-login"
node ./scripts/postman-to-node/run.js --collection modelUser --req "get-users"
```

Sensitive values should come from environment variables, not committed files.

## Known Sharp Edges

- Many Korean comments and strings appear mojibake/garbled in the current checkout.
  Be very careful editing adjacent user-facing text.
- `src/main.ts` is a large global bootstrap and navigation coordinator.
- `normalSet.ts`, `sales.ts`, and `couponList.ts` are large stateful page modules.
- `deviceManage.ts` is both imported statically and dynamically by `main.ts`, producing a Vite warning.
- `log.html` has a non-module jQuery script warning during build.
- This app relies on production API endpoints by default; local dev can mutate real data if credentials are valid.
- Route permissions are hardcoded in `src/ts/common/auth.ts`.
- Side menu behavior is hardcoded in `src/main.ts`.
- HTML entry pages must be listed in `vite.config.ts` to be included in production build.
- `dist/` is generated output. Do not edit it manually.
- Android native assets are generated from `dist/` by `npx.cmd cap sync android`;
  do not edit `android/app/src/main/assets/public` manually.

## How To Approach Changes

For a page behavior change:

1. Find the HTML file under `html/`.
2. Find the matching page module in `src/ts/page/`.
3. Confirm that `src/main.ts` imports/initializes it for that path.
4. Check API calls in the page module.
5. Prefer `apiHelpers.ts` unless the flow is login/public/no-auth.

For auth/permission changes:

1. Check `src/ts/common/auth.ts`.
2. Check menu construction in `src/main.ts`.
3. Check login flow in `src/ts/page/login.ts`.

For machine/device changes:

1. Check `src/ts/page/deviceManage.ts`.
2. Check global event binding in `src/main.ts`.
3. Check endpoints `/model_machine_registry`, `/model_machine_controll`, and `/model_inventory_calculate`.

For menu/product changes:

1. Check `src/ts/page/product.ts`.
2. Check `src/ts/page/productAdd.ts`.
3. Check `src/ts/page/productDetail.ts`.
4. Check `src/ts/form/renderProductForm.ts`.
5. Check validation in `src/ts/utils/validation.ts`.

For deployment issues:

1. Run `npm.cmd run build`.
2. Check `vite.config.ts` for the HTML entry.
3. Check `.github/workflows/deploy.yml`.

## Suggested Prompt For Future AI Sessions

```text
Read AI_CONTEXT.md first. Work in C:\Users\perop\WebstormProjects\mode-admin.
This is a Vite + TypeScript multi-page admin frontend for the Model kiosk
platform. Main bootstrap is src/main.ts. HTML pages live in html/ and are mapped
in vite.config.ts. Backend API base is https://api.narrowroad-model.com. Keep
changes page-scoped when possible, use apiHelpers for authenticated API calls,
and run npm.cmd run build before finishing.
```
