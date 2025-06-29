1. 로그인
2. 관리자 홈
3. 유저 홈


관리자는 유저를 하나 선택하면 유저 홈으로 이동한다.
해당유저에서 빠져나오는방법은 헤더에 메인으로 이동누르면
관리자 홈으로 이동한다

관리자 홈은 시스템관리자, 프랜차이즈 관리자 2개
유저는 단일 홈

권한을 기반으로 홈 경로 및 접근 권한이 제한됨

ex: 관리자 슈퍼어드민, 총괄관리자, 프랜차이즈 는 일반화면에 바로 접근불가,
홈화면에서 해당 매장을 클릭했을경우 해당 매장의 일반 홈으로 이동됨

일반유저 바로 일반 홈

loging or 유저 선택시
- fetchUserInfo 함수로 조회된 모든 user 정보를 localstorage 에 저장
  localstorage 에 저장된 userId 기반으로 접근 가능여부 체크

일반유저는 로그인 과 동시에 localstorage 에 유저 정보를 저장하고,
관리자 계정의 경우 홈에서 특정 유저 선택시 localstorage 에 유저 정보 저장
이후 일반 유저 홈 으로 이동시킨다.

모든 일반유저 화면은 localstorage 에저장되어있는 userId를 참고하여 기본기능을 수행한다

**master 브랜치는 배포 브랜치 push 금지**

new 브랜치에서 새 브랜치 따면됩니다.

fetch/이름-작업

기준으로 브랜치 따서 작업하세요.

서버 구성은

aws - dynamoDB - lambda - API gateway
aws - s3

api 스팩은 postman 공유 드린거 확인하시면되고,

지금작업하셔야할 곳은 payment 부분입니다

web
html - sales.html 



