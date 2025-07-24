import{f}from"./main-CaxVcynr.js";function I(){console.log("✅ register.ts 로드됨");const r=document.getElementById("register-form");if(!r){console.error("❌ 회원가입 폼을 찾을 수 없음");return}r.addEventListener("submit",async n=>{n.preventDefault();const e=document.getElementById("adminId").value.trim(),t=document.getElementById("password").value.trim(),s=document.getElementById("number").value.trim(),a=document.getElementById("confirmPassword").value.trim(),c=document.getElementById("privacyAgree").checked,m=document.getElementById("kakaoAgree").checked,u=`
        - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등
        - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등
        - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)
        - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)
        - 동의 거부 시 서비스 이용 제한 가능
        `,g=`
        - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보
        - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등
        - 보유 기간: 동의 철회 시까지
        - 동의는 선택 사항이며, 미동의해도 서비스 이용에 제한은 없습니다.
        `;if(!e||!t||!a||!s){alert("⚠️ 모든 필드를 입력해주세요.");return}if(t!==a){alert("⚠️ 비밀번호가 일치하지 않습니다.");return}if(t.length<6){alert("⚠️ 비밀번호는 최소 6자리 이상이어야 합니다.");return}if(!c){alert("⚠️ 개인정보 수집 및 이용에 동의해주세요.");return}try{const o=await f("/model_admin_user?func=register-admin",{method:"POST",body:JSON.stringify({adminId:e,password:t,number:s,privacyAgree:c,privacyContent:u,kakaoAgree:m,kakaoContent:g,agreedAt:new Date().toISOString()}),mode:"cors"}),y=await o.json();o.ok?(console.log("✅ 회원가입 성공 → 로그인 페이지로 이동"),alert("✅ 회원가입 성공! 로그인 페이지로 이동합니다."),window.location.href="/html/log.html"):alert(y.message||"회원가입 실패. 다시 시도하세요.")}catch(o){console.error("❌ 회원가입 오류:",o),alert("서버 오류가 발생했습니다. 다시 시도하세요.")}});const d={privacy:{title:"개인정보 수집 및 이용 동의서",body:`
      - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등<br/>
      - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등<br/>
      - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)<br/>
      - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)<br/>
      - 동의 거부 시 서비스 이용 제한 가능
      `},kakao:{title:"카카오톡 수신 동의 안내",body:`
      - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보<br/>
      - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등<br/>
      - 보유 기간: 동의 철회 시까지<br/>
      - 동의는 선택 사항이며, 미동의해도 서비스 이용에 제한은 없습니다.
      `}};function l(n){const e=document.getElementById("modal-content"),t=document.getElementById("modal-backdrop");document.getElementById("modal-title").innerText=d[n].title,document.getElementById("modal-body").innerHTML=d[n].body,e==null||e.classList.remove("hidden"),t==null||t.classList.remove("hidden")}function i(){var n,e;(n=document.getElementById("modal-content"))==null||n.classList.add("hidden"),(e=document.getElementById("modal-backdrop"))==null||e.classList.add("hidden")}window.openModal=l,window.closeModal=i}export{I as initRegister};
