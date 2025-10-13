import{h as R}from"./html2canvas.esm-BfYXEYrK.js";import{a as L}from"./main-B1NCi6Rz.js";let x=[],b=[],C=0,r=1;const T=10;let g="transaction",f="",m="",D="all";function st(){console.log("✅ sales.ts 로드됨"),U(),j(),F(),K(),et(),g="transaction",N(),h(),G()}function U(){document.querySelectorAll('input[name="sales-type"]').forEach((e,t)=>{e.addEventListener("change",o=>{o.target.checked&&(g=t===0?"transaction":"product",r=1,J(),g==="product"&&(N(),f="",m=""),h())})})}function j(){const n=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type'),t=document.querySelector(".btn-i.search"),o=document.querySelector(".btn-i.reset");n&&n.addEventListener("change",a=>{f=a.target.value}),e&&e.addEventListener("change",a=>{m=a.target.value}),t&&t.addEventListener("click",()=>{z()&&(r=1,h())}),o&&o.addEventListener("click",()=>{X(),r=1,h()})}function F(){document.querySelectorAll('input[name="detail-period"]').forEach((e,t)=>{e.addEventListener("change",o=>{o.target.checked&&(_(t),r=1,h())})})}function _(n){const e=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');if(!e||!t)return;const o=new Date;let a="",s="";switch(n){case 0:a="",s="";break;case 1:a=v(o),s=v(o);break;case 2:const d=new Date(o);d.setDate(o.getDate()-1),a=v(d),s=v(d);break;case 3:const c=new Date(o.getFullYear(),o.getMonth(),1),u=new Date(o.getFullYear(),o.getMonth()+1,0);a=v(c),s=v(u);break;case 4:const i=new Date(o.getFullYear(),o.getMonth()-1,1),l=new Date(o.getFullYear(),o.getMonth(),0);a=v(i),s=v(l);break}e.value=a,t.value=s,f=a,m=s}function J(){const n=document.getElementById("table-header"),e=document.querySelector(".tableArea"),t=document.getElementById("date-search-section"),o=document.getElementById("detail-settings-section");if(!n||!e){console.error("테이블 요소를 찾을 수 없습니다.");return}g==="transaction"?(n.innerHTML=`
      <th>순서</th>
      <th>일자</th>
      <th>상품</th>
      <th>가격</th>
      <th>상태</th>
    `,e.classList.remove("product-view"),t&&(t.style.display="flex"),o&&(o.style.display="block")):(n.innerHTML=`
      <th>순서</th>
      <th style="padding-left: 3rem; text-align: center;">상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `,e.classList.add("product-view"),t&&(t.style.display="none"),o&&(o.style.display="none"))}async function h(){try{const e=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(g==="transaction")await H(e),await Y(e);else{await H(e);let t=`/model_payment?userId=${e}&func=get-menu-statistics`;x=((await(await L(t)).json()).items||[]).sort((s,d)=>(d.totalCount||0)-(s.totalCount||0)),await M(x)}}catch(n){console.error("매출 데이터 로드 실패:",n)}}async function H(n){try{let e=`/model_payment?func=get-payment&userId=${n}`;f&&m&&(e+=`&startDate=${f}&endDate=${m}`);const o=await(await L(e)).json();V(o)}catch(e){console.error("섹션 데이터 로드 실패:",e)}}function K(){document.querySelectorAll('input[name="payment-type"]').forEach((e,t)=>{e.addEventListener("change",o=>{if(o.target.checked){switch(t){case 0:D="all";break;case 1:D="card";break;case 2:D="point";break}r=1,h()}})})}async function Y(n){try{let e=`/model_payment?func=get-payment&userId=${n}`;if(f&&m&&(e+=`&startDate=${f}&endDate=${m}`),D!=="all"&&(e+=`&paymentType=${D}`),r>1&&b.length>0){const a=r-2;b[a]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(b[a]))}`)}const o=await(await L(e)).json();if(r===1&&(b=[],C=o.total||0,o.pageKeys))try{b=JSON.parse(o.pageKeys)}catch(a){console.error("pageKeys 파싱 실패:",a)}x=o.items||[],await M(x)}catch(e){console.error("테이블 데이터 로드 실패:",e)}}function V(n){const e=document.querySelector(".countArea");if(e){const t=e.querySelectorAll(".countbox");if(t[0]){const o=t[0].querySelector("h4");if(o){const a=n.totalPriceSum||0;o.innerHTML=`${a.toLocaleString()}<small>원</small>`}}if(t[1]){const o=t[1].querySelector("h4");if(o){const a=n.totalCount||0;o.innerHTML=`${a}<small>건</small>`}}if(t[2]){const o=t[2].querySelector("h4");if(o){const a=n.pointSum||0;o.innerHTML=`${a}<small>P</small>`}}if(t[3]){const o=t[3].querySelector("h4");if(o){const a=n.pointCount||0;o.innerHTML=`${a}<small>건</small>`}}}}async function M(n){const e=document.querySelector(".tableArea table tbody");e&&(e.innerHTML="",n.forEach((t,o)=>{var c;let a="";if(g==="transaction"){const u=String(t.timestamp).split("T"),i=u[0],l=u[1].substring(0,5),w=((c=t.menuSummary[0])==null?void 0:c.name)||"알 수 없음",S=t.menuSummary.reduce((I,p)=>I+(p.count||1),0),$=S>1?`<label class="plus">+${S-1}</label>`:"";a=`
        <td>${(r-1)*T+o+1}</td>
        <td>${i} <br class="br-s">${l}</td>
        <td class="rel"><span>${w}</span> ${$}</td>
        <td>${t.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const u=t.name||"알 수 없음",i=t.totalSales||0,l=t.totalCount||0;a=`
        <td>${o+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${u}</span></td>
        <td>${i.toLocaleString()}원</td>
        <td class="blue">${l}건</td>
      `}const s=document.createElement("tr");s.className="on-popup";const d=g==="product"?o.toString():((r-1)*T+o).toString();s.setAttribute("data-index",d),s.innerHTML=a,e.appendChild(s)}),W())}function W(){const n=document.querySelector(".pagination");if(!n)return;if(g==="product"){n.style.display="none";return}n.style.display="block";const e=Math.ceil(C/T),t=n.querySelector(".page-numbers");t&&(t.innerHTML=""),n.querySelectorAll("button[data-page]").forEach(p=>p.remove());const a=5;let s=Math.max(1,r-Math.floor(a/2)),d=s+a-1;d>e&&(d=e,s=Math.max(1,d-a+1));for(let p=s;p<=d;p++){const y=document.createElement("button");y.setAttribute("data-page",String(p)),y.innerText=String(p),y.style.display="inline-block",y.style.margin="0 2px",y.style.padding="5px 10px",y.style.border="1px solid #ddd",y.style.backgroundColor=p===r?"#007bff":"#fff",y.style.color=p===r?"#fff":"#333",y.style.cursor="pointer",p===r&&y.classList.add("active"),y.addEventListener("click",()=>{p!==r&&(r=p,h())});const E=n.querySelector(".page-next");E?n.insertBefore(y,E):n.appendChild(y)}const c=n.querySelector(".page-first"),u=n.querySelector(".page-prev"),i=n.querySelector(".page-next"),l=n.querySelector(".page-last");c&&(c.style.display="inline-block"),u&&(u.style.display="inline-block"),i&&(i.style.display="inline-block"),l&&(l.style.display="inline-block"),[c,u,i,l].forEach(p=>{p&&p.replaceWith(p.cloneNode(!0))});const w=n.querySelector(".page-first"),S=n.querySelector(".page-prev"),$=n.querySelector(".page-next"),I=n.querySelector(".page-last");w&&(w.addEventListener("click",()=>{r>1&&(r=1,h())}),w.disabled=r===1),S&&(S.addEventListener("click",()=>{r>1&&(r--,h())}),S.disabled=r===1),$&&($.addEventListener("click",()=>{r<e&&(r++,h())}),$.disabled=r===e),I&&(I.addEventListener("click",()=>{r<e&&(r=e,h())}),I.disabled=r===e)}function G(){const n=document.querySelector(".popup-overlay");document.addEventListener("click",e=>{const t=e.target;if(t.closest(".on-popup")){const o=t.closest(".on-popup"),a=parseInt(o.getAttribute("data-index")||"0");Q(a),n.style.display="flex"}t.closest(".save-img")&&Z(),(t.closest(".popup-footer .gr")||t.closest(".close-btn"))&&(n.style.display="none")})}async function Q(n){try{let e,t;if(g==="product"?(e=n,t=x[e]):(e=n%T,t=x[e]),!t){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",e);return}const a=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let s={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const l=await(await L(`/model_user_setting?func=get-user&userId=${a}`)).json();l&&l.user&&(s={storeName:l.user.storeName||"정보 없음",tel:l.user.tel||"정보 없음",address:l.user.address||"정보 없음",businessNo:l.user.businessNo||"정보 없음"})}catch(i){console.error("매장 정보 로드 실패:",i)}let d="";if(g==="transaction"){const i=t.menuSummary.map(q=>`${q.name} / ${q.count||1}개`).join("<br>"),l=String(t.timestamp).split("T"),w=l[0],S=l[1].substring(0,5),$=`${w} ${S}`,I=t.point===0?"0P":`${t.point}P`;let p="card",y="카드",E="정보 없음",B="정보없음";t.point>0&&(p="point",y="포인트"),t.pointData&&(E=t.pointData.tel||"정보 없음",B=`${t.pointData.points||0}P`);let k="",P="";if(p==="card"){const q=t.payInfo||{},A=q.issuerName||"정보 없음",O=q.cardBin||"정보 없음";k=`
          <div>
            <h5>결제 카드</h5>
            <p>${A}</p>
          </div>
          <div>
            <h5>카드 번호</h5>
            <p>${O}</p>
          </div>
        `,P=""}else p==="point"&&(k="",P=`
          <div>
            <h5>포인트 연락처</h5>
            <p>${E}</p>
          </div>
          <div>
            <h5>사용 포인트</h5>
            <p>${I}</p>
          </div>
          <div>
            <h5>적립 포인트</h5>
            <p>${B}</p>
          </div>
        `);d=`
        <li>
          <div>
            <h5>주문상품</h5>
            <p>${i}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>매장명</h5>
            <p>${s.storeName}</p>
          </div>
          <div>
            <h5>매장 연락처</h5>
            <p>${s.tel}</p>
          </div>
          <div class="store-address">
            <h5>매장 주소</h5>
            <p>${s.address}</p>
          </div>
          <div>
            <h5>사업자 등록번호</h5>
            <p>${s.businessNo}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>결제 금액</h5>
            <p>${t.totalPrice.toLocaleString()}원</p>
          </div>
          <div>
            <h5>결제 일자</h5>
            <p>${$}</p>
          </div>
          <div>
            <h5>승인번호</h5>
            <p>${t.orderId||"정보 없음"}</p>
          </div>
          <div>
            <h5>결제 수단</h5>
            <p>${y}</p>
          </div>
          ${k}
          ${P}
        </li>
      `}else{const i=new Date(t.lastOrderTimestamp),l=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;d=`
        <li>
          <div>
            <h5>상품명</h5>
            <p>${t.name||"정보 없음"}</p>
          </div>
          <div>
            <h5>상품 ID</h5>
            <p>${t.menuId||"정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>총 주문액</h5>
            <p>${(t.totalSales||0).toLocaleString()}원</p>
          </div>
          <div>
            <h5>총 주문 건수</h5>
            <p>${t.totalCount||0}건</p>
          </div>
          <div>
            <h5>마지막 주문일</h5>
            <p>${l}</p>
          </div>
        </li>
      `}const c=document.querySelector(".popup-body .history");c&&(c.innerHTML=d);const u=document.querySelector(".popup-footer");if(u){const i=u.querySelector(".btn.blue"),l=u.querySelector(".btn.red");i&&(i.style.visibility="hidden",i.style.opacity="0"),l&&(l.style.visibility="hidden",l.style.opacity="0")}}catch(e){console.error("팝업 데이터 업데이트 실패:",e)}}function v(n){const e=n.getFullYear(),t=String(n.getMonth()+1).padStart(2,"0"),o=String(n.getDate()).padStart(2,"0");return`${e}-${t}-${o}`}function z(){return!f&&!m?!0:!f||!m?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):f>m?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function X(){const n=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');n&&(n.value="",f=""),e&&(e.value="",m="");const t=document.querySelectorAll('input[name="detail-period"]');t.length>0&&(t[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function Z(){try{let n=function(){Object.assign(e.style,a),Object.assign(s.style,d),t.forEach((c,u)=>{c.style.display=o[u]})};const e=document.querySelector(".popup");if(!e){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const t=[e.querySelector(".save-img"),e.querySelector(".close-btn"),...e.querySelectorAll(".popup-footer .btn")].filter(Boolean),o=t.map(c=>c.style.display);t.forEach(c=>c.style.display="none");const a={animation:e.style.animation,boxShadow:e.style.boxShadow,opacity:e.style.opacity,transform:e.style.transform,width:e.style.width,height:e.style.height},s=e.querySelector(".history"),d={maxHeight:s.style.maxHeight,minHeight:s.style.minHeight,height:s.style.height,overflow:s.style.overflow};Object.assign(e.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(s.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{R(e,{scale:1,useCORS:!0,width:400,height:e.scrollHeight}).then(c=>{const u=document.createElement("canvas"),i=u.getContext("2d");u.width=c.width,u.height=c.height,i&&(i.beginPath(),i.roundRect(0,0,c.width,c.height,10),i.clip(),i.drawImage(c,0,0));const l=`매출정보_${new Date().toISOString().slice(0,10)}.png`;tt(u.toDataURL("image/png"),l),n(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(c=>{console.error("이미지 저장 실패:",c),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),n()})},100)}catch(n){console.error("이미지 저장 실패:",n),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function tt(n,e){const t=document.createElement("a");t.download=e,t.href=n,document.body.appendChild(t),t.click(),document.body.removeChild(t)}function N(){const n=document.querySelector(".countArea");if(n){const e=n.querySelectorAll(".countbox");if(e[0]){const t=e[0].querySelector("h4");t&&(t.innerHTML="0<small>원</small>")}if(e[1]){const t=e[1].querySelector("h4");t&&(t.innerHTML="0<small>건</small>")}if(e[2]){const t=e[2].querySelector("h4");t&&(t.innerHTML="0<small>P</small>")}if(e[3]){const t=e[3].querySelector("h4");t&&(t.innerHTML="0<small>건</small>")}}}function et(){const n=document.querySelector(".btn.wt");n&&n.addEventListener("click",nt)}async function nt(){try{const e=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!e){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let t="";if(g==="transaction")t=`/model_payment?func=get-payment-excel&userId=${e}`,D!=="all"&&(t+=`&paymentType=${D}`),f&&m&&(t+=`&startDate=${f}&endDate=${m}`);else if(t=`/model_payment?func=get-menu-statistics-excel&userId=${e}`,r>1&&b.length>0){const d=r-2;b[d]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(b[d]))}`)}const a=await(await L(t)).json();if(!a.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const s=document.createElement("a");s.href=a.excelUrl,document.body.appendChild(s),s.click(),document.body.removeChild(s)}catch(n){console.error("엑셀 다운로드 실패:",n),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{st as initSales};
