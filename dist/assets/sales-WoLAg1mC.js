import{h as G}from"./html2canvas.esm-BfYXEYrK.js";import{a as N}from"./main-DRXaj6vt.js";let B=[],q=[],J=0,d=1;const j=10;let b="transaction",m="",g="",x="all";function mt(){console.log("✅ sales.ts 로드됨"),Z(),z(),X(),nt(),ut(),b="transaction",Y(),$(),it()}function Z(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&(b=e===0?"transaction":"product",d=1,et(),b==="product"&&(Y(),m="",g=""),$())})})}function z(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),o=document.querySelector(".btn-i.reset");n&&n.addEventListener("change",a=>{m=a.target.value}),t&&t.addEventListener("change",a=>{g=a.target.value}),e&&e.addEventListener("click",()=>{lt()&&(d=1,$())}),o&&o.addEventListener("click",()=>{ct(),d=1,$()})}function X(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&(tt(e),d=1,$())})})}function tt(n){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const o=new Date;let a="",i="";switch(n){case 0:a="",i="";break;case 1:a=D(o),i=D(o);break;case 2:const u=new Date(o);u.setDate(o.getDate()-1),a=D(u),i=D(u);break;case 3:const l=new Date(o.getFullYear(),o.getMonth(),1),s=new Date(o.getFullYear(),o.getMonth()+1,0);a=D(l),i=D(s);break;case 4:const f=new Date(o.getFullYear(),o.getMonth()-1,1),h=new Date(o.getFullYear(),o.getMonth(),0);a=D(f),i=D(h);break}t.value=a,e.value=i,m=a,g=i}function et(){const n=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),o=document.getElementById("detail-settings-section");if(!n||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}b==="transaction"?(n.innerHTML=`
      <th>순서</th>
      <th>일자</th>
      <th>상품</th>
      <th>가격</th>
      <th>상태</th>
    `,t.classList.remove("product-view"),e&&(e.style.display="flex"),o&&(o.style.display="block")):(n.innerHTML=`
      <th>순서</th>
      <th style="padding-left: 3rem; text-align: center;">상품</th>
      <th>총주문액</th>
      <th>총건수</th>
    `,t.classList.add("product-view"),e&&(e.style.display="none"),o&&(o.style.display="none"))}async function $(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(b==="transaction")await _(t),await ot(t);else{await _(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;B=((await(await N(e)).json()).items||[]).sort((i,u)=>(u.totalCount||0)-(i.totalCount||0)),await K(B)}}catch(n){console.error("매출 데이터 로드 실패:",n)}}async function _(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;m&&g&&(t+=`&startDate=${m}&endDate=${g}`);const o=await(await N(t)).json();at(o)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function nt(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{if(o.target.checked){switch(e){case 0:x="all";break;case 1:x="card";break;case 2:x="point";break}d=1,$()}})})}async function ot(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;if(m&&g&&(t+=`&startDate=${m}&endDate=${g}`),x!=="all"&&(t+=`&paymentType=${x}`),d>1&&q.length>0){const a=d-2;q[a]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[a]))}`)}const o=await(await N(t)).json();if(d===1&&(q=[],J=o.total||0,o.pageKeys))try{q=JSON.parse(o.pageKeys)}catch(a){console.error("pageKeys 파싱 실패:",a)}B=o.items||[],await K(B)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function at(n){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const o=e[0].querySelector("h4");if(o){const a=n.totalPriceSum||0;o.innerHTML=`${a.toLocaleString()}<small>원</small>`}}if(e[1]){const o=e[1].querySelector("h4");if(o){const a=n.totalCount||0;o.innerHTML=`${a}<small>건</small>`}}if(e[2]){const o=e[2].querySelector("h4");if(o){const a=n.pointSum||0;o.innerHTML=`${a}<small>P</small>`}}if(e[3]){const o=e[3].querySelector("h4");if(o){const a=n.pointCount||0;o.innerHTML=`${a}<small>건</small>`}}}}async function K(n){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",n.forEach((e,o)=>{var l;let a="";if(b==="transaction"){const s=String(e.timestamp).split("T"),f=s[0],h=s[1].substring(0,5),y=((l=e.menuSummary[0])==null?void 0:l.name)||"알 수 없음",v=e.menuSummary.reduce((w,r)=>w+(r.count||1),0),I=v>1?`<label class="plus">+${v-1}</label>`:"";a=`
        <td>${(d-1)*j+o+1}</td>
        <td>${f} <br class="br-s">${h}</td>
        <td class="rel"><span>${y}</span> ${I}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const s=e.name||"알 수 없음",f=e.totalSales||0,h=e.totalCount||0;a=`
        <td>${o+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${s}</span></td>
        <td>${f.toLocaleString()}원</td>
        <td class="blue">${h}건</td>
      `}const i=document.createElement("tr");i.className="on-popup";const u=b==="product"?o.toString():((d-1)*j+o).toString();i.setAttribute("data-index",u),i.innerHTML=a,t.appendChild(i)}),st())}function st(){const n=document.querySelector(".pagination");if(!n)return;if(b==="product"){n.style.display="none";return}n.style.display="block";const t=Math.ceil(J/j),e=n.querySelector(".page-numbers");e&&(e.innerHTML=""),n.querySelectorAll("button[data-page]").forEach(r=>r.remove());const a=5;let i=Math.max(1,d-Math.floor(a/2)),u=i+a-1;u>t&&(u=t,i=Math.max(1,u-a+1));for(let r=i;r<=u;r++){const p=document.createElement("button");p.setAttribute("data-page",String(r)),p.innerText=String(r),p.style.display="inline-block",p.style.margin="0 2px",p.style.padding="5px 10px",p.style.border="1px solid #ddd",p.style.backgroundColor=r===d?"#007bff":"#fff",p.style.color=r===d?"#fff":"#333",p.style.cursor="pointer",r===d&&p.classList.add("active"),p.addEventListener("click",()=>{r!==d&&(d=r,$())});const A=n.querySelector(".page-next");A?n.insertBefore(p,A):n.appendChild(p)}const l=n.querySelector(".page-first"),s=n.querySelector(".page-prev"),f=n.querySelector(".page-next"),h=n.querySelector(".page-last");l&&(l.style.display="inline-block"),s&&(s.style.display="inline-block"),f&&(f.style.display="inline-block"),h&&(h.style.display="inline-block"),[l,s,f,h].forEach(r=>{r&&r.replaceWith(r.cloneNode(!0))});const y=n.querySelector(".page-first"),v=n.querySelector(".page-prev"),I=n.querySelector(".page-next"),w=n.querySelector(".page-last");y&&(y.addEventListener("click",()=>{d>1&&(d=1,$())}),y.disabled=d===1),v&&(v.addEventListener("click",()=>{d>1&&(d--,$())}),v.disabled=d===1),I&&(I.addEventListener("click",()=>{d<t&&(d++,$())}),I.disabled=d===t),w&&(w.addEventListener("click",()=>{d<t&&(d=t,$())}),w.disabled=d===t)}function it(){const n=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const o=e.closest(".on-popup"),a=parseInt(o.getAttribute("data-index")||"0");rt(a),n.style.display="flex"}e.closest(".save-img")&&dt(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(n.style.display="none")})}async function rt(n){var t,e,o,a,i,u;try{let l,s;if(b==="product"?(l=n,s=B[l]):(l=n%j,s=B[l]),console.log("item",s),!s){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",l);return}const h=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let y={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const p=await(await N(`/model_user_setting?func=get-user&userId=${h}`)).json();p&&p.user&&(y={storeName:p.user.storeName||"정보 없음",tel:p.user.tel||"정보 없음",address:p.user.address||"정보 없음",businessNo:p.user.businessNo||"정보 없음"})}catch(r){console.error("매장 정보 로드 실패:",r)}let v="";if(b==="transaction"){const r=s.menuSummary.map(k=>`${k.name} / ${k.count||1}개`).join("<br>"),p=String(s.timestamp).split("T"),A=p[0],W=p[1].substring(0,5),F=`${A} ${W}`;if(s.totalPayInfo){const C=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((t=s.totalPayInfo)==null?void 0:t.filter(c=>c.method==="쿠폰").flatMap(c=>c.coupons||[]).map(c=>`${c.name} (${c.couponCode}) - ${c.price.toLocaleString()}`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
            `,L=((e=s.totalPayInfo)==null?void 0:e.filter(c=>c.method==="카드"))||[];let E="미사용",T="미사용",H="-";if(L.length>0){E=L.map(M=>`${M.method} (${M.issuerName})`).join(", "),T=L.map(M=>M.cardBin).join(", ");const c=(o=L[0])==null?void 0:o.approvalDateTime;if(c){const[M,Q]=c.split("T"),V=Q.split("+")[0].substring(0,5);H=`${M} ${V}`}}const P=(a=s.totalPayInfo)==null?void 0:a.filter(c=>c.method==="바코드QR").flatMap(c=>c||{});P.length>0&&(E=P.map(c=>`${c.method} (${c.payName})`),T=P.map(c=>`${c.cardBin}`));const R=((i=s.totalPayInfo)==null?void 0:i.filter(c=>c.method==="마일리지"&&c.usedAmount>0))||[];let O="미등록 고객",S="미사용";R.length>0&&(O=R.map(c=>`${c.mileageNo??"-"}`).join(", "),S=R.map(c=>`${c.usedAmount.toLocaleString()}`).join(", "));const U=`
                    <div>
                        <h5>결제 수단</h5>
                        <p>${E}</p>
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
                        <p>${O}</p>
                    </div>
                    <div>
                        <h5>사용 포인트</h5>
                        <p>${S}</p>
                    </div>
                `;v=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${r}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${y.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${y.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${y.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${y.businessNo}</p>
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
                        <p>${s.orderId||"정보 없음"}</p>
                      </div>
                      ${U}
                      ${C}   <!-- ✅ 추가된 부분 -->
                    </li>
                `}else{const k=s.point===0?"0P":`${s.point}P`;let C="card",L="카드",E="정보 없음",T="정보없음";s.point>0&&(C="point",L="포인트"),s.pointData&&(E=s.pointData.tel||"정보 없음",T=`${s.pointData.points||0}P`);let H="",P="";if(C==="card"){const S=s.payInfo||{},U=S.issuerName||"정보 없음",c=S.cardBin||"정보 없음";H=`
                        <div>
                            <h5>결제 카드</h5>
                            <p>${U}</p>
                        </div>
                        <div>
                            <h5>카드 번호</h5>
                            <p>${c}</p>
                        </div>
                    `}else C==="point"&&(P=`
                        <div>
                            <h5>포인트 연락처</h5>
                            <p>${E}</p>
                        </div>
                        <div>
                            <h5>사용 포인트</h5>
                            <p>${k.toLocaleString()}</p>
                        </div>
                        <div>
                            <h5>적립 포인트</h5>
                            <p>${T.toLocaleString()}</p>
                        </div>
                    `);const O=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((u=s.totalPayInfo)==null?void 0:u.filter(S=>S.method==="쿠폰").flatMap(S=>S.coupons||[]).map(S=>`${S.name} (${S.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
                `;v=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${r}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${y.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${y.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${y.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${y.businessNo}</p>
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
                        <p>${s.orderId||"정보 없음"}</p>
                      </div>
                      <div>
                        <h5>결제 수단</h5>
                        <p>${L}</p>
                      </div>
                      ${O}   <!-- ✅ 추가된 부분 -->
                      ${H}
                      ${P}
                    </li>
                `}}else{const r=new Date(s.lastOrderTimestamp),p=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`;v=`
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
      `}const I=document.querySelector(".popup-body .history");I&&(I.innerHTML=v);const w=document.querySelector(".popup-footer");if(w){const r=w.querySelector(".btn.blue"),p=w.querySelector(".btn.red");r&&(r.style.visibility="hidden",r.style.opacity="0"),p&&(p.style.visibility="hidden",p.style.opacity="0")}}catch(l){console.error("팝업 데이터 업데이트 실패:",l)}}function D(n){const t=n.getFullYear(),e=String(n.getMonth()+1).padStart(2,"0"),o=String(n.getDate()).padStart(2,"0");return`${t}-${e}-${o}`}function lt(){return!m&&!g?!0:!m||!g?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):m>g?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function ct(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');n&&(n.value="",m=""),t&&(t.value="",g="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function dt(){try{let n=function(){Object.assign(t.style,a),Object.assign(i.style,u),e.forEach((l,s)=>{l.style.display=o[s]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),o=e.map(l=>l.style.display);e.forEach(l=>l.style.display="none");const a={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},i=t.querySelector(".history"),u={maxHeight:i.style.maxHeight,minHeight:i.style.minHeight,height:i.style.height,overflow:i.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(i.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{G(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(l=>{const s=document.createElement("canvas"),f=s.getContext("2d");s.width=l.width,s.height=l.height,f&&(f.beginPath(),f.roundRect(0,0,l.width,l.height,10),f.clip(),f.drawImage(l,0,0));const h=`매출정보_${new Date().toISOString().slice(0,10)}.png`;pt(s.toDataURL("image/png"),h),n(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(l=>{console.error("이미지 저장 실패:",l),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),n()})},100)}catch(n){console.error("이미지 저장 실패:",n),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function pt(n,t){const e=document.createElement("a");e.download=t,e.href=n,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function Y(){const n=document.querySelector(".countArea");if(n){const t=n.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function ut(){const n=document.querySelector(".btn.wt");n&&n.addEventListener("click",ft)}async function ft(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if(b==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,x!=="all"&&(e+=`&paymentType=${x}`),m&&g&&(e+=`&startDate=${m}&endDate=${g}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,d>1&&q.length>0){const u=d-2;q[u]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[u]))}`)}const a=await(await N(e)).json();if(!a.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const i=document.createElement("a");i.href=a.excelUrl,document.body.appendChild(i),i.click(),document.body.removeChild(i)}catch(n){console.error("엑셀 다운로드 실패:",n),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{mt as initSales};
