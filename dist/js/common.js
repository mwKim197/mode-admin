if (typeof $ === "undefined") {
  console.warn("❌ jQuery가 로드되지 않았습니다. common.js 실행 중단");
} else {
  const path = window.location.pathname;
  if (path === "/html/log.html") {
    console.log("🛑 log.html에서는 common.js 일부 기능 실행 제외됨");
  } else {
    console.log("✅ jQuery 있음, 공통 스크립트 실행 시작");
    initCommonScripts();
  }
}

function initCommonScripts() {
    //-------- menuClick 이벤트 --------
    function updateMenuBehavior() {
      if (window.innerWidth <= 768) {
        // 모바일 환경: 햄버거 메뉴 클릭 시 메뉴 토글
        $("#menuToggle")
            .off("click")
            .on("click", function (e) {
              e.stopPropagation(); // 클릭 이벤트 전파 방지
              $(this).toggleClass("open"); // 햄버거 버튼 애니메이션 적용
              $(".sidemenu").stop().slideToggle();
            });

        // 사이드 메뉴 내부 클릭 시 닫히지 않도록 방지
        $(".sidemenu")
            .off("click")
            .on("click", function (e) {
              e.stopPropagation();
            });

        // 바깥 영역 클릭 시 메뉴 닫기
        $(document)
            .off("click")
            .on("click", function () {
              $(".sidemenu").slideUp();
              $("#menuToggle").removeClass("open"); // 햄버거 버튼 초기 상태로 복귀
            });
      } else {
        // 데스크탑 환경: hover 시 메뉴 표시
        $("#menuToggle").removeClass("open"); // 데스크탑에서는 버튼 원래대로
        $(".sidemenu").hide(); // 기본적으로 메뉴 숨김

        $(".menuWrap")
            .off("mouseenter")
            .on("mouseenter", function () {
              $(".sidemenu").stop().slideDown();
              $("#menuToggle").addClass("open"); // 햄버거 버튼을 X자로 변경
            });

        $(".menuWrap, .sidemenu")
            .off("mouseleave")
            .on("mouseleave", function () {
              $(".sidemenu").stop().slideUp();
              $("#menuToggle").removeClass("open"); // 햄버거 버튼 원래 상태로 복귀
            });

        // 데스크탑에서는 클릭 시 메뉴 닫기
        $(".menuWrap, .sidemenu")
            .off("click")
            .on("click", function () {
              $(".sidemenu").stop().slideUp();
              $("#menuToggle").removeClass("open"); // 클릭 시 햄버거 버튼 원래 상태로
            });
      }
    }

    // 초기 로드 시 실행
    updateMenuBehavior();

    // 화면 크기 변경 시 이벤트 다시 바인딩
    $(window).resize(updateMenuBehavior);
    $(window).resize(updateMenuBehavior);

    //-------- mouseCursor 이벤트 --------
    const cursor = document.querySelector(".custom-cursor");

    //-------- 마우스 이동 시 커서 따라다니기 --------
    document.addEventListener("mousemove", function (e) {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    //-------- 클릭 시 원 확대 효과 --------
    document.addEventListener("click", function () {
      cursor.style.width = "60px";
      cursor.style.height = "60px";
      setTimeout(() => {
        cursor.style.width = "40px";
        cursor.style.height = "40px";
      }, 200);
    });

    //-------- 링크 & 버튼 위에서 색상 변경 --------
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.backgroundColor = "rgba(0, 94, 212, 0.5)"; // 파란색 변경
        cursor.style.border = "2px solid rgb(0, 94, 212)"; //
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.backgroundColor = "rgba(255, 255, 255, 0)"; // 원래 색으로 복귀
        cursor.style.border = "1px solid rgba(255, 255, 255, 0.8)"; //
      });
    });

///////////////////////////////////////////////////////////////////



    // 공통 페이지네이션 설정
    function setupPagination(containerSelector, itemSelector, itemsPerPage) {
      let $container = $(containerSelector);
      let $items = $(itemSelector);
      let totalPages = Math.max(1, Math.ceil($items.length / itemsPerPage));
      let currentPage = 1;

      function showPage(page) {
        if (page < 1 || page > totalPages) return;

        currentPage = page;
        $items.hide();
        $items.slice((page - 1) * itemsPerPage, page * itemsPerPage).show();
        updatePagination();
      }

      function updatePagination() {
        let $pageNumbers = $container.find(".page-numbers");
        $pageNumbers.empty();

        for (let i = 1; i <= totalPages; i++) {
          let pageButton = $("<button>")
              .addClass("page-number")
              .text(i)
              .attr("data-page", i);

          if (i === currentPage) {
            pageButton.addClass("active");
          }

          pageButton.click(function () {
            showPage(i);
          });

          $pageNumbers.append(pageButton);
        }

        // 버튼 활성화/비활성화
        $container.find(".page-prev").prop("disabled", currentPage === 1);
        $container
            .find(".page-next")
            .prop("disabled", currentPage === totalPages);
        $container.find(".page-first").prop("disabled", currentPage === 1);
        $container
            .find(".page-last")
            .prop("disabled", currentPage === totalPages);
      }

      // 이전 버튼
      $container.find(".page-prev").click(function () {
        if (currentPage > 1) {
          showPage(currentPage - 1);
        }
      });

      // 다음 버튼
      $container.find(".page-next").click(function () {
        if (currentPage < totalPages) {
          showPage(currentPage + 1);
        }
      });

      // 처음으로 버튼
      $container.find(".page-first").click(function () {
        showPage(1);
      });

      // 마지막으로 버튼
      $container.find(".page-last").click(function () {
        showPage(totalPages);
      });

      // 초기 페이지 보여주기
      showPage(currentPage);
    }

    // 📄 FAQ & 공지사항 페이지네이션 적용
    setupPagination(".pagination[data-type='contest']", ".contest-item", 10);
    setupPagination(".pagination[data-type='notice']", ".notice-item", 6);
    setupPagination(".pagination[data-type='table']", ".tableArea tbody tr", 6);
}

// ani-btn 스타일
document.querySelector(".ani-1").addEventListener("click", function () {
document.querySelector(".user-setBox").classList.toggle("hidden");
});

document.querySelector(".close-btn").addEventListener("click", function () {
document.querySelector(".user-setBox").classList.add("hidden");
});

//-------- 프로그래스바 이벤트 --------
// const fills = document.querySelectorAll(".progress-fill");
// const values = [25, 30, 70, 90]; // 고정 값

// function animateProgress(index, value) {
//   const fill = fills[index];
//   fill.style.transition = "none";
//   fill.style.width = "0%";
//   fill.textContent = "0%";

//   // 강제 리렌더링
//   void fill.offsetWidth;

//   // 다시 애니메이션 설정
//   fill.style.transition = "width 1s ease";
//   fill.style.width = value + "%";
//   fill.textContent = value + "%";
// }

// function replayAnimation(index) {
//   animateProgress(index, values[index]);
// }

// // 초기 로딩 시
// window.addEventListener("DOMContentLoaded", () => {
//   values.forEach((val, idx) => {
//     animateProgress(idx, val);
//   });
// });
/*const fills = document.querySelectorAll(".progress-fill");
const values = [25, 30, 70, 90]; // 초기값

function animateProgress(index, value, changeColor = false) {
  const fill = fills[index];

  // 초기화
  fill.style.transition = "none";
  fill.style.width = "0%";
  fill.textContent = "0%";
  fill.style.backgroundColor = ""; // 기본색으로 리셋

  // 강제 리렌더링
  void fill.offsetWidth;

  // 애니메이션 시작
  fill.style.transition = "width 1s ease";
  fill.style.width = value + "%";

  // 애니메이션 후에 텍스트 & 색상 설정
  setTimeout(() => {
    fill.textContent = value + "%";
    if (changeColor) {
      fill.style.backgroundColor = "#2B7FE8"; // --blue-90
    }
  }, 1000); // transition과 동일한 시간
}

function replayAnimation(index) {
  animateProgress(index, 100, true);
}

// 초기 로딩 시
window.addEventListener("DOMContentLoaded", () => {
  values.forEach((val, idx) => {
    animateProgress(idx, val);
  });
});



// 파일 선택
function previewLogo(event) {
  const input = event.target;
  const file = input.files[0];

  if (file) {
    // 파일 이름 표시
    document.getElementById("fileName").textContent = file.name;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById("logoPreview");
      img.src = e.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

//   항목 추가
const container = document.getElementById("section-container");
const addButton = document.getElementById("addItemBtn");

let itemCount = 1;

addButton.addEventListener("click", () => {
  itemCount++;

  const newItem = document.createElement("div");
  newItem.className = "boxStyle gr mb20 item";
  newItem.innerHTML = `
      <h2 class="mb10">${itemCount}항목</h2>
      <p class="fs14">타입</p>
      <div class="btnFlex">            
        <select class="popup-select mb0">
          <option value="option1">선택</option>
          <option value="option2">옵션 2</option>
        </select>
        <button class="btn red delete-btn">삭제</button>
      </div>
    `;

  container.insertBefore(newItem, addButton.parentElement);
  updateDeleteEvents();
});

function updateDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.onclick = function () {
      const item = btn.closest(".item");
      if (item) {
        item.remove();
        updateItemTitles();
      }
    };
  });
}

function updateItemTitles() {
  const items = document.querySelectorAll(".boxStyle.item");
  itemCount = 0;
  items.forEach((item, index) => {
    itemCount = index + 1;
    const title = item.querySelector("h2");
    if (title) {
      title.textContent = `${itemCount}항목`;
    }
  });
}
// 초기화
updateDeleteEvents();*/


///////////////////////////////////////////////