import{h as tt}from"./html2canvas.esm-BfYXEYrK.js";import{a as E}from"./main-YedABb3F.js";let x=[],q=[],Y=0,c=1;const P=10;let v="transaction",m="",g="",L="all";function wt(){console.log("✅ sales.ts 로드됨"),et(),nt(),ot(),it(),mt(),v="transaction",V(),S(),dt()}function et(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&(v=e===0?"transaction":"product",c=1,st(),v==="product"&&(V(),m="",g=""),S())})})}function nt(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),o=document.querySelector(".btn-i.reset");n&&n.addEventListener("change",s=>{m=s.target.value}),t&&t.addEventListener("change",s=>{g=s.target.value}),e&&e.addEventListener("click",()=>{ut()&&(c=1,S())}),o&&o.addEventListener("click",()=>{ft(),c=1,S()})}function ot(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",o=>{o.target.checked&&(at(e),c=1,S())})})}function at(n){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const o=new Date;let s="",r="";switch(n){case 0:s="",r="";break;case 1:s=D(o),r=D(o);break;case 2:const d=new Date(o);d.setDate(o.getDate()-1),s=D(d),r=D(d);break;case 3:const a=new Date(o.getFullYear(),o.getMonth(),1),f=new Date(o.getFullYear(),o.getMonth()+1,0);s=D(a),r=D(f);break;case 4:const y=new Date(o.getFullYear(),o.getMonth()-1,1),p=new Date(o.getFullYear(),o.getMonth(),0);s=D(y),r=D(p);break}t.value=s,e.value=r,m=s,g=r}function st(){const n=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),o=document.getElementById("detail-settings-section");if(!n||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}v==="transaction"?(n.innerHTML=`
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
    `,t.classList.add("product-view"),e&&(e.style.display="none"),o&&(o.style.display="none"))}async function S(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(v==="transaction")await K(t),await rt(t);else{await K(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;x=((await(await E(e)).json()).items||[]).sort((r,d)=>(d.totalCount||0)-(r.totalCount||0)),await Q(x)}}catch(n){console.error("매출 데이터 로드 실패:",n)}}async function K(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;m&&g&&(t+=`&startDate=${m}&endDate=${g}`);const o=await(await E(t)).json();lt(o)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function it(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",o=>{if(o.target.checked){switch(e){case 0:L="all";break;case 1:L="card";break;case 2:L="point";break}c=1,S()}})})}async function rt(n){try{let t=`/model_payment?func=get-payment&userId=${n}`;if(m&&g&&(t+=`&startDate=${m}&endDate=${g}`),L!=="all"&&(t+=`&paymentType=${L}`),c>1&&q.length>0){const s=c-2;q[s]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[s]))}`)}const o=await(await E(t)).json();if(c===1&&(q=[],Y=o.total||0,o.pageKeys))try{q=JSON.parse(o.pageKeys)}catch(s){console.error("pageKeys 파싱 실패:",s)}x=o.items||[],await Q(x)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function lt(n){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const o=e[0].querySelector("h4");if(o){const s=n.totalPriceSum||0;o.innerHTML=`${s.toLocaleString()}<small>원</small>`}}if(e[1]){const o=e[1].querySelector("h4");if(o){const s=n.totalCount||0;o.innerHTML=`${s}<small>건</small>`}}if(e[2]){const o=e[2].querySelector("h4");if(o){const s=n.pointSum||0;o.innerHTML=`${s}<small>P</small>`}}if(e[3]){const o=e[3].querySelector("h4");if(o){const s=n.pointCount||0;o.innerHTML=`${s}<small>건</small>`}}}}async function Q(n){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",n.forEach((e,o)=>{var a;let s="";if(v==="transaction"){const f=String(e.timestamp).split("T"),y=f[0],p=f[1].substring(0,5),$=((a=e.menuSummary[0])==null?void 0:a.name)||"알 수 없음",b=e.menuSummary.reduce((u,l)=>u+(l.count||1),0),w=b>1?`<label class="plus">+${b-1}</label>`:"";s=`
        <td>${(c-1)*P+o+1}</td>
        <td>${y} <br class="br-s">${p}</td>
        <td class="rel"><span>${$}</span> ${w}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const f=e.name||"알 수 없음",y=e.totalSales||0,p=e.totalCount||0;s=`
        <td>${o+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${f}</span></td>
        <td>${y.toLocaleString()}원</td>
        <td class="blue">${p}건</td>
      `}const r=document.createElement("tr");r.className="on-popup";const d=v==="product"?o.toString():((c-1)*P+o).toString();r.setAttribute("data-index",d),r.innerHTML=s,t.appendChild(r)}),ct())}function ct(){const n=document.querySelector(".pagination");if(!n)return;if(v==="product"){n.style.display="none";return}n.style.display="block";const t=Math.ceil(Y/P),e=n.querySelector(".page-numbers");e&&(e.innerHTML=""),n.querySelectorAll("button[data-page]").forEach(l=>l.remove());const s=5;let r=Math.max(1,c-Math.floor(s/2)),d=r+s-1;d>t&&(d=t,r=Math.max(1,d-s+1));for(let l=r;l<=d;l++){const h=document.createElement("button");h.setAttribute("data-page",String(l)),h.innerText=String(l),h.style.display="inline-block",h.style.margin="0 2px",h.style.padding="5px 10px",h.style.border="1px solid #ddd",h.style.backgroundColor=l===c?"#007bff":"#fff",h.style.color=l===c?"#fff":"#333",h.style.cursor="pointer",l===c&&h.classList.add("active"),h.addEventListener("click",()=>{l!==c&&(c=l,S())});const T=n.querySelector(".page-next");T?n.insertBefore(h,T):n.appendChild(h)}const a=n.querySelector(".page-first"),f=n.querySelector(".page-prev"),y=n.querySelector(".page-next"),p=n.querySelector(".page-last");a&&(a.style.display="inline-block"),f&&(f.style.display="inline-block"),y&&(y.style.display="inline-block"),p&&(p.style.display="inline-block"),[a,f,y,p].forEach(l=>{l&&l.replaceWith(l.cloneNode(!0))});const $=n.querySelector(".page-first"),b=n.querySelector(".page-prev"),w=n.querySelector(".page-next"),u=n.querySelector(".page-last");$&&($.addEventListener("click",()=>{c>1&&(c=1,S())}),$.disabled=c===1),b&&(b.addEventListener("click",()=>{c>1&&(c--,S())}),b.disabled=c===1),w&&(w.addEventListener("click",()=>{c<t&&(c++,S())}),w.disabled=c===t),u&&(u.addEventListener("click",()=>{c<t&&(c=t,S())}),u.disabled=c===t)}function dt(){const n=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const o=e.closest(".on-popup"),s=parseInt(o.getAttribute("data-index")||"0");pt(s),n.style.display="flex"}e.closest(".save-img")&&yt(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(n.style.display="none")})}async function pt(n){var t,e,o,s,r;try{let d,a;if(v==="product"?(d=n,a=x[d]):(d=n%P,a=x[d]),!a){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",d);return}const y=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let p={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const l=await(await E(`/model_user_setting?func=get-user&userId=${y}`)).json();l&&l.user&&(p={storeName:l.user.storeName||"정보 없음",tel:l.user.tel||"정보 없음",address:l.user.address||"정보 없음",businessNo:l.user.businessNo||"정보 없음"})}catch(u){console.error("매장 정보 로드 실패:",u)}let $="";if(v==="transaction"){console.log("item: ",a);const u=a.menuSummary.map(i=>`${i.name} / ${i.count||1}개`).join("<br>"),l=String(a.timestamp).split("T"),h=l[0],T=l[1].substring(0,5),A=`${h} ${T}`,W=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((t=a.totalPayInfo)==null?void 0:t.filter(i=>i.method==="쿠폰").flatMap(i=>i.coupons||[]).map(i=>`${i.name} (${i.couponCode}) - ${i.price}`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
            `,M=(e=a.totalPayInfo)==null?void 0:e.filter(i=>i.method==="카드").flatMap(i=>i||{});let B="미사용",k="미사용";M.length>0&&(B=M.map(i=>`${i.method} (${i.issuerName})`),k=M.map(i=>`${i.cardBin}`));const C=(o=a.totalPayInfo)==null?void 0:o.filter(i=>i.method==="바코드QR").flatMap(i=>i||{});C.length>0&&(B=C.map(i=>`${i.method} (${i.payName})`),k=C.map(i=>`${i.cardBin}`));const H=(s=a.totalPayInfo)==null?void 0:s.filter(i=>i.method==="마일리지").flatMap(i=>i||{});let R="미등록 고객",O="미사용";H.length>0&&(R=H.map(i=>`${i.tel}`),O=H.map(i=>`${i.usedAmount}`));const G=`
                    <div>
                        <h5>결제 수단</h5>
                        <p>${B}</p>
                    </div>
                    <div>
                        <h5>카드 번호</h5>
                        <p>${k}</p>
                    </div>
                    <div>
                        <h5>포인트 연락처</h5>
                        <p>${R}</p>
                    </div>
                    <div>
                        <h5>사용 포인트</h5>
                        <p>${O}</p>
                    </div>
                `;if(a.totalPayInfo)$=`
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
                        <p>${A}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${a.orderId||"정보 없음"}</p>
                      </div>
                      ${G}
                      ${W}   <!-- ✅ 추가된 부분 -->
                    </li>
                `;else{const i=a.point===0?"0P":`${a.point}P`;let N="card",j="카드",U="정보 없음",F="정보없음";a.point>0&&(N="point",j="포인트"),a.pointData&&(U=a.pointData.tel||"정보 없음",F=`${a.pointData.points||0}P`);let _="",J="";if(N==="card"){const I=a.payInfo||{},X=I.issuerName||"정보 없음",Z=I.cardBin||"정보 없음";_=`
                        <div>
                            <h5>결제 카드</h5>
                            <p>${X}</p>
                        </div>
                        <div>
                            <h5>카드 번호</h5>
                            <p>${Z}</p>
                        </div>
                    `}else N==="point"&&(J=`
                        <div>
                            <h5>포인트 연락처</h5>
                            <p>${U}</p>
                        </div>
                        <div>
                            <h5>사용 포인트</h5>
                            <p>${i}</p>
                        </div>
                        <div>
                            <h5>적립 포인트</h5>
                            <p>${F}</p>
                        </div>
                    `);const z=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((r=a.totalPayInfo)==null?void 0:r.filter(I=>I.method==="쿠폰").flatMap(I=>I.coupons||[]).map(I=>`${I.name} (${I.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
                `;$=`
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
                        <p>${A}</p>
                      </div>
                      <div>
                        <h5>승인번호</h5>
                        <p>${a.orderId||"정보 없음"}</p>
                      </div>
                      <div>
                        <h5>결제 수단</h5>
                        <p>${j}</p>
                      </div>
                      ${z}   <!-- ✅ 추가된 부분 -->
                      ${_}
                      ${J}
                    </li>
                `}}else{const u=new Date(a.lastOrderTimestamp),l=`${u.getFullYear()}-${String(u.getMonth()+1).padStart(2,"0")}-${String(u.getDate()).padStart(2,"0")}`;$=`
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
            <p>${l}</p>
          </div>
        </li>
      `}const b=document.querySelector(".popup-body .history");b&&(b.innerHTML=$);const w=document.querySelector(".popup-footer");if(w){const u=w.querySelector(".btn.blue"),l=w.querySelector(".btn.red");u&&(u.style.visibility="hidden",u.style.opacity="0"),l&&(l.style.visibility="hidden",l.style.opacity="0")}}catch(d){console.error("팝업 데이터 업데이트 실패:",d)}}function D(n){const t=n.getFullYear(),e=String(n.getMonth()+1).padStart(2,"0"),o=String(n.getDate()).padStart(2,"0");return`${t}-${e}-${o}`}function ut(){return!m&&!g?!0:!m||!g?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):m>g?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function ft(){const n=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');n&&(n.value="",m=""),t&&(t.value="",g="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function yt(){try{let n=function(){Object.assign(t.style,s),Object.assign(r.style,d),e.forEach((a,f)=>{a.style.display=o[f]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),o=e.map(a=>a.style.display);e.forEach(a=>a.style.display="none");const s={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},r=t.querySelector(".history"),d={maxHeight:r.style.maxHeight,minHeight:r.style.minHeight,height:r.style.height,overflow:r.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(r.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{tt(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(a=>{const f=document.createElement("canvas"),y=f.getContext("2d");f.width=a.width,f.height=a.height,y&&(y.beginPath(),y.roundRect(0,0,a.width,a.height,10),y.clip(),y.drawImage(a,0,0));const p=`매출정보_${new Date().toISOString().slice(0,10)}.png`;ht(f.toDataURL("image/png"),p),n(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(a=>{console.error("이미지 저장 실패:",a),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),n()})},100)}catch(n){console.error("이미지 저장 실패:",n),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function ht(n,t){const e=document.createElement("a");e.download=t,e.href=n,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function V(){const n=document.querySelector(".countArea");if(n){const t=n.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function mt(){const n=document.querySelector(".btn.wt");n&&n.addEventListener("click",gt)}async function gt(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if(v==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,L!=="all"&&(e+=`&paymentType=${L}`),m&&g&&(e+=`&startDate=${m}&endDate=${g}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,c>1&&q.length>0){const d=c-2;q[d]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(q[d]))}`)}const s=await(await E(e)).json();if(!s.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const r=document.createElement("a");r.href=s.excelUrl,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch(n){console.error("엑셀 다운로드 실패:",n),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{wt as initSales};
