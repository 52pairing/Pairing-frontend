# STATE

## 현재 작업 (2026-08-18 — 세션 만료 재로그인 시 보안 민감 경로 복귀 차단)

- 작업명: 세션 만료·401 후 재로그인 시 결제/서명/비밀번호/탈퇴 등 보안 민감 경로로 그대로 복귀하지 않도록 `returnUrl` 처리에 차단 목록 적용
- 관련 Issue: #252
- 관련 브랜치: `fix/common-session-header-css#252`
- 진행 상황: 완료 — 상세 내용은 `.ai/WORKLOG.md` 최상단 참고
- 검증: `tsc --noEmit`·ESLint·`npm run build` 통과, 신규+기존 Jest 통과(무관 baseline 실패 1건 제외)
- 남은 작업: 실제 로그인 세션 기반 브라우저 확인 미실행(테스트 계정 없음). commit/push/PR은 사용자 명시 요청 시

---

## 현재 작업 (2026-08-18 — 클라이언트 메인 등급 배지 레이아웃 시프트 수정)

- 작업명: 클라이언트 메인 새로고침 시 등급 배지의 지연 표시로 닉네임 영역이 위아래로 이동하는 문제 수정
- 관련 Issue: 생성 전
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 완료
- 구현: 클라이언트 메인에서 서버 사용자·등급을 병렬 조회해 초기 렌더에 전달하고, 초기 등급이 없을 때는 동일 크기의 비가시 배지로 공간을 유지한 채 브라우저 조회로 폴백
- 교정: 최초에 첨부 화면을 프리랜서 메인으로 잘못 판단해 적용했던 변경은 모두 되돌리고 실제 대상인 클라이언트 메인에만 반영
- 테스트: 서버 초기 사용자명·등급 동시 표시 및 중복 조회 방지, 브라우저 폴백 중 배지 자리와 사용자명 유지 후 실제 등급 표시 2건 추가
- 검증: 관련 Jest 1 suite/2 tests, 전체 TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저·API: 로그인 테스트 세션이 없어 미검증

---

## 현재 작업 (2026-08-18 — RoleGuard 전역 렌더 차단 개선 가이드라인 수립)

- 작업명: `/client/**`·`/freelancer/**` 진입 시 RoleGuard의 클라이언트 렌더 차단으로 생기는 직렬 스피너 워터폴 제거 설계 (진단·가이드라인만, **코드 미변경**)
- 관련 Issue: 생성 전
- 관련 브랜치: 현재 작업 브랜치 (변경 없음)
- 배경(진단): [layout.tsx](../src/app/layout.tsx)의 [RoleGuard](../src/features/auth/components/RoleGuard.tsx)가 루트에서 모든 children을 감싸고, `outcome` 확정 전까지 children을 렌더하지 않음 → 페이지 마운트(데이터 fetch 시작)가 클라 `getCurrentUser()` 완료 이후로 밀림. 결과: `hydrate → getCurrentUser(스피너1) → allowed → 페이지 fetch(스피너2)` 직렬 2단. [client/layout.tsx](../src/app/client/layout.tsx)·[freelancer/layout.tsx](../src/app/freelancer/layout.tsx)이 이미 `getServerCurrentUser()`로 유저를 조회하는데 그 결과를 재사용하지 못하고 클라에서 재조회함.
- 목표: 서버가 아는 유저로 첫 렌더부터 페이지를 그리고, 클라 가드는 "차단"이 아니라 "세션 유지 안전망"으로 축소.

- 반드시 지킬 제약(어기면 회귀):
  - C1. `user===null`(미상)일 때 서버에서 무조건 로그인으로 튕기면 안 됨 — [serverCurrentUser.ts](../src/features/auth/services/serverCurrentUser.ts)는 `no-store`라 refresh 불가. 액세스 토큰만 만료된 유저는 클라 `apiCall`의 GLOBAL_009→refresh로 살아나야 함
  - C2. 역할 불일치(forbidden) 판정은 "유저 성공 조회 + 역할 실제 불일치"일 때만. null을 forbidden으로 오판 금지
  - C3. [AuthSessionGuard](../src/features/auth/components/AuthSessionGuard.tsx)는 역할 불일치 시 **사용자 홈으로 조용히 replace**, RoleGuard는 **`/forbidden`으로 이동** — 목적지 상이. → **[확정 2026-08-18] `/forbidden` 페이지 경유 + 수동 "내 홈으로" 버튼으로 통일** (RoleGuard 현재 동작 유지, AuthSessionGuard의 역할 크로스 redirect를 `/forbidden`으로 변경, 자동 이동 없음). 근거: 1계정=1역할 고정이라 불일치 경로는 드물고, 명확한 안내 한 화면이 조용한 튕김보다 낫고 우리 코드의 잘못된 링크 버그도 드러남
  - C4. 서버 레이아웃은 하드 진입/초기 로드에만 재실행(소프트 내비 캐시) → 서버=진입 게이트, 클라=세션 만료 감시로 역할 분담

- 권장 아키텍처(하이브리드):
  - 서버(레이아웃): 유저+역할 일치 → 렌더 / 유저+역할 불일치 → `redirect` / null → redirect 없이 렌더(클라 위임)
  - 클라(RoleGuard): pending 스피너 분기([RoleGuard.tsx:121-128](../src/features/auth/components/RoleGuard.tsx)) 제거해 렌더 비차단화, 확정 forbidden/login만 redirect(소프트 내비 안전망)

- 단계(권장 순서):
  - Phase 0: C3 정책 결정(역할 불일치 목적지 통일) — **완료(2026-08-18): `/forbidden` 경유 + 수동 홈, 자동 이동 없음**
  - Phase 1: 레이아웃에 서버 게이트 추가 + `getServerCurrentUser`를 React `cache()`로 감싸 요청당 `/auth/me` 1회로(레이아웃+페이지 중복 조회도 동시 해결)
    - **확정 설계(2026-08-18)**:
      - Phase 1a(바로 진행): (1) `getServerCurrentUser`를 React `cache()` 래핑 → 요청 단위 dedupe. (2) [client/layout.tsx](../src/app/client/layout.tsx)·[freelancer/layout.tsx](../src/app/freelancer/layout.tsx)에 **역할 불일치 서버 게이트만** 추가: `const user = await getServerCurrentUser(); if (user && user.role !== "CLIENT") redirect("/forbidden");` — `user===null`(미상)은 redirect 없이 렌더(C1). returnUrl 불필요·결정적이라 C2 충족
      - Phase 1b(로그인 게이트): **A안 확정 — 클라이언트 유지, 미들웨어 미도입**. 로그아웃 유저 하드진입은 서버는 렌더하고 클라(RoleGuard/AuthSessionGuard)가 401 감지 후 `usePathname` 기반 `returnUrl` 붙여 login 이동. 트레이드오프: 로그아웃 하드진입 시 페이지 셸 순간 노출(오늘의 스피너와 유사 수준, 드문 경로). 미들웨어(B안)는 새 구조+백엔드 리프레시 쿠키 이름 확인이 필요해 보류 — 깜빡임이 실제 문제화되면 별도 팀 안건으로
    - 제약 재확인: 서버 게이트는 pathname 접근 불가 → 로그인 returnUrl은 서버에서 못 만듦(A안 채택 근거). 인증은 httpOnly 쿠키라 JS에서 쿠키 이름 미참조(전체 `cookie` 헤더만 전달)
    - Phase 1 스코프 밖(현행 유지): `tempPassword → /login/findpassword/reset` 리다이렉트는 클라 AuthSessionGuard에 그대로 둠(서버 게이트로 옮기지 않음)
  - Phase 2: RoleGuard 비차단화
    - **확정 설계(2026-08-18): 2-core + 2-enhance 함께 진행**
    - 2-core(필수): [RoleGuard.tsx:121-128](../src/features/auth/components/RoleGuard.tsx)의 pending 스피너 분기를 **children 렌더로 교체** → 확인 중에도 페이지를 그림(차단 해제). Phase 1로 서버가 하드 진입 역할 불일치를 이미 걸렀으므로 클라 재확인은 "allowed" 확정→깜빡임 없이 통과. forbidden/login/error 확정 시에만 개입(redirect/에러 UI 유지). 효과: 직렬 스피너 2단→1단, 페이지 데이터 fetch가 권한 확인을 안 기다리고 즉시 시작. 남는 리스크: 소프트 내비로 잘못된 역할 링크 진입 시 순간 렌더 후 `/forbidden`(드묾, 2-enhance로 제거됨)
    - 2-enhance(추천 포함): 서버 `initialUser`를 [currentUser.ts](../src/features/auth/services/currentUser.ts) **모듈 캐시(`cachedUser`)에 시드**. 근거: 현재 `initialUser`는 [useCurrentUser.ts:19](../src/features/auth/hooks/useCurrentUser.ts)의 로컬 state로만 들어가고 공유 모듈 캐시엔 없어 RoleGuard/Header가 `/auth/me`를 재조회함(하드 진입마다 클라 중복 라운드트립). 시드하면 (1) RoleGuard가 `getCachedCurrentUser()`로 **동기 판단**→소프트 내비 잔여 깜빡임 제거, (2) 클라 `/auth/me` 중복 조회 제거(5초 창). 시드 위치: `initialUser`를 가진 `client/freelancer` 레이아웃에서 작은 클라 시더 컴포넌트로 마운트 시 1회
    - 2-enhance 안전장치: `initialUser===null`(로그아웃/서버 조회 실패)이면 시드 안 함(로그인됨으로 오시드 금지). 캐시 기존 규칙(5초 TTL, `cacheGeneration` 로그아웃 무효화) 존중
    - 두 항목은 독립적 — 2-core만으로도 직렬 스피너 해소, 2-enhance는 중복 fetch·잔여 깜빡임까지 제거
  - Phase 3(선택): RoleGuard·AuthSessionGuard 역할 처리 중복 수렴(참조/테스트 확인 후, 삭제 전 참조 확인 원칙 준수)

- 엣지 케이스 검증 체크리스트: 비로그인 하드 진입 / 액세스 토큰만 만료+리프레시 유효 진입(C1 핵심) / CLIENT가 `/freelancer/**` 진입(콘텐츠 순간 노출 없음) / 소프트 내비 역할 홈 이동 / 세션 만료 모달(GLOBAL_010·011) / `/chat`·`/notifications`(RoleGuard 비대상) / `/auth/me` 요청당 1회 감소
- 검증 방법: `tsc --noEmit` + ESLint(메모리 규칙: 로컬 브라우저 대신), before/after 스피너 단계 수·TTFB는 프로덕션 빌드 3회 중앙값(성능최적화 노트 #5와 연결)
- 리스크·롤백: 최대 리스크는 C1(refresh 회귀)·C2(null 오판). Phase 독립적이라 Phase 1만 넣고 A/B 관찰 후 진행하는 점진 적용 권장. 롤백은 레이아웃 redirect 분기 제거 + RoleGuard 원복
- 진행 상황: Phase 0·1·2 설계 확정. **Phase 1·2 구현 완료(2026-08-18)** — 아래 "구현 기록" 참고. Phase 3은 후속 보류
- 구현 기록:
  - Phase 1a 완료: [serverCurrentUser.ts](../src/features/auth/services/serverCurrentUser.ts) `getServerCurrentUser`를 React `cache()`로 래핑(요청당 `/auth/me` 1회 dedupe), [client/layout.tsx](../src/app/client/layout.tsx)·[freelancer/layout.tsx](../src/app/freelancer/layout.tsx)에 역할 불일치 서버 게이트 추가(`user && role!==X → redirect("/forbidden")`, null은 렌더)
  - Phase 1b: A안이라 코드 변경 없음(클라 RoleGuard·AuthSessionGuard 로그인/refresh 흐름 유지)
  - Phase 2-core 완료: [RoleGuard.tsx](../src/features/auth/components/RoleGuard.tsx)의 pending 스피너("접근 권한을 확인하고 있습니다")를 제거하고 `return children`로 비차단화. forbidden/login redirect·error UI는 유지
  - Phase 2-enhance 완료: [currentUser.ts](../src/features/auth/services/currentUser.ts)에 `seedCurrentUser` 추가(이미 유효 캐시 있으면 미덮음), [useCurrentUser.ts](../src/features/auth/hooks/useCurrentUser.ts)의 `useCurrentUserState`가 `initialUser` 있으면 모듈 캐시에 1회 시드(null은 미시드). → 하드 진입 시 가드·헤더의 `/auth/me` 재조회 제거
  - 테스트: `unit-tests/auth/hooks/useCurrentUser.test.ts` mock에 `seedCurrentUser` 추가 + 시드 호출/미호출 검증 2건 보강
  - 검증: `tsc --noEmit` 0, ESLint(변경 7파일) 0, auth 유닛테스트 40 suites/168 tests 전체 통과(RoleGuard·AuthSessionGuard·useCurrentUser·serverCurrentUser 포함)
- 남은 작업: 실제 로그인 세션 기반 브라우저 확인 미실행(no localhost verify 규칙). commit/push/PR은 사용자 명시 요청 시. Phase 3(가드 중복 수렴)은 안정화 후 별도 안건
- 관련 문서: 전체 렌더링·최적화 진단은 [.ai/성능최적화-발표노트.md](성능최적화-발표노트.md) #5(이중 로딩 플래시)와 연결

---

## 현재 작업 (2026-08-18 — freelancer/matching/negotiation 핵심 테스트 코드 작성)

- 작업명: auth에 이어 담당 영역(freelancer/matching/negotiation) 전체에서 "중요한 것만" 골라 Jest 테스트 작성
- 관련 Issue: 확인 필요 (신규 요청, 기존 Issue 미연결)
- 관련 브랜치: 현재 작업 브랜치 (커밋 전)
- 진행 상황: 완료
  - freelancer(`unit-tests/freelancer/`): 서비스 3개(`grade.ts`, `freelancerFiles.ts`, `freelancerProfile.ts` — null 필드 기본값 처리·요청 형태 검증), `FreelancerPaymentMethods.tsx`(결제수단 인증 게이트·AU_006 재인증 분기), `ProjectRejectModals.tsx`(거절 사유 제출 성공/실패)
  - matching(`unit-tests/matching/`): `matching.ts` 서비스 나머지 함수 전체(URL/method/body), `useMatchingNotifications.ts`(구독·해제·JSON 파싱 실패 무시), `CandidateProfile.tsx`(initialProfile 재조회 생략, 실패 시 오류 메시지)
  - negotiation(`unit-tests/negotiation/`): `conditionFormat.ts` 유틸 전체(금액/기간/날짜 변환, 라벨 매핑), `negotiation.ts` 서비스 전체(`getMyNegotiations`의 배열/페이지 응답 분기 포함), `NegotiationCancelModal.tsx`(역할별 경고 문구), `NegotiationResultCard.tsx`(타결/결렬, XSS 방지 텍스트 렌더링)
- 의도적으로 제외(범위·복잡도 대비 시간 우선순위로 미착수): `FreelancerBasicProfileEdit.tsx`, `CandidateRerollRequest.tsx`와 그 하위(`CandidateRerollActions`·`CandidateRerollPaymentSummaryModal`·`CandidateRerollStatusScreens`·`MatchingCandidateNotificationTarget`·`MatchingNotificationRedirect`·`serverCandidateProfile`·`serverMatchingRequestDetail`), `NegotiationRoom.tsx`(전체), `ProjectNegotiation.tsx`, `CandidateCard.tsx`, `useNegotiationEvents.ts`
- 검증: 신규 테스트 12개 파일 통과(정확한 총 건수는 각 파일 참고), `tsc --noEmit` 통과, ESLint 통과, 전체 프로젝트 Jest 94 suites 중 93 통과(나머지 5건은 팀원 파트 `FreelancerProfile.test.tsx`의 기존 `useRouter` 미마운트 실패, 이번 작업과 무관)
- 실행하지 못한 검증: 실제 브라우저 확인(로그인 세션 없음)
- 참고: 작업 중 그레이프 도구 출력이 정방향 슬래시 경로를 역슬래시로 잘못 표시하는 현상을 발견(파일 실제 내용은 정상, 표시상 문제만 확인)
- 남은 작업: 위 미착수 항목은 필요 시 후속 요청. `git add`/commit/push/PR은 사용자 명시 요청 시 진행

---

## 현재 작업 (2026-08-17 — 클라이언트 리뷰 작성 진입 경로 및 결제 대기 안내 수정)

- 작업명: 클라이언트 마이페이지·계약 카드 리뷰 진입 경로 추가 및 성공보수 결제 대기 안내
- 기준 문서: `C:/Users/user/Documents/카카오톡 받은 파일/frontend-client-review-entry-2026-08-17.md`
- 관련 Issue: 생성 전
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 완료
  - 마이페이지 리뷰 관리에서 작성 대기 리뷰와 완료 계약을 함께 조회해 `contractId → projectId` 매핑 후 리뷰 작성 링크 표시
  - 매핑하지 못한 작성 대기 리뷰는 숨기지 않고 계약 정보 확인 불가 비활성 항목으로 표시
  - 클라이언트 완료 계약 카드에 `projectId`·`contractId`를 포함한 리뷰 작성 버튼 추가
  - 성공보수 결제 완료 화면에서 `COMPLETION_PENDING` 계약이 있으면 프리랜서 결제 대기 안내 표시
- API 변경: 없음 — 기존 리뷰 작성 대기·완료 계약 목록 API 사용
- 검증: 변경 파일 ESLint, 전체 TypeScript, 프로덕션 빌드, `git diff --check` 통과
- 검증 중 조치: 최초 빌드는 샌드박스의 Google Fonts 네트워크 차단으로 실패했으나 네트워크 허용 후 재실행 통과
- 실제 API·브라우저: 로그인 테스트 계정이 없어 미검증

---

## 현재 작업 (2026-08-17 — auth/freelancer/matching 렌더링·최적화 진단 후속)

- 작업명: 담당 영역(auth/freelancer/matching) 한정 진단 후 정적 메타 캐싱 누락 수정 + `FreelancerResumeRegistration.tsx` 4개 파일 구조 분리
- 관련 Issue: #224
- 관련 브랜치: `refactor/freelancer-resume-cleanup#224`
- 진행 상황: 코드 변경 완료, `git add`까지 완료. 커밋·push·PR 전 상태
- 변경 파일: `freelancerResume.ts`(캐싱), `FreelancerResumeRegistration.tsx`(축소), 신규 `utils/resumeFormData.ts`·`ResumeFormControls.tsx`·`ResumeReviewScreen.tsx`·`freelancerResumeCache.test.ts`
- 검증: `tsc --noEmit`·ESLint·`npm run build` 통과, 관련 Jest 통과(무관 baseline 실패 5건 제외)
- 실제 로그인 세션 기반 브라우저 확인: 미실행
- 남은 작업: commit → push → PR
- 상세 내용: `.ai/WORKLOG.md` 참고

---

## 현재 작업 (2026-08-16 — 마이페이지·매칭·결제 화면 다건 버그 수정)

- 작업명: 세션 만료 모달·로그아웃 경로·클라이언트 메인 미연결 버튼·등급 배지·추천 후보 프로필 404·이력서 UX 3건·결제 모듈 목업 데이터 제거 등 다건 수정
- 관련 Issue: #216, #218
- 관련 브랜치: `fix/common-mypage#216`, `fix/common-payment-mockdata#218`
- 진행 상황: 완료 — 두 브랜치 모두 커밋·push·PR 리뷰·`develop` 병합까지 완료
- 검증: 각 변경 파일 TypeScript·ESLint·`npm run build` 통과, 관련 Jest 일부 재실행(회귀 없음)
- 실제 로그인 세션 기반 브라우저 확인: 대부분 미실행(테스트 계정 없음)
- 상세 내용: `.ai/WORKLOG.md` 참고
- 남은 작업: 백엔드 확인 요청 3건 전달 필요
  1. 회원 탈퇴 `blockers[].linkUrl`이 실제 라우트와 안 맞음(`/negotiations` 등)
  2. 매칭 후보 프로필 API Swagger 예시 배열 필드명 오류(문서만 수정)
  3. 매칭 후보 프로필 응답의 연락처 정보 노출 정책 확인
## 현재 작업 (2026-08-16 — 협상 마지노선 방향 반영)

- 작업명: `floorDirection` 기반 협상 마지노선 표시·위반 판정 및 시작일 문구 수정
- 기준 문서: `C:/Users/user/Downloads/frontend-floor-direction-0816.md`
- 관련 Issue: #222
- 관련 브랜치: `fix/common-negotiation#222`
- 진행 상황: 완료
  - 협상 조건 타입에 optional/null 허용 `floorDirection(MAX|MIN|CHOICE|NONE)` 추가
  - 서버 방향을 우선하고 미응답 시 기존 `floorComparison`·역할 판정으로 폴백
  - 시작일 MAX를 역할과 관계없이 `늦어도 {날짜}까지 시작해야 합니다`로 표시
  - 최초 입력·재지시 라벨, 마지노선 위반 판정·확인 모달, 최종 절충 문구에 공용 방향 판정 적용
  - 이미 닫힌 STOMP 세션의 `Session closed.` 종료 프레임은 오류 오버레이를 띄우지 않도록 제외하고 실제 브로커 오류 로깅은 유지
- API 변경: 신규 응답 필드 사용, 요청 변경 없음
- 검증: 협상·STOMP 관련 테스트, 변경 파일 ESLint, TypeScript, 프로덕션 빌드, `git diff --check` 통과
- 전체 Jest: 39 suites/203 tests 통과, 1 suite/5 tests 실패 — 기존 `FreelancerProfile.test.tsx`의 `useRouter` mock 누락으로 App Router 미마운트 오류(이번 변경 파일과 무관)
- 실제 API·브라우저: 백엔드 `floorDirection` 응답과 역할별 협상 화면은 미검증

---

## 현재 작업 (2026-08-16 — 계약·결제·추천 후보 상태 표시 오류 수정)

- 작업명: 계약서 PDF 다운로드 게이팅, 성공보수 결제 완료 카드, 착수금 결제 전 추천 후보 안내 수정
- 기준 문서: `C:/Users/user/Downloads/frontend-contract-pdf-gate-2026-08-16.md`
- 관련 Issue: #220
- 관련 브랜치: `fix/common-contract#220`
- 진행 상황: 완료
  - 계약 PDF 다운로드는 클라이언트·프리랜서 양측 서명 완료 시에만 버튼과 실행을 허용하고, 서명 화면의 PDF 미리보기는 유지
  - 성공보수 결제 액션은 `payableSettlementId`가 있을 때만 표시하고 결제 완료 후에는 클라이언트 결제 대기 문구 표시
  - `DEPOSIT_PENDING`·`PAYMENT_FAILED` 프로젝트는 추천 후보 API를 호출하지 않고 착수금 결제 안내만 표시
- API 변경: 없음 — 기존 `signatures`, `payableSettlementId`, `paymentStatus` 응답 사용
- 검증: 변경 파일 ESLint 통과, 관련 Jest 5 suites/32 tests 통과, 프로덕션 빌드 통과, `git diff --check` 통과
- 검증 중 조치: 삭제된 라우트를 참조하던 재생성 가능한 `.next/dev/types` 캐시를 제거한 뒤 빌드 재실행
- 실제 API·브라우저: 로그인 테스트 계정이 없어 미검증

---

## 현재 작업 (2026-08-16 — ECS 런타임 의존성 오류 수정)

- 작업명: 프로덕션 runner에서 `next.config.ts` 로드에 필요한 `@next/bundle-analyzer` 의존성 복구
- 관련 Issue: #212
- 관련 브랜치: `fix/common-ecs-runtime-dependency#212`
- 원인: runner의 `npm ci --omit=dev`가 `devDependencies`를 제외하지만 `next start`가 `next.config.ts`의 정적 import를 런타임에 로드함
- 변경 범위: `package.json`, `package-lock.json`
- 진행 상황: 완료 — `@next/bundle-analyzer`를 `dependencies`로 이동하고 잠금 파일의 루트·패키지·전이 의존성 `dev` 플래그 갱신
- 검증: `npm ls --omit=dev @next/bundle-analyzer`에서 16.3.1 확인, `npm run build`, `git diff --check` 통과
- 실행하지 못한 검증: 로컬 Docker 엔진이 실행 중이지 않아 프로덕션 이미지 빌드·기동·HTTP 200 확인 미실행
- 실제 ECS·ALB: 미검증
- 참고: `npm install --package-lock-only` 감사 결과 기존 high severity 취약점 1건 보고, 자동 수정은 범위 밖이라 미실행

---

## 현재 작업 (2026-08-15 — 고아 파일 삭제, 이력서 화면 문구 분기)

- 작업명: 연결되지 않는 옛 1단계 마법사 파일 삭제, 이력서 화면 제목·설명을 최초 등록/수정/조회 상태별로 분리
- 배경: 사용자에게 "희망 조건 입력 화면을 이력서 화면에 통합 유지 vs 옛 1단계 마법사 부활" 중 선택을 물었고, 통합 유지로 결정됨에 따라 옛 마법사 파일은 더 이상 쓸 이유가 없어 삭제 요청받음. 또한 최초 등록 화면과 이미 등록된 화면을 볼 때 문구가 똑같아 구분이 안 된다는 지적
- 진행 상황:
  - `src/features/freelancer/mypage/components/FreelancerProfileRegistration.tsx` 삭제(2026-08-13 마이페이지 개편 이후 어떤 라우트에서도 참조되지 않던 고아 컴포넌트였음을 사전에 확인)
  - [FreelancerResumeRegistration.tsx](../src/features/freelancer/mypage/components/FreelancerResumeRegistration.tsx): 작성 화면의 제목·설명을 `hasSavedResume` 기준으로 분기
    - 최초 등록(이력서 없음): "이력서 등록" / "희망 조건과 이력서, 포트폴리오를 등록해 주세요."
    - 기존 이력서 수정: "내 이력서 수정" / "이력서와 포트폴리오 정보를 수정합니다."
    - 조회(보기) 화면: 기존 그대로 "내 이력서" / "등록된 이력서와 포트폴리오 정보를 확인할 수 있습니다."(변경 없음)
- 검증: 변경 파일 TypeScript(`tsc --noEmit`) 전체 통과, ESLint 통과. `/freelancer/mypage/resume` 직접 접근 시 컴파일 에러 없음 확인
- 실제 화면: 로그인이 필요해 문구 전환은 브라우저로 확인하지 못함

---

## 현재 작업 (2026-08-15 — 메인페이지 CTA 문구 이력서 유무로 분기)

- 작업명: 메인페이지 CTA 버튼 문구를 이력서 완료 여부에 따라 "프로필 등록하기" ↔ "내 이력서 보기"로 분기
- 배경: 이력서가 이미 있는 사용자에게도 "프로필 등록하기"라고 뜨는 게 어색하다는 지적. 링크 목적지(`/freelancer/mypage/resume`)는 이미 이력서 유무로 작성/조회를 분기하므로 그대로 두고, 버튼 문구만 상태에 맞게 바꿈
- 진행 상황: [FreelancerMain.tsx](../src/features/freelancer/components/FreelancerMain.tsx)에서 로그인된 사용자에 한해 `GET /api/v1/freelancers/me`의 `resumeCompleted`(기존에 타입에는 있었으나 어디서도 쓰이지 않던 필드)를 조회해 버튼 문구를 분기. href는 두 경우 모두 `/freelancer/mypage/resume`로 동일
- 별도 발견: 같은 히어로 영역의 "시니어 등급" 배지는 실제 등급 API(`GET /grades/me`) 호출 없이 하드코딩된 문자열이라, 이력서·프로젝트 이력이 없는 신규 가입자에게도 항상 노출됨. 사용자에게 보고했고 수정 여부는 아직 확정되지 않음(응답 대기)
- 검증: 변경 파일 TypeScript·ESLint 통과. `/freelancer` 직접 접근 시 컴파일 에러 없음 확인
- 실제 화면: 로그인이 필요해 실제 분기(버튼 문구 전환)는 브라우저로 확인하지 못함

---

## 현재 작업 (2026-08-15 — 메인페이지 "프로필 등록하기" → 이력서 화면 직결)

- 작업명: 메인페이지 "프로필 등록하기" 버튼을 `/freelancer/mypage/resume`로 연결(사용자 승인 후 결정)
- 배경: 원래(2026-08-12 최초 커밋) `/freelancer/mypage/profile`은 등록 마법사 1단계였으나, 이후 마이페이지 API 연동 과정에서 이 라우트가 "기본 정보 조회 화면"으로 바뀌었음(라우트 재사용). 그 결과 지금 구조에서 CTA가 `/freelancer/mypage/profile`로 가면 이력서 유무와 무관하게 항상 같은 기본 정보 화면만 보여주고, "이력서 없으면 작성/있으면 조회" 분기는 사이드바에서 별도로 "이력서" 탭을 눌러야만 볼 수 있었음
- 결정: 새 분기 로직을 만들지 않고, 이미 그 분기를 구현하고 있는 `/freelancer/mypage/resume`(`FreelancerResumeRegistration`)로 CTA를 바로 연결. 로직 중복 없이 기존 코드 재사용
- 진행 상황: [FreelancerMain.tsx](../src/features/freelancer/components/FreelancerMain.tsx) href를 `/freelancer/mypage/resume`로 변경
- 검증: 변경 파일 ESLint·TypeScript 통과, `/freelancer` 직접 접근 시 컴파일 에러 없이 정상 동작(로그인 리다이렉트) 확인
- 실제 화면: 로그인이 필요해 클릭 후 실제 분기 동작은 브라우저로 확인하지 못함

---

## 현재 작업 (2026-08-15 — 메인페이지 "프로필 등록하기" 링크 원복, 이전 기록 정정)

- 작업명: 메인페이지 "프로필 등록하기" 버튼 링크를 원래 값(`/freelancer/mypage/profile`)으로 되돌리고, 아래 "이력서 화면 희망 조건 통합·라벨/디자인 복원" 항목의 잘못된 기록을 정정
- 배경: 앞선 작업에서 "메인페이지 버튼이 원래 `/freelancer/mypage/resume`로 연결됐었는데 끊겼다"고 추측해 `/freelancer/mypage/resume`로 바꿨으나, 이는 검증 없이 추측한 내용이었음. `git log`/`git show`로 최초 커밋(f327732, 2026-08-12)부터 현재 HEAD까지 확인한 결과 이 버튼은 **처음부터 계속** `/freelancer/mypage/profile`로 연결돼 있었고, `/freelancer/mypage/resume`로 연결된 적은 한 번도 없었음
- 진행 상황: [FreelancerMain.tsx](../src/features/freelancer/components/FreelancerMain.tsx)의 href를 `/freelancer/mypage/profile`로 되돌림
- 검증: 변경 파일 ESLint 통과
- 교훈: "예전엔 이랬을 것" 같은 추측은 실제 `git log`로 검증한 뒤에 코드를 바꿔야 함(이번엔 사용자가 재차 확인해줘서 알아챔)

---

## 현재 작업 (2026-08-15 — 이력서 사진·포트폴리오 URL 응답 반영)

- 작업명: 이력서 조회 응답에 실제로 내려오는 `profileImageUrl`/`portfolioUrl`을 반영해 이전 임시 조치(계정 사진 재사용)를 제거
- 배경: 사용자가 백엔드에 확인한 결과 `GET /api/v1/freelancers/me/resume`가 `profileImageUrl`(CDN 절대 URL), `portfolioUrl`을 이미 내려주고 있었음(DB엔 object key만 저장, 응답 시 CDN 도메인을 붙여 완성). 저장(PUT)은 `profileFileId`/`portfolioFileId`(숫자 ID)를 받지만 조회(GET)는 URL 문자열로 내려주는 **비대칭 계약**이라 필드명만 보고는 존재를 알기 어려웠음. 계정 프로필 사진(`/freelancers/me`)과 이력서용 사진(`/freelancers/me/resume`)은 서로 다른 값이라는 점도 확인함
- 진행 상황:
  - [types/resume.ts](../src/features/freelancer/mypage/types/resume.ts): GET 응답 전용 `ResumeDetailBody` 타입 신설(`profileImageUrl`, `portfolioUrl` 포함, PUT 전용 `ResumeBody`와 분리). `ResumeDetailResponse.resume`의 타입을 이 타입으로 교체
  - [freelancerResume.ts](../src/features/freelancer/mypage/services/freelancerResume.ts): `getFreelancerResume()` 매핑에 `profileImageUrl`/`portfolioUrl` 정규화 추가
  - [FreelancerResumeRegistration.tsx](../src/features/freelancer/mypage/components/FreelancerResumeRegistration.tsx)
    - 지난 턴에 임시로 썼던 "계정 프로필 사진 재사용"(`getFreelancerProfile` 호출)을 제거하고, 이력서 자체의 `profileImageUrl`을 표시에 사용하도록 수정 — 이제 계정 사진이 아니라 실제 이력서용 사진이 보임
    - 조회 응답은 파일 ID를 내려주지 않으므로(URL만 내려줌), 사진·포트폴리오가 "등록돼 있는지" 여부는 `profileImageFileId || profileImageUrl`(사진), `portfolioFileId || portfolioUrl`(포트폴리오)로 판단하도록 필수값 검증을 변경
    - 저장(PUT) 요청은 이번 세션에 새로 업로드해 숫자 ID를 받은 경우에만 `profileFileId`/`portfolioFileId`를 보내고, 그렇지 않으면 필드 자체를 생략(기존 `ClientProfile.tsx`의 `logoFileId` 생략 패턴과 동일) — 서버가 생략된 필드는 기존 값을 유지한다는 전제이며 **미검증**
    - 포트폴리오는 이미 등록된 경우 파일명을 `portfolioUrl`로 연결되는 링크로 표시해 실제 업로드된 파일을 바로 열어볼 수 있게 함
- 검증: 변경 파일 TypeScript(`tsc --noEmit`) 전체 통과, ESLint 통과. `/freelancer/mypage/resume` 직접 접근 시 컴파일 에러 없이 로그인 리다이렉트로 정상 동작 확인
- 실제 화면: 로그인이 필요해 사진·포트폴리오 링크가 실제로 어떻게 보이는지는 브라우저로 확인하지 못했습니다
- 확인 필요: PUT 요청에서 `profileFileId`/`portfolioFileId`를 생략했을 때 서버가 기존 값을 그대로 유지하는지 여부(로그인 세션에서 검증 필요)

---

## 현재 작업 (2026-08-15 — 이력서 화면 희망 조건 통합·라벨/디자인 복원)

- 작업명: 이력서 화면에 희망 조건(condition) 섹션 통합, 라벨·전화번호 표기·프로필 사진·보유 스킬 디자인을 이전 버전과 일치시킴
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 배경: 사용자가 "디자인이 다 전이랑 달라졌다"고 지적. 확인 결과 두 가지 원인이 겹쳐 있었음
  1. `.ai/API.md`의 "프리랜서 마이페이지 등급·이력서 통합 저장(2026-08-14)" 항목에 따르면 `condition`과 이력서 본문은 **같은 화면에서 한 번에 PUT** 하도록 설계가 확정됐는데, 실제 화면에는 조건 입력 UI 자체가 빠져 있었음(과거 별도 1단계 마법사였던 `FreelancerProfileRegistration.tsx`가 라우트 연결이 끊겨 고아 상태로 방치됨). 그 결과 조건은 이전에 sessionStorage에 남아있던 값에만 의존했고, 새 계정은 조건을 입력할 방법이 없었음
  2. ~~메인페이지 "프로필 등록하기" 버튼이 언젠가 `/freelancer/mypage/profile`(기본 정보 조회 화면)로 바뀌어 있어, 실제 등록 화면(`/freelancer/mypage/resume`)으로 가는 진입점 자체가 사라져 있었음~~ → **정정(위 최신 항목 참고)**: `git log` 확인 결과 이 버튼은 최초 커밋부터 계속 `/freelancer/mypage/profile`이었고 끊긴 적이 없었음. 아래 진행 상황의 링크 변경은 검증 없는 추측이었고 이후 원복함
- 진행 상황:
  - [FreelancerResumeRegistration.tsx](../src/features/freelancer/mypage/components/FreelancerResumeRegistration.tsx)
    - "희망 조건" `FormCard`를 이력서/조건 사이에 신설. 직군·직무·근무방식·근무형태·희망급여단위·희망급여·최저수용금액·시작가능일·협의여부·희망기간·기간단위·프리랜서경험·경력(년)·보유스킬을 사용자가 준 표 기준 필수/선택으로 재구현. 스킬 선택 UI는 예전 `FreelancerProfileRegistration.tsx`의 타원(`rounded-full`) 배지 스타일을 그대로 재사용
    - 조회(review) 화면의 "보유 스킬"도 코드 문자열이 아니라 타원 배지 목록으로, 직군/직무/근무방식 등도 실제 코드가 아니라 메타 API의 라벨로 표시(기존엔 raw code를 그대로 보여주고 있었음)
    - 라벨을 사용자가 준 표 그대로 "연락처"·"이메일"·"기본 주소"로 되돌림(이전 대화에서 붙였던 "연락처(이력서용)"/"연락 이메일"은 되돌림). 우편번호는 표대로 필수에서 제외
    - `mapApiToDraft`에서 `contactPhone`에 `formatPhoneNumber`를 적용해 조회·수정 화면 모두 하이픈 포함 형식으로 표시(이전엔 서버 원본 숫자 그대로 표시되던 버그)
    - 자격증 입력 시 취득일자·자격증명 필수 검증 추가(표 5번 항목), 약관 동의는 최초 등록 시에만 필수이고 이후 수정 저장은 막지 않도록 게이트 추가(표 9번 항목)
    - 프로필 사진: 이력서 API 응답에는 사진 URL 필드가 없어(파일 ID만 있음), 계정 조회(`GET /freelancers/me`)의 `profileImageUrl`을 저장된 사진의 표시용 URL로 임시 사용함 — **이 값이 실제로 이력서용 사진과 같은 파일인지는 미확인**이라 백엔드 확인 필요
    - 이전 1단계 마법사와의 연결에 쓰이던 `sessionStorage` 브릿지(`pairing.freelancer.resume.condition`) 제거(같은 화면으로 통합돼 더 이상 필요 없음)
  - ~~[FreelancerMain.tsx](../src/features/freelancer/components/FreelancerMain.tsx): 메인페이지 "프로필 등록하기" 버튼을 `/freelancer/mypage/resume`로 재연결~~ → **정정**: 검증 없는 추측이었음. 위 최신 항목에서 `/freelancer/mypage/profile`로 원복함
  - `FreelancerProfileRegistration.tsx`(고아 상태였던 예전 1단계 마법사)는 어디서도 참조되지 않는 상태 그대로 두고 삭제하지 않음(요청 범위 밖 삭제 금지 원칙)
- 검증: 변경 파일 TypeScript(`tsc --noEmit`) 전체 통과, ESLint 통과. `/freelancer/mypage/resume` 직접 접근 시 로그인 리다이렉트까지 정상 동작(컴파일 에러 없음)으로 확인
- 실제 화면: 로그인이 비밀번호 입력을 요구해 조건 섹션·스킬 배지·사진 표시가 실제로 어떻게 보이는지는 브라우저로 확인하지 못했습니다. 사용자 확인 필요
- 확인 필요: 이력서 프로필 사진이 계정 프로필 사진과 동일한 파일인지 여부(현재는 계정 사진을 그대로 재사용)

---

## 현재 작업 (2026-08-15 — 이력서 수정 이메일 인증 제거·최초 작성 안내 문구)

- 작업명: 이력서 수정 진입 시 이메일 인증 요구 제거, 이력서 미작성 계정에 최초 작성 안내 문구 추가
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 배경: 사용자가 이력서 수정에는 이메일 인증이 필요 없다고 확인함(계정 정보 수정과 달리 이력서 연락처는 별개 값이라는 이전 정리와 일관). 또한 이력서가 없는 신규 계정이 조회 화면 없이 바로 작성 폼으로 들어가는 것을 보고 "처음 작성"이라는 안내가 없어 헷갈린다는 피드백
- 진행 상황:
  - [FreelancerResumeRegistration.tsx](../src/features/freelancer/mypage/components/FreelancerResumeRegistration.tsx): 조회 화면의 "수정하기" 버튼에서 `ProfileUpdateVerificationModal` 인증 게이트를 제거하고 바로 편집 폼으로 전환하도록 되돌림(`verificationOpen` 상태·모달 제거)
  - 이력서가 없어 처음부터 작성 폼이 보이는 경우(`hasSavedResume === false`)에만 "아직 등록된 이력서가 없어 처음 작성하는 화면입니다. 아래 정보를 입력하고 저장하면 이력서가 등록됩니다." 안내 문구를 폼 상단에 표시. 기존에 저장된 이력서를 수정하러 온 경우에는 표시하지 않음
- 검증: 변경 파일 TypeScript(`tsc --noEmit`) 통과, ESLint 통과
- 실제 화면: 로그인에 비밀번호 입력이 필요해 로그인된 이력서 화면은 브라우저로 미검증. 사용자 확인 필요

---

## 현재 작업 (2026-08-15 — 프리랜서 프로필 별점·이력서 연락처 라벨 정리)

- 작업명: 프리랜서 프로필 화면 별점·리뷰 건수 표시, 이력서 연락처 라벨/안내 문구 정리
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 배경: 백엔드 변경 없음. `GET /freelancers/me`가 이미 내려주는 `ratingAverage`/`reviewCount`를 프리랜서 프로필 화면만 그리지 않아 클라이언트 화면과 동일한 형태로 맞춤. 이력서의 전화번호·이메일·주소는 계정 정보와 별개의 `Resume` 엔티티 컬럼(비우면 계정 값 대체)인데 화면 라벨이 이를 설명하지 않아 계정 정보를 고치는 칸으로 오인될 수 있어 라벨·안내 문구만 수정
- 진행 상황:
  - [FreelancerProfile.tsx](../src/features/freelancer/mypage/components/FreelancerProfile.tsx): 이름 옆에 `★ {ratingAverage} · 리뷰 {reviewCount}건`을 `ClientProfile.tsx`와 동일한 형태로 추가(리뷰 0건이어도 숨기지 않음, 클라이언트 쪽과 동일 정책)
  - [FreelancerResumeRegistration.tsx](../src/features/freelancer/mypage/components/FreelancerResumeRegistration.tsx): 기본 정보 카드에 "매칭된 클라이언트에게 보여줄 연락처입니다. 비우면 회원정보의 값을 사용합니다. 로그인 정보를 바꾸려면 기본 정보 탭에서 수정하세요." 안내 문구 추가, 전화번호/이메일 라벨을 "연락처(이력서용)"/"연락 이메일"로 변경(수정 폼과 조회(review) 화면 모두 반영)
- 검증: 변경 파일 TypeScript(`tsc --noEmit`)·ESLint 통과, 관련 기존 `FreelancerProfile.test.tsx`는 이번 변경과 무관하게 기존부터 실패하던 App Router 목 누락 5건과 동일하게 실패(회귀 아님)
- 실제 화면: 로그인에 비밀번호 입력이 필요해 로그인된 마이페이지·이력서 화면은 브라우저로 미검증. 사용자 확인 필요

---

## 현재 작업 (2026-08-15 — 마이페이지 기존 디자인 복원)

- 클라이언트 기본 정보 화면의 여백·타이포·프로필 정보 배치와 다음 등급 진행 카드를 기존 디자인으로 복원
- 클라이언트 기본 정보 편집 상태의 상단 취소·저장 버튼, 입력 높이와 2열 폼 배치를 기존 디자인으로 복원
- 프리랜서 프로필 조회에서 저장된 사진을 표시하고, 수정 화면의 상단 원형 프로필 영역에서 사진을 등록·변경하도록 복원
- 저장된 프리랜서 이력서는 조회 전용 화면으로 먼저 표시하고, 수정하기 클릭 시 이메일 인증 완료 후에만 편집 화면으로 전환
- 이력서 조회 화면에서 누락됐던 희망 조건과 보유 스킬 카드를 통합 `condition` 응답값으로 복원
- 클라이언트·프리랜서 리뷰 목록의 작성자·프로젝트·본문·별점·작성일 배치를 기존 디자인으로 복원
- 실제 프로필·등급·리뷰 API 연동과 이메일 인증, 최근 확정된 작성 리뷰 카드 구성은 유지
- 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 로컬 브라우저는 인증 세션이 없어 로그인 리다이렉트까지만 확인하여 실제 마이페이지 화면은 미검증

---

## 현재 작업 (2026-08-15 — 원격 프로필 이미지 CDN 허용)

- `next/image` 원격 호스트에 `https://cdn.52pairing.kro.kr` 등록
- 기존 bundle analyzer wrapper 유지
- 백엔드 `CandidateResponse.profileImageUrl` 절대 URL 변환 배포 필요
- object key 문자열만 내려오는 현재 응답으로는 이미지 표시 불가
- production build·`git diff --check` 통과

---

## 현재 작업 (2026-08-15 — 로그인 후 화면 전환 실패 수정)

- 일반 로그인 성공·로그아웃 완료 시 현재 사용자 모듈 캐시 초기화
- 로그인 내비게이션을 STOMP 재연결보다 먼저 실행하고 재연결 실패를 로그인과 분리
- 소셜 로그인 성공 경로에도 동일한 캐시 초기화·비동기 STOMP 복구 적용
- 로그인·회원가입 등 공개 경로에서 `AuthSessionGuard`의 `/auth/me` 호출 차단
- 테마 초기화 Script를 head에서 body 첫 자식으로 이동
- TypeScript·변경 파일 ESLint·production build·`git diff --check` 통과
- 실제 역할 교차 재로그인·브라우저 콘솔은 로그인 환경에서 확인 필요

---

## 현재 작업 (2026-08-15 — 클라이언트 회사명 표시)

- `/auth/me` 응답 타입에 nullable `companyName` 추가
- 클라이언트 메인 인사말과 헤더 프로필명을 `companyName ?? name`으로 표시
- 클라이언트 마이페이지는 기존부터 회사명·담당자명을 올바르게 분리해 추가 변경 없음
- 프리랜서 헤더는 기존 개인 이름 표시 유지
- TypeScript·변경 파일 ESLint·production build·`git diff --check` 통과

---

## 현재 작업 (2026-08-15 — 결제수단 이메일 인증)

- 최종 첨부 계약에 따라 결제수단 GET은 인증 없이 즉시 조회·표시
- 카드·계좌 수정 버튼에서 `PAYMENT_METHOD` 인증 모달을 선제적으로 표시
- 인증 성공 후 선택한 수정 폼을 열고 30분 마커 동안 카드·계좌 수정 연속 사용
- 카드·계좌 PUT의 `AU_006`은 입력 폼을 유지한 채 인증 모달로 복귀
- 수수료 결제 모달의 T4 인증 변경은 제거하고 기존 조회·결제 흐름 유지
- TypeScript·변경 파일 ESLint·production build 통과
- 전체 Jest 167개 통과, 기존 `FreelancerProfile` App Router 목 누락 5개 실패
- 실제 이메일 발송·30분 만료·연속 수정은 로그인 환경에서 확인 필요

---

## 현재 작업 (2026-08-15 — 백엔드 주소 객체 계약 연동)

- 회원가입 3종과 클라이언트·프리랜서 기본 정보 수정의 `address`를 5칸 객체로 변경
- 다음 우편번호 검색을 공통 `AddressFields`로 연결하고 도로명주소는 읽기 전용, 상세주소만 직접 입력
- 조회 화면은 서버의 한 줄 `address`, 수정 초기값은 nullable `addressParts` 사용
- TypeScript·ESLint 통과, 신규 주소 빌더 테스트 3개 통과
- 전체 Jest: 155개 통과, 기존 `FreelancerProfile` 라우터 목 누락 5개 실패
- production build 통과(네트워크 허용 환경에서 Google Fonts 다운로드 포함)
- 실제 위젯 필드·회원가입 201·마이페이지 PATCH 200은 로그인 테스트 환경에서 확인 필요

---

## 현재 작업 (2026-08-15 — 카드사 메타·결제번호 검증 연동)

- 가입 3종 카드사를 `/meta/card-companies`, 은행을 `/meta/banks` select로 분리
- 결제수단 조회의 `cardCompany`를 카드 수정 폼 초기 코드로 사용
- 가입·양 역할 마이페이지 카드번호 16자리, 계좌번호 10~14자리 공통 검증 적용
- TypeScript·변경 파일 ESLint·production build·관련 테스트 12개 통과
- 전체 Jest는 기존 `FreelancerProfile` App Router 목 누락 5개 실패, 나머지 167개 통과
- 실제 가입 201·결제수단 수정 200과 수정 폼 재진입은 로그인 환경에서 미검증
## 현재 작업 (2026-08-15 — 계약 파트 리팩터링: 포매터 중복 제거 + overlay 토큰화)

- 작업명: client·freelancer 계약 파트 정리 (요청: 불필요 코드 / 렌더링 / 최적화 / SEO 전체 진단 후 우선순위 2건 착수)
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 범위: `features/contract` (포매터 유틸 신설 + 카드/상세/완료모달 적용, overlay 토큰 교체). 로그인/매칭/마이페이지/메인 제외
- 진단 결과 요약:
  - dead code: 미사용 import·주석코드 없음. `getClientContracts` 등 불필요 `export` 소수 (후속)
  - 렌더링: 전 계약 페이지 CSR(쿠키 인증). Suspense 비대칭은 `useSearchParams` 강제 경계로 정상
  - 번들/코드스플리팅: 팀 실측 완료(건강) → 손대지 않음. 이미지: 서명 blob `unoptimized` 정답
  - SEO: 계약 라우트는 `robots.ts` disallow(의도된 비공개). 페이지 title 부재 + noindex 방어선은 후속 권고
- 착수 범위(이번 패스):
  - 포매터 중복 제거: `features/contract/utils/format.ts` 신설(`formatContractDate`/`formatKrw`/`formatMonthlyAmount`), 4개 컴포넌트 사설 복사본 대체 (동작 보존)
  - overlay 토큰화: `ContractCompleteModal` `bg-[#0f172a]/45` → `bg-theme-overlay`
- 보류/미검증(추측 금지):
  - A. ClientContracts 서버 탭 페이지네이션 전환 — API.md상 fetch-all은 의도된 설계 + 서버 client-탭 필터링 미검증 → 백엔드 확인 필요
  - 상태→라벨 통합 — 역할별 문구 상이로 병합 부적합
  - badge/notice raw hex 다크모드 대응 — blue/purple 토큰 부재 → 토큰 신설+시각 검증 필요한 별도 작업
- 진행 상황: 완료 (4단계)
  - 1단계: `format.ts` 신설 + 4개 컴포넌트 사설 포매터 제거, `ContractCompleteModal` overlay 토큰화
  - 2단계(다크모드): 시맨틱 토큰 5종 신설(`danger-border`/`success-border`/`info`·`info-surface`·`info-border`), 계약 컴포넌트 light 전용 raw hex → 토큰. badge 5색은 고정 상태색 유지(가이드 §5)
  - 3단계(SEO): 계약 라우트 9개 `page.tsx`에 static metadata(title + `robots` noindex)
  - 4단계(렌더링·dead code): `ContractDocument` detail/PDF 병렬화, 외부 미사용 `export` 7개 제거
- 검증: TypeScript·`eslint`(contract+변경 라우트) 통과, `npm run build` 성공, 계약 Jest 4 suites/25 tests 통과, 전체 181/186 통과
- 무관 실패: `FreelancerProfile.test.tsx` 5건 — 변경 전 baseline 동일(stash 재현), 팀원 파트라 미수정
- 실제 API·브라우저: 미검증 (no localhost verify). **다크모드 라이트/다크 시각 확인 미실시** → 가이드 §11 완료조건 미충족, PR 시 캡처 검증 필요. `robots` 메타 렌더 결과도 브라우저 미확인
- 항목 A 완료(2026-08-16): 백엔드 회신 확인 후 `ClientContracts` 서버 탭 페이지네이션 전환. `AWAITING_ME`는 서버가 DRAFT·REJECTED 제외로 좁아짐(의도됨). `.ai/API.md` 갱신
- 항목 C 완료(2026-08-16): `useAsyncData` 훅 + `<ListState>` + `<ContractTabBar>` 신설, 3개 컨테이너·2개 탭 어댑터에 적용. 동작·화면 보존(탭 aria-pressed 일관화만 추가)
- 후속(보류): (B) badge 다크 전용 톤 칩 승격(시각검증). 상태→라벨 통합은 역할별 상이로 제외 확정. `useAsyncData` common 승격·상태박스/탭 레이아웃 통일은 팀 판단 시

---

## 현재 작업 (2026-08-15 — 계약·프로젝트 버그 4건 수정)

- 작업명: 프리랜서 서명 대기 탭, 계약 상세 복귀 경로·PDF 다운로드, 종료 프로젝트 모집 정보 수정
- 기준 문서: `C:/Users/user/Downloads/frontend-contract-project-fixes-guide.md`
- 관련 Issue: 생성 전
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 완료 — 프리랜서 서명 대기 탭을 `SIGNING`으로 변경, 클라이언트 계약 상세 복귀 경로를 `/client/contracts`로 수정, 종료·취소 프로젝트의 모집 마감일·연장 횟수 숨김, 양측 서명 완료 시에만 계약 상세 PDF 다운로드 노출
- 검증: 관련 Jest 3 suites/18 tests, 변경 파일 ESLint, TypeScript, 프로덕션 빌드, `git diff --check` 통과
- 실제 API·브라우저: 미검증 — 로그인 테스트 세션이 없고 `SIGNING` 배포 응답을 확인하지 못함

---

## 현재 작업 (2026-08-15 — 채팅/고객문의 파트 정리·렌더링·SEO 최적화)

- 작업명: 채팅·고객지원(support) 파트 리팩터링/최적화 (불필요 코드 정리 + 렌더링 전략 + 번들 실측 + SEO)
- 관련 Issue: #198 (확인 필요)
- 관련 브랜치: 현재 작업 브랜치
- 범위: `features/chat`, `features/support`, `app/support`, 공용 `Header`(사용자 승인), `next.config.ts`, `app/layout.tsx`. 로그인/매칭/마이페이지/메인 제외
- 진행 상황(완료):
  - 미사용 코드 3건 삭제(`leaveChatRoom`+`leaveEnabled`, `getUnreadChatCount` 별칭). `writer*` 필드는 유지 선택
  - `/support` SEO metadata + 루트 `metadataBase`
  - 문의 첨부 업로드 `Promise.allSettled` 병렬화(롤백·에러코드 유지)
  - `/support` SSR→SSG(`force-static`), 하위 인증 라우트는 dynamic 유지
  - `next.config` 실측 후 하이진 설정(`poweredByHeader:false` 등), 이미지 설정은 호스트 미확정 TODO
  - 공용 `Header` 깜빡임 스켈레톤(`HeaderSkeleton`) — SSG 하드진입 시 게스트→로그인 깜빡임 제거
- 검증: TypeScript·ESLint 통과, Jest 35 suites/174 tests 통과, `npm run build`에서 `/support` `○ Static` 확인
- 남은 작업: 아바타 이미지 최적화(실제 호스트 확정 후 `unoptimized` 제거 + `remotePatterns`), 스켈레톤 시각 미세조정(브라우저 확인 시)
- 기존 실패(무관): `FreelancerProfile.test.tsx` 5건 `useRouter` 하네스 이슈 — 변경 stash 후에도 동일, 팀원 파트라 미수정

---

## 현재 작업 (2026-08-15 — 채팅 입력창 상단 구분선 제거)

- 작업명: 1:1 채팅 입력 영역 위 얇은 구분선 제거
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 채팅 메시지 입력 폼의 상단 테두리 스타일 제거 완료
- 변경 파일: `src/features/chat/components/Chat.tsx`
- 검증: 변경 파일 ESLint, 채팅 Jest 1 suite/8 tests, `git diff --check` 통과
- 실제 브라우저: 미실행 — 로그인 채팅 데이터가 필요한 화면이며 상단 테두리 클래스만 제거

---

## 현재 작업 (2026-08-14 — 처음 마지노선 등록 최소가 하한: 차단→경고 후 허용)

- 작업명: 처음 협상 시작(POST /start) 시 등록 최소가보다 낮은 단가면 NG_012 차단 대신 확인 모달 후 허용
- 기준 문서: `C:/Users/user/Downloads/frontend-floor-below-minaccept-0814.md`
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 범위: 처음 입력(start)만. 재조정(/floors)·수락(/answers)은 손대지 않음. 프리랜서+AMOUNT에만 의미
- 진행 상황: `StartNegotiationRequest.conditions[]`에 `belowMinAccept?` 추가, `handleStart`가 NG_012를 배너 대신 `{ belowMinAccept: true }`로 반환, SetupPanel이 확인 모달을 띄우고 [그래도 시작] 시 AMOUNT만 `belowMinAccept:true`로 재제출
- 변경 파일: `types/negotiation.ts`, `NegotiationRoom.tsx`, `NegotiationChatFlow.tsx`, 추가 `unit-tests/negotiation/NegotiationStartBelowMinAccept.test.tsx`
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, 신규 협상 Jest 1 suite/2 tests 통과, `git diff --check` 통과
- 실제 로그인·API·브라우저: 미검증(테스트 계정 없음). 백엔드 NG_012→belowMinAccept 통과 반영이 배포돼야 실제 동작 확인 가능

---

## 현재 작업 (2026-08-14 — 헤더 채팅 아이콘 안읽음 배지)

- 작업명: 상단 채팅 아이콘에 안 읽은 1:1 채팅 총합 배지 표시
- 기준 문서: `C:/Users/user/Downloads/frontend-chat-unread-badge.md`
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 폴링 기반 안읽음 총합 훅 추가, 헤더에 연결, 99+ 표기 적용
- 기준 문서와 실제 코드 차이: 문서는 `GET /api/v1/chats/unread-count` `{ unread }`로 안내하나, 실제 코드에는 이미 `getChatUnreadCount`가 `GET /api/v1/chat-rooms/unread-count` `{ unreadCount }`로 구현·테스트되어 있어 실제 코드 기준으로 재사용
- 실시간 전략: 문서 권장 A(폴링, 백엔드 무변경). 채팅 STOMP는 방별 토픽이라 전역 배지에 쓸 수 없어 20초 폴링 + 창 포커스 복귀 시 재조회
- 추가 파일: `src/features/chat/hooks/useUnreadChatCount.ts`, `unit-tests/chat/useUnreadChatCount.test.tsx`
- 변경 파일: `Header.tsx`(훅 연결), `ClientHeader.tsx`·`FreelancerHeader.tsx`(배지에 99+ 표기)
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, 채팅 Jest 4 suites/18 tests(신규 훅 4 tests 포함) 통과
- 한계: 채팅방을 읽어 안읽음이 0이 되어도 헤더 배지는 다음 폴링(≤20초) 또는 포커스 복귀 시 갱신됨(문서 A안 트레이드오프)
- 실제 로그인·API·브라우저: 미검증(테스트 계정 없음)

---

## 현재 작업 (2026-08-14 — 검색 엔진 크롤링·사이트맵 설정)

- 작업명: 사이트 공개 경로용 `robots.txt`와 `sitemap.xml` 메타데이터 라우트 추가
- 관련 Issue: #187 — 브랜치명 기준
- 관련 브랜치: `feature/common-seo#187`
- 진행 상황: 공개 정적 페이지와 비공개·인증 경로를 분류해 `robots.txt`·`sitemap.xml` 구현 및 배포 빌드 환경변수 전달 완료
- 검증: 변경 파일 ESLint, TypeScript, 프로덕션 빌드, 생성 결과 확인, `git diff --check` 통과
- 배포 확인 필요: GitHub Repository Variable `NEXT_PUBLIC_SITE_URL`에 실제 프론트 운영 주소 등록 필요

---

## 현재 작업 (2026-08-14 — 협상 조건 라벨 문구 변경)

- 작업명: 협상 조건 카드의 `내 마지노선` 라벨을 `내 선택`으로 변경
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 사용자에게 표시되는 조건 카드 라벨만 변경 완료
- 검증: 변경 파일 ESLint 및 `git diff --check` 통과, 실제 로그인 협상 화면 미검증

---

## 현재 작업 (2026-08-14 — Google Search Console 소유권 확인 파일 배치)

- 작업명: Google Search Console HTML 확인 파일을 Next.js 정적 공개 경로로 이동
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: `google4e55541e4d3ae080.html`을 프로젝트 루트에서 `public/`로 이동 완료
- 검증: 파일 경로와 인증 문자열 확인, 실제 운영 배포 및 Search Console 인증은 미검증
## 현재 작업 (2026-08-15 — 마이페이지 체크리스트 최종 재대조)

- 필수 수정·추가 체크리스트 전 항목 코드 반영 상태 확인
- 경력 `department`, `position`, `jobDescription`이 서버 선택값인데 프론트에서 일부 필수 처리되던 검증 제거
- BusinessField/EmployeeCount 메타 서비스는 프론트에 있으나 백엔드 가이드상 미제공 상태와 충돌해 실제 배포 응답 확인 필요
- 성공보수 관련 0건·빈 배열은 정상 빈 상태로 유지

---

## 현재 작업 (2026-08-15 — 공통 인증·결제수단 가이드 재검증)

- `PROFILE_UPDATE` 인증 모달에 서버 expiresAt 타이머·remainingSendCount 재발송 제한 적용
- 임시 비밀번호 사용자는 `tempPassword=true`일 때 비밀번호 변경 이메일 인증 생략
- 비밀번호 규칙을 영문·숫자·특수문자 8~20자로 서버와 통일
- 정보 수정 요청 실패 후 1회용 인증을 다시 완료해야 재저장 가능하도록 양 역할 보완
- 프리랜서 결제수단 목업 fallback 제거 및 카드·계좌 PUT 실제 저장 연결
- 양 역할 계좌 마스킹을 `bankName + ****last4` 형식으로 통일
- TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- production build 실패: 코드 오류가 아니라 실행 환경에서 Google Fonts(Geist/Geist Mono) 요청 실패

---

## 현재 작업 (2026-08-15 — 첨부 마이페이지 연동 가이드 재검증)

- 프리랜서 리뷰 관리의 목업 데이터를 제거하고 summary/received/written API로 교체
- 작성 가능한 리뷰는 pending 응답을 유지하고 목록이 비면 섹션 숨김
- 클라이언트·프리랜서 작성한 리뷰에서 조회 API가 제공하지 않는 서비스 이용 후기 블록 제거
- 작성 리뷰의 `content=null`은 본문을 렌더링하지 않고 수정·삭제 불가 정적 배지는 유지
- 등급 목표·통합 이력서 저장·notice·만원 단위·1,500자·부서/직급·약관·소속 제거 상태 재확인
- TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- 관련 FreelancerProfile Jest는 실행이 120초 내 완료되지 않아 타임아웃(결과 미확인)
- TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- 관련 FreelancerProfile Jest는 실행이 120초 내 완료되지 않아 타임아웃(결과 미확인)

---

## 현재 작업 (2026-08-14 — 시스템 설정 마이페이지 이동)

- 헤더의 테마 선택 드롭다운을 작은 라이트/다크 전환 아이콘으로 교체
- 클라이언트·프리랜서 마이페이지 사이드바에 `기본 설정` 추가
- 화면 테마와 비밀번호 변경을 기본 설정 페이지로 이동
- 프리랜서 AI 매칭 설정도 기본 정보에서 기본 설정 페이지로 이동
- 기존 비밀번호 변경 URL은 역할별 기본 설정 페이지로 리다이렉트

---

## 현재 작업 (2026-08-14 — 마이페이지 이메일 인증·프로필/결제수단 접근 수정)

- 클라이언트 기본 정보는 수정 버튼 클릭 후 `PROFILE_UPDATE` 이메일 인증 모달을 통과해야 편집 모드 진입
- 프리랜서 기본 정보 수정과 양 역할 결제수단 화면도 같은 인증 모달을 통과해야 정보 노출
- 결제수단 API는 인증 완료 전 호출하지 않도록 차단
- 클라이언트 기업 로고 업로드를 별도 폼 필드에서 상단 프로필 사진 영역으로 이동
- 클라이언트·프리랜서 전화번호 입력과 클라이언트 조회 표시에 자동 하이픈 적용
- 클라이언트 사이드바의 등급 및 혜택 제거(프리랜서 사이드바에는 기존부터 없음)

---

## 현재 작업 (2026-08-14 — 회원 탈퇴 완료 모달·비로그인 전환 수정)

- 클라이언트·프리랜서 공통 탈퇴 성공 시 현재 사용자 캐시를 즉시 초기화
- 완료 모달을 표시하고 확인 버튼을 누를 때 `window.location.replace("/")`로 비로그인 메인 이동
- `AC_008`도 동일 처리하며 진행 중이던 사용자 조회가 캐시를 복원하지 못하도록 방지
- 탈퇴 관련 Jest 2 suites/12 tests, TypeScript, ESLint, `git diff --check` 통과

---

## 현재 작업 (2026-08-14 — 리뷰 작성·작성 대기 API 연동)

- 클라이언트·프리랜서 공용 리뷰 작성 요청을 `contractId + counterpart + site` 구조로 구현
- 두 별점 필수, 텍스트 선택·500자, 제출 전 수정/삭제 불가 확인 적용
- 클라이언트 결제 완료 화면에 완료 계약별 리뷰 작성 링크 추가
- 프리랜서 마이페이지에 `/reviews/pending` 목록이 있을 때만 작성 가능 섹션 표시
- 프리랜서 완료 계약의 무동작 리뷰 버튼을 실제 리뷰 경로에 연결
- TypeScript, ESLint, `git diff --check` 통과
- 실제 로그인·결제 완료 계약 기반 제출은 미검증

---

## 현재 작업 (2026-08-14 — 클라이언트 마이페이지 통합 API 연동)

- 사이드바를 기본 정보/리뷰 관리/결제수단/결제 내역/등급 및 혜택/회원 탈퇴 6개로 정리
- 기본 정보와 기업 정보를 `/clients/me` 기반 단일 조회·편집 화면으로 통합
- 수정 불가 필드 비활성화, `PROFILE_UPDATE` 이메일 인증, 기업 로고 업로드 및 단일 PATCH 저장 구현
- 클라이언트 등급 현황·기준표와 받은 리뷰·작성한 리뷰 실제 API 연동
- TypeScript, ESLint, production build, 클라이언트 마이페이지 Jest 2 suites/8 tests 통과
- 실제 로그인 세션 기반 API·화면은 미검증

---

## 현재 작업 (2026-08-14 — 프로젝트 등록 규칙 기반 사전 점검 1단계)

- 작업명: 프로젝트 등록 전 브라우저 규칙 기반 콘텐츠 사전 점검
- 관련 Issue: #159 추정 — 브랜치명 기준, Issue 본문 미확인
- 관련 브랜치: `feature/client-ondevice-project-precheck#159`
- 진행 상황: 개인정보 후보, 필수값·권장 길이, 명백한 문장 반복, 상세 범위 구체화 단서 점검 구현 완료
- 제약: 기존 프로젝트 등록 API·서버 사전 검수 계약·등록 완료 흐름 및 백엔드 변경 없음
- 검증: 전체 Jest 31 suites/140 tests, 전체 ESLint(기존 warning 1건), TypeScript, `git diff --check` 통과
- 실패 검증: 프로덕션 빌드 — 코드 오류가 아니라 실행 환경에서 Google Fonts 연결 실패
- 실제 브라우저: 로그인 등록 문맥에서 미검증
- 온디바이스 모델: 1단계 범위에서 사용하지 않음. 별도 2단계 spike로 분리

---

 ## 현재 작업 (2026-08-14 — 프리랜서 등급·이력서 최신 가이드 반영)

- `GET /grades/me`와 `GET /grades?role=FREELANCER`를 마이페이지 등급 카드에 연결하고 프리랜서 등급을 주니어/시니어/마스터 기준으로 표시
- 목표 별점·완료 건수는 기준표 `promotionCondition`, 승급·산정일 안내는 `nextGradeGuide`·`checkedGuide` 서버 문구 사용
- `completedProjectCount=0`, `ratingAverage=null`을 정상 데이터로 처리
- 이력서 저장 시 `condition`을 `PUT /freelancers/me/resume`에 포함해 한 번에 저장하고 별도 조건 PUT 제거
- 조회 응답의 `condition`/`resume` 타입을 분리하고 서버 `notice`를 상단 파란 안내 박스에 표시
- 실제 로그인 세션 기반 화면/API 확인 필요

---

## 현재 작업 (2026-08-13 — 프리랜서 프로젝트 제안 3화면 가이드 대조·버그 수정)

- 작업명: `frontend-matching-negotiation-guide.md` 기준 프리랜서 제안 목록·상세·협상방 3화면 대조 점검 및 발견된 프론트 버그 수정
- 관련 브랜치: `fix/freelancer-project-proposal#166`
- 발견 경위: 사용자가 "상세보기를 눌러도 아무것도 안 나온다"고 제보 → 실제로는 `GET /matchings/requests/{requestId}`가 404 `AC_002`("프로필 정보를 찾을 수 없습니다")를 반환하는 **백엔드 이슈**로 확인(프론트 라우팅·ID 매핑은 정상). 매칭 담당에게 전달할 보고 문구를 작성해 사용자에게 전달함(코드 수정 없음).
- 이어서 목록·협상방 화면도 가이드 문서와 전수 대조하여 프론트 자체 버그를 찾아 수정:
  - **[FreelancerProjects.tsx](../src/features/freelancer/myprojects/components/FreelancerProjects.tsx), [FreelancerProjectDetail.tsx](../src/features/freelancer/myprojects/components/FreelancerProjectDetail.tsx)**: 수락 응답이 조건 즉시 타결로 `NEGOTIATING`이 아니라 바로 `CONTRACT_PENDING`으로 오는 경우 협상방으로 이동하지 않던 버그 수정(`status` 체크 대신 `negotiationId` 존재 여부로 판단). 상세 화면의 "협상방 입장" 링크도 `NEGOTIATING`만 체크하던 것을 `CONTRACT_PENDING`/`ACCEPTED`까지 포함하도록 수정.
  - **[FreelancerProjects.tsx](../src/features/freelancer/myprojects/components/FreelancerProjects.tsx)**: "AI 최종 협의 조건" 블록이 아예 채워지지 않던 문제 → `getNegotiation` 지연 조회로 연동(모집 인원은 서버 응답에 없는 필드라 "확인 필요"로 표시, 8장 ③ 참고). 종료됨 탭의 상태 칩이 "거절함"/"응답 기한 마감" 두 값만 지원해 계약 완료 등 다른 종료 상태에 칩이 안 뜨던 문제 수정. 수락/거절 후 전체 재조회 대신 로컬 상태 갱신으로 변경(스크롤 튐 방지). `MT_006`/`MT_007` 에러도 `MT_016`처럼 재조회하도록 통일.
  - **[FreelancerProjects.tsx](../src/features/freelancer/myprojects/components/FreelancerProjects.tsx), [FreelancerProjectDetail.tsx](../src/features/freelancer/myprojects/components/FreelancerProjectDetail.tsx)**: `budgetAmount`(계약 총액)를 "월 X원"으로 잘못 라벨링하던 표시 버그 수정 → "총 X원"으로 변경.
  - **[negotiation.ts (types)](../src/features/negotiation/types/negotiation.ts), [NegotiationResultCard.tsx](../src/features/negotiation/components/NegotiationResultCard.tsx), [NegotiationChatFlow.tsx](../src/features/negotiation/components/NegotiationChatFlow.tsx)**: `endReason` 필드를 타입에 추가하고 결렬 카드에 텍스트로만(이스케이프 보장) 표시하도록 연동. 실제 응답 필드 존재 여부는 미검증.
  - 자체 코드 리뷰(8관점)로 추가 발견·수정: 협상 요약 캐시가 영구 고정돼 탭을 오가도 갱신 안 되던 문제(`load()` 시 캐시 초기화), 수락/거절 응답 대기 중 탭 전환 시 오래된 `activeStatus`를 참조하던 경쟁 상태(`ref`로 전환), 협상 조건 금액 파싱 실패 시 "월 NaN원" 노출 가능성(`Number.isFinite` 가드).
- **협상 대기 헤더 배지(`waiting-count`) 관련**: 최초 감사에서 "가이드가 요구하는데 미구현"으로 오판했으나, `.ai/API.md`에 **"헤더 종 배지 미사용은 확정된 팀 결정"**이라고 이미 기록돼 있는 것을 확인하고 수정하지 않음(의도된 설계). 감사 결과를 곧이곧대로 코드에 반영하기 전에 `.ai/API.md`를 먼저 확인해야 한다는 교훈.
- 검증: 변경 파일 대상 `tsc --noEmit`(통과), ESLint(통과), 전체 Jest(25 suites/122 tests) 통과, `git diff --check` 통과(경고는 기존 파일들의 LF/CRLF 알림뿐, 이번 변경 파일과 무관)
- 실제 브라우저·로그인 세션 검증: 테스트 계정이 없어 미검증(기존과 동일한 한계)
- 참고: 작업 중 같은 저장소를 열어둔 다른 Claude 세션이 파일을 원래 상태로 되돌리는 일이 두 차례 있었음(작업 내용은 이 기록과 stash로 복구). 동시에 같은 저장소를 여러 세션에서 열어두지 않는 것을 권장.
## 현재 작업 (2026-08-14 — 프리랜서 결제내역 API 연동)

- 작업명: 프리랜서 마이페이지 결제내역 summary·PAID 목록 API 연동
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 확정 탭 3개(전체/착수금/성공보수), 진입 시 summary 1회 조회, 탭별 `phase`와 `status=PAID` 목록 조회, 서버 페이지 이동, 로딩·빈 상태·실패 재시도 구현
- 요약: 탭과 무관하게 `successFeeAmount`, `successFeeProjectCount` 고정 표시
- 검증: 클라이언트·프리랜서 결제내역 Jest 2 suites/4 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 API·브라우저: 배포 Swagger에 summary 엔드포인트가 아직 없어 실제 응답 미검증

---

## 현재 작업 (2026-08-14 — 클라이언트 결제내역 API 연동)

- 작업명: 클라이언트 마이페이지 결제내역 summary·PAID 목록 API 연동
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 상단 summary 진입 1회 조회, 전체/착수금/성공보수 탭별 `phase` 및 `status=PAID` 목록 조회, 서버 페이지 이동, 로딩·빈 상태·실패 재시도 구현
- 합계: 목록 `feeAmount`를 더하지 않고 탭별로 `summary.totalAmount`/`depositAmount`/`successFeeAmount` 사용
- 2026-08-14 최종 가이드 대조: summary 프로젝트 수 필드 타입, KST 날짜 절삭, nullable 결제수단·프로젝트명, 서버 오류 메시지 토스트 반영
- 검증: 관련 Jest 1 suite/2 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 API·브라우저: 로그인 테스트 세션 기반 확인 필요

---

## 현재 작업 (2026-08-13 — 헤더·메인 사용자명 깜빡임 수정)

- 작업명: 헤더·메인의 역할 기본값과 실제 사용자명이 번갈아 보이는 현상 수정
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 사용자 조회 로딩 상태를 분리하고 메인 페이지에도 서버 초기 사용자 데이터를 전달했으며, 헤더 프로필 버튼 폭을 140px로 고정해 레이아웃 이동 방지. 파란 히어로 위 로딩 스켈레톤을 투명 자리 확보 방식으로 변경. 인증 가드·헤더·본문의 중복 `/auth/me` 요청을 단일 진행 요청과 5초 캐시로 공유하고, 가드가 확인한 사용자를 헤더·본문의 동기 초기값으로 사용하도록 수정
- 검증: 관련 Jest 7 suites/32 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 참고: ESLint 오류는 없으며 기존 `ProfileMenu` 미사용 prop warning 1건 유지
- 실제 브라우저·API: 로컬 브라우저는 인증 세션이 없어 RoleGuard까지만 확인, 로그인 화면은 미검증

## 현재 작업 (2026-08-13 — 채팅 최종 합의안 카드 스타일 조정)

- 작업명: 채팅 최종 합의안 영역 바깥 여백·둥근 모서리 적용
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 합의안 영역에 좌우·상단 여백과 전체 테두리, 둥근 모서리 적용 완료
- 검증: 관련 Jest 1 suite/8 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 로그인 채팅 데이터가 필요한 화면

---

## 현재 작업 (2026-08-13 — 채팅 화면 최대 너비 축소)

- 작업명: 데스크톱 채팅 전체 컨테이너 가로 너비 조정
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 채팅 컨테이너 최대 너비를 1440px에서 1200px로 축소하고 중앙 정렬 유지
- 검증: 관련 Jest 1 suite/8 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 로그인 채팅 데이터가 필요한 화면

---

## 현재 작업 (2026-08-13 — 챗봇 확인 중 문구 강조 완화)

- 작업명: 잔여 상담 횟수 로딩 문구의 색상·굵기 조정
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: `확인 중` 문구에 보조 색상과 semibold 굵기 적용 완료
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 문구 색상·굵기만 변경

---

## 현재 작업 (2026-08-13 — 챗봇 새로고침 초기 표시·스크롤 수정)

- 작업명: 챗봇 새로고침 시 대화 상단 노출과 잔여 횟수 `-` 표시 개선
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 초기 로딩 중 대화 렌더링을 보류하고 한도를 `확인 중 / 10회`로 표시하며, 기록 로드 직후 최신 메시지로 즉시 스크롤하도록 수정 완료
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 브라우저: 새로고침 직후 `확인 중 / 10회` 표시, `-`와 기본 인사말 미노출 확인. 미인증 환경이라 실제 대화 기록의 최신 위치 복원은 단위 테스트로 확인

---

## 현재 작업 (2026-08-13 — 챗봇 잔여 상담 카드 배경 추가)

- 작업명: `오늘 남은 AI 상담` 카드 기본 상태에 흰색 배경 추가
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 기본 잔여 횟수 카드에 surface 배경과 테두리 색상 적용 완료
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 기본 카드 배경·테두리 스타일만 변경

---

## 현재 작업 (2026-08-13 — 문의 접수 완료 배경 제거)

- 작업명: 문의 접수 완료 안내 바깥 흰색 카드 배경 제거
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 완료 안내를 감싸는 흰 배경·테두리·모서리 스타일 제거 완료
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 배경·테두리 스타일만 제거

---

## 현재 작업 (2026-08-13 — 문의 접수 완료 카드 크기 축소)

- 작업명: `문의가 접수되었습니다` 완료 안내 카드 크기 조정
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 카드 최대 너비·최소 높이·내부 여백과 아이콘·버튼 크기 축소 완료
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — Tailwind 크기 조정만 수행

---

## 현재 작업 (2026-08-13 — 고객지원 돌아가기 UI 통일)

- 작업명: 챗봇·1대1 문의 목록의 고객지원 돌아가기 링크 UI 통일
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 문의 목록 링크의 크기·테두리·배경·간격을 챗봇 링크와 동일하게 적용 완료
- 검증: 관련 Jest 2 suites/15 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 챗봇과 동일한 Tailwind 클래스 적용 여부를 코드로 대조

---

## 현재 작업 (2026-08-13 — 고객지원 카드 버튼 간격 조정)

- 작업명: 고객지원 안내 문구와 하단 버튼 사이 여백 추가
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 두 고객지원 카드의 안내 목록 아래 여백 추가 완료
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 요청 화면 기준으로 Tailwind 여백만 조정

---

## 현재 작업 (2026-08-13 — 고객지원 하위 화면 돌아가기 링크 개선)

- 작업명: 챗봇 돌아가기 링크 위치 조정 및 1:1 문의 돌아가기 경로·문구 개선
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 챗봇 링크를 제목 위로 이동하고 고객지원·1대1 문의 이동 목적지에 맞는 문구와 링크 적용 완료
- 검증: 관련 Jest 4 suites/27 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 브라우저: 챗봇 링크가 제목 위에 배치되고 문의 목록·작성·상세 링크가 각 목적지로 연결되는 것 확인

---

## 현재 작업 (2026-08-13 — 고객지원 챗봇 한도 문구 깜빡임 수정)

- 작업명: 고객지원 페이지 새로고침 시 챗봇 무료 이용 한도 문구가 바뀌는 현상 수정
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 고객지원 안내 카드의 불필요한 이용 한도 API 조회를 제거하고 첫 렌더부터 `하루 최대 10회 무료 이용` 문구를 표시하도록 수정 완료
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 브라우저: `/support` 최초 접근과 새로고침 전후 모두 한도 문구 1개, 로딩 문구 0개 확인

---

## 현재 작업 (2026-08-13 — 프로젝트·계약 후속 수정 4건)

- 작업명: 사전 검수 문구, 프로젝트 첨부 다운로드, 종료 프로젝트 리뷰, 프로젝트·계약 탭 배지 수정
- 기준 문서: `C:/Users/user/Downloads/frontend-followup-guide.md`
- 관련 Issue: 생성 전
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 후속 4건 구현 완료
- 검증: 변경 파일 ESLint, TypeScript, 전체 Jest 25 suites/122 tests, 프로덕션 빌드, `git diff --check` 통과
- 실제 API·브라우저: 로그인 테스트 계정과 신규 API 배포 여부를 확인하지 못해 미검증

---

## 현재 작업 (2026-08-13 — 채팅 단위·컴포넌트 테스트)

- 작업명: 채팅방 목록·상세·메시지·실시간 구독 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 서비스·STOMP 훅·채팅 컴포넌트 테스트 작성 완료
- 검증: 채팅 3 suites/14 tests, 전체 23 suites/110 tests, TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- 실제 API·STOMP·브라우저: Mock 기반 테스트 범위이므로 미검증

---

## 현재 작업 (2026-08-13 — 계약 도메인 구조 정리)

- 작업명: 계약 컴포넌트 공통·프리랜서·클라이언트 3분류 통합
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 흩어진 계약 컴포넌트와 클라이언트 전용 서비스·타입을 `src/features/contract` 아래로 통합 완료
- 검증: 계약 관련 테스트 6 suites, 31 tests 통과; 변경 파일 ESLint 및 `git diff --check` 통과
- TypeScript: 실패 — 기존 프리랜서 마이페이지의 미설치 `lucide-react` import 2건
- 실제 브라우저·API: 경로 이동만 수행하여 미검증

---

## 현재 작업 (2026-08-13 — 1:1 채팅 최종 API 재연동)

- 작업명: 1:1 채팅 목록·상세·메시지·실시간 API 연동
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 최종 매핑 기준 `/chat-rooms` REST, 계약 합의안, STOMP 사용자 판정 연동 완료
- 검증: 채팅 변경 파일 ESLint, `git diff --check` 통과
- TypeScript: 실패 — 기존 프리랜서 마이페이지의 `lucide-react` 모듈 해석 오류 2건
- 실제 API·STOMP·브라우저: 인증 가능한 테스트 계정이 없어 미검증
- 백엔드 최종 회신 반영: 프로필은 PR #199 이후 절대 URL, `ACTIVE | CLOSED`, nullable 상대·프로젝트, 이미지 로드 실패 폴백, STOMP messageId 중복 제거 적용
- `GET /api/v1/chat-rooms` 500 해결 완료: PostgreSQL 쿼리 파라미터 타입 추론 서버 버그 수정·배포 후 200 및 채팅방 9건 확인. 프론트 수정 사항 없음
- 프로필 이미지는 CloudFront 절대 URL로 반환되며 현재 데이터는 대부분 null이라 첫 글자 폴백 유지

---

## 현재 작업 (2026-08-13 — 프리랜서 계약 테스트)

- 작업명: 프리랜서 내 계약 목록·상세 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 브랜치 사용 중
- 진행 상황: 관련 테스트 3 suites, 19 tests 통과
- 전체 테스트: 18 suites, 88 tests 통과
- 검증: 변경 파일 ESLint, `git diff --check` 통과
- TypeScript: 사용자 측 프리랜서 마이페이지 코드의 미설치 `lucide-react` import 2건으로 실패
- 빌드: TypeScript 선행 오류로 미실행
- 실제 계약·PDF·정산 API 및 브라우저: 미검증

---

## 현재 작업 (2026-08-13 — FAQ 챗봇 테스트)

- 작업명: 고객지원 FAQ 챗봇 단위·컴포넌트 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 브랜치 사용 중
- 진행 상황: 챗봇 관련 테스트 2 suites, 12 tests 통과
- 검증: 변경 파일 ESLint, `git diff --check` 통과
- 전체 테스트: 15 suites, 69 tests 전체 통과 — `FreelancerProfile` 테스트를 현재 인라인 버튼 UI에 맞게 갱신
- TypeScript: 실패 — 사용자 측 프리랜서 마이페이지 코드의 미설치 `lucide-react` import 2건
- 전체 ESLint: 오류 0건, 기존 warning 2건
- 빌드: TypeScript 선행 오류로 미실행
- 실제 API·브라우저: 미검증

---

## 현재 작업 (2026-08-13)

- 작업명: 알림 센터 실제 API/STOMP 연동
- 기준 문서: `frontend-notification-integration.md` (카카오톡 전달본), 회원 탈퇴는 `frontend-withdrawal-integration.md` 대조만 수행
- 작업 목적: 알림 목록·안읽음 개수·읽음·삭제 REST와 `/topic/users/{accountId}/notifications` STOMP 실시간 수신을 헤더 배지·알림함 화면에 연동합니다. 기존 디자인은 유지합니다.

## 완료 범위

- 회원 탈퇴: 신규 가이드 대조 결과 기존 구현(2026-08-13 회원 탈퇴 프론트 연동)이 이미 blockers 포맷·에러코드(`AC_008`~`AC_011`, `GLOBAL_002`)를 그대로 만족해 추가 변경 없음
- 알림: 목데이터를 실제 REST(`/api/v1/notifications`, `unread-count`, `read`, `read-all`, 삭제/전체삭제)로 교체
- 알림: 매칭 전용 STOMP 구독과 별개로 전체 타입을 수신하는 일반 알림 STOMP 구독 추가, 헤더 종 배지에 실제 안읽음 수 연결
- `CONTRACT_CREATED`/`CONTRACT_SIGNED`의 `linkUrl`(`/contracts/{contractId}`)이 실제 라우트에 없어, 매칭 알림 리다이렉트와 동일한 패턴으로 역할별 상세로 보내는 리다이렉트 페이지 추가

## 미검증·확인 필요

- 가이드 문서에 `NEGOTIATION_STARTED`/`NEGOTIATION_PROPOSED`/`NEGOTIATION_FAILED`, `SETTLEMENT_DUE`의 실제 `linkUrl` 형식이 명시돼 있지 않아 서버가 내려주는 값을 그대로 이동시킵니다. 실제 협상방·정산 경로와 다를 수 있어 확인이 필요합니다.
- 실제 로그인 세션·STOMP 연결로 알림 수신, 배지 증가, 재연결 시 목록 재조회는 테스트 계정이 없어 확인하지 못했습니다.
- 회원 탈퇴 안내 문구(`blockers[].linkUrl`)가 가리키는 `/negotiations`, `/my-projects`, `/mypage/settlements`, `/contracts` 같은 공용 경로는 앱에 아직 없습니다(기존 구현부터 있던 차이이며 이번 작업 범위 밖).
