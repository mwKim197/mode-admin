import{h as U}from"./html2canvas.esm-BfYXEYrK.js";import{a as L}from"./main-8e-s8cfq.js";let x=[],$=[],C=0,r=1;const T=10;let v="transaction",m="",h="",q="all";function lt(){console.log("✅ sales.ts 로드됨"),F(),_(),J(),V(),ot(),v="transaction",A(),S(),z()}function F(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(v=e===0?"transaction":"product",r=1,Y(),v==="product"&&(A(),m="",h=""),S())})})}function _(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),n=document.querySelector(".btn-i.reset");o&&o.addEventListener("change",a=>{m=a.target.value}),t&&t.addEventListener("change",a=>{h=a.target.value}),e&&e.addEventListener("click",()=>{Z()&&(r=1,S())}),n&&n.addEventListener("click",()=>{tt(),r=1,S()})}function J(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(K(e),r=1,S())})})}function K(o){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const n=new Date;let a="",s="";switch(o){case 0:a="",s="";break;case 1:a=w(n),s=w(n);break;case 2:const c=new Date(n);c.setDate(n.getDate()-1),a=w(c),s=w(c);break;case 3:const i=new Date(n.getFullYear(),n.getMonth(),1),u=new Date(n.getFullYear(),n.getMonth()+1,0);a=w(i),s=w(u);break;case 4:const p=new Date(n.getFullYear(),n.getMonth()-1,1),l=new Date(n.getFullYear(),n.getMonth(),0);a=w(p),s=w(l);break}t.value=a,e.value=s,m=a,h=s}function Y(){const o=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),n=document.getElementById("detail-settings-section");if(!o||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}v==="transaction"?(o.innerHTML=`
      <th>순서</th>
      <th>일자</th>
      <th>상품</th>
      <th>가격</th>
      <th>상태</th>
    `,t.classList.remove("product-view"),e&&(e.style.display="flex"),n&&(n.style.display="block")):(o.innerHTML=`
      <th>순서</th>
      <th style="padding-left: 3rem; text-align: center;">상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `,t.classList.add("product-view"),e&&(e.style.display="none"),n&&(n.style.display="none"))}async function S(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(v==="transaction")await M(t),await W(t);else{await M(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;x=((await(await L(e)).json()).items||[]).sort((s,c)=>(c.totalCount||0)-(s.totalCount||0)),await N(x)}}catch(o){console.error("매출 데이터 로드 실패:",o)}}async function M(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;m&&h&&(t+=`&startDate=${m}&endDate=${h}`);const n=await(await L(t)).json();G(n)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function V(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{if(n.target.checked){switch(e){case 0:q="all";break;case 1:q="card";break;case 2:q="point";break}r=1,S()}})})}async function W(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;if(m&&h&&(t+=`&startDate=${m}&endDate=${h}`),q!=="all"&&(t+=`&paymentType=${q}`),r>1&&$.length>0){const a=r-2;$[a]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify($[a]))}`)}const n=await(await L(t)).json();if(r===1&&($=[],C=n.total||0,n.pageKeys))try{$=JSON.parse(n.pageKeys)}catch(a){console.error("pageKeys 파싱 실패:",a)}x=n.items||[],await N(x)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function G(o){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const n=e[0].querySelector("h4");if(n){const a=o.totalPriceSum||0;n.innerHTML=`${a.toLocaleString()}<small>원</small>`}}if(e[1]){const n=e[1].querySelector("h4");if(n){const a=o.totalCount||0;n.innerHTML=`${a}<small>건</small>`}}if(e[2]){const n=e[2].querySelector("h4");if(n){const a=o.pointSum||0;n.innerHTML=`${a}<small>P</small>`}}if(e[3]){const n=e[3].querySelector("h4");if(n){const a=o.pointCount||0;n.innerHTML=`${a}<small>건</small>`}}}}async function N(o){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",o.forEach((e,n)=>{var i;let a="";if(v==="transaction"){const u=String(e.timestamp).split("T"),p=u[0],l=u[1].substring(0,5),d=((i=e.menuSummary[0])==null?void 0:i.name)||"알 수 없음",b=e.menuSummary.reduce((D,y)=>D+(y.count||1),0),I=b>1?`<label class="plus">+${b-1}</label>`:"";a=`
        <td>${(r-1)*T+n+1}</td>
        <td>${p} <br class="br-s">${l}</td>
        <td class="rel"><span>${d}</span> ${I}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const u=e.name||"알 수 없음",p=e.totalSales||0,l=e.totalCount||0;a=`
        <td>${n+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${u}</span></td>
        <td>${p.toLocaleString()}원</td>
        <td class="blue">${l}건</td>
      `}const s=document.createElement("tr");s.className="on-popup";const c=v==="product"?n.toString():((r-1)*T+n).toString();s.setAttribute("data-index",c),s.innerHTML=a,t.appendChild(s)}),Q())}function Q(){const o=document.querySelector(".pagination");if(!o)return;if(v==="product"){o.style.display="none";return}o.style.display="block";const t=Math.ceil(C/T),e=o.querySelector(".page-numbers");e&&(e.innerHTML=""),o.querySelectorAll("button[data-page]").forEach(y=>y.remove());const a=5;let s=Math.max(1,r-Math.floor(a/2)),c=s+a-1;c>t&&(c=t,s=Math.max(1,c-a+1));for(let y=s;y<=c;y++){const f=document.createElement("button");f.setAttribute("data-page",String(y)),f.innerText=String(y),f.style.display="inline-block",f.style.margin="0 2px",f.style.padding="5px 10px",f.style.border="1px solid #ddd",f.style.backgroundColor=y===r?"#007bff":"#fff",f.style.color=y===r?"#fff":"#333",f.style.cursor="pointer",y===r&&f.classList.add("active"),f.addEventListener("click",()=>{y!==r&&(r=y,S())});const E=o.querySelector(".page-next");E?o.insertBefore(f,E):o.appendChild(f)}const i=o.querySelector(".page-first"),u=o.querySelector(".page-prev"),p=o.querySelector(".page-next"),l=o.querySelector(".page-last");i&&(i.style.display="inline-block"),u&&(u.style.display="inline-block"),p&&(p.style.display="inline-block"),l&&(l.style.display="inline-block"),[i,u,p,l].forEach(y=>{y&&y.replaceWith(y.cloneNode(!0))});const d=o.querySelector(".page-first"),b=o.querySelector(".page-prev"),I=o.querySelector(".page-next"),D=o.querySelector(".page-last");d&&(d.addEventListener("click",()=>{r>1&&(r=1,S())}),d.disabled=r===1),b&&(b.addEventListener("click",()=>{r>1&&(r--,S())}),b.disabled=r===1),I&&(I.addEventListener("click",()=>{r<t&&(r++,S())}),I.disabled=r===t),D&&(D.addEventListener("click",()=>{r<t&&(r=t,S())}),D.disabled=r===t)}function z(){const o=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const n=e.closest(".on-popup"),a=parseInt(n.getAttribute("data-index")||"0");X(a),o.style.display="flex"}e.closest(".save-img")&&et(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(o.style.display="none")})}async function X(o){var t;try{let e,n;if(v==="product"?(e=o,n=x[e]):(e=o%T,n=x[e]),!n){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",e);return}console.log(n);const s=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let c={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const d=await(await L(`/model_user_setting?func=get-user&userId=${s}`)).json();d&&d.user&&(c={storeName:d.user.storeName||"정보 없음",tel:d.user.tel||"정보 없음",address:d.user.address||"정보 없음",businessNo:d.user.businessNo||"정보 없음"})}catch(l){console.error("매장 정보 로드 실패:",l)}let i="";if(v==="transaction"){const l=n.menuSummary.map(g=>`${g.name} / ${g.count||1}개`).join("<br>"),d=String(n.timestamp).split("T"),b=d[0],I=d[1].substring(0,5),D=`${b} ${I}`,y=n.point===0?"0P":`${n.point}P`;let f="card",E="카드",k="정보 없음",P="정보없음";n.point>0&&(f="point",E="포인트"),n.pointData&&(k=n.pointData.tel||"정보 없음",P=`${n.pointData.points||0}P`);let B="",H="";if(f==="card"){const g=n.payInfo||{},R=g.issuerName||"정보 없음",j=g.cardBin||"정보 없음";B=`
      <div>
        <h5>결제 카드</h5>
        <p>${R}</p>
      </div>
      <div>
        <h5>카드 번호</h5>
        <p>${j}</p>
      </div>
    `}else f==="point"&&(H=`
      <div>
        <h5>포인트 연락처</h5>
        <p>${k}</p>
      </div>
      <div>
        <h5>사용 포인트</h5>
        <p>${y}</p>
      </div>
      <div>
        <h5>적립 포인트</h5>
        <p>${P}</p>
      </div>
    `);const O=`
    <div>
      <h5>사용 쿠폰</h5>
      <p>${((t=n.totalPayInfo)==null?void 0:t.filter(g=>g.method==="쿠폰").flatMap(g=>g.coupons||[]).map(g=>`${g.name} (${g.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
    </div>
  `;i=`
    <li>
      <div>
        <h5>주문상품</h5>
        <p>${l}</p>
      </div>
    </li>
    <li>
      <div>
        <h5>매장명</h5>
        <p>${c.storeName}</p>
      </div>
      <div>
        <h5>매장 연락처</h5>
        <p>${c.tel}</p>
      </div>
      <div class="store-address">
        <h5>매장 주소</h5>
        <p>${c.address}</p>
      </div>
      <div>
        <h5>사업자 등록번호</h5>
        <p>${c.businessNo}</p>
      </div>
    </li>
    <li>
      <div>
        <h5>결제 금액</h5>
        <p>${n.totalPrice.toLocaleString()}원</p>
      </div>
      <div>
        <h5>결제 일자</h5>
        <p>${D}</p>
      </div>
      <div>
        <h5>승인번호</h5>
        <p>${n.orderId||"정보 없음"}</p>
      </div>
      <div>
        <h5>결제 수단</h5>
        <p>${E}</p>
      </div>
      ${O}   <!-- ✅ 추가된 부분 -->
      ${B}
      ${H}
    </li>
  `}else{const l=new Date(n.lastOrderTimestamp),d=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`;i=`
        <li>
          <div>
            <h5>상품명</h5>
            <p>${n.name||"정보 없음"}</p>
          </div>
          <div>
            <h5>상품 ID</h5>
            <p>${n.menuId||"정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>총 주문액</h5>
            <p>${(n.totalSales||0).toLocaleString()}원</p>
          </div>
          <div>
            <h5>총 주문 건수</h5>
            <p>${n.totalCount||0}건</p>
          </div>
          <div>
            <h5>마지막 주문일</h5>
            <p>${d}</p>
          </div>
        </li>
      `}const u=document.querySelector(".popup-body .history");u&&(u.innerHTML=i);const p=document.querySelector(".popup-footer");if(p){const l=p.querySelector(".btn.blue"),d=p.querySelector(".btn.red");l&&(l.style.visibility="hidden",l.style.opacity="0"),d&&(d.style.visibility="hidden",d.style.opacity="0")}}catch(e){console.error("팝업 데이터 업데이트 실패:",e)}}function w(o){const t=o.getFullYear(),e=String(o.getMonth()+1).padStart(2,"0"),n=String(o.getDate()).padStart(2,"0");return`${t}-${e}-${n}`}function Z(){return!m&&!h?!0:!m||!h?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):m>h?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function tt(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');o&&(o.value="",m=""),t&&(t.value="",h="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function et(){try{let o=function(){Object.assign(t.style,a),Object.assign(s.style,c),e.forEach((i,u)=>{i.style.display=n[u]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),n=e.map(i=>i.style.display);e.forEach(i=>i.style.display="none");const a={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},s=t.querySelector(".history"),c={maxHeight:s.style.maxHeight,minHeight:s.style.minHeight,height:s.style.height,overflow:s.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(s.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{U(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(i=>{const u=document.createElement("canvas"),p=u.getContext("2d");u.width=i.width,u.height=i.height,p&&(p.beginPath(),p.roundRect(0,0,i.width,i.height,10),p.clip(),p.drawImage(i,0,0));const l=`매출정보_${new Date().toISOString().slice(0,10)}.png`;nt(u.toDataURL("image/png"),l),o(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(i=>{console.error("이미지 저장 실패:",i),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),o()})},100)}catch(o){console.error("이미지 저장 실패:",o),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function nt(o,t){const e=document.createElement("a");e.download=t,e.href=o,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function A(){const o=document.querySelector(".countArea");if(o){const t=o.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function ot(){const o=document.querySelector(".btn.wt");o&&o.addEventListener("click",at)}async function at(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if(v==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,q!=="all"&&(e+=`&paymentType=${q}`),m&&h&&(e+=`&startDate=${m}&endDate=${h}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,r>1&&$.length>0){const c=r-2;$[c]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify($[c]))}`)}const a=await(await L(e)).json();if(!a.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const s=document.createElement("a");s.href=a.excelUrl,document.body.appendChild(s),s.click(),document.body.removeChild(s)}catch(o){console.error("엑셀 다운로드 실패:",o),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{lt as initSales};
