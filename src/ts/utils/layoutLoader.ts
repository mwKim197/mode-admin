export async function loadPartials() {
  // head 삽입
  const headRes = await fetch("/partials/head.html");
  const headHtml = await headRes.text();
  document.head.innerHTML += headHtml;

  // layout 요소 삽입
  const layoutRes = await fetch("/partials/layout.html");
  const layoutHtml = await layoutRes.text();
  const layoutDiv = document.createElement("div");
  layoutDiv.innerHTML = layoutHtml;
  document.body.prepend(layoutDiv);

  // header 삽입
  const headerRes = await fetch("/partials/header.html");
  const headerHtml = await headerRes.text();
  const headerWrap = document.createElement("div");
  headerWrap.innerHTML = headerHtml;
  document.body.prepend(headerWrap);

  // ✅ common.js 동적으로 로딩 (단, log.html 제외)
  const path = window.location.pathname;
  // layoutLoader.ts 내부 (loadPartials 함수 안)
  if (path !== "/html/log.html") {
    const jqueryScript = document.createElement("script");
    jqueryScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js";
    jqueryScript.onload = () => {
      const commonScript = document.createElement("script");
      commonScript.src = "/js/common.js";
      document.body.appendChild(commonScript);
    };
    document.head.appendChild(jqueryScript);
  }
}