# 리포지토리 관리 규칙 (자동 생성)

이 파일은 .dev-assistant.json을 기반으로 자동 생성됩니다. 변경하려면 .dev-assistant.json을 수정하세요.

## 커밋 메시지 규칙
- 언어: ko
- 접두사: 한글:

## 타입 정책
- 타입 정의 디렉터리: `src/ts/types`
- 새 필드 추가 전 타입 파일을 먼저 업데이트해야 합니다: 예
- 타입 누락 시 경고: 예

## 필드 명명 규칙
- HTML id: kebab-case
- API 필드(백엔드): camelCase

## 카카오 알림톡 설정(프로젝트별 예시)
- API 필드명: `kakaoNumber`
- HTML id: `kakao-number`

## 워크플로우
- 새 API/필드를 추가할 때는 반드시 먼저 types 디렉터리에 타입을 추가하세요.
- 변경 후에는 generate-rm.js를 실행해 RM.md를 갱신할 수 있습니다(자동화 예정).