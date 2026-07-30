import{h as z}from"./html2canvas.esm-BfYXEYrK.js";import{a as R}from"./main-DnHqv9jM.js";let M=[],L=[],K=0,d=1;const _=10;let b="transaction",h="",m="",x="all";function gt(){console.log("✅ sales.ts 로드됨"),X(),tt(),et(),at(),ft(),b="transaction",Q(),$(),lt()}function X(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(b=e===0?"transaction":"product",d=1,nt(),b==="product"&&(Q(),W()),$())})})}function tt(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),n=document.querySelector(".btn-i.reset");o&&o.addEventListener("change",a=>{h=a.target.value}),t&&t.addEventListener("change",a=>{m=a.target.value}),e&&e.addEventListener("click",()=>{dt()&&(d=1,$())}),n&&n.addEventListener("click",()=>{W(),d=1,$()})}function et(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(ot(e),d=1,$())})})}function ot(o){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const n=new Date;let a="",r="";switch(o){case 0:a="",r="";break;case 1:a=q(n),r=q(n);break;case 2:const u=new Date(n);u.setDate(n.getDate()-1),a=q(u),r=q(u);break;case 3:const c=new Date(n.getFullYear(),n.getMonth(),1),s=new Date(n.getFullYear(),n.getMonth()+1,0);a=q(c),r=q(s);break;case 4:const f=new Date(n.getFullYear(),n.getMonth()-1,1),S=new Date(n.getFullYear(),n.getMonth(),0);a=q(f),r=q(S);break}t.value=a,e.value=r,h=a,m=r}function nt(){const o=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),n=document.getElementById("detail-settings-section"),a=document.getElementById("payment-section");if(!o||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}b==="transaction"?(o.innerHTML=`
      <th>순서</th>
      <th>일자</th>
      <th>상품</th>
      <th>가격</th>
      <th>상태</th>
    `,t.classList.remove("product-view"),e&&(e.style.display="flex"),n&&(n.style.display="block"),a&&(a.style.display="block")):(o.innerHTML=`
      <th>순서</th>
      <th style="padding-left: 3rem; text-align: center;">상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `,t.classList.add("product-view"),e&&(e.style.display="flex"),n&&(n.style.display="block"),a&&(a.style.display="none"))}async function $(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(b==="transaction")await J(t),await st(t);else{await J(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;h&&m&&(e+=`&startDate=${h}&endDate=${m}`),M=((await(await R(e)).json()).items||[]).sort((r,u)=>(u.totalCount||0)-(r.totalCount||0)),await Y(M)}}catch(o){console.error("매출 데이터 로드 실패:",o)}}async function J(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;h&&m&&(t+=`&startDate=${h}&endDate=${m}`);const n=await(await R(t)).json();it(n)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function at(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{if(n.target.checked){switch(e){case 0:x="all";break;case 1:x="card";break;case 2:x="point";break}d=1,$()}})})}async function st(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;if(h&&m&&(t+=`&startDate=${h}&endDate=${m}`),x!=="all"&&(t+=`&paymentType=${x}`),d>1&&L.length>0){const a=d-2;L[a]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(L[a]))}`)}const n=await(await R(t)).json();if(d===1&&(L=[],K=n.total||0,n.pageKeys))try{L=JSON.parse(n.pageKeys)}catch(a){console.error("pageKeys 파싱 실패:",a)}M=n.items||[],await Y(M)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function it(o){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const n=e[0].querySelector("h4");if(n){const a=o.totalPriceSum||0;n.innerHTML=`${a.toLocaleString()}<small>원</small>`}}if(e[1]){const n=e[1].querySelector("h4");if(n){const a=o.totalCount||0;n.innerHTML=`${a}<small>건</small>`}}if(e[2]){const n=e[2].querySelector("h4");if(n){const a=o.pointSum||0;n.innerHTML=`${a}<small>P</small>`}}if(e[3]){const n=e[3].querySelector("h4");if(n){const a=o.pointCount||0;n.innerHTML=`${a}<small>건</small>`}}}}async function Y(o){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",o.forEach((e,n)=>{var c;let a="";if(b==="transaction"){const s=String(e.timestamp).split("T"),f=s[0],S=s[1].substring(0,5),g=((c=e.menuSummary[0])==null?void 0:c.name)||"알 수 없음",v=e.menuSummary.reduce((w,l)=>w+(l.count||1),0),I=v>1?`<label class="plus">+${v-1}</label>`:"";a=`
        <td>${(d-1)*_+n+1}</td>
        <td>${f} <br class="br-s">${S}</td>
        <td class="rel"><span>${g}</span> ${I}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const s=e.name||"알 수 없음",f=e.totalSales||0,S=e.totalCount||0;a=`
        <td>${n+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${s}</span></td>
        <td>${f.toLocaleString()}원</td>
        <td class="blue">${S}건</td>
      `}const r=document.createElement("tr");r.className="on-popup";const u=b==="product"?n.toString():((d-1)*_+n).toString();r.setAttribute("data-index",u),r.innerHTML=a,t.appendChild(r)}),rt())}function rt(){const o=document.querySelector(".pagination");if(!o)return;if(b==="product"){o.style.display="none";return}o.style.display="block";const t=Math.ceil(K/_),e=o.querySelector(".page-numbers");e&&(e.innerHTML=""),o.querySelectorAll("button[data-page]").forEach(l=>l.remove());const a=5;let r=Math.max(1,d-Math.floor(a/2)),u=r+a-1;u>t&&(u=t,r=Math.max(1,u-a+1));for(let l=r;l<=u;l++){const p=document.createElement("button");p.setAttribute("data-page",String(l)),p.innerText=String(l),p.style.display="inline-block",p.style.margin="0 2px",p.style.padding="5px 10px",p.style.border="1px solid #ddd",p.style.backgroundColor=l===d?"#007bff":"#fff",p.style.color=l===d?"#fff":"#333",p.style.cursor="pointer",l===d&&p.classList.add("active"),p.addEventListener("click",()=>{l!==d&&(d=l,$())});const O=o.querySelector(".page-next");O?o.insertBefore(p,O):o.appendChild(p)}const c=o.querySelector(".page-first"),s=o.querySelector(".page-prev"),f=o.querySelector(".page-next"),S=o.querySelector(".page-last");c&&(c.style.display="inline-block"),s&&(s.style.display="inline-block"),f&&(f.style.display="inline-block"),S&&(S.style.display="inline-block"),[c,s,f,S].forEach(l=>{l&&l.replaceWith(l.cloneNode(!0))});const g=o.querySelector(".page-first"),v=o.querySelector(".page-prev"),I=o.querySelector(".page-next"),w=o.querySelector(".page-last");g&&(g.addEventListener("click",()=>{d>1&&(d=1,$())}),g.disabled=d===1),v&&(v.addEventListener("click",()=>{d>1&&(d--,$())}),v.disabled=d===1),I&&(I.addEventListener("click",()=>{d<t&&(d++,$())}),I.disabled=d===t),w&&(w.addEventListener("click",()=>{d<t&&(d=t,$())}),w.disabled=d===t)}function lt(){const o=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const n=e.closest(".on-popup"),a=parseInt(n.getAttribute("data-index")||"0");ct(a),o.style.display="flex"}e.closest(".save-img")&&pt(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(o.style.display="none")})}async function ct(o){var t,e,n,a,r,u;try{let c,s;if(b==="product"?(c=o,s=M[c]):(c=o%_,s=M[c]),console.log("item",s),!s){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",c);return}const S=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let g={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const p=await(await R(`/model_user_setting?func=get-user&userId=${S}`)).json();p&&p.user&&(g={storeName:p.user.storeName||"정보 없음",tel:p.user.tel||"정보 없음",address:p.user.address||"정보 없음",businessNo:p.user.businessNo||"정보 없음"})}catch(l){console.error("매장 정보 로드 실패:",l)}let v="";if(b==="transaction"){const l=s.menuSummary.map(N=>`${N.name} / ${N.count||1}개`).join("<br>"),p=String(s.timestamp).split("T"),O=p[0],V=p[1].substring(0,5),F=`${O} ${V}`;if(s.totalPayInfo){const C=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((t=s.totalPayInfo)==null?void 0:t.filter(i=>i.method==="쿠폰").flatMap(i=>i.coupons||[]).map(i=>`${i.name} (${i.couponCode}) - ${i.price.toLocaleString()}`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
            `,E=((e=s.totalPayInfo)==null?void 0:e.filter(i=>i.method==="카드"))||[];let P="미사용",T="미사용",H="-";if(E.length>0){P=E.map(D=>`${D.method} (${D.issuerName})`).join(", "),T=E.map(D=>D.cardBin).join(", ");const i=(n=E[0])==null?void 0:n.approvalDateTime;if(i){const[D,G]=i.split("T"),Z=G.split("+")[0].substring(0,5);H=`${D} ${Z}`}}const k=(a=s.totalPayInfo)==null?void 0:a.filter(i=>i.method==="바코드QR").flatMap(i=>i||{});k.length>0&&(P=k.map(i=>`${i.method} (${i.payName})`),T=k.map(i=>`${i.cardBin}`));const j=((r=s.totalPayInfo)==null?void 0:r.filter(i=>i.method==="마일리지"&&i.usedAmount>0))||[];let U="미등록 고객",A="미사용";j.length>0&&(U=j.map(i=>`${i.mileageNo??"-"}`).join(", "),A=j.map(i=>`${i.usedAmount.toLocaleString()}`).join(", "));const y=`
                    <div>
                        <h5>결제 수단</h5>
                        <p>${P}</p>
                    </div>
                    <div>
                        <h5>실제결제 시간</h5>
                        <p>${H}</p>
                    </div>
                    <div>
                        <h5>카드 번호</h5>
                        <p>${T}</p>
                    </div>
                    <div>
                        <h5>고객번호</h5>
                        <p>${U}</p>
                    </div>
                    <div>
                        <h5>사용 포인트</h5>
                        <p>${A}</p>
                    </div>
                `;let B=s.orderId||"정보 없음";if(s.totalPayInfo){const i=(s.totalPayInfo||[]).filter(D=>D.method==="카드");i.length>0&&(i[0].approvalNo||i[0].approvalNo===0)&&(B=i[0].approvalNo)}v=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${l}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${g.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${g.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${g.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${g.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${s.totalPrice.toLocaleString()}원</p>
                      </div>
                      <div>
                        <h5>결제 일자</h5>
                        <p>${F}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${B}</p>
                      </div>
                      ${y}
                      ${C}   <!-- ✅ 추가된 부분 -->
                    </li>
                `}else{const N=s.point===0?"0P":`${s.point}P`;let C="card",E="카드",P="정보 없음",T="정보없음";s.point>0&&(C="point",E="포인트"),s.pointData&&(P=s.pointData.tel||"정보 없음",T=`${s.pointData.points||0}P`);let H="",k="";if(C==="card"){const y=s.payInfo||{},B=y.issuerName||"정보 없음",i=y.cardBin||"정보 없음";H=`
                        <div>
                            <h5>결제 카드</h5>
                            <p>${B}</p>
                        </div>
                        <div>
                            <h5>카드 번호</h5>
                            <p>${i}</p>
                        </div>
                    `}else C==="point"&&(k=`
                        <div>
                            <h5>포인트 연락처</h5>
                            <p>${P}</p>
                        </div>
                        <div>
                            <h5>사용 포인트</h5>
                            <p>${N.toLocaleString()}</p>
                        </div>
                        <div>
                            <h5>적립 포인트</h5>
                            <p>${T.toLocaleString()}</p>
                        </div>
                    `);const U=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((u=s.totalPayInfo)==null?void 0:u.filter(y=>y.method==="쿠폰").flatMap(y=>y.coupons||[]).map(y=>`${y.name} (${y.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
                `;let A=s.orderId||"정보 없음";if(s.totalPayInfo){const y=(s.totalPayInfo||[]).filter(B=>B.method==="카드");y.length>0&&(y[0].approvalNo||y[0].approvalNo===0)&&(A=y[0].approvalNo)}v=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${l}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${g.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${g.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${g.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${g.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${s.totalPrice.toLocaleString()}원</p>
                      </div>
                      <div>
                        <h5>결제 일자</h5>
                        <p>${F}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${A}</p>
                      </div>
                      <div>
                        <h5>결제 수단</h5>
                        <p>${E}</p>
                      </div>
                      ${U}   <!-- ✅ 추가된 부분 -->
                      ${H}
                      ${k}
                    </li>
                `}}else{const l=new Date(s.lastOrderTimestamp),p=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`;v=`
        <li>
          <div>
            <h5>상품명</h5>
            <p>${s.name||"정보 없음"}</p>
          </div>
          <div>
            <h5>상품 ID</h5>
            <p>${s.menuId||"정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>총 주문액</h5>
            <p>${(s.totalSales||0).toLocaleString()}원</p>
          </div>
          <div>
            <h5>총 주문 건수</h5>
            <p>${s.totalCount||0}건</p>
          </div>
          <div>
            <h5>마지막 주문일</h5>
            <p>${p}</p>
          </div>
        </li>
      `}const I=document.querySelector(".popup-body .history");I&&(I.innerHTML=v);const w=document.querySelector(".popup-footer");if(w){const l=w.querySelector(".btn.blue"),p=w.querySelector(".btn.red");l&&(l.style.visibility="hidden",l.style.opacity="0"),p&&(p.style.visibility="hidden",p.style.opacity="0")}}catch(c){console.error("팝업 데이터 업데이트 실패:",c)}}function q(o){const t=o.getFullYear(),e=String(o.getMonth()+1).padStart(2,"0"),n=String(o.getDate()).padStart(2,"0");return`${t}-${e}-${n}`}function dt(){return!h&&!m?!0:!h||!m?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):h>m?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function W(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');o&&(o.value="",h=""),t&&(t.value="",m="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function pt(){try{let o=function(){Object.assign(t.style,a),Object.assign(r.style,u),e.forEach((c,s)=>{c.style.display=n[s]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),n=e.map(c=>c.style.display);e.forEach(c=>c.style.display="none");const a={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},r=t.querySelector(".history"),u={maxHeight:r.style.maxHeight,minHeight:r.style.minHeight,height:r.style.height,overflow:r.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(r.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{z(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(c=>{const s=document.createElement("canvas"),f=s.getContext("2d");s.width=c.width,s.height=c.height,f&&(f.beginPath(),f.roundRect(0,0,c.width,c.height,10),f.clip(),f.drawImage(c,0,0));const S=`매출정보_${new Date().toISOString().slice(0,10)}.png`;ut(s.toDataURL("image/png"),S),o(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(c=>{console.error("이미지 저장 실패:",c),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),o()})},100)}catch(o){console.error("이미지 저장 실패:",o),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function ut(o,t){const e=document.createElement("a");e.download=t,e.href=o,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function Q(){const o=document.querySelector(".countArea");if(o){const t=o.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function ft(){const o=document.querySelector(".btn.wt");o&&o.addEventListener("click",yt)}async function yt(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if(b==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,x!=="all"&&(e+=`&paymentType=${x}`),h&&m&&(e+=`&startDate=${h}&endDate=${m}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,h&&m&&(e+=`&startDate=${h}&endDate=${m}`),d>1&&L.length>0){const u=d-2;L[u]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(L[u]))}`)}const n=await R(e),a=await n.json();if(!n.ok)throw new Error(a.message||`Excel request failed (${n.status})`);if(!a.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const r=document.createElement("a");r.href=a.excelUrl,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch(o){console.error("엑셀 다운로드 실패:",o),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{gt as initSales};
