function l(){var i;console.log("✅ notice.ts 로드됨"),(i=document.getElementById("dashboard-button"))==null||i.addEventListener("click",()=>{location.href="/html/dashboard.html"});const o=document.getElementById("notice-list");if(!o){console.error("❌ 필수 요소가 없습니다.");return}function a(n){o!==null&&(o.innerHTML="",n.forEach(t=>{const e=document.createElement("div");e.className="p-4 border rounded mb-2 hover:bg-gray-100 flex justify-between items-center",e.setAttribute("data-id",t.contentId);const d=new Date(t.timestamp).toLocaleDateString("ko-KR");e.innerHTML=`
        <div>
          <div class="font-bold">${t.title}</div>
          <div class="text-sm text-gray-500">${d} / 작성자: ${t.userId}</div>
        </div>
        <div class="flex space-x-2">
            <button class="edit-btn text-blue-600 underline" data-id="${t.contentId}">수정</button>
            <button class="delete-btn text-red-600 underline" data-id="${t.contentId}">삭제</button>
        </div>
      `,o.appendChild(e)}))}async function r(){try{const t=await(await fetch("https://api.narrowroad-model.com/model_home_page?func=get-posts&contentType=notice")).json();a(t),s()}catch(n){console.error("❌ 공지사항 불러오기 실패",n)}}function s(){document.querySelectorAll(".edit-btn").forEach(n=>{n.addEventListener("click",t=>{t.stopPropagation();const e=t.target.getAttribute("data-id");e&&(location.href=`/html/notice-edit.html?id=${e}`)})}),document.querySelectorAll(".delete-btn").forEach(n=>{n.addEventListener("click",async t=>{t.stopPropagation();const e=t.target.getAttribute("data-id");if(!(!e||!confirm("정말 삭제하시겠습니까?")))try{(await fetch(`https://api.narrowroad-model.com/model_home_page?func=delete-post&contentType=notice&contentId=${e}`,{method:"DELETE"})).ok?(alert("삭제 완료"),r()):alert("삭제 실패")}catch(c){console.error("❌ 삭제 요청 실패",c)}})})}r()}export{l as initNotice};
