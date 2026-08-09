# STATE

이 문서는 현재 AI와 함께 진행 중인 한 가지 작업만 기록합니다.

## 현재 작업

- 작업명: 프리랜서 소셜 로그인 및 회원가입 API 연동
- 관련 Issue: `#44`
- 관련 브랜치: `feature/freelancer-social-auth#44`
- 작업 목적: 카카오·구글 소셜 인증부터 기존 회원 로그인과 신규 회원 가입까지 연결합니다.

## 현재 작업 범위

- 소셜 로그인 시작 API
- 소셜 콜백 API와 응답 분기
- 신규 회원 `signUpTicket` 전달
- 프리랜서 소셜 회원가입 제출 API
- 로그인 사용자 기반 역할별 헤더 정보 표시
- 헤더 프로필 메뉴 로그아웃 API 연결

## 진행 상황

- [x] 카카오·구글 로그인 시작 API 서비스 및 타입 추가
- [x] 로그인 버튼에 인증 시작과 로딩·오류 처리 연결
- [x] 회원가입 역할 선택 화면의 카카오·구글 버튼 연결
- [x] 로그인·회원가입의 소셜 인증 시작 로직 공통화
- [x] 소셜 콜백 페이지 구현
- [x] `LOGIN`·`SIGNUP_REQUIRED` 응답 분기
- [x] OAuth 콜백의 서버 렌더링 `window is not defined` 오류 수정
- [x] 소셜 회원가입 화면의 목업 정보 제거
- [x] 프리랜서 소셜 회원가입 제출 API 연결
- [x] `/auth/me` 기반 역할·이름 헤더 표시
- [x] 헤더의 하드코딩 이름·알림 숫자 제거
- [x] `POST /auth/logout`과 헤더 로그아웃 버튼 연결

## 실행한 검증

- [x] Next.js 라우트 타입 생성
- [x] TypeScript 통과
- [x] 변경 파일 ESLint 통과
- [ ] build
- [ ] 브라우저 확인
- [ ] 실제 OAuth 및 API 응답 확인

## 확인이 필요한 내용

- 백엔드 OAuth 설정과 카카오·구글 Redirect URI
- 콜백을 받을 프론트 라우트
- Google Redirect URI: `/oauth/callback/google`
- Kakao Redirect URI: `/oauth/callback/kakao` 등록 여부 확인 필요
- 실제 `authorizeUrl`과 콜백 응답 구조

## 주의사항

- `state`는 콜백 값을 그대로 백엔드에 전달하며 별도 저장하지 않습니다.
- Access token, Refresh token, 인증 쿠키는 프론트 코드에서 직접 다루지 않습니다.
- 실제 응답을 확인하기 전까지 API 항목은 `미검증`으로 기록합니다.
- commit, push, Pull Request 생성은 사용자 요청 없이 수행하지 않습니다.
