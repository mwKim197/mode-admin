import{h as b}from"./main-DVqWtZWP.js";function p(){console.log("✅ register.ts 로드됨");const l=document.getElementById("register-form");if(!l){console.error("❌ 회원가입 폼을 찾을 수 없음");return}l.addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("adminId").value.trim(),o=document.getElementById("password").value.trim(),n=document.getElementById("number").value.trim(),r=document.getElementById("confirmPassword").value.trim(),a=document.getElementById("privacyAgree").checked,i=document.getElementById("kakaoAgree").checked,u=`
        - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등
        - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등
        - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)
        - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)
        - 동의 거부 시 서비스 이용 제한 가능
        `,y=`
        - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보
        - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등
        - 보유 기간: 동의 철회 시까지
        - 동의는 선택 사항이며, 미동의해도 서비스 이용에 제한은 없습니다.
        `;if(!t||!o||!r||!n){alert("⚠️ 모든 필드를 입력해주세요.");return}if(o!==r){alert("⚠️ 비밀번호가 일치하지 않습니다.");return}if(o.length<6){alert("⚠️ 비밀번호는 최소 6자리 이상이어야 합니다.");return}if(!a){alert("⚠️ 개인정보 수집 및 이용에 동의해주세요.");return}try{const d=await b("/model_admin_user?func=register-admin",{method:"POST",body:JSON.stringify({adminId:t,password:o,number:n,privacyAgree:a,privacyContent:u,kakaoAgree:i,kakaoContent:y,agreedAt:new Date().toISOString()}),mode:"cors"}),g=await d.json();d.ok?(console.log("✅ 회원가입 성공 → 로그인 페이지로 이동"),alert("✅ 회원가입 성공! 로그인 페이지로 이동합니다."),window.location.href="/html/log.html"):alert(g.message||"회원가입 실패. 다시 시도하세요.")}catch(d){console.error("❌ 회원가입 오류:",d),alert("서버 오류가 발생했습니다. 다시 시도하세요.")}});const c={privacy:{title:"개인정보 수집 및 이용 동의서",body:`
      - 수집 항목: 성명, 전화번호, 아이디, 비밀번호, 결제정보 등<br/>
      - 이용 목적: 회원관리, 서비스 제공, 카카오 알림톡 발송 등<br/>
      - 보유 기간: 이용 종료 후 5년 보관 (관련 법령에 따름)<br/>
      - 제3자 제공: 없음 (단, 결제/배송 등 서비스 제공 목적 위탁 가능)<br/>
      - 동의 거부 시 서비스 이용 제한 가능
      `},kakao:{title:"카카오톡 수신 동의 안내",body:`
      - 수신 항목: 서비스 안내, 마케팅 및 이벤트 정보<br/>
      - 수신 방법: 카카오 알림톡, 카카오 채널 메시지 등<br/>
      - 보유 기간: 동의 철회 시까지<br/>
      - 동의는 선택 사항이며, 미동의해도 <br/>서비스 이용에 제한은 없습니다.
      `}};function s(e){const t=document.getElementById("modal-backdrop"),o=document.getElementById("modal-content"),n=document.getElementById("modal-title"),r=document.getElementById("modal-body");t.style.display="flex",o.style.display="flex",n.innerText=c[e].title,r.innerHTML=c[e].body}function m(){const e=document.getElementById("modal-backdrop"),t=document.getElementById("modal-content");e.style.display="none",t.style.display="none"}window.openModal=s,window.closeModal=m}export{p as initRegister};
