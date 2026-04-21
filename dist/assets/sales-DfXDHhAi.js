import{h as Z}from"./html2canvas.esm-BfYXEYrK.js";import{a as R}from"./main-BrjEWvpU.js";let N=[],L=[],K=0,d=1;const _=10;let b="transaction",g="",v="",E="all";function gt(){console.log("✅ sales.ts 로드됨"),z(),X(),tt(),nt(),ft(),b="transaction",W(),$(),rt()}function z(){document.querySelectorAll('input[name="sales-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(b=e===0?"transaction":"product",d=1,ot(),b==="product"&&(W(),g="",v=""),$())})})}function X(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type'),e=document.querySelector(".btn-i.search"),n=document.querySelector(".btn-i.reset");o&&o.addEventListener("change",s=>{g=s.target.value}),t&&t.addEventListener("change",s=>{v=s.target.value}),e&&e.addEventListener("click",()=>{ct()&&(d=1,$())}),n&&n.addEventListener("click",()=>{dt(),d=1,$()})}function tt(){document.querySelectorAll('input[name="detail-period"]').forEach((t,e)=>{t.addEventListener("change",n=>{n.target.checked&&(et(e),d=1,$())})})}function et(o){const t=document.querySelector('input[type="date"]:first-of-type'),e=document.querySelector('input[type="date"]:last-of-type');if(!t||!e)return;const n=new Date;let s="",r="";switch(o){case 0:s="",r="";break;case 1:s=q(n),r=q(n);break;case 2:const u=new Date(n);u.setDate(n.getDate()-1),s=q(u),r=q(u);break;case 3:const c=new Date(n.getFullYear(),n.getMonth(),1),a=new Date(n.getFullYear(),n.getMonth()+1,0);s=q(c),r=q(a);break;case 4:const f=new Date(n.getFullYear(),n.getMonth()-1,1),m=new Date(n.getFullYear(),n.getMonth(),0);s=q(f),r=q(m);break}t.value=s,e.value=r,g=s,v=r}function ot(){const o=document.getElementById("table-header"),t=document.querySelector(".tableArea"),e=document.getElementById("date-search-section"),n=document.getElementById("detail-settings-section");if(!o||!t){console.error("테이블 요소를 찾을 수 없습니다.");return}b==="transaction"?(o.innerHTML=`
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
    `,t.classList.add("product-view"),e&&(e.style.display="none"),n&&(n.style.display="none"))}async function $(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(b==="transaction")await J(t),await at(t);else{await J(t);let e=`/model_payment?userId=${t}&func=get-menu-statistics`;N=((await(await R(e)).json()).items||[]).sort((r,u)=>(u.totalCount||0)-(r.totalCount||0)),await Y(N)}}catch(o){console.error("매출 데이터 로드 실패:",o)}}async function J(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;g&&v&&(t+=`&startDate=${g}&endDate=${v}`);const n=await(await R(t)).json();st(n)}catch(t){console.error("섹션 데이터 로드 실패:",t)}}function nt(){document.querySelectorAll('input[name="payment-type"]').forEach((t,e)=>{t.addEventListener("change",n=>{if(n.target.checked){switch(e){case 0:E="all";break;case 1:E="card";break;case 2:E="point";break}d=1,$()}})})}async function at(o){try{let t=`/model_payment?func=get-payment&userId=${o}`;if(g&&v&&(t+=`&startDate=${g}&endDate=${v}`),E!=="all"&&(t+=`&paymentType=${E}`),d>1&&L.length>0){const s=d-2;L[s]&&(t+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(L[s]))}`)}const n=await(await R(t)).json();if(d===1&&(L=[],K=n.total||0,n.pageKeys))try{L=JSON.parse(n.pageKeys)}catch(s){console.error("pageKeys 파싱 실패:",s)}N=n.items||[],await Y(N)}catch(t){console.error("테이블 데이터 로드 실패:",t)}}function st(o){const t=document.querySelector(".countArea");if(t){const e=t.querySelectorAll(".countbox");if(e[0]){const n=e[0].querySelector("h4");if(n){const s=o.totalPriceSum||0;n.innerHTML=`${s.toLocaleString()}<small>원</small>`}}if(e[1]){const n=e[1].querySelector("h4");if(n){const s=o.totalCount||0;n.innerHTML=`${s}<small>건</small>`}}if(e[2]){const n=e[2].querySelector("h4");if(n){const s=o.pointSum||0;n.innerHTML=`${s}<small>P</small>`}}if(e[3]){const n=e[3].querySelector("h4");if(n){const s=o.pointCount||0;n.innerHTML=`${s}<small>건</small>`}}}}async function Y(o){const t=document.querySelector(".tableArea table tbody");t&&(t.innerHTML="",o.forEach((e,n)=>{var c;let s="";if(b==="transaction"){const a=String(e.timestamp).split("T"),f=a[0],m=a[1].substring(0,5),h=((c=e.menuSummary[0])==null?void 0:c.name)||"알 수 없음",S=e.menuSummary.reduce((w,l)=>w+(l.count||1),0),I=S>1?`<label class="plus">+${S-1}</label>`:"";s=`
        <td>${(d-1)*_+n+1}</td>
        <td>${f} <br class="br-s">${m}</td>
        <td class="rel"><span>${h}</span> ${I}</td>
        <td>${e.totalPrice.toLocaleString()}원</td>
        <td class="blue">정보없음</td>
      `}else{const a=e.name||"알 수 없음",f=e.totalSales||0,m=e.totalCount||0;s=`
        <td>${n+1}</td>
        <td class="rel" style="padding-left: 3rem; text-align: left;"><span>${a}</span></td>
        <td>${f.toLocaleString()}원</td>
        <td class="blue">${m}건</td>
      `}const r=document.createElement("tr");r.className="on-popup";const u=b==="product"?n.toString():((d-1)*_+n).toString();r.setAttribute("data-index",u),r.innerHTML=s,t.appendChild(r)}),it())}function it(){const o=document.querySelector(".pagination");if(!o)return;if(b==="product"){o.style.display="none";return}o.style.display="block";const t=Math.ceil(K/_),e=o.querySelector(".page-numbers");e&&(e.innerHTML=""),o.querySelectorAll("button[data-page]").forEach(l=>l.remove());const s=5;let r=Math.max(1,d-Math.floor(s/2)),u=r+s-1;u>t&&(u=t,r=Math.max(1,u-s+1));for(let l=r;l<=u;l++){const p=document.createElement("button");p.setAttribute("data-page",String(l)),p.innerText=String(l),p.style.display="inline-block",p.style.margin="0 2px",p.style.padding="5px 10px",p.style.border="1px solid #ddd",p.style.backgroundColor=l===d?"#007bff":"#fff",p.style.color=l===d?"#fff":"#333",p.style.cursor="pointer",l===d&&p.classList.add("active"),p.addEventListener("click",()=>{l!==d&&(d=l,$())});const O=o.querySelector(".page-next");O?o.insertBefore(p,O):o.appendChild(p)}const c=o.querySelector(".page-first"),a=o.querySelector(".page-prev"),f=o.querySelector(".page-next"),m=o.querySelector(".page-last");c&&(c.style.display="inline-block"),a&&(a.style.display="inline-block"),f&&(f.style.display="inline-block"),m&&(m.style.display="inline-block"),[c,a,f,m].forEach(l=>{l&&l.replaceWith(l.cloneNode(!0))});const h=o.querySelector(".page-first"),S=o.querySelector(".page-prev"),I=o.querySelector(".page-next"),w=o.querySelector(".page-last");h&&(h.addEventListener("click",()=>{d>1&&(d=1,$())}),h.disabled=d===1),S&&(S.addEventListener("click",()=>{d>1&&(d--,$())}),S.disabled=d===1),I&&(I.addEventListener("click",()=>{d<t&&(d++,$())}),I.disabled=d===t),w&&(w.addEventListener("click",()=>{d<t&&(d=t,$())}),w.disabled=d===t)}function rt(){const o=document.querySelector(".popup-overlay");document.addEventListener("click",t=>{const e=t.target;if(e.closest(".on-popup")){const n=e.closest(".on-popup"),s=parseInt(n.getAttribute("data-index")||"0");lt(s),o.style.display="flex"}e.closest(".save-img")&&pt(),(e.closest(".popup-footer .gr")||e.closest(".close-btn"))&&(o.style.display="none")})}async function lt(o){var t,e,n,s,r,u;try{let c,a;if(b==="product"?(c=o,a=N[c]):(c=o%_,a=N[c]),console.log("item",a),!a){console.error("해당 인덱스의 데이터를 찾을 수 없습니다:",c);return}const m=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;let h={storeName:"정보 없음",tel:"정보 없음",address:"정보 없음",businessNo:"정보 없음"};try{const p=await(await R(`/model_user_setting?func=get-user&userId=${m}`)).json();p&&p.user&&(h={storeName:p.user.storeName||"정보 없음",tel:p.user.tel||"정보 없음",address:p.user.address||"정보 없음",businessNo:p.user.businessNo||"정보 없음"})}catch(l){console.error("매장 정보 로드 실패:",l)}let S="";if(b==="transaction"){const l=a.menuSummary.map(k=>`${k.name} / ${k.count||1}개`).join("<br>"),p=String(a.timestamp).split("T"),O=p[0],Q=p[1].substring(0,5),F=`${O} ${Q}`;if(a.totalPayInfo){const C=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((t=a.totalPayInfo)==null?void 0:t.filter(i=>i.method==="쿠폰").flatMap(i=>i.coupons||[]).map(i=>`${i.name} (${i.couponCode}) - ${i.price.toLocaleString()}`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
            `,x=((e=a.totalPayInfo)==null?void 0:e.filter(i=>i.method==="카드"))||[];let P="미사용",T="미사용",H="-";if(x.length>0){P=x.map(D=>`${D.method} (${D.issuerName})`).join(", "),T=x.map(D=>D.cardBin).join(", ");const i=(n=x[0])==null?void 0:n.approvalDateTime;if(i){const[D,V]=i.split("T"),G=V.split("+")[0].substring(0,5);H=`${D} ${G}`}}const M=(s=a.totalPayInfo)==null?void 0:s.filter(i=>i.method==="바코드QR").flatMap(i=>i||{});M.length>0&&(P=M.map(i=>`${i.method} (${i.payName})`),T=M.map(i=>`${i.cardBin}`));const j=((r=a.totalPayInfo)==null?void 0:r.filter(i=>i.method==="마일리지"&&i.usedAmount>0))||[];let U="미등록 고객",A="미사용";j.length>0&&(U=j.map(i=>`${i.mileageNo??"-"}`).join(", "),A=j.map(i=>`${i.usedAmount.toLocaleString()}`).join(", "));const y=`
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
                `;let B=a.orderId||"정보 없음";if(a.totalPayInfo){const i=(a.totalPayInfo||[]).filter(D=>D.method==="카드");i.length>0&&(i[0].approvalNo||i[0].approvalNo===0)&&(B=i[0].approvalNo)}S=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${l}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${h.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${h.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${h.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${h.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${a.totalPrice.toLocaleString()}원</p>
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
                `}else{const k=a.point===0?"0P":`${a.point}P`;let C="card",x="카드",P="정보 없음",T="정보없음";a.point>0&&(C="point",x="포인트"),a.pointData&&(P=a.pointData.tel||"정보 없음",T=`${a.pointData.points||0}P`);let H="",M="";if(C==="card"){const y=a.payInfo||{},B=y.issuerName||"정보 없음",i=y.cardBin||"정보 없음";H=`
                        <div>
                            <h5>결제 카드</h5>
                            <p>${B}</p>
                        </div>
                        <div>
                            <h5>카드 번호</h5>
                            <p>${i}</p>
                        </div>
                    `}else C==="point"&&(M=`
                        <div>
                            <h5>포인트 연락처</h5>
                            <p>${P}</p>
                        </div>
                        <div>
                            <h5>사용 포인트</h5>
                            <p>${k.toLocaleString()}</p>
                        </div>
                        <div>
                            <h5>적립 포인트</h5>
                            <p>${T.toLocaleString()}</p>
                        </div>
                    `);const U=`
                    <div>
                      <h5>사용 쿠폰</h5>
                      <p>${((u=a.totalPayInfo)==null?void 0:u.filter(y=>y.method==="쿠폰").flatMap(y=>y.coupons||[]).map(y=>`${y.name} (${y.couponCode})`).join("<br>"))||"사용한 쿠폰 없음"}</p>
                    </div>
                `;let A=a.orderId||"정보 없음";if(a.totalPayInfo){const y=(a.totalPayInfo||[]).filter(B=>B.method==="카드");y.length>0&&(y[0].approvalNo||y[0].approvalNo===0)&&(A=y[0].approvalNo)}S=`
                    <li>
                      <div>
                        <h5>주문상품</h5>
                        <p>${l}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>매장명</h5>
                        <p>${h.storeName}</p>
                      </div>
                      <div>
                        <h5>매장 연락처</h5>
                        <p>${h.tel}</p>
                      </div>
                      <div class="store-address">
                        <h5>매장 주소</h5>
                        <p>${h.address}</p>
                      </div>
                      <div>
                        <h5>사업자 등록번호</h5>
                        <p>${h.businessNo}</p>
                      </div>
                    </li>
                    <li>
                      <div>
                        <h5>결제 금액</h5>
                        <p>${a.totalPrice.toLocaleString()}원</p>
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
                        <p>${x}</p>
                      </div>
                      ${U}   <!-- ✅ 추가된 부분 -->
                      ${H}
                      ${M}
                    </li>
                `}}else{const l=new Date(a.lastOrderTimestamp),p=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`;S=`
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
            <p>${p}</p>
          </div>
        </li>
      `}const I=document.querySelector(".popup-body .history");I&&(I.innerHTML=S);const w=document.querySelector(".popup-footer");if(w){const l=w.querySelector(".btn.blue"),p=w.querySelector(".btn.red");l&&(l.style.visibility="hidden",l.style.opacity="0"),p&&(p.style.visibility="hidden",p.style.opacity="0")}}catch(c){console.error("팝업 데이터 업데이트 실패:",c)}}function q(o){const t=o.getFullYear(),e=String(o.getMonth()+1).padStart(2,"0"),n=String(o.getDate()).padStart(2,"0");return`${t}-${e}-${n}`}function ct(){return!g&&!v?!0:!g||!v?(window.showToast("시작일과 종료일을 모두 선택해주세요.",3e3,"warning"),!1):g>v?(window.showToast("시작일은 종료일보다 클 수 없습니다.",3e3,"error"),!1):!0}function dt(){const o=document.querySelector('input[type="date"]:first-of-type'),t=document.querySelector('input[type="date"]:last-of-type');o&&(o.value="",g=""),t&&(t.value="",v="");const e=document.querySelectorAll('input[name="detail-period"]');e.length>0&&(e[0].checked=!0),console.log("날짜 검색 초기화 완료")}async function pt(){try{let o=function(){Object.assign(t.style,s),Object.assign(r.style,u),e.forEach((c,a)=>{c.style.display=n[a]})};const t=document.querySelector(".popup");if(!t){window.showToast("팝업을 찾을 수 없습니다.",3e3,"error");return}const e=[t.querySelector(".save-img"),t.querySelector(".close-btn"),...t.querySelectorAll(".popup-footer .btn")].filter(Boolean),n=e.map(c=>c.style.display);e.forEach(c=>c.style.display="none");const s={animation:t.style.animation,boxShadow:t.style.boxShadow,opacity:t.style.opacity,transform:t.style.transform,width:t.style.width,height:t.style.height},r=t.querySelector(".history"),u={maxHeight:r.style.maxHeight,minHeight:r.style.minHeight,height:r.style.height,overflow:r.style.overflow};Object.assign(t.style,{animation:"none",boxShadow:"none",opacity:"1",transform:"none",width:"400px",height:"auto"}),Object.assign(r.style,{maxHeight:"none",minHeight:"auto",height:"auto",overflow:"visible"}),setTimeout(()=>{Z(t,{scale:1,useCORS:!0,width:400,height:t.scrollHeight}).then(c=>{const a=document.createElement("canvas"),f=a.getContext("2d");a.width=c.width,a.height=c.height,f&&(f.beginPath(),f.roundRect(0,0,c.width,c.height,10),f.clip(),f.drawImage(c,0,0));const m=`매출정보_${new Date().toISOString().slice(0,10)}.png`;ut(a.toDataURL("image/png"),m),o(),window.showToast("이미지가 성공적으로 저장되었습니다.",3e3,"success")}).catch(c=>{console.error("이미지 저장 실패:",c),window.showToast("이미지 저장에 실패했습니다.",3e3,"error"),o()})},100)}catch(o){console.error("이미지 저장 실패:",o),window.showToast("이미지 저장에 실패했습니다.",3e3,"error")}}function ut(o,t){const e=document.createElement("a");e.download=t,e.href=o,document.body.appendChild(e),e.click(),document.body.removeChild(e)}function W(){const o=document.querySelector(".countArea");if(o){const t=o.querySelectorAll(".countbox");if(t[0]){const e=t[0].querySelector("h4");e&&(e.innerHTML="0<small>원</small>")}if(t[1]){const e=t[1].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}if(t[2]){const e=t[2].querySelector("h4");e&&(e.innerHTML="0<small>P</small>")}if(t[3]){const e=t[3].querySelector("h4");e&&(e.innerHTML="0<small>건</small>")}}}function ft(){const o=document.querySelector(".btn.wt");o&&o.addEventListener("click",yt)}async function yt(){try{const t=JSON.parse(localStorage.getItem("userInfo")||"{}").userId;if(!t){window.showToast("사용자 정보를 찾을 수 없습니다.",3e3,"error");return}let e="";if(b==="transaction")e=`/model_payment?func=get-payment-excel&userId=${t}`,E!=="all"&&(e+=`&paymentType=${E}`),g&&v&&(e+=`&startDate=${g}&endDate=${v}`);else if(e=`/model_payment?func=get-menu-statistics-excel&userId=${t}`,d>1&&L.length>0){const u=d-2;L[u]&&(e+=`&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(L[u]))}`)}const s=await(await R(e)).json();if(!s.excelUrl)throw new Error("엑셀 URL을 받지 못했습니다.");const r=document.createElement("a");r.href=s.excelUrl,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch(o){console.error("엑셀 다운로드 실패:",o),window.showToast("엑셀 다운로드에 실패했습니다.",3e3,"error")}}export{gt as initSales};
