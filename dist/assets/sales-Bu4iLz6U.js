import{h as W}from"./html2canvas.esm-BfYXEYrK.js";import{a as H}from"./main-OJnQMRvD.js";let P=[],q=[],K=0,c=1;const O=10;let $="transaction",g="",S="",L="all";function ht(){console.log("✅ sales.ts 로드됨"),G(),z(),X(),et(),pt(),$="transaction",Q(),v(),st()}function G(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&($=e===0?"transaction":"product",c=1,tt(),$==="product"&&(Q(),g="",S=""),v())})})}function z(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),o=document.querySelector(".btn-i.reset");n&&n.addEventListener("change",s=>{g=s.target.value}),t&&t.addEventListener("change",s=>{S=s.target.value}),e&&e.addEventListener("click",()=>{rt()&&(c=1,v())}),o&&o.addEventListener("click",()=>{lt(),c=1,v()})}function X(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&(Z(e),c=1,v())})})}function Z(n){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const o=new Date;let s="",i="";switch(n){case 0:s="",i="";break;case 1:s=D(o),i=D(o);break;case 2:const d=new Date(o);d.setDate(o.getDate()-1),s=D(d),i=D(d);break;case 3:const a=new Date(o.getFullYear(),o.getMonth(),1),f=new Date(o.getFullYear(),o.getMonth()+1,0);s=D(a),i=D(f);break;case 4:const y=new Date(o.getFullYear(),o.getMonth()-1,1),p=new Date(o.getFullYear(),o.getMonth(),0);s=D(y),i=D(p);break}t.value=s,e.value=i,g=s,S=i}function tt(){const n=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),o=document.getElementById("detail-settings-section");if(!n||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}$==="transaction"?(n.innerHTML=`
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
    `,t.classList.add("product-view"),e&&(e.style.display="none"),o&&(o.style.display="none"))}async function v(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if($==="transaction")await J(t),await nt(t);else{await J(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;P=((await(await H(e)).json()).items||[]).sort((i,d)=>(d.totalCount||0)-(i.totalCount||0)),await Y(P)}}catch(n){console.error("매출 데이터 로드 실패:",n)}}async function J(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;g&&S&&(t+=`&startDate=${g}&endDate=${S}`);const o=await(await H(t)).json();ot(o)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function et(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{if(o.target.checked){switch(e){case 0:L="all";break;case 1:L="card";break;case 2:L="point";break}c=1,v()}})})}async function nt(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;if(g&&S&&(t+=`&startDate=${g}&endDate=${S}`),L!=="all"&&(t+=`&paymentType=${L}`),c>1&&q.length>0){const s=c-2;q[s]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[s]))}`)}const o=await(await H(t)).json();if(c===1&&(q=[],K=o.total||0,o.pageKeys))try{q=JSON.parse(o.pageKeys)}catch(s){console.error("pageKeys 파싱 실패:",s)}P=o.items||[],await Y(P)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function ot(n){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const o=e[0].querySelector("h4");if(o){const s=n.totalPriceSum||0;o.innerHTML=`${s.toLocaleString()}<small>원</small>`}}if(e[1]){const o=e[1].querySelector("h4");if(o){const s=n.totalCount||0;o.innerHTML=`${s}<small>건</small>`}}if(e[2]){const o=e[2].querySelector("h4");if(o){const s=n.pointSum||0;o.innerHTML=`${s}<small>P</small>`}}if(e[3]){const o=e[3].querySelector("h4");if(o){const s=n.pointCount||0;o.innerHTML=`${s}<small>건</small>`}}}}async function Y(n){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",n.forEach((e,o)=>{var a;let s="";if($==="transaction"){const f=String(e.timestamp).split("T"),y=f[0],p=f[1].substring(0,5),b=((a=e.menuSummary[0])==null?void 0:a.name)||"알 수 없음",w=e.menuSummary.reduce((u,r)=>u+(r.count||1),0),I=w>1?`<label class="plus">+${w-1}</label>`:"";s=`
        <td>${(c-1)*O+o+1}</td>
        <td>${y} <br class="br-s">${p}</td>
        <td class="rel"><span>${b}</span> ${I}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const f=e.name||"알 수 없음",y=e.totalSales||0,p=e.totalCount||0;s=`
        <td>${o+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${f}</span></td>
        <td>${y.toLocaleString()}원</td>
        <td class="blue">${p}건</td>
      `}const i=document.createElement("tr");i.className="on-popup";const d=$==="product"?o.toString():((c-1)*O+o).toString();i.setAttribute("data-index",d),i.innerHTML=s,t.appendChild(i)}),at())}function at(){const n=document.querySelector(".pagination");if(!n)return;if($==="product"){n.style.display="none";return}n.style.display="block";const t=Math.ceil(K/O),e=n.querySelector(".page-numbers");e&&(e.innerHTML=""),n.querySelectorAll("button[data-page]").forEach(r=>r.remove());const s=5;let i=Math.max(1,c-Math.floor(s/2)),d=i+s-1;d>t&&(d=t,i=Math.max(1,d-s+1));for(let r=i;r<=d;r++){const h=document.createElement("button");h.setAttribute("data-page",String(r)),h.innerText=String(r),h.style.display="inline-block",h.style.margin="0 2px",h.style.padding="5px 10px",h.style.border="1px solid #ddd",h.style.backgroundColor=r===c?"#007bff":"#fff",h.style.color=r===c?"#fff":"#333",h.style.cursor="pointer",r===c&&h.classList.add("active"),h.addEventListener("click",()=>{r!==c&&(c=r,v())});const N=n.querySelector(".page-next");N?n.insertBefore(h,N):n.appendChild(h)}const a=n.querySelector(".page-first"),f=n.querySelector(".page-prev"),y=n.querySelector(".page-next"),p=n.querySelector(".page-last");a&&(a.style.display="inline-block"),f&&(f.style.display="inline-block"),y&&(y.style.display="inline-block"),p&&(p.style.display="inline-block"),[a,f,y,p].forEach(r=>{r&&r.replaceWith(r.cloneNode(!0))});const b=n.querySelector(".page-first"),w=n.querySelector(".page-prev"),I=n.querySelector(".page-next"),u=n.querySelector(".page-last");b&&(b.addEventListener("click",()=>{c>1&&(c=1,v())}),b.disabled=c===1),w&&(w.addEventListener("click",()=>{c>1&&(c--,v())}),w.disabled=c===1),I&&(I.addEventListener("click",()=>{c<t&&(c++,v())}),I.disabled=c===t),u&&(u.addEventListener("click",()=>{c<t&&(c=t,v())}),u.disabled=c===t)}function st(){const n=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const o=e.closest(".on-popup"),s=parseInt(o.getAttribute("data-index")||"0");it(s),n.style.display="flex"}e.closest(".save-img")&&ct(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(n.style.display="none")})}async function it(n){var t,e,o,s,i;try{let d,a;if($==="product"?(d=n,a=P[d]):(d=n%O,a=P[d]),console.log("item",a),!a){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",d);return}const y=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let p={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const r=await(await H(`/model_user_setting?func=get-user&userId=${y}`)).json();r&&r.user&&(p={storeName:r.user.storeName||"정보 없음",tel:r.user.tel||"정보 없음",address:r.user.address||"정보 없음",businessNo:r.user.businessNo||"정보 없음"})}catch(u){console.error("매장 정보 로드 실패:",u)}let b="";if($==="transaction"){const u=a.menuSummary.map(M=>`${M.name} / ${M.count||1}개`).join("<br>"),r=String(a.timestamp).split("T"),h=r[0],N=r[1].substring(0,5),U=`${h} ${N}`;if(a.totalPayInfo){const B=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((t=a.totalPayInfo)==null?void 0:t.filter(l=>l.method==="쿠폰").flatMap(l=>l.coupons||[]).map(l=>`${l.name} (${l.couponCode}) - ${l.price.toLocaleString()}`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
            `,T=(e=a.totalPayInfo)==null?void 0:e.filter(l=>l.method==="카드").flatMap(l=>l||{});let x="미사용",E="미사용";T.length>0&&(x=T.map(l=>`${l.method} (${l.issuerName})`),E=T.map(l=>`${l.cardBin}`));const k=String(a.payInfo.approvalDateTime).split("T"),A=k[0],F=k[1].substring(0,5),j=`${A} ${F}`,m=(o=a.totalPayInfo)==null?void 0:o.filter(l=>l.method==="바코드QR").flatMap(l=>l||{});m.length>0&&(x=m.map(l=>`${l.method} (${l.payName})`),E=m.map(l=>`${l.cardBin}`));const C=(s=a.totalPayInfo)==null?void 0:s.filter(l=>l.method==="마일리지").flatMap(l=>l||{});let R="미등록 고객",_="미사용";C.length>0&&(R=C.map(l=>`${l.mileageNo}`),_=C.map(l=>`${l.usedAmount.toLocaleString()}`));const V=`
                    <div>
                        <h5>결제 수단</h5>
                        <p>${x}</p>
                    </div>
                    <div>
                        <h5>실제결제 시간</h5>
                        <p>${j}</p>
                    </div>
                    <div>
                        <h5>카드 번호</h5>
                        <p>${E}</p>
                    </div>
                    <div>
                        <h5>고객번호</h5>
                        <p>${R}</p>
                    </div>
                    <div>
                        <h5>사용 포인트</h5>
                        <p>${_}</p>
                    </div>
                `;b=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${u}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${p.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${p.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${p.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${p.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${a.totalPrice.toLocaleString()}원</p>
                      </div>
                      <div>
                        <h5>결제 일자</h5>
                        <p>${U}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${a.orderId||"정보 없음"}</p>
                      </div>
                      ${V}
                      ${B}   <!-- ✅ 추가된 부분 -->
                    </li>
                `}else{const M=a.point===0?"0P":`${a.point}P`;let B="card",T="카드",x="정보 없음",E="정보없음";a.point>0&&(B="point",T="포인트"),a.pointData&&(x=a.pointData.tel||"정보 없음",E=`${a.pointData.points||0}P`);let k="",A="";if(B==="card"){const m=a.payInfo||{},C=m.issuerName||"정보 없음",R=m.cardBin||"정보 없음";k=`
                        <div>
                            <h5>결제 카드</h5>
                            <p>${C}</p>
                        </div>
                        <div>
                            <h5>카드 번호</h5>
                            <p>${R}</p>
                        </div>
                    `}else B==="point"&&(A=`
                        <div>
                            <h5>포인트 연락처</h5>
                            <p>${x}</p>
                        </div>
                        <div>
                            <h5>사용 포인트</h5>
                            <p>${M.toLocaleString()}</p>
                        </div>
                        <div>
                            <h5>적립 포인트</h5>
                            <p>${E.toLocaleString()}</p>
                        </div>
                    `);const j=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((i=a.totalPayInfo)==null?void 0:i.filter(m=>m.method==="쿠폰").flatMap(m=>m.coupons||[]).map(m=>`${m.name} (${m.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
                `;b=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${u}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${p.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${p.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${p.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${p.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${a.totalPrice.toLocaleString()}원</p>
                      </div>
                      <div>
                        <h5>결제 일자</h5>
                        <p>${U}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${a.orderId||"정보 없음"}</p>
                      </div>
                      <div>
                        <h5>결제 수단</h5>
                        <p>${T}</p>
                      </div>
                      ${j}   <!-- ✅ 추가된 부분 -->
                      ${k}
                      ${A}
                    </li>
                `}}else{const u=new Date(a.lastOrderTimestamp),r=`${u.getFullYear()}-${String(u.getMonth()+1).padStart(2,"0")}-${String(u.getDate()).padStart(2,"0")}`;b=`
        <li>
          <div>
            <h5>상품명</h5>
            <p>${a.name||"정보 없음"}</p>
          </div>
          <div>
            <h5>상품 ID</h5>
            <p>${a.menuId||"정보 없음"}</p>
          </div>
        </li>
        <li>
          <div>
            <h5>총 주문액</h5>
            <p>${(a.totalSales||0).toLocaleString()}원</p>
          </div>
          <div>
            <h5>총 주문 건수</h5>
            <p>${a.totalCount||0}건</p>
          </div>
          <div>
            <h5>마지막 주문일</h5>
            <p>${r}</p>
          </div>
        </li>
      `}const w=document.querySelector(".popup-body .history");w&&(w.innerHTML=b);const I=document.querySelector(".popup-footer");if(I){const u=I.querySelector(".btn.blue"),r=I.querySelector(".btn.red");u&&(u.style.visibility="hidden",u.style.opacity="0"),r&&(r.style.visibility="hidden",r.style.opacity="0")}}catch(d){console.error("팝업 데이터 업데이트 실패:",d)}}function D(n){const t=n.getFullYear(),e=String(n.getMonth()+1).padStart(2,"0"),o=String(n.getDate()).padStart(2,"0");return`${t}-${e}-${o}`}function rt(){return!g&&!S?!0:!g||!S?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):g>S?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function lt(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');n&&(n.value="",g=""),t&&(t.value="",S="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function ct(){try{let n=function(){Object.assign(t.style,s),Object.assign(i.style,d),e.forEach((a,f)=>{a.style.display=o[f]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),o=e.map(a=>a.style.display);e.forEach(a=>a.style.display="none");const s={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},i=t.querySelector(".history"),d={maxHeight:i.style.maxHeight,minHeight:i.style.minHeight,height:i.style.height,overflow:i.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(i.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{W(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(a=>{const f=document.createElement("canvas"),y=f.getContext("2d");f.width=a.width,f.height=a.height,y&&(y.beginPath(),y.roundRect(0,0,a.width,a.height,10),y.clip(),y.drawImage(a,0,0));const p=`매출정보_${new Date().toISOString().slice(0,10)}.png`;dt(f.toDataURL("image/png"),p),n(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(a=>{console.error("이미지 저장 실패:",a),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),n()})},100)}catch(n){console.error("이미지 저장 실패:",n),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function dt(n,t){const e=document.createElement("a");e.download=t,e.href=n,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function Q(){const n=document.querySelector(".countArea");if(n){const t=n.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function pt(){const n=document.querySelector(".btn.wt");n&&n.addEventListener("click",ut)}async function ut(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if($==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,L!=="all"&&(e+=`&paymentType=${L}`),g&&S&&(e+=`&startDate=${g}&endDate=${S}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,c>1&&q.length>0){const d=c-2;q[d]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[d]))}`)}const s=await(await H(e)).json();if(!s.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const i=document.createElement("a");i.href=s.excelUrl,document.body.appendChild(i),i.click(),document.body.removeChild(i)}catch(n){console.error("엑셀 다운로드 실패:",n),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{ht as initSales};
