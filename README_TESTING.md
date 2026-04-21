이 레포지토리의 API 테스트(뉴먼/포스트맨 변환) 사용법

폴더 구조
- postman/
  - *.collection.json    (Postman export한 컬렉션 파일)
  - env.template.json   (환경 템플릿 - 실제 민감값은 로컬에서 환경변수로 주입)
- scripts/postman-to-node/run.js  (컬렉션의 특정 요청을 Node로 실행하는 스크립트)

간단 실행 예
1) 필요한 환경변수 설정(로컬)
   export adminId=your_admin
   export adminPassword=your_password
   # 또는 토큰을 바로 줘도 됨
   export token=your_bearer_token

2) 특정 요청 실행
   node ./scripts/postman-to-node/run.js --collection login --req "admin-login"
   node ./scripts/postman-to-node/run.js --collection modelUser --req "get-users"

설명
- run.js는 postman/*.collection.json 파일을 읽고 요청 이름으로 특정 요청을 실행합니다.
- env.template.json의 변수는 {{var}} 치환 시 기본값으로 사용되고, process.env 우선으로 덮어씌워집니다.
- 로그인 요청의 응답에 accessToken 또는 token 필드가 포함되어 있으면 자동으로 추출하여 메모리(state.token)에 저장하고, 이후 bearer auth가 필요한 요청에 자동 주입합니다.

보안 주의
- 민감한 계정/비밀번호/토큰은 절대 커밋하거나 공개 채널에 올리지 마세요.
- CI에서는 GitHub/GitLab Secrets를 사용해 런타임에 환경변수로 주입하세요.
