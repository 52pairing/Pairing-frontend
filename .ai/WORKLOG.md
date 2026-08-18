# WORKLOG

## 2026-08-17 — 클라이언트 리뷰 작성 진입 경로 및 결제 대기 안내 수정

- 클라이언트 마이페이지 리뷰 관리에서 `GET /reviews/pending`과 완료 계약 목록을 병렬 조회하고 `contractId → projectId`를 매핑해 작성 가능한 리뷰 링크를 추가했습니다. 매핑에 실패한 항목은 조용히 숨기지 않고 비활성 안내로 표시합니다.
- `COMPLETED` 상태의 클라이언트 계약 카드에 리뷰 작성 버튼을 추가하고 기존 상세보기 버튼과 한 액션 영역으로 묶었습니다. 링크에는 리뷰 폼 제출에 필요한 `contractId` 쿼리를 포함합니다.
- 성공보수 결제 완료 화면에서 완료 계약이 없고 `COMPLETION_PENDING` 계약이 있으면 프리랜서의 성공보수 결제를 기다려야 한다는 안내를 표시합니다. 리뷰 섹션은 기존대로 완료 계약이 있을 때만 노출합니다.
- API·타입 변경은 없으며 기존 리뷰·계약 API를 사용했습니다.
- 검증: 변경 파일 ESLint, 전체 TypeScript, 프로덕션 빌드, `git diff --check` 통과. 최초 빌드는 샌드박스의 Google Fonts 네트워크 차단으로 실패했으나 네트워크 허용 후 재실행해 통과했습니다.
- 실제 로그인 세션 기반 API·브라우저 확인: 테스트 계정이 없어 미검증.


## 2026-08-17 — 이력서 화면 렌더링·최적화 진단 후속 조치 (auth/freelancer/matching 대상)

- 배경: 커밋 작성자 기준(`git log --format='%an'`)으로 담당 영역을 확인한 결과 `auth`·`freelancer`·`matching`이 본인(als-wl) 담당으로 확인되어, 이 세 영역만 대상으로 진단 에이전트를 돌려 우선순위 목록을 뽑았습니다. `negotiation`·`contract`·`chat`·`support`·`payment`·`client/projects`·`client/myprojects`는 팀원(jia40) 담당으로 확인되어 제외했습니다(이미 만졌던 negotiation 재렌더 수정 1건은 되돌림).
- **정적 메타 API 캐싱 누락 수정**: `freelancerResume.ts`의 `getFreelancerJobCategories`/`getFreelancerJobRoles`/`getFreelancerSkills`/`getFreelancerWorkConditions`가 `client/projects/services/projectPreReview.ts`(팀원 파일)와 동일한 엔드포인트를 호출하면서도 캐싱이 안 돼 있어, 이력서 화면 재진입마다 반복 요청되던 것을 확인했습니다. 같은 `cacheOnce` 패턴을 이 파일에도 복제 적용(팀원 파일 import 대신 자체 구현 유지).
  - 검증: 신규 `unit-tests/freelancer/mypage/freelancerResumeCache.test.ts` 2개(캐시 1회 호출 증명, 실패 시 캐시 초기화 증명) 통과. `tsc`·ESLint·`npm run build` 통과.
- **`FreelancerResumeRegistration.tsx` 구조 리팩터링(동작 변경 없음)**: 2503줄짜리 파일에서 메인 컴포넌트 함수가 약 1500줄로 렌더링·비즈니스 로직·매핑이 혼재돼 있던 것을 4개 파일로 분리했습니다.
  - 신규 `utils/resumeFormData.ts`(421줄): `ResumeDraft`/`EducationForm`/`ConditionForm` 등 타입, `mapApiToDraft`/`buildConditionPayload`/`buildResumePayload` 등 순수 매핑·검증 함수. 컴포넌트 내부 클로저였던 `buildPayload()`는 `buildResumePayload(draft, conditionForm, effectiveEmail)` 순수 함수로 전환.
  - 신규 `ResumeFormControls.tsx`(252줄): `Field`/`CompactField`/`ConditionChoice`/`YearMonthSelect` 등 재사용 폼 부품.
  - 신규 `ResumeReviewScreen.tsx`(356줄): `ReviewScreen`/`CompleteScreen`(조회·완료 화면).
  - `FreelancerResumeRegistration.tsx`: 2503 → 1541줄. 로직은 그대로 옮기기만 하고 변경하지 않음.
  - 검증: `tsc --noEmit` 통과, ESLint 새 경고/에러 0건(기존부터 있던 무관 경고 1건만 유지), `npm run build` 통과, 관련 Jest 8 suites/44 tests 중 39 통과·5 실패는 전부 무관한 `FreelancerProfile.test.tsx`(기존 baseline 실패, 이 변경과 무관 — 다수 기존 WORKLOG 항목에 이미 기록됨).
- 부수 발견(미수정, 범위 밖): `skillSearch`/`setSkillSearch` 상태가 현재 어디서도 호출되지 않음 — 이전 세션에 스킬 선택 UI를 버튼 목록에서 드롭다운으로 바꾸며 검색창을 제거했는데 상태만 남은 것으로 추정. 리팩터링 범위 밖이라 그대로 둠.
- 실제 로그인 세션 기반 브라우저 확인: 미실행(테스트 계정 없음).

## 2026-08-16 — 결제 모듈 목업 데이터 제거 및 레거시 화면 정리 (#218)

- `PaymentMethodModal`이 정산(`settlementId`) 기반 결제(착수금·성공보수)에서는 실제 등록 카드를 보여주면서도, `settlementId`가 없는 호출(유료 재추천)에서는 하드코딩된 가짜 카드("신한카드 1234-\***\*-\*\***-5678")를 보여주던 것을 확인해, 두 경로 모두 `getMyPaymentMethods()`로 실제 등록된 카드를 조회하도록 통일했습니다. 카드가 없으면 결제 버튼을 비활성화합니다.
- `settlementId`가 없는 경로(유료 재추천)는 실제 PG 연동이 아닌 시뮬레이션이라, 선택한 카드를 서버로 전달하는 필드는 필요 없다고 확인했습니다(사용자 확인).
- 참조가 끊긴 레거시 성공보수 결제 화면(`/client/projects/{projectId}/success-fee` 및 전용 컴포넌트 `SuccessFeePayment`/`SuccessFeePaymentModal`/`PaymentMethodCard`, 목업 데이터 `mockPaymentMethods.ts`)을 grep으로 다른 참조 없음을 확인한 뒤 삭제했습니다. 실제 성공보수 결제는 `ClientProjectDetail` 내 실 연동 모달로 이미 대체되어 있었습니다.
- 연쇄적으로 안 쓰이게 된 타입 `PaymentMethod`, `SuccessFeePaymentSummary`도 정리했습니다.
- 검증: 변경 파일 TypeScript, ESLint, `npm run build` 통과(삭제된 라우트 타입 재생성 확인). 기존 결제 플로우 관련 Jest 3 suites/15 tests 통과(회귀 없음).
- 실제 화면: 로그인 세션에서 실제 등록 카드가 뜨는지는 브라우저로 직접 확인하지 못했습니다.

## 2026-08-16 — 마이페이지·매칭 화면 다건 버그 수정 (#216)

- 추천 후보 로딩 화면에 스피너가 없던 것을 다른 로딩 화면과 통일했습니다.
- 로그인 세션 만료 시 안내 모달 없이 곧장 로그인 화면으로 이동하던 문제를 수정했습니다. `AuthSessionGuard`의 인증 확인 실패 처리가 "다른 기기 로그인"만 모달로 분기하고 세션 만료는 무조건 즉시 리다이렉트하고 있어, 세션 만료 모달(`SessionExpiredModal`)이 뜰 기회가 없었습니다. `GLOBAL_010`도 모달로 분기하도록 수정하고, 모달 확인 시 이동 경로에 `returnUrl`을 유지했습니다.
- 로그아웃 이동 경로를 `/login`에서 `/`(비로그인 메인)로 변경했습니다.
- 클라이언트 메인페이지의 "프로젝트 등록하기"/"내 프로젝트 보기" 버튼이 `onClick`/`href` 없이 장식만 있던 것을 확인해 각각 `/client/projects/new`, `/client/projects`로 연결했습니다.
- 추천 후보 "프로필" 클릭 시 항상 404가 나던 원인을 확인했습니다. 실제 후보 상세 화면이 API 연동 없이 하드코딩된 더미 후보 3명(`constants/recommendedCandidates.ts`)에서만 조회하고 있었습니다. `GET /api/v1/matchings/candidates/{candidateId}/profile`(Swagger로 확인된 실제 엔드포인트)로 재연동하고, 더미 데이터 파일을 삭제했습니다.
  - Swagger 예시의 배열 필드명(`condition.ConditionSkillResponse`, `resume.ResumeEducationResponse`/`ResumeCareerResponse`/`ResumeCertificateResponse`)이 실제 응답과 달라(실제는 `condition.skills`, `resume.educations`/`careers`/`certificates` 카멜케이스) 한 차례 "보유기술이 안 나온다"는 버그로 재발했고, 실제 로그인 세션 응답으로 확인 후 필드명을 고쳤습니다.
  - 연락처(전화번호·이메일·주소·생년월일)는 응답에 포함되지만 매칭 요청 전 단계 화면이라 화면에는 표시하지 않았습니다(기존 "연락처 정보는 매칭 및 계약이 완료된 후 확인할 수 있습니다" 문구와 일관).
- 프리랜서 이력서의 "최저 수용 금액"에 "만원 단위" 안내가 빠져 있어 희망 급여와 동일하게 추가했습니다.
- (백엔드 요청) 보유 스킬 검색 결과를 동그란 버튼 목록에서 `<select>` 드롭다운으로 변경했습니다. 이 과정에서 구 버튼 목록 시절 남아있던 12개 노출 제한(`slice`)이 드롭다운에도 그대로 적용되어 있던 것을 발견해 제거했습니다.
- (백엔드 요청) 이력서 외부 링크를 GitHub/Notion 고정 분야(각 1개)에서 분야 구분 없는 자유 URL 다건 입력으로 변경했습니다.
- 클라이언트 메인 등급 배지가 실제 등급과 무관하게 "골드 등급"으로 하드코딩돼 있던 것을 확인해, 마이페이지와 동일하게 `getClientMyGrade()` 실 조회로 교체했습니다. 조회 전/실패 시에는 배지를 숨깁니다(프리랜서 메인의 동일 패턴은 이미 다른 작업에서 고쳐져 있었음을 확인).
- 검증: 변경 파일 TypeScript, ESLint, `npm run build` 통과. 관련 Jest 일부 재실행(회귀 없음).
- 실제 화면: 대부분 로그인 세션이 필요해 브라우저로 직접 확인하지 못했습니다.
- 백엔드 확인 요청 3건(별도 전달 필요):
  1. 회원 탈퇴 `GET /accounts/me/withdrawal-eligibility` 응답의 `blockers[].linkUrl`이 실제 존재하는 라우트가 아님(`/negotiations` 등 ID 없는 경로) — 클릭 시 404
  2. 매칭 후보 프로필 API Swagger 예시의 배열 필드명 오류(문서만 수정 필요, 위 항목 참고)
  3. 매칭 후보 프로필 응답의 연락처 정보 노출이 의도된 정책인지 확인 필요

## 2026-08-16 — ECS 프로덕션 런타임 의존성 오류 수정 (#212)

- `next start`가 런타임에 로드하는 `next.config.ts`의 정적 import를 보장하기 위해 `@next/bundle-analyzer`를 `devDependencies`에서 `dependencies`로 이동
- `npm install --package-lock-only`로 루트 및 전이 의존성의 프로덕션 플래그 갱신
- 검증: `npm ls --omit=dev @next/bundle-analyzer`에서 16.3.1 확인, `npm run build`, `git diff --check` 통과
- 미실행: 로컬 Docker 엔진 미기동으로 프로덕션 이미지·컨테이너·HTTP 200 검증 불가
- 미검증: ECS 재배포 및 ALB 헬스체크
- 참고: npm audit high severity 1건은 이번 변경 범위 밖이라 자동 수정하지 않음

---

## 2026-08-15 — 매칭 요청 상세 프로젝트 정보 7종 연동

- 매칭 요청 상세(`GET /matchings/requests/{requestId}`)에 새로 추가된 진행 상황·시작일 협의 가능 여부·예상 기간(숫자+단위)·전체 모집 인원·세부 업무 범위·우대사항·근무 장소 7종을 프리랜서·클라이언트 양쪽 상세 화면에 표시했습니다.
- 목록 조회에서는 이 7종이 기존 `mainTask`와 같은 방식으로 항상 `null`이라, 타입에도 같은 방식(`string | null` 등)으로 반영했습니다.
- 세부 업무 범위·우대사항·근무 장소는 프로젝트 등록 시 선택 입력이라 값이 없을 수 있어 값이 있을 때만 표시하고, 근무 장소는 재택 근무일 때는 표시하지 않도록 기존 클라이언트 프로젝트 상세 화면과 동일한 규칙을 적용했습니다.
- 프리랜서 상세 화면의 수락/거절 응답은 목록과 같은 모양이라 상세 전용 값이 `null`로 돌아오는데, 기존에는 `mainTask`만 이전 값으로 보존하던 것을 7종 전체로 확장(`withPreservedDetailFields`)했습니다.
- 후보 카드 단가가 이제 추천 시점 값으로 고정된다는 백엔드 공지를 확인했습니다 — 프론트는 API 응답을 그대로 표시하므로 코드 변경은 없었습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 관련 Jest 2 suites/11 tests 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 최초 작성 화면의 서버 notice 중복 노출 수정

- 서버가 내려주는 `notice`("수정한 이력서는 새로운 추천부터 반영됩니다...")는 이미 이력서가 있고 수정하는 상황을 전제로 한 문구인데, 이력서가 아예 없는 최초 작성 화면에서도 항상 함께 떠서 "처음 작성" 안내 문구와 모순돼 보였습니다.
- 이력서가 있을 때(수정 화면)만 서버 notice를 표시하고, 없을 때(최초 작성)는 "처음 작성" 안내 문구만 보이도록 고쳤습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 고아 파일 삭제, 이력서 화면 문구 분기

- 어디서도 연결되지 않던 옛 1단계 등록 마법사 파일(`FreelancerProfileRegistration.tsx`)을 삭제했습니다. 희망 조건 입력 화면은 지금처럼 이력서 화면 하나로 통합 유지하기로 결정된 데 따른 정리입니다.
- 이력서 화면 제목·설명을 상태별로 다르게 표시하도록 고쳤습니다: 최초 등록("이력서 등록"), 기존 이력서 수정("내 이력서 수정"), 조회("내 이력서", 기존 유지).
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 문구 전환은 확인하지 못했습니다.

---

## 2026-08-15 — 메인페이지 CTA 문구 이력서 유무로 분기

- 메인페이지 CTA 버튼 문구를 이력서 완료 여부에 따라 "프로필 등록하기"(없을 때) ↔ "내 이력서 보기"(있을 때)로 나눴습니다. 링크 주소는 두 경우 모두 `/freelancer/mypage/resume`로 동일합니다.
- `GET /api/v1/freelancers/me`의 `resumeCompleted` 필드를 사용했습니다. 이 필드는 타입에는 있었지만 실제 화면 어디에서도 쓰이지 않고 있었습니다.
- 같은 화면의 "시니어 등급" 배지가 실제 API 없이 하드코딩돼 있어 신규 가입자에게도 항상 보이는 문제를 발견해 사용자에게 보고했습니다(수정은 아직 미확정).
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 메인페이지 "프로필 등록하기" → 이력서 화면 직결

- 메인페이지 "프로필 등록하기" 버튼을 `/freelancer/mypage/resume`로 연결했습니다(사용자 확인 후 결정). 그 화면은 이미 "이력서가 없으면 작성 폼, 있으면 조회 화면"을 정확히 분기하고 있어서 새 로직 없이 그대로 재사용했습니다.
- 검증: 변경 파일 ESLint, TypeScript 통과. 로그인이 필요해 실제 분기 동작은 확인하지 못했습니다.

---

## 2026-08-15 — 메인페이지 "프로필 등록하기" 링크 원복

- 앞선 작업에서 메인페이지 "프로필 등록하기" 버튼을 `/freelancer/mypage/resume`로 바꾸며 "예전엔 등록 화면으로 연결됐었는데 끊겼다"고 적었는데, 이는 검증 없는 추측이었습니다. `git log`로 최초 커밋부터 확인한 결과 이 버튼은 처음부터 계속 `/freelancer/mypage/profile`이었고 바뀐 적이 없었습니다. 원래 값으로 되돌렸습니다.
- 검증: 변경 파일 ESLint 통과.

---

## 2026-08-15 — 비밀번호 변경 완료 화면 스타일 정리

- 비밀번호 변경 완료 화면에서 위쪽에 그어지던 구분선(`border-t`)을 제거했습니다.
- 단계 표시기(Stepper)에서 완료된 단계 원을 초록(emerald)에서 남색(`#17365d`)으로, 진행 중인 단계는 기존 브랜드 파란색을 그대로 유지했습니다.
- 완료 화면의 큰 체크 아이콘을 텍스트 글리프(✓)에서 얇은 선의 SVG 체크 아이콘으로 바꾸고 브랜드 파란색으로 통일했습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 보기(읽기 전용) 화면 학력·경력·자기소개 레이아웃 정리

- 이전에 수정 폼에만 적용했던 "학력/경력 필드 한 줄 정렬, 자기소개 꽉 차게" 요청이 보기(읽기 전용) 화면에는 반영되지 않았던 점을 확인했습니다. 보기 화면은 폼과 다른 `ReviewCard` 컴포넌트를 쓰고 있었습니다.
- `ReviewCard`에 `columns`(2|3)와, 주소·담당업무·자기소개처럼 한 줄을 다 차지해야 하는 값을 위한 `fullRows`를 추가했습니다.
- 기본 정보: 성명·생년월일·연락처·이메일 4칸을 2×2로, 주소는 아래 한 줄 전체로 분리했습니다(기존엔 5개 항목이 2열에 걸쳐 2,2,1로 어중간하게 밀려 있었습니다).
- 학력사항: 학교명·학과·학력상태 3개를 한 줄(`columns=3`)로 정렬했습니다(기존엔 2,1로 밀려 있었습니다).
- 경력사항: 회사·부서·직급·재직상태를 한 줄(`columns=3`)로, 담당 업무는 그 아래 한 줄 전체로 분리했습니다.
- 자기소개: 단독 항목을 절반 폭이 아니라 카드 전체 폭을 채우도록 고쳤습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 생년월일·정렬·스킬 칩·에러 스크롤 수정

- 생년월일이 "회원정보에서 가져온 값"이라는 설명 문구를 그대로 값처럼 보여주고 있던 버그를 고쳐, 계정 조회(`GET /freelancers/me`)의 실제 `birthDate` 값을 표시하도록 했습니다(수정 불가·회색 처리는 그대로 유지 — 계정 정보 기준이라는 백엔드 확정 사항과 일치).
- "프로젝트 시작 가능일"/"희망 기간·기간 단위" 두 컬럼의 입력 줄이 안내 문구 유무 때문에 서로 다른 높이에서 시작되던 문제를 고쳐, 두 입력이 같은 줄에서 나란히 시작하도록 정렬했습니다.
- 보유 스킬을 선택했을 때의 칩을 타원(pill)에서, 예전 프로필 등록 화면과 같은 사각형(rounded-md) 목록 행 형태로 되돌렸습니다(스킬 검색·선택 버튼 자체는 타원 유지, 선택된 항목 표시만 사각형으로).
- 근무 방식·근무 형태·프리랜서 경험 여부·스킬 숙련도 등 일부 필수 항목은 비어 있어도 화면에 안내 문구가 뜨지 않아 "저장" 시 어디가 문제인지 이동하지 못하던 문제를 고쳐, 모든 필수 항목에 안내 문구(스크롤 이동 대상)를 추가했습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면·스크롤 동작은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 학력·경력·자기소개 레이아웃 정리

- 학력사항 4개 필드(학교명·학과·학력상태·캠퍼스)를 화면 폭과 무관하게 항상 한 줄로 나란히 배치했습니다(이전엔 좁은 화면에서 세로로 쌓였습니다).
- 경력사항의 회사/부서/직급 한 줄에 재직 중 체크박스를 같은 줄로 옮겨 4칸 한 줄로 정리하고, 담당 업무는 그 아래 한 줄(textarea)로 유지했습니다.
- 간단 자기소개 textarea 높이를 늘려 더 꽉 차 보이도록 조정했습니다(h-36 → h-56).
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 레이아웃은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 사진·포트폴리오 URL 응답 반영

- 백엔드 확인 결과 이력서 조회 API가 실제로는 사진·포트폴리오 URL(`profileImageUrl`, `portfolioUrl`)을 이미 내려주고 있었습니다. 저장(PUT)은 숫자 파일 ID, 조회(GET)는 URL 문자열로 필드명이 다른 비대칭 계약이라 앞서 놓쳤던 부분입니다.
- 지난번 임시로 썼던 "계정 프로필 사진 재사용" 방식을 제거하고, 이력서 자체의 사진 URL을 표시하도록 고쳤습니다. 계정 프로필 사진과 이력서용 사진은 서로 다른 값이라는 점도 함께 확인했습니다.
- 포트폴리오가 이미 등록된 경우 파일명을 실제 파일로 연결되는 링크로 바꿨습니다.
- 저장 요청은 새로 업로드한 파일이 있을 때만 파일 ID를 보내고, 그렇지 않으면 생략하도록 했습니다(기존 값 유지를 서버에 맡김 — 미검증).
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 화면 희망 조건 통합·라벨/디자인 복원

- 이력서 화면에 "희망 조건" 섹션(직군·직무·근무방식·근무형태·희망급여·최저수용금액·시작가능일·희망기간·프리랜서경험·경력·보유스킬)을 새로 추가했습니다. `.ai/API.md`에 이미 문서화된 "조건+이력서 통합 저장(PUT /freelancers/me/resume)" 설계에 맞춰, 예전에 별도 페이지였다가 라우트가 끊겨 있던 조건 입력 화면을 이력서 화면 안으로 합쳤습니다.
- 보유 스킬 선택·표시를 타원(pill) 배지 스타일로, 조회 화면의 직군/직무/근무방식 등도 코드가 아니라 실제 라벨로 보이도록 고쳤습니다.
- 연락처·이메일 라벨을 단순한 형태("연락처"/"이메일")로 되돌리고, 저장된 전화번호가 조회·수정 화면 모두 하이픈 포함 형식으로 보이도록 고쳤습니다(이전엔 서버 원본 숫자가 그대로 보이던 버그였습니다).
- ~~메인페이지의 "프로필 등록하기" 버튼을 다시 이력서 화면(`/freelancer/mypage/resume`)으로 연결했습니다. 예전엔 이 버튼이 별도 등록 화면으로 이어졌는데, 어느 시점에 기본 정보 조회 화면으로 바뀌면서 실질적인 등록 진입점이 사라져 있었습니다.~~ → **정정(2026-08-15 상단 항목 참고)**: 검증 없는 추측이었고, 실제로는 처음부터 `/freelancer/mypage/profile`이었습니다. 원래 값으로 되돌렸습니다.
- 이력서 프로필 사진은 API 응답에 URL이 없어 계정 프로필 사진을 임시로 재사용했습니다. 실제로 같은 사진인지는 확인이 필요합니다.
- 검증: 변경 파일 TypeScript, ESLint 통과. 로그인이 필요해 실제 화면은 확인하지 못했습니다.

---

## 2026-08-15 — 이력서 수정 이메일 인증 제거·최초 작성 안내 문구

- 이력서 조회 화면의 "수정하기" 버튼을 눌렀을 때 뜨던 이메일 인증 모달을 제거하고, 바로 편집 폼으로 전환하도록 되돌렸습니다. 이력서 연락처는 계정 인증이 필요한 정보가 아니라는 점을 사용자가 재확인했습니다.
- 저장된 이력서가 없어 처음부터 작성 폼이 보이는 계정에는 "아직 등록된 이력서가 없어 처음 작성하는 화면입니다..." 안내 문구를 폼 상단에 추가했습니다. 기존 이력서를 수정하러 온 경우에는 뜨지 않습니다.
- 검증: 변경 파일 TypeScript, ESLint 통과.
- 실제 화면: 로그인이 필요해 브라우저로 직접 확인하지 못했습니다. 사용자 확인 필요.

---

## 2026-08-15 — 프리랜서 프로필 별점·이력서 연락처 라벨 정리

- 프리랜서 프로필 화면 이름 옆에 별점·리뷰 건수(`★ 4.8 · 리뷰 17건` 형태)를 클라이언트 화면과 동일하게 표시했습니다. API 응답(`ratingAverage`, `reviewCount`)과 타입·매핑은 이미 있었고 화면만 그리지 않고 있었습니다.
- 이력서 수정/조회 화면의 전화번호·이메일 라벨을 "연락처(이력서용)"·"연락 이메일"로 바꾸고, 이 값이 계정 로그인 정보가 아니라 이력서 전용 값(비우면 계정 값을 대신 사용)이라는 안내 문구를 기본 정보 카드에 추가했습니다. 인증 우회가 아니라 계정 연락처와 이력서 연락처가 애초에 분리된 값이라는 점을 화면에서 설명하기 위한 문구 변경입니다.
- 백엔드 API 변경 없음.
- 검증: 변경 파일 TypeScript, ESLint 통과. 관련 `FreelancerProfile.test.tsx`는 이번 변경 이전부터 App Router 목 누락으로 실패하던 5건과 동일하게 실패(회귀 아님, 기존 한계).
- 실제 화면: 로그인이 비밀번호 입력을 요구해 브라우저로 직접 확인하지 못했습니다. 사용자 확인 필요.

---

## 2026-08-15 — 마이페이지 기존 디자인 복원

- API 연동 과정에서 달라진 클라이언트 기본 정보의 간격, 타이포그래피, 프로필 상세 배치와 등급 진행 카드 디자인을 기존 형태로 복원했습니다.
- 기본 정보 수정 상태도 기존처럼 상단 취소·저장 버튼과 44px 입력 필드, 2열 폼 배치를 사용하도록 복원했습니다.
- 프리랜서 프로필 사진을 일반 파일 입력칸 대신 수정 화면 상단 원형 이미지에서 등록·변경하도록 복원하고, 조회 화면에도 저장된 이미지를 표시했습니다.
- 저장된 이력서는 조회 화면으로 먼저 진입하고, 수정하기 버튼을 누르면 이메일 인증 모달을 통과한 뒤에만 편집할 수 있도록 변경했습니다.
- API 통합 과정에서 조회 화면에서 빠졌던 희망 조건과 보유 스킬 카드를 실제 condition 응답값으로 다시 표시했습니다.
- 클라이언트·프리랜서의 받은 리뷰 목록을 기존 작성자·프로젝트·본문·별점·작성일 배치로 되돌렸습니다.
- API 데이터 연동, 이메일 인증, 사용자가 확정한 작성 리뷰 카드 구성은 유지했습니다.
- 검증: 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 화면: 로컬 브라우저에 로그인 세션이 없어 로그인 화면 이동까지만 확인했으며 마이페이지 렌더링은 미검증입니다.

---

## 2026-08-15 — 프로필 이미지 CDN 호스트 등록

- `next.config.ts`의 기존 bundle analyzer 설정을 유지하면서 `cdn.52pairing.kro.kr` HTTPS 호스트를 `images.remotePatterns`에 추가했습니다.
- 백엔드가 매칭 후보 프로필의 S3 object key를 해당 CDN 절대 URL로 변환해야 실제 이미지가 표시됩니다.
- production build와 `git diff --check`가 통과했습니다.

---

## 2026-08-15 — 로그인 후 화면 전환 경쟁 상태 수정

- 로그인·로그아웃에서 5초 사용자 캐시와 진행 중 `/auth/me` 요청을 초기화해 다른 역할의 이전 사용자가 반환되지 않도록 했습니다.
- 일반·소셜 로그인 모두 역할별 화면으로 먼저 이동하고 STOMP 재연결은 결과에 영향을 주지 않는 백그라운드 작업으로 변경했습니다.
- 공개 인증 경로에서는 세션 가드가 `/auth/me`를 호출하지 않으며, 테마 초기화 Script를 body 첫 자식으로 옮겨 클라이언트 리렌더 경고 원인을 제거했습니다.
- TypeScript, 변경 파일 ESLint, production build, `git diff --check`가 통과했습니다.

---

## 2026-08-15 — 클라이언트 회사명 표시

- `GET /api/v1/auth/me`의 nullable `companyName`을 현재 사용자 타입에 추가했습니다.
- 클라이언트 메인 인사말과 공통 헤더의 클라이언트 분기에서 회사명을 우선 표시하고, 값이 없으면 담당자 이름으로 폴백합니다.
- 마이페이지 프로필은 이미 `/clients/me`의 회사명을 큰 제목·이니셜에 사용하고 담당자 개인 이름을 별도 표시하고 있어 유지했습니다.
- TypeScript, 변경 파일 ESLint, production build, `git diff --check`가 통과했습니다.

---

## 2026-08-15 — 결제수단 전용 이메일 인증 연동

- `PAYMENT_METHOD` purpose를 인증 타입과 공통 인증 모달에 추가했습니다.
- 최종 첨부 계약에 따라 양 역할 결제수단 목록 GET은 인증 없이 유지하고 카드·계좌 수정 버튼에서 인증을 선제적으로 요구합니다.
- 인증 성공 후 선택했던 수정 폼을 열며, 수정 중 마커가 만료되면 입력 폼을 유지한 채 `AU_006` 인증으로 복귀합니다.
- 수수료 결제 모달은 조회 인증 대상이 아니므로 앞서 추가했던 인라인 인증과 분리 조회를 제거하고 기존 결제 흐름을 복원했습니다.
- TypeScript, 변경 파일 ESLint, production build가 통과했습니다. 전체 Jest는 기존 `FreelancerProfile`의 App Router 목 누락 5개만 실패하고 167개가 통과했습니다.

---

## 2026-08-15 — 카드사 select와 결제번호 검증 연동

- 카드사 자유 입력을 `GET /api/v1/meta/card-companies`의 영문 enum code를 보내는 select로 변경했습니다.
- 은행은 별도의 `GET /api/v1/meta/banks` 숫자 기관코드를 사용하도록 가입과 양 역할 결제수단 수정 화면을 통일했습니다.
- 결제수단 응답의 `cardCompany`를 수정 폼 초기값으로 사용하고 표시에는 기존 `cardBrand`·`displayName`을 유지했습니다.
- 카드번호 숫자 16자리와 계좌번호 숫자 10~14자리 검증을 공통 함수로 적용했습니다.
- TypeScript, 변경 파일 ESLint, production build, 관련 테스트 12개가 통과했습니다. 전체 Jest는 기존 `FreelancerProfile`의 App Router 목 누락 5개만 실패하고 167개가 통과했습니다.

---

## 2026-08-15 — 회원가입·마이페이지 주소 객체 계약 연동

- 주소를 문자열 대신 `sido`, `sigungu`, `roadAddress`, `addressDetail`, `zipCode` 5칸 객체로 보내도록 회원가입 3종과 양 역할 프로필 PATCH를 변경했습니다.
- 다음 우편번호 검색 UI를 공통화하고 서버 조회의 한 줄 `address`와 수정용 nullable `addressParts`를 분리했습니다.
- 세종시의 빈 `sigungu`를 유지하는 요청 빌더 테스트를 포함해 신규 테스트 3개가 통과했습니다.
- TypeScript, ESLint, production build는 통과했습니다. 전체 Jest는 기존 `FreelancerProfile` 테스트의 App Router 목 누락으로 5개 실패했고 나머지 155개는 통과했습니다.
- 실제 다음 위젯 응답 필드와 회원가입 201·프로필 수정 200은 로그인 가능한 브라우저에서 미검증입니다.

## 2026-08-16 — 계약 목록 공통화 (항목 C, 동작·화면 보존 리팩터)

- 신규 `useAsyncData<T>` 훅(`features/contract/hooks`): 비동기 로드 공통화 — `requestId` 경쟁 방지 + `cancelled` 이펙트 + `isLoading`/`error` + `reload`. 3개 컨테이너의 중복 로드 idiom 대체
- 신규 `<ListState>`(`components/common`): 로딩/에러/빈 상태 스캐폴드. 화면별 프레임(`frameClassName`)·에러 스타일(`errorVariant`)을 prop으로 받아 **기존 마크업을 그대로 재현**(무손실)
- 신규 `<ContractTabBar<T>>`(`components/common`): 탭바 렌더 로직 단일화(활성색/밑줄/카운트 배지). `ClientContractTabs`·`FreelancerContractStatusTabs`는 데이터+variant만 넘기는 **얇은 어댑터**로 축소(기존 export·타입 그대로 유지 → 호출부 무변경)
- 적용: `ClientContracts`/`ProjectContracts`/`FreelancerContracts` → useAsyncData + ListState. `FreelancerContracts`의 결제 모달·정산 로직은 그대로 보존, 목록 로드/탭건수/스캐폴드만 교체
- 화면/동작 보존: 상태 박스·탭 마크업을 클래스 단위로 동일 재현. 유일한 의도적 변화는 탭 버튼 `aria-pressed`를 양쪽 일관 적용(접근성 개선, 시각·동작 무변경)
- 검증: TypeScript·`eslint src/features/contract` 통과, `npm run build` 성공, 계약 Jest 4 suites/25(FreelancerContracts·ProjectContracts 테스트가 리팩터 컴포넌트 직접 검증)·전체 181/186 통과(무관 실패 5건 baseline 동일)
- 남은 판단(팀): `useAsyncData`를 chat/matching에도 쓰면 `features/common`으로 승격 검토 / 상태박스·탭 레이아웃 통일 여부(현재는 무손실 보존)

## 2026-08-16 — 클라이언트 계약 목록 서버 탭 페이지네이션 전환 (항목 A)

- 백엔드 회신으로 클라이언트 탭 서버 필터링 지원 확인 → `ClientContracts`를 `getAllClientContracts()`(전체 페이지 조회 후 클라 `matchesTab` 필터)에서 **`getContracts({tab, page, size:10})` 서버 탭 필터 + 페이지네이션**으로 전환 (프리랜서 목록과 방식 통일, 정렬 id DESC로 페이지 안정)
- 구현: `requestIdRef` 경쟁 방지, prev/next 페이지 네비 추가, 직무 라벨·탭 배지는 계정 단위 메타로 1회 로드(실패해도 목록 렌더 비차단), 로컬 `matchesTab`·`useMemo` 제거
- 동작 변화(의도됨, BE 확인): `AWAITING_ME`(서명 대기) 탭에서 `DRAFT`(AI 문구 작성 2~5초)·`REJECTED`(상대 거부)가 서버 기준으로 빠짐 → 배지 숫자가 줄어 보일 수 있음. `CONCLUDED`/`AWAITING_COUNTERPART`는 기존과 동일
- `getAllClientContracts`는 `ContractNotificationRedirect`가 계속 사용하므로 서비스 유지
- 문서: `.ai/API.md` 클라이언트 계약 관리 섹션 + 변경 이력 갱신
- 검증: TypeScript·`eslint src/features/contract` 통과, `npm run build` 성공(`/client/contracts` 정상), 계약 Jest 4 suites/25·전체 181/186 통과(무관 실패 5건 baseline 동일)
- 미검증: 실제 로그인 브라우저에서 서버 탭 응답·페이지네이션 동작 (no-localhost) — PR 시 확인 필요

## 2026-08-16 — 계약 파트 마무리 3건 (SEO metadata / PDF 병렬화 / 미사용 export 정리)

- SEO: 계약 라우트 9개 `page.tsx`에 static `metadata`(역할별 `title` + `robots:{index:false,follow:false}`) 추가 — 인증 비공개 페이지의 noindex 방어선(기존 `robots.ts` disallow에 더한 이중 안전) + 탭/히스토리 타이틀 개선
  - `/client/contracts`(계약 관리), `/freelancer/contracts`(내 계약), `/contracts/[contractId]`(계약), 상세·서명(계약 상세/계약서 서명) 각 역할, 리뷰 작성, 성공보수 결제
- 렌더링: `ContractDocument` 로드에서 `getContractDetail`과 `downloadContractPdf`를 순차→**병렬**로 변경(미리보기 첫 표시 단축). 상세 실패=치명 에러, PDF 실패=미리보기 영역 에러 분리 처리는 그대로 유지
- dead code: 외부 미사용 `export` 제거(grep로 정의 파일 밖 미사용 확인) — `getClientContracts`(clientContracts.ts), 타입 `ContractStatus`(contractList.ts), `ContractDetailStatus`·`ContractSignatureStatus`·`ContractPartyClient`·`ContractPartyFreelancer`·`ContractClause`(contractDetail.ts). 타입 자체는 유지, `export`만 제거
- 검증: TypeScript·`eslint`(contract + 변경 라우트) 통과, `npm run build` 성공(계약 라우트 9개 정상 컴파일), 계약 Jest·전체 181/186 통과(무관 실패 5건 baseline 동일)
- 미검증: `robots` 메타의 실제 렌더 결과는 브라우저 미확인(no-localhost). 다만 Next 표준 metadata API로 build 통과

## 2026-08-16 — 계약 파트 다크모드 대응 (raw hex → 시맨틱 토큰)

- 신규 시맨틱 색상 토큰 5종 추가(`src/app/globals.css`, light/dark 모두 정의): `--danger-border`, `--success-border`, `--info`, `--info-surface`, `--info-border` + `@theme inline` 매핑
- 설계 원칙(다크모드 가이드 §5): 큰 상태 패널은 테마 적응형 토큰, 작은 상태 pill은 고정 상태색 유지
  - `ContractOverview`: 안내/서명/확정/에러 패널의 light 전용 hex(`#eef6fc`/`#cbdcf1`/`#bde9ce`/`#fda29b`) → `info-surface`/`info-border`/`success-border`/`danger-border` (배경+글자 함께 flip → 다크 대비 확보)
  - `ClientContracts`·`FreelancerContracts`: 에러 박스 `border-[#fda29b]`→`border-danger-border`, 재시도 버튼 `border-[#b42318]`→`border-theme-danger`, 부제 `text-[#748094]`→`text-theme-secondary`
  - `FreelancerContractStatusTabs`: 활성 `text-[#122d50]`→`text-brand`, 비활성 `text-[#7d8899]`→`text-theme-muted`, 밑줄 `bg-[#15365d]`→`bg-brand` (ClientContractTabs와 토큰 통일)
  - `FreelancerContractCard`: badge/notice green·red가 flip되는 `text-theme-success/danger`를 쓰다 다크에서 안 보이던 버그 → 고정값(`#067647`/`#b42318`)으로 통일해 나머지 3색과 동일 거동. 보조버튼 `border-[#dce2e9]`→`border-theme`
  - `ContractCompleteModal`: 다운로드 버튼 no-op `hover:bg-brand`→`hover:bg-brand-hover`, `text-white`→`text-brand-contrast`, 뒤로가기 `border-[#e1e6ed]`→`border-theme`
- 유지한 고정색(가이드 §5 허용, 상태 구분 고유색): badge 5색 배경/테두리, 완료 모달 성공 아이콘 원(주석 명시)
- 검증: TypeScript·`eslint src/features/contract` 통과, `npm run build` 성공(새 토큰 유틸 컴파일 확인), 계약 Jest 4 suites/25 tests·전체 181/186 통과(실패 5건은 무관 baseline)
- 미검증: **실제 브라우저 라이트/다크 시각 확인은 no-localhost 방침으로 미실시** — 가이드 §11 완료조건(시각 확인)은 충족하지 못함. light 값은 기존 hex와 동일하게 잡아 라이트 무변경, dark 값은 팔레트 패턴 추정치 → PR 시 다크 화면 캡처 검증 필요

## 2026-08-15 — 계약 파트 리팩터링: 포매터 중복 제거 + overlay 토큰화

- 계약 파트 공용 포매터 `src/features/contract/utils/format.ts` 신설: `formatContractDate`(`YYYY-MM-DD`/datetime → `YYYY.MM.DD`), `formatKrw`, `formatMonthlyAmount`
- 카드/상세/완료 모달에 흩어져 있던 동일 포매터 사설 복사본 제거 후 공용 유틸로 대체 (동작 보존)
  - `ClientContractCard`(`formatAmount`/`formatDate` 삭제), `FreelancerContractCard`(`formatMonthlyAmount`/`formatDate` 삭제), `ContractOverview`(`formatAmount`/`formatDate` 삭제), `ContractCompleteModal`(인라인 `toLocaleString`/`replaceAll` 대체)
- 다크모드 정합: `ContractCompleteModal` 오버레이 `bg-[#0f172a]/45`(light 전용 raw hex) → `bg-theme-overlay` 토큰 (light/dark 모두 정의됨)
- 검증: TypeScript(`tsc --noEmit`) 통과, `eslint src/features/contract` 통과, 계약 Jest 4 suites/25 tests 통과, 전체 181/186 통과
- 미검증/무관: `FreelancerProfile.test.tsx` 5건 실패는 변경 전 baseline에서도 동일(팀원 파트 `useRouter` 하네스 이슈) — 본 변경과 무관 확인(stash 후 재현). 실제 브라우저 다크모드 시각 확인은 no-localhost 방침으로 미검증
- 보류(추측 금지): ClientContracts 서버 탭 페이지네이션 전환(API.md상 fetch-all은 의도된 설계 + 서버 client-탭 필터링 미검증), badge/notice raw hex 다크모드 대응(blue/purple 토큰 부재 → 토큰 신설+시각 검증 필요)

## 2026-08-15 — 계약·프로젝트 버그 4건 수정

- 프리랜서 내 계약 `서명 대기` 목록·건수 조회 탭 코드를 `AWAITING_ME`에서 `SIGNING`으로 변경
- 클라이언트 계약 상세의 `← 내 계약` 링크를 `/client/contracts`로 수정
- `CLOSED`, `CANCELED` 프로젝트 상세에서 모집 마감일과 연장 횟수 배지를 숨기도록 상태 조건 추가
- 계약 상세의 PDF 다운로드를 클라이언트·프리랜서 양측 서명이 모두 `SIGNED`인 경우에만 허용하고, 서명 화면의 PDF 미리보기는 유지
- 관련 회귀 테스트 추가·수정
- 검증: 관련 Jest 3 suites/18 tests, 변경 파일 ESLint, TypeScript, 프로덕션 빌드, `git diff --check` 통과
- 미검증: 실제 로그인 브라우저 흐름과 배포 서버의 `tab=SIGNING` 응답

---

## 2026-08-15 — 채팅/고객문의 파트 정리·렌더링·SEO 최적화 (#198)

- 범위: 클라이언트/프리랜서 공용 **채팅(`features/chat`)·고객지원(`features/support`)** 파트. 로그인/매칭/마이페이지/메인은 팀원 파트라 제외. 전수 코드 리뷰 후 안전한 항목만 반영.
- **미사용 코드 정리(참조 grep 검증 후)**:
  - `leaveChatRoom` 서비스 + `ChatRoom.leaveEnabled` 타입 필드 삭제 — UI에 '나가기' 미구현, 앱 참조 0(테스트만 사용). 연동 테스트(`chatRooms.test.ts`, `fixtures.ts`)도 정리.
  - `getUnreadChatCount` 별칭 삭제 — 전부 `getChatUnreadCount`만 사용, 별칭 참조 0.
  - `writerName/writerRole/writerEmail`(문의 응답 admin 필드)은 사용자가 유지 선택 → 보존.
- **SEO**: 루트에 `metadataBase` + title template 추가(`app/layout.tsx`), 공개 페이지 `/support`에 title·description·canonical·OpenGraph 추가(`app/support/page.tsx`). robots/sitemap은 기존 정책 유지(인증 라우트 disallow).
- **문의 첨부 업로드 병렬화**: `InquiryForm` 순차 `for-await` → `Promise.allSettled` 병렬. 부분 실패 시 성공분 id 롤백·첫 실패 원인 전파 유지(에러코드 분기 그대로).
- **`/support` SSR → SSG**: `getServerCurrentUser()`(쿠키 의존) 제거 + `export const dynamic = "force-static"`. 콘텐츠가 외부 데이터 0(하드코딩)이라 ISR 대신 SSG가 적합. 하위 인증 라우트(`/support/chatbot`, `/support/inquiries/*`)는 dynamic 유지. 빌드 라우트표에서 `/support`가 `ƒ`→`○ Static` 전환 확인.
- **`next.config` 실측 튜닝**: `ANALYZE=true npm run build`로 실측 결과 무거운 의존성 없음(@stomp/stompjs gzip 6.6KB·`/chat` 국한, lucide-react는 Next 기본 optimizePackageImports로 트리셰이킹). 코드분할용 설정 대신 `poweredByHeader:false`, `productionBrowserSourceMaps:false` 명시. 이미지 설정은 호스트 미확정으로 TODO 주석만.
- **헤더 깜빡임 제거(공용 Header, 사용자 승인 하에 팀 공용 파트 수정)**: SSG 하드 진입 시 정적 HTML이 게스트 헤더로 나가 로그인 유저가 '게스트→로그인' 깜빡이던 문제. `Header`에 `isLoading && !user`면 `HeaderSkeleton` 반환하는 분기 추가(역할 확정 전 가로챔). auth 훅/서비스는 무변경(`useCurrentUserState`가 이미 `isLoading` 제공). SSR 페이지는 `initialUser` 덕에 `isLoading=false`라 스켈레톤 미노출 → 실효 영향은 SSG 페이지 한정.
  - 추가: `src/features/common/components/header/HeaderSkeleton.tsx` / 변경: `Header.tsx`
- 변경 파일: `next.config.ts`, `app/layout.tsx`, `app/support/page.tsx`, `features/chat/services/chatRooms.ts`, `features/chat/types/chat.ts`, `features/support/components/InquiryForm.tsx`, `features/common/components/header/Header.tsx`, `HeaderSkeleton.tsx`(신규), `unit-tests/chat/chatRooms.test.ts`, `unit-tests/chat/fixtures.ts`
- 검증: TypeScript 통과, 변경 파일 ESLint 통과(ProfileMenu 기존 warning 1건은 무관), Jest 35 suites/174 tests 통과, `npm run build` 통과 및 `/support` Static 전환 확인.
- 미검증: 실제 브라우저 렌더(스켈레톤 모양·SSG 하드진입 UX)는 규칙상 미확인. 이미지 최적화(아바타 `unoptimized` 제거)는 실제 이미지 호스트 확정 후 진행 예정.
- 참고: 전체 Jest 중 `FreelancerProfile.test.tsx` 5건 실패는 본 변경과 무관한 **기존 실패**(변경 stash 후에도 동일, `useRouter` 하네스 이슈). 팀원 파트라 손대지 않음.

---

## 2026-08-15 — 채팅 입력창 상단 구분선 제거

- 1:1 채팅의 메시지 입력 폼에서 상단 테두리(`border-t border-theme`)를 제거해 입력창 위의 얇은 구분선이 표시되지 않도록 수정했습니다.
- 변경: `src/features/chat/components/Chat.tsx`
- 검증: 변경 파일 ESLint, 채팅 Jest 1 suite/8 tests, `git diff --check` 통과
- 미검증: 로그인 채팅 데이터가 필요한 화면이라 실제 브라우저에서는 확인하지 못했습니다.

---

## 2026-08-14 — 처음 마지노선 등록 최소가 하한: 차단→경고 후 허용

- 프리랜서가 처음 협상 시작(`POST /start`) 시 등록 최소 수용가보다 낮은 단가를 넣으면, 기존엔 `NG_012`로 막혔던 것을 확인 모달 후 허용하도록 변경했습니다(PO 확정 정책, `acceptBelowFloor`와 같은 패턴).
- `StartNegotiationRequest.conditions[]`에 `belowMinAccept?`(boolean, 기본 false)를 추가했습니다. 프리랜서 AMOUNT에만 의미하며 `true`면 등록 최소가 하한 검증만 건너뜁니다.
- `NegotiationRoom.handleStart`가 `NG_012` 응답을 막다른 배너 대신 `{ belowMinAccept: true }`로 반환하도록 했습니다(상태·입력칸 유지, 화면 전환 없음).
- `SetupPanel`이 `belowMinAccept`를 받으면 확인 모달("입력하신 금액이 등록 최소 수용가보다 낮습니다…")을 띄우고, [그래도 시작] 시 같은 요청을 **AMOUNT 조건만** `belowMinAccept:true`로 재제출합니다. [취소]는 입력값을 유지합니다. 입력한 단가는 문구에 표시하고, 등록 최소가 값은 응답에 없어 정확한 숫자는 표시하지 않습니다.
- 범위는 처음 입력(start) 한 곳뿐입니다. 재조정(`PATCH /floors`)·수락(`POST /answers`)은 손대지 않았습니다(백엔드가 `/floors`의 플래그는 무시).
- 변경: `types/negotiation.ts`, `NegotiationRoom.tsx`, `NegotiationChatFlow.tsx` / 추가: `unit-tests/negotiation/NegotiationStartBelowMinAccept.test.tsx`
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, 신규 협상 Jest 1 suite/2 tests 통과, `git diff --check` 통과
- 미검증: 실제 로그인·API·브라우저는 테스트 계정이 없어 확인하지 못했습니다. 백엔드가 `belowMinAccept=true` 시 `start` 하한 가드를 통과시키는 반영이 배포돼야 실제 동작이 확인됩니다.

## 2026-08-15 — 협상 순수 로직 분리 + 테스트 안전망 (#3 Step 1)

- 배경: `NegotiationChatFlow`(1233줄)는 테스트가 0개인데 재무 성격의 마지노선(floor) 위반 판정 로직을 포함. 컴포넌트 분해 전에 순수 로직을 먼저 분리·테스트해 안전망 확보.
- 변경:
  - 신규 `src/features/negotiation/utils/negotiationDisplay.ts` — 순수 함수 7개 + `Decision`/`ViewerRole` 타입 이전: `numericValue`, `findFloorViolation`, `buildBelowFloorMessage`(재무 핵심), `buildAgreedSummary`, `opponentValue`, `floorFieldLabel`, `toOptions`.
  - `NegotiationChatFlow.tsx`에서 위 함수/로컬 `Decision` 타입 제거, 새 모듈에서 import. 렌더링·동작 로직은 그대로(순수 이동). 1233 → 1136줄.
  - 신규 `unit-tests/negotiation/negotiationDisplay.test.ts` — 13개 테스트: floor 위반(프리랜서 하한/클라 상한/거절 제외/안쪽 제안), 안내 문구 방향(낮습니다/높습니다), 합의 요약, 라벨/옵션 변환.
- 검증: TypeScript 통과, 변경/신규 파일 ESLint 통과, 신규 협상 로직 Jest 13/13 통과(협상 파트 첫 테스트).
- 남은 작업(#3 후속): `MessageItem` 등 `React.memo`로 폴링 재렌더 저감(Step 2), 패널 컴포넌트 분해(Step 3) — 재렌더 개선은 React Profiler(브라우저) 측정이 필요해 별도 진행 권장.

---

## 2026-08-15 — 프로젝트 목록 페이지네이션 URL 동기화 (#5)

- 문제: 목록 탭은 `?tab=`으로 URL에 반영되나 `page`는 로컬 state라, 새로고침·링크 공유 시 페이지 위치가 0으로 유실.
- 변경: `src/features/client/myprojects/components/ClientProjects.tsx`
  - 초기 진입 시 `?page=`(1-based)를 읽어 내부 page(0-based)로 반영.
  - `syncUrl(tab, page)` 헬퍼로 탭 변경·페이지 이동 시 `router.replace`로 쿼리 갱신(첫 페이지는 page 쿼리 생략해 URL 깔끔). 이전/다음 버튼을 `goToPage`로 통일.
- 측정(테스트로 증명): `unit-tests/client/myprojects/ClientProjects.test.tsx`에 2개 추가
  - "다음" 클릭 → `?tab=REGISTERED&page=2` 반영 + `getMyProjects({page:1})` 호출.
  - `?page=2` 초기 진입 → `getMyProjects({page:1})` 호출(새로고침 시 위치 유지).
- 검증: TypeScript 통과, 변경/테스트 파일 ESLint 통과, ClientProjects Jest 6/6 통과(기존 4 + 신규 2).
- 미검증: 실제 브라우저 새로고침/공유 UX는 미검증(로직·유닛 테스트 기준).

---

## 2026-08-15 — 정적 메타(/api/v1/meta/\*) 조회 캐싱 (네트워크 최적화 #4)

- 문제: 직무·직무카테고리·스킬·근무조건 등 정적 메타 조회(`getProjectJobRoles`/`getProjectJobCategories`/`getProjectSkills`/`getProjectWorkConditions`)가 상세·편집·등록·계약·채팅·프리랜서 등 10곳 이상 컴포넌트에서 마운트마다 매번 재요청됨.
- 변경: `src/features/client/projects/services/projectPreReview.ts`에 프로미스 캐시 헬퍼(`cacheOnce`) 추가, 4개 GET 게터를 감쌈. 최초 조회 결과(프로미스)를 세션 동안 재사용하고, 실패 시 캐시를 비워 재시도 가능. `createProjectPreReview`(POST)는 캐싱 안 함. 공개 API 시그니처는 동일 → 호출처 무변경.
- 안전성: 대상은 파라미터 없는 전역 정적 데이터(`/api/v1/meta/*`)이며, 호출처가 결과 배열을 in-place 변경하지 않음(정렬/push 등 없음 확인)이라 공유 참조 안전.
- 측정(단위 테스트로 증명): 신규 `unit-tests/client/projects/projectPreReviewCache.test.ts` — 같은 게터 3회 호출 시 `apiCall` 1회만, 실패 후에는 재조회로 2회. → 화면 이동마다 반복되던 메타 호출이 세션당 1회로 수렴.
- 검증: TypeScript 통과, 변경/신규 파일 ESLint 통과, 신규 캐시 테스트 2/2 통과.
- 참고: 전체 Jest에서 `FreelancerProfile.test.tsx` 5개 실패는 본 변경과 무관한 기존 실패(변경 stash 후에도 동일 실패 확인, 해당 화면은 메타 게터 미사용).

---

## 2026-08-15 — 프로젝트 상세 비기본 탭 지연 로드 (번들 최적화 #2)

- 문제: `ClientProjectDetail`이 추천/협상/계약/진행 탭 컴포넌트를 전부 정적 import → 기본 "프로젝트 정보" 탭만 열어도 4개 탭 코드가 상세 초기 번들에 포함.
- 변경: `src/features/client/myprojects/components/ClientProjectDetail.tsx`에서 `RecommendedCandidates`·`ProjectNegotiation`·`NegotiationActions`·`ProjectContracts`·`ProjectProgress`를 `next/dynamic({ ssr:false, loading })`로 전환. 기본 정보 탭(`ProjectInformation`)은 정적 유지.
- 측정(실측, chunk 기준):
  - 상세 라우트(`[projectId]/page`) 초기 chunk 총량 **157,003 → 124,917 bytes (−32,086 B, −20.4%)**.
  - 초기 chunk에서 `ProjectProgress`("정산 대기")·`RecommendedCandidates`("AI 추천이 완료") 코드 **분리 확인**(async chunk로 이동).
- 트레이드오프: 각 비기본 탭 첫 진입 시 async chunk 로드 지연(1회, "불러오고 있습니다" fallback 표시).
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, `ClientProjectDetail` Jest 4개 통과, 프로덕션 빌드 성공.
- 미검증: 실제 탭 전환 UX는 브라우저 미검증(로직·타입·유닛 테스트 기준).

---

## 2026-08-15 — 로그인/소셜콜백 초기 번들에서 STOMP 동적 분리 (번들 최적화 #1)

- 문제: 로그인·소셜콜백은 로그인 전(쿠키 없음)이라 실시간 알림이 없는데도, `reactivateStomp` **정적 import** 때문에 `@stomp/stompjs` 포함 chunk(~23KB)가 초기 번들에 딸려옴.
- 변경: `src/app/login/page.tsx`·`src/features/auth/components/SocialCallbackContent.tsx`의 `reactivateStomp`를 정적 import 제거하고, 로그인 성공 핸들러 안에서 `await import("@/features/negotiation/stomp/client")`로 동적 로드.
- 인증 페이지(client/_, freelancer/_, projects/\*)는 헤더 알림 스트림(`useNotificationStream`)이 STOMP를 쓰므로 공용 로드가 정상 → 그대로 유지.
- 측정(실측, chunk 기준 — Next 16 + Turbopack은 `next build` First Load JS 라우트 표를 출력하지 않음):
  - STOMP chunk `1k80-*.js` = **23,425 bytes**, 크기는 동일하나 async chunk로 전환.
  - `/login`·`/login/social/callback` 초기 번들에서 STOMP chunk 참조 **제거**(before 포함 → after 없음).
  - STOMP chunk 참조 아티팩트 수 `.next/server/app` 기준 **73 → 62**(−11, 로그인·소셜콜백 파일군 전체).
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, 프로덕션 빌드 성공.
- 미검증: 실제 로그인 후 STOMP 재연결 동작은 테스트 계정 부재로 브라우저 미검증(정적→동적 import는 동작 동일, 로드 시점만 지연).

---

## 2026-08-15 — 클라이언트 프로젝트(목록·상세·등록·협상) 데드코드·중복 정리

- 대상: 프로젝트 등록 / 목록 / 상세(정보·협상). 로그인·매칭·마이페이지·메인은 팀원 파트라 미변경.
- **데드코드 삭제**(참조 재검증 후):
  - `NegotiationFailedCard.tsx` 파일 전체(어디서도 import 안 됨)
  - 미사용 타입 `WorkStyle`·`PageResponse`(`negotiation/types/negotiation.ts`), 죽은 타입 re-export 3곳(`ClientProjectCard`·`ProjectStatusTabs`·`ProjectDetailTabs`)
  - `ClientProjectCardProps.deadline` prop 경로(타입·구조분해·죽은 배지 분기)
  - `conditionFormat.ts`의 존재하지 않는 심볼(`senderShortLabel`) 참조 주석 정리
- **중복 로직 공용화**:
  - 신규 `src/features/client/myprojects/utils/projectDisplay.ts` — `PROJECT_STATUS_LABEL`/`getProjectStatusLabel`, `PERIOD_UNIT_LABEL`, `formatProjectDate`
  - `ClientProjects`·`ClientProjectDetail`·`ProjectInformation`에 흩어진 프로젝트 상태 라벨(2곳)·기간단위 라벨(2곳)·날짜 포맷(3곳) 중복 제거 후 공용 모듈 참조
  - 등록 `ProjectBasicInfo`의 근무조건 조회 중복(재시도용 함수 + useEffect 복붙)을 `applyWorkConditions` 공유로 정리(옆 `ProjectRoles`의 `applyMeta` 패턴에 맞춤)
- **의도적으로 하지 않은 것(사유 기록)**:
  - 상태 라벨 맵 중 매칭요청(`ProjectFreelancerStatus`)·계약(`ProjectProgress`)은 프로젝트 상태와 **값·의미가 다른 별도 맵**이라 병합하지 않음. 같은 코드 `COMPLETION_PENDING`이 "완료 대기"(프로젝트) vs "정산 대기"(계약)로 갈리는 도메인 간 드리프트는 남은 과제.
  - API 응답 DTO 미사용 필드(`statusNote`·`paymentStatus`·`floorComparison`·`ProjectTabCount.status` 등)는 백엔드 응답 계약이라 유지(임의 삭제 금지 원칙).
  - `NegotiationChatFlow`(1233줄) 내부 중복(floor 라벨 4곳·submit 버튼)은 테스트 0개 + 재무 가드레일 로직이라, 컴포넌트 분해 작업 때 테스트 선반영 후 함께 처리로 이연.
- **재검증으로 되살린 삭제 후보**(전역 참조 확인의 효과):
  - `agreedAmount` — `FreelancerProjects`에서 사용 → 유지
  - `calculateTextOverlap`·`hasElaborationDetail` — 유닛 테스트가 직접 import → `export` 유지
- 변경 파일: `myprojects/components/{ClientProjectCard,ClientProjectDetail,ClientProjects,ProjectDetailTabs,ProjectStatusTabs}.tsx`, `myprojects/information/components/ProjectInformation.tsx`, `myprojects/types/components.ts`, `myprojects/utils/projectDisplay.ts`(신규), `negotiation/types/negotiation.ts`, `negotiation/utils/conditionFormat.ts`, `client/projects/components/ProjectBasicInfo.tsx`
- 검증: TypeScript(`tsc --noEmit`) 통과, 변경 파일 ESLint 통과, Jest(myprojects+freelancer 72개, register 40개) 전체 통과. 순 변경 약 −60줄.
- 미검증: 실제 로그인·브라우저 렌더는 테스트 계정 부재로 미확인(로직·타입·유닛 테스트 기준으로만 검증).

---

## 2026-08-14 — 헤더 채팅 아이콘 안읽음 배지

- 상단 채팅 아이콘에 안 읽은 1:1 채팅 메시지 총합을 빨간 배지로 표시했습니다(알림 벨 배지와 동일 위치·스타일).
- 안읽음 총합은 이미 구현·테스트되어 있던 `getChatUnreadCount`(`GET /api/v1/chat-rooms/unread-count`, `{ unreadCount }`)를 재사용했습니다. 기준 문서의 `GET /api/v1/chats/unread-count` `{ unread }`와는 경로·필드명이 달라 실제 코드 우선 원칙에 따라 코드 기준으로 연동했습니다.
- 전역 갱신은 기준 문서 권장 A(폴링)로 구현: `useUnreadChatCount` 훅이 진입 시 1회 조회하고 20초 주기 폴링 및 창 포커스 복귀 시 재조회합니다. 채팅 STOMP는 방별 토픽이라 다른 화면에서는 전역 배지에 쓸 수 없어 폴링을 택했습니다(백엔드 무변경).
- 배지 숫자는 0이면 숨기고 99 초과 시 `99+`로 표기합니다(채팅·알림 배지 공통).
- 추가: `src/features/chat/hooks/useUnreadChatCount.ts`, `unit-tests/chat/useUnreadChatCount.test.tsx`
- 변경: `Header.tsx`(훅 연결·`chatCount` 전달), `ClientHeader.tsx`·`FreelancerHeader.tsx`(배지 99+ 표기)
- 검증: TypeScript 통과, 변경 파일 ESLint 통과, 채팅 Jest 4 suites/18 tests(신규 훅 4 tests 포함) 통과
- 한계·미검증: 채팅방을 읽어 안읽음이 0이 되어도 헤더 배지는 다음 폴링(≤20초) 또는 포커스 복귀 시 갱신됩니다(A안 트레이드오프). 즉시 실시간이 필요하면 기준 문서 B안(사용자별 채팅 브로드캐스트)의 백엔드 추가가 필요합니다. 실제 로그인·API·브라우저는 테스트 계정이 없어 미검증입니다.

---

## 2026-08-14 — 검색 엔진 크롤링·사이트맵 설정

- Next.js 메타데이터 라우트로 `/robots.txt`와 `/sitemap.xml`을 추가했습니다.
- sitemap에는 홈, 고객지원, 등급 안내, 이용약관, 개인정보 처리방침 등 공개 정적 페이지만 포함했습니다.
- 로그인·회원가입·역할별 화면·계약·채팅·알림·동적 상세·문의 내역 경로는 robots 크롤링 대상에서 제외했습니다.
- Docker와 GitHub Actions 빌드에 `NEXT_PUBLIC_SITE_URL` 전달을 연결했습니다.
- 검증: 변경 파일 ESLint, TypeScript, 프로덕션 빌드, 생성된 robots·sitemap 내용, `git diff --check` 통과
- 실제 운영 배포는 미검증이며 GitHub Repository Variable `NEXT_PUBLIC_SITE_URL` 등록이 필요합니다.

---

## 2026-08-14 — 협상 조건 라벨 문구 변경

- 협상 조건 카드에 표시되는 `내 마지노선` 문구를 `내 선택`으로 변경했습니다.
- 내부 API 필드와 협상 판정 로직은 변경하지 않았습니다.
- 검증: 변경 파일 ESLint 및 `git diff --check` 통과
- 실제 로그인 협상 화면은 미검증입니다.

---

## 2026-08-14 — Google Search Console 소유권 확인 파일 배치

- 루트에 있던 `google4e55541e4d3ae080.html`을 Next.js에서 정적 파일로 제공되는 `public/`로 이동했습니다.
- 배포 후 `/google4e55541e4d3ae080.html` 경로에서 인증 문자열이 노출되도록 구성했습니다.
- 검증: 로컬 파일 경로와 내용 확인. 실제 운영 배포 및 Search Console 소유권 인증은 미검증입니다.

---

## 2026-08-15 — 마이페이지 체크리스트 최종 재대조

- 리뷰·결제수단·클라이언트 통합 정보·등급·급여·이력서·탈퇴 체크리스트의 반영 상태를 전체 검색으로 확인했습니다.
- 경력에서 선택값인 부서와 담당 업무를 입력하지 않아도 저장 검증을 통과하도록 수정했습니다.
- BusinessField/EmployeeCount 메타 엔드포인트는 프론트 서비스만 존재하며 실제 배포 여부는 미검증으로 남겼습니다.

## 2026-08-15 — 공통 이메일 인증·결제수단 계약 보완

- 프로필 수정 인증 모달에 만료 타이머와 남은 재발송 횟수를 적용했습니다.
- 임시 비밀번호 사용자의 비밀번호 변경 인증 생략과 서버 비밀번호 형식 기준을 반영했습니다.
- 1회용 프로필 인증이 저장 실패로 소진된 뒤 재인증 없이 재시도하지 못하도록 수정했습니다.
- 프리랜서 결제수단의 목업 fallback과 화면상 저장을 제거하고 실제 카드·계좌 PUT으로 교체했습니다.
- 계좌 마스킹 표시를 양 역할에서 같은 형식으로 맞췄습니다.
- TypeScript, 변경 파일 ESLint, `git diff --check`는 통과했습니다. production build는 Google Fonts 네트워크 요청 실패로 완료하지 못했습니다.

## 2026-08-15 — 마이페이지 연동 가이드 리뷰 항목 재검증

- 프리랜서 리뷰 관리에 남아 있던 목업 리뷰를 실제 summary/received/written API로 교체했습니다.
- 양 역할 작성한 리뷰에서 서버가 돌려주지 않는 서비스 이용 후기 블록을 제거했습니다.
- null 리뷰 본문, 페이징, 빈 상태, 오류 상태와 수정·삭제 불가 배지를 가이드에 맞췄습니다.
- 등급과 이력서 주요 계약이 기존 코드에 반영된 상태임을 다시 확인했습니다.
- TypeScript, 변경 파일 ESLint, `git diff --check`를 통과했습니다. FreelancerProfile Jest는 120초 타임아웃으로 결과를 확인하지 못했습니다.

## 2026-08-14 — 시스템 설정 마이페이지 이동

- 헤더의 시스템/라이트/다크 드롭다운을 간결한 테마 전환 아이콘으로 교체했습니다.
- 양 역할 마이페이지에 기본 설정 메뉴와 페이지를 추가하고 테마·비밀번호 변경을 이동했습니다.
- 프리랜서 기본 정보에 있던 AI 매칭 설정을 기본 설정으로 이동했습니다.

## 2026-08-14 — 마이페이지 비밀번호 변경 UI 축소

- 클라이언트·프리랜서 공통 비밀번호 변경 컴포넌트의 단계 표시, 이메일 인증 카드, 입력창, 버튼과 여백을 축소했습니다.
- 기본 정보 화면에 펼쳐지는 형태는 최대 너비를 제한해 주변 마이페이지 디자인과 자연스럽게 이어지도록 조정했습니다.

## 2026-08-14 — 마이페이지 이메일 인증 모달·프로필 UI 정리

- 기본 정보 수정 전에 공통 `PROFILE_UPDATE` 이메일 인증 모달을 거치도록 클라이언트와 프리랜서 흐름을 통일했습니다.
- 결제수단 목록은 인증 없이 조회하고, 카드·계좌 수정 전에만 `PAYMENT_METHOD` 이메일 인증을 요구합니다.
- 클라이언트 기업 로고 등록을 별도 입력칸에서 제거하고 상단 원형 프로필 사진 영역으로 옮겼습니다.
- 전화번호 입력에 자동 하이픈을 적용하고 클라이언트 조회 화면 표시도 같은 형식으로 통일했습니다.
- 클라이언트 사이드바에서 등급 및 혜택 메뉴를 제거했습니다. 프리랜서 사이드바에는 해당 메뉴가 없음을 확인했습니다.

## 2026-08-14 — 마이페이지 프론트 체크리스트 최종 대조

- 체크리스트를 전체 검색으로 대조해 남아 있던 카드 최대 3개 문구와 계좌 표시 규칙을 수정했습니다.
- `RV_004`를 리뷰 폼에서 명시적인 대금 지급 완료 안내로 처리했습니다.
- 희망 조건 화면으로 잘못 연결되던 프리랜서 기본 정보 수정 버튼을 전용 `/freelancers/me` 수정 화면으로 교체했습니다.
- 프리랜서 수정 화면에 `PROFILE_UPDATE` 이메일 인증과 전화번호·주소·프로필 사진 단일 저장을 구현했습니다.
- 프리랜서 기본 정보 조회도 `/auth/me` 대신 `/freelancers/me`를 사용해 생년월일·전화번호·주소를 표시합니다.
- 프리랜서 프로필 Jest 1 suite/5 tests, TypeScript, ESLint, production build, `git diff --check` 통과

## 2026-08-14 — 회원 탈퇴 완료 모달 후 비로그인 메인 이동

- 탈퇴 성공 또는 `AC_008` 발생 시 프론트의 현재 사용자 캐시를 즉시 비우고 완료 모달을 표시하도록 변경했습니다.
- 탈퇴 전에 시작된 사용자 조회가 늦게 완료되더라도 로그인 캐시가 복원되지 않도록 캐시 세대값 검증을 추가했습니다.
- 완료 모달의 확인 버튼을 누르면 `/`를 새로 요청하므로 메인은 비로그인 상태로 렌더링됩니다.
- 클라이언트·프리랜서 탈퇴 Jest 2 suites/12 tests, TypeScript, ESLint, `git diff --check` 통과

## 2026-08-14 — 리뷰 작성·작성 대기 API 연동

- 화면만 존재하던 리뷰 폼을 `POST /reviews`에 연결하고 제거된 projectId·revieweeAccountId 없이 contractId만 전송하도록 구현했습니다.
- 상대 평가와 사이트 후기 객체를 항상 함께 보내며 두 별점은 필수, 텍스트는 공백일 때 생략하도록 처리했습니다.
- 등록 후 수정·삭제가 불가능하다는 최종 확인을 제출 직전에 표시합니다.
- 클라이언트 성공보수 결제 완료 화면에 계약별 리뷰 작성 링크를 추가했습니다.
- 프리랜서 리뷰 관리에 서버 작성 대기 목록이 있을 때만 진입 섹션을 표시하고, 완료 계약 카드의 동작하지 않던 리뷰 버튼도 연결했습니다.
- TypeScript, 변경 파일 ESLint, `git diff --check` 통과

## 2026-08-14 — 파일 업로드·메타 목록 계약 재검증

- 프로필 사진·기업 로고·포트폴리오·1:1 문의 첨부가 모두 multipart `file` 파트와 purpose 쿼리를 사용하는지 확인했습니다.
- 기업 로고에 jpg/jpeg/png MIME 검증을 추가하고, 새 로고를 다시 고를 때 앞서 업로드한 미연결 파일을 삭제하도록 보완했습니다.
- 프리랜서 직무 목록을 선택한 직군의 `parentCode`로 필터링하고 직군 변경 시 직무를 초기화하도록 수정했습니다.
- 이미 선택한 스킬을 검색 결과에서 제외하고, 서버 skillLevels의 숙련도 선택이 모든 스킬에 존재해야 저장할 수 있도록 검증했습니다.
- TypeScript, 변경 파일 ESLint, `git diff --check` 통과

## 2026-08-14 — 클라이언트 마이페이지 통합 API 연동

- 기본 정보와 기업 정보 탭을 한 화면으로 합치고 `/clients/me` 응답의 계정·기업 정보를 모두 표시하도록 변경했습니다.
- 수정 모드에서 기업명·직원 수·휴대폰·주소·로고만 활성화하고 담당자명·사업자번호·사업 분야·이메일은 회색 비활성으로 유지했습니다.
- `PROFILE_UPDATE` 이메일 인증을 한 번 완료한 뒤 모든 변경을 단일 PATCH로 저장하도록 구현했습니다.
- 로고 변경 시에만 `COMPANY_LOGO` 업로드 결과의 `logoFileId`를 요청에 포함합니다.
- 사이드바를 요구된 6개 메뉴로 정리하고 클라이언트 등급 API 및 받은/작성한 리뷰 API를 연결했습니다.
- 작성한 리뷰 화면의 API가 없는 사이트 후기 블록은 제거했습니다.

### 검증

- TypeScript, 변경 파일 ESLint, production build 통과
- 클라이언트 마이페이지 Jest 2 suites / 8 tests 통과
- 실제 로그인 세션 기반 API·브라우저 화면은 미검증

## 2026-08-14 — 프로젝트 등록 규칙 기반 사전 점검 1단계

- 프로젝트 최종 확인 화면에서 사용자가 직접 실행하는 브라우저 사전 점검 UI를 추가했습니다.
- 주요 업무·상세 업무의 필수값과 권장 길이, 명백한 동일·거의 동일 문장, 상세 범위의 구체화 단서를 규칙으로 점검합니다.
- 이메일·전화번호·계좌번호 후보는 외부 전송 없이 브라우저에서 탐지하고 결과에는 마스킹된 값만 표시합니다.
- 점검 결과는 안내용이며 등록 버튼과 서버의 기존 사전 검수 흐름을 차단하거나 변경하지 않습니다.
- 새 라이브러리와 AI 모델은 추가하지 않았으며 온디바이스 모델 검증은 2단계 별도 spike로 분리했습니다.
- 검증: 전체 Jest 31 suites/140 tests, 전체 ESLint(기존 warning 1건), TypeScript, `git diff --check` 통과
- 미검증: 실제 로그인 세션의 프로젝트 등록 화면, 프로덕션 빌드(외부 Google Fonts 연결 실패)

---

## 2026-08-14 — 프리랜서 등급·이력서 최신 연동 가이드 반영

- 프리랜서 마이페이지 등급 카드에 내 등급과 역할별 기준표 API를 연결했습니다.
- 프리랜서 등급을 주니어/시니어/마스터로 표시하고, 다음 등급 목표·진행률·서버 승급 안내·월별 산정 안내를 반영했습니다.
- 프로젝트 0건과 평점 null을 오류로 보지 않고 안전하게 표시합니다.
- 이력서와 희망 조건을 하나의 `PUT /freelancers/me/resume` 요청으로 저장하도록 통합하고 `affiliation`을 제거했습니다.
- 조회 응답과 저장 요청의 타입을 분리하고 이력서 상단 안내는 하드코딩 대신 서버 `notice`를 표시하도록 수정했습니다.

### 검증

- 프리랜서 프로필 Jest 1 suite / 5 tests, TypeScript, 변경 파일 ESLint, production build, `git diff --check` 통과
- 실제 로그인 세션 기반 API·브라우저 화면은 미검증

---

## 2026-08-13 — 프리랜서 프로젝트 제안 3화면 가이드 대조 및 버그 수정

- `frontend-matching-negotiation-guide.md` 기준으로 프리랜서 제안 목록·상세·협상방 화면을 실제 코드와 한 줄씩 대조했습니다.
- "상세보기를 눌러도 아무것도 안 나온다"는 제보를 조사한 결과, `GET /matchings/requests/{requestId}`가 404 `AC_002`(프로필 정보 없음)를 반환하는 백엔드 이슈로 확인해 매칭 담당 전달용 보고 문구를 작성했습니다(프론트 코드는 정상이라 수정하지 않음).
- 수락 응답이 조건 즉시 타결로 `CONTRACT_PENDING`이 되는 경우 협상방으로 이동하지 않던 버그를 목록·상세 화면 모두에서 수정했습니다(`status` 대신 `negotiationId` 유무로 판단).
- 목록 화면의 "AI 최종 협의 조건" 블록을 실제로 연동했습니다(협상 상세 지연 조회, 조건 폴백은 `periodLabel`/`workLabel`).
- 종료됨 탭에서 "거절함"/"응답 기한 마감" 외 상태(계약 완료 등)에 칩이 안 뜨던 문제를 수정했습니다.
- `budgetAmount`(계약 총액)를 "월 X원"으로 잘못 표시하던 문구를 "총 X원"으로 고쳤습니다.
- 수락·거절 성공 시 전체 재조회 대신 로컬 상태 갱신으로 바꿔 스크롤 튐을 없앴고, `MT_006`/`MT_007` 에러도 `MT_016`과 동일하게 재조회하도록 통일했습니다.
- 협상 결렬 사유(`endReason`) 필드를 타입에 추가하고 결렬 카드에 텍스트로만(이스케이프 보장) 표시하도록 연동했습니다.
- 자체 코드 리뷰로 협상 요약 캐시 미갱신, 탭 전환 경쟁 상태, 금액 파싱 NaN 노출 가능성을 추가로 찾아 수정했습니다.
- 감사 중 "협상 대기 헤더 배지 미구현"으로 오판했던 항목은 `.ai/API.md`에 이미 "헤더 종 배지 미사용은 확정 결정"이라 기록돼 있어 수정하지 않았습니다.

### 검증

- [x] `npx tsc --noEmit` — 오류 없음
- [x] 변경 파일 대상 ESLint — 오류 없음
- [x] `npx jest` — 25 suites / 122 tests 전체 통과
- [x] `git diff --check` — 통과(경고는 이번 변경과 무관한 기존 파일의 LF/CRLF 알림뿐)
- [ ] 실제 로그인 세션·브라우저 확인 — 테스트 계정 없어 미검증

## 2026-08-13 — 헤더·메인 사용자명 깜빡임 수정

- 사용자 정보 클라이언트 재조회 중 `프리랜서`/`클라이언트` 역할 기본값이 먼저 노출된 뒤 실제 이름으로 바뀌던 흐름을 로딩 상태로 분리했습니다.
- 조회 중에는 프로필 메뉴를 비활성화하고 고정 크기 스켈레톤을 표시해 하드코딩 문구와 실제 데이터가 번갈아 보이지 않도록 했습니다.
- 역할별 메인 페이지에 서버 초기 사용자 정보를 전달하고, 재조회 중에는 `회원님` 대신 스켈레톤을 표시하도록 변경했습니다.
- 헤더 프로필 버튼 폭을 140px로 고정해 로딩 전후 사용자명 길이가 달라도 헤더 액션 영역이 움직이지 않도록 했습니다.
- 다크모드 초기화 경로를 점검한 결과 사용자명 교체 원인은 테마가 아니라 파란 히어로 위 반투명 로딩 스켈레톤이었으며, 이를 색이 없는 투명 자리 확보 방식으로 교체했습니다.
- 보호 페이지 진입 때 인증 세션 가드, 역할 가드, 헤더, 본문이 각각 `/auth/me`를 호출하던 구조를 확인했습니다. 진행 중 요청과 짧은 성공 캐시를 공유하고 역할 가드가 확인한 사용자를 후속 컴포넌트의 동기 초기값으로 사용해 닉네임이 빈 상태로 다시 시작하지 않도록 수정했습니다.
- 검증: 관련 Jest 7 suites/32 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 미검증: 실제 로그인 세션의 새로고침 화면

---

## 2026-08-13 — 채팅 최종 합의안 카드 스타일 조정

- 채팅 최종 합의안 영역에 바깥 여백과 전체 테두리, 둥근 모서리를 적용해 대화창과 분리된 카드 형태로 변경했습니다.
- 검증: 관련 Jest 1 suite/8 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 로그인 채팅 데이터가 필요한 화면

---

## 2026-08-13 — 채팅 화면 최대 너비 축소

- 데스크톱 채팅 컨테이너의 최대 너비를 1440px에서 1200px로 줄이고 중앙 정렬과 내부 영역 비율은 유지했습니다.
- 검증: 관련 Jest 1 suite/8 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 로그인 채팅 데이터가 필요한 화면

---

## 2026-08-13 — 챗봇 확인 중 문구 강조 완화

- 잔여 상담 횟수를 불러오는 동안 표시되는 `확인 중` 문구를 연한 보조 색상과 낮은 굵기로 조정했습니다.
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 문구 색상·굵기만 변경

---

## 2026-08-13 — 챗봇 새로고침 초기 표시·스크롤 수정

- 새로고침 직후 API 로딩 중에는 기본 인사말을 먼저 노출하지 않고 대화 로딩 상태만 표시하도록 변경했습니다.
- 잔여 횟수는 `-` 대신 `확인 중`, 일일 한도는 처음부터 `10회`로 표시합니다.
- 대화 기록이 준비된 첫 렌더에서 애니메이션 없이 최신 메시지 위치로 이동하고, 이후 새 메시지는 기존처럼 부드럽게 이동합니다.
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, `npx tsc --noEmit`, `git diff --check` 통과
- 브라우저: 새로고침 직후 `확인 중 / 10회` 표시, `-`와 기본 인사말 미노출 확인. 실제 기록 복원은 미인증 환경이라 단위 테스트로 확인

---

## 2026-08-13 — 챗봇 잔여 상담 카드 배경 추가

- `오늘 남은 AI 상담` 카드의 기본 상태에 흰색 surface 배경과 테두리를 추가했습니다.
- 낮은 잔여 횟수와 소진 상태의 경고 배경은 기존 스타일을 유지했습니다.
- 검증: 관련 Jest 1 suite/10 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 기본 카드 배경·테두리 스타일만 변경

---

## 2026-08-13 — 문의 접수 완료 배경 제거

- 문의 접수 완료 안내를 감싸던 흰색 카드 배경과 테두리를 제거해 페이지 배경 위에 바로 표시되도록 변경했습니다.
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 배경·테두리 스타일만 제거

---

## 2026-08-13 — 문의 접수 완료 카드 크기 축소

- 문의 접수 완료 카드의 최대 너비와 높이, 내부 여백을 줄이고 아이콘·문구·버튼 크기를 함께 조정했습니다.
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — Tailwind 크기 조정만 수행

---

## 2026-08-13 — 고객지원 돌아가기 UI 통일

- 챗봇과 1대1 문의 목록의 `고객지원으로 돌아가기` 링크에 동일한 버튼 UI와 제목 간격을 적용했습니다.
- 검증: 관련 Jest 2 suites/15 tests, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 챗봇과 동일한 Tailwind 클래스 적용 여부를 코드로 대조

---

## 2026-08-13 — 고객지원 카드 버튼 간격 조정

- 챗봇·1대1 문의 카드의 마지막 안내 문구와 하단 버튼 사이에 여백을 추가했습니다.
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `git diff --check` 통과
- 실제 브라우저: 미실행 — 요청 화면 기준으로 Tailwind 여백만 조정

---

## 2026-08-13 — 고객지원 하위 화면 돌아가기 링크 개선

- 챗봇의 고객지원 돌아가기 링크를 `페어링 FAQ 챗봇` 제목 위로 이동했습니다.
- 1대1 문의 목록에는 고객지원 메인으로 돌아가는 링크를 추가했습니다.
- 문의 작성·상세 화면에서 문의 목록으로 이동하는 링크 문구를 `1대1 문의로 돌아가기`로 통일했습니다.
- 검증: 관련 Jest 4 suites/27 tests, 변경 파일 ESLint, `npx tsc --noEmit`, `git diff --check` 통과
- 브라우저: 챗봇 링크의 제목 상단 배치와 문의 목록·작성·상세 링크의 노출 및 `href` 확인

---

## 2026-08-13 — 고객지원 챗봇 한도 문구 깜빡임 수정

- 고객지원 카드가 처음에는 로딩 문구를 렌더링하고 API 응답 후 한도 문구로 교체하던 동작을 제거했습니다.
- 고객지원 안내 카드에는 첫 렌더부터 `하루 최대 10회 무료 이용`을 표시하고, 실제 잔여 횟수 조회는 챗봇 화면에서만 유지했습니다.
- 검증: 관련 Jest 1 suite/1 test, 변경 파일 ESLint, `npx tsc --noEmit`, `git diff --check` 통과
- 브라우저: `/support` 최초 접근 및 새로고침 후 한도 문구 1개, 로딩 문구 0개 확인

---

## 2026-08-13 — 프로젝트·계약 후속 수정 4건

- 사전 검수의 `예상 후보 수` 문구를 `매칭 가능 인원`으로 변경하고 기존 서버 `notice` 노출 유지
- 프로젝트 첨부자료를 전용 다운로드 API와 Blob으로 저장하고 상세 응답의 원본 파일명 사용
- 종료 프로젝트 진행 현황 우측에 계약 ID 기준 작성 완료·작성 대기 리뷰 표시
- 내 프로젝트와 역할별 내 계약 탭에 서버 라벨·건수 배지 표시, 0건 배지 숨김
- 계약 탭 건수 API가 아직 배포되지 않은 경우 목록은 유지하고 배지만 숨기도록 처리
- 검증: 변경 파일 ESLint, `npx tsc --noEmit`, 전체 Jest 25 suites/122 tests, `npm run build`, `git diff --check` 통과
- 실제 로그인 세션 기반 API·브라우저·파일 저장: 미검증

---

## 2026-08-13 — 알림 센터 REST/STOMP 연동, 회원 탈퇴 가이드 대조

- 카카오톡으로 전달받은 `frontend-notification-integration.md`, `frontend-withdrawal-integration.md` 두 가이드를 반영했습니다.
- 회원 탈퇴는 기존 구현(2026-08-13 회원 탈퇴 프론트 연동)이 새 가이드의 blockers 포맷·에러코드를 이미 그대로 만족해 추가 변경 없이 대조만 완료했습니다.
- 알림 센터의 목데이터를 실제 REST(`GET /notifications`, `unread-count`, `PUT .../read`, `PUT .../read-all`, `DELETE .../{id}`, `DELETE /notifications`)로 교체했습니다.
- 매칭 전용 STOMP 구독과 별개로 전체 알림 타입을 수신하는 구독을 추가해 알림 센터 실시간 수신(토스트·목록 추가)과 헤더 종 배지(`unread-count` 초기 조회 + 수신 시 `+1`)를 연결했습니다.
- STOMP 재연결 시 알림 목록을 다시 조회하도록 공용 클라이언트(`src/features/negotiation/stomp/client.ts`)에 `onStompConnect` 리스너를 추가했습니다(기존 매칭·협상 구독 동작에는 영향 없는 추가 전용 변경).
- `CONTRACT_CREATED`/`CONTRACT_SIGNED` 알림의 `linkUrl`(`/contracts/{contractId}`)이 실제 라우트에 없어, 매칭 알림 리다이렉트와 동일한 패턴으로 역할별 계약 상세로 보내는 리다이렉트 페이지(`/contracts/[contractId]`)를 추가했습니다.
- 협상 3종·`SETTLEMENT_DUE` 알림의 실제 `linkUrl` 형식은 가이드에 명시돼 있지 않아 서버 값을 그대로 이동시키며, 상세는 `.ai/API.md` "알림 센터" 절에 확인 필요로 기록했습니다.

### 검증

- [x] `npx tsc --noEmit`
- [x] `npm run lint` — 오류 0건, 기존 `ProfileMenu.tsx` 미사용 prop 경고 1건(무관)
- [x] `npm run test` — 17 suites / 77개 전체 통과
- [x] `npm run build` — `/contracts/[contractId]` 라우트 포함 정상 생성
- [x] 브라우저로 `/notifications` 미로그인 접근 확인 — 401 후 로그인 화면으로 정상 폴백(크래시 없음)
- [ ] 실제 로그인 세션으로 목록·배지·STOMP 수신·재연결 재조회 확인 — 테스트 계정 없음
- [ ] 백엔드 실제 알림 payload·에러 응답 — 미배포/미검증, 가이드 문서 기준으로 구현

---

## 2026-08-13 — AI 매칭 MD 누락 화면 처리 완료

- 기존 화면 디자인을 유지하면서 프리랜서 거절 사유, 요청 페이지 이동, 전체 상태 표시, `MT_016` 재동기화를 추가했습니다.
- 매칭 동의·일시중지 설정을 분리하고 서버의 추천 제외 사유를 표시했습니다.
- 요청 알림은 역할별 상세로, 재추천 알림은 포지션 후보 재조회 화면으로 연결했습니다.
- 유료 재추천의 프로젝트·포지션·남은 자리·남은 횟수·진행 포지션을 실제 API 값으로 표시했습니다.

---

## 2026-08-13 — 프리랜서 매칭 화면 디자인 복원

- API 연동 과정에서 교체된 프로젝트 제안 목록·상세 JSX를 기존 카드, 탭, 섹션 및 버튼 디자인으로 복원했습니다.
- 기존 디자인 컴포넌트에는 실제 받은 요청 데이터와 수락·거절·협상 이동 동작만 연결했습니다.
- API에 적합도 점수가 없어 임의의 `0%`를 표시하지 않도록 처리했습니다.
- 상세·목록 API를 직무/스킬 메타 API와 분리해, 메타 조회가 실패해도 실제 매칭 정보는 표시되도록 수정했습니다.

### 검증

- [x] TypeScript 타입 검사
- [x] 전체 단위 테스트 15개 스위트, 65개 테스트
- [x] ESLint — 기존 `ProfileMenu.tsx` 경고 1건 제외
- [ ] 실제 로그인 API 화면 확인 — 테스트 계정/세션 필요

---

## 2026-08-13 — AI 매칭 화면 매핑 문서 나머지 API 연동

- 무료·유료 재추천을 포지션 ID 기준 202 비동기 API로 연결하고 사용자별 STOMP `MATCHING_RECOMMENDED` 완료 신호에서 후보를 다시 조회합니다.
- 프리랜서의 받은 요청 목록을 상태 탭별 실제 페이지 API로 교체하고 상세 조회, 수락, 선택 사유 거절, 기한 만료 재동기화를 연결했습니다.
- 수락 응답이 `NEGOTIATING`일 때만 협상방으로 이동하며 조건 완전 일치로 `CONTRACT_PENDING`이 바로 오는 경우도 처리합니다.
- 프리랜서 AI 매칭 설정을 서버 조회·변경 응답으로 표시하며 두 필수 설정값을 항상 함께 전송합니다.
- API 계약에 없는 후보 상세와 알림 목록 REST는 추측하지 않고 기존 상태를 유지했습니다.
- 유료 재추천의 기존 디자인은 유지하고, 가짜 완료 타이머를 제거해 요청한 모든 포지션의 완료 알림을 기다리도록 수정했습니다.
- 받은 요청에 메타 라벨·D-day·페이지 이동을 적용하고 클라이언트 요청 상세 화면과 실시간 매칭 알림 표시를 연결했습니다.

### 검증

- [x] `npm run build`
- [x] `npm run lint` — 오류 0건, 기존 `ProfileMenu.tsx` 경고 1건
- [x] `git diff --check`
- [ ] 실제 로그인 REST·STOMP 흐름 — 테스트 계정/세션 필요

---

## 2026-08-13 — 클라이언트 추천 후보 1차 API 연동

- 프로젝트 상세의 실제 포지션 ID로 포지션별 추천 후보를 조회하도록 목데이터를 교체했습니다.
- 후보 카드에 직무·스킬 메타 라벨, 희망 단가, 평점 nullable 처리, 추천 이유를 실제 응답 기준으로 표시했습니다.
- 적합도·예산 경고를 독립 배너로 처리하고 로딩·오류·빈 상태·재시도를 추가했습니다.
- 후보 거절은 응답의 최신 후보 목록으로 즉시 갱신하고, 선택 후보 매칭 요청은 `candidateId` 배열로 발송한 뒤 목록을 재조회합니다.
- 빠르게 포지션 탭을 전환할 때 이전 응답이 새 탭을 덮지 않도록 요청 순서를 검증합니다.
- 후보를 한 번도 받지 못한 초기 빈 결과에도 "모두 추천했다"고 표시되던 문구를 제거하고, 서버가 빈 사유를 제공하지 않는 현재 계약에 맞춰 중립 안내로 변경했습니다.

### 검증

- [x] 신규 추천 후보 컴포넌트 테스트 3개 통과
- [x] `npx tsc --noEmit`
- [x] `npm run lint` — 오류 0건, 기존 `ProfileMenu.tsx` 경고 1건
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 전체 테스트 — 60개 중 59개 통과, 기존 `FreelancerProfile.test.tsx`의 비밀번호 변경 링크 기대 불일치 1개 실패
- [ ] 로그인 상태 실제 API·화면 검증

## 2026-08-13 — 채팅 단위·컴포넌트 테스트

- 채팅 REST 서비스의 목록·상세·메시지·전송·읽음·나가기·미읽음 수 요청 형식을 검증했습니다.
- STOMP 채팅방 구독과 해제, 최신 핸들러 사용, 잘못된 broadcast 무시 동작을 검증했습니다.
- 채팅방 최신순 정렬, URL 기반 선택, 메시지 시간순 표시, 방 전환과 읽음 처리를 검증했습니다.
- 메시지 전송 성공·실패, 입력 비활성화, 실시간 메시지 수신과 messageId 중복 제거를 검증했습니다.
- 목록 로딩·빈 상태·조회 오류 및 재시도 흐름을 검증했습니다.

### 검증

- [x] 채팅 관련 테스트 — 3 suites, 14 tests
- [x] 전체 테스트 — 23 suites, 110 tests
- [x] `npx tsc --noEmit`
- [x] 변경 파일 ESLint
- [x] `git diff --check`
- [ ] 실제 API·STOMP·브라우저 — Mock 기반 테스트 작업으로 미실행

---

## 2026-08-13 — 회원 탈퇴 프론트 연동

- 클라이언트/프리랜서 마이페이지의 회원 탈퇴 화면(디자인만 있던 placeholder)에 `GET /accounts/me/withdrawal-eligibility`, `DELETE /accounts/me`를 연동했습니다.
- 탈퇴 가능 여부를 화면 진입 시 먼저 조회하고, `withdrawable === false`면 서버가 내려준 차단 사유(`label`·`count`·`linkUrl`)를 그대로 나열하며 탈퇴 버튼을 비활성화합니다.
- 동의 체크박스와 확인 문구(`"탈퇴하겠습니다"`) 입력에 선택 항목인 탈퇴 사유(500자) 입력을 추가했습니다.
- 탈퇴 성공 시 완료 모달 후 메인으로 이동하며, `AC_008`(이미 탈퇴)도 동일하게 처리합니다.
- `AC_010`/`AC_011`(진행 중인 프로젝트·계약, 미납 수수료)로 실패하면 탈퇴 가능 여부를 다시 조회해 안내를 갱신하고, `AC_009`(확인 문구 불일치)는 입력값을 유지한 채 인라인 오류로 표시합니다.
- 두 역할 화면이 동일한 로직을 쓰도록 `src/features/common/hooks/useWithdrawal.ts`로 분리했습니다.
- 검증용 단위 테스트는 로컬에 작성해 통과를 확인했으며, 테스트 코드 자체는 별도 TEST 이슈·브랜치로 커밋합니다.

### 검증

- [x] `npx tsc --noEmit`
- [x] `npm run lint` — 오류 0건, 기존 `ProfileMenu.tsx` 미사용 prop 경고 1건(무관)
- [x] `npm run test` — 전체 스위트 통과(로컬 작성 테스트 포함, 테스트 코드는 별도 커밋)
- [x] `npm run build`
- [ ] 실제 로그인 세션으로 브라우저 확인 — 테스트 계정 없음
- [ ] 백엔드 실제 응답·에러코드(`AC_008`~`AC_011`) 확인 — 미배포/미검증, 가이드 문서 기준으로 구현

## 2026-08-13 — 1:1 채팅 최종 API 재연동

- 최종 백엔드 매핑에 맞춰 채팅 REST 경로를 `/api/v1/chat-rooms`로 정정했습니다.
- 계약을 협상 ID로 조회해 직무와 최종 합의안 카드에 단가·기간·시작일·근무 조건·특약사항을 표시합니다.
- STOMP broadcast에는 `mine`이 없으므로 현재 계정 ID와 발신자 ID를 비교해 내 전송 이벤트를 제외합니다.
- 공통 API 에러의 `code`와 기존 `errorCode`를 모두 처리하도록 호환했습니다.
- 백엔드 최종 회신에 따라 방 상태를 `ACTIVE | CLOSED`로 수정하고 nullable 상대방·프로젝트를 방어 처리했습니다.
- 채팅 전용 STOMP 훅을 분리하고 broadcast의 `mine`을 현재 계정으로 계산한 뒤 `messageId`로 중복 제거합니다.
- CloudFront 절대 프로필 URL을 그대로 사용하며 403·로드 실패 시 첫 글자 아바타로 대체합니다.
- 서버의 PostgreSQL 파라미터 타입 추론 오류 수정·배포 후 채팅방 목록 API 200 및 9건 반환이 확인되었습니다.

### 검증

- [x] 변경 파일 ESLint
- [x] `git diff --check`
- [ ] TypeScript — 기존 프리랜서 마이페이지의 `lucide-react` 모듈 해석 오류 2건
- [ ] 실제 API·STOMP·프로필 이미지 — 인증 가능한 테스트 계정 및 파일 URL 규칙 확인 필요

---

## 2026-08-13 — 계약 도메인 구조 정리

- 공통 계약 상세·서명 컴포넌트를 `features/contract/components/common`으로 모았습니다.
- 프리랜서 계약 목록 컴포넌트를 `features/contract/components/freelancer`로 모았습니다.
- 클라이언트 전체·프로젝트별 계약 목록 컴포넌트를 `features/contract/components/client`로 모았습니다.
- 클라이언트 전용 계약 서비스와 타입도 `features/contract`의 `services`·`types`로 이동하고 모든 import와 테스트 Mock 경로를 갱신했습니다.

### 검증

- [x] 계약 관련 테스트 6 suites, 31 tests
- [x] 변경 파일 ESLint
- [x] `git diff --check`
- [ ] `npx tsc --noEmit` — 기존 프리랜서 마이페이지의 미설치 `lucide-react` import 2건
- [ ] 실제 브라우저·API — 구조 이동 작업으로 미실행

---

## 2026-08-13 — 1:1 채팅 API 연동

- 채팅 목 데이터를 REST 기반 목록·상세·메시지 조회와 전송·읽음 처리로 교체했습니다.
- 채팅방별 STOMP 구독, 메시지 ID 중복 방지, 날짜·시각·상대시간 표시를 추가했습니다.
- 빈 상태, API 오류, 입력 비활성화, 전송 중 중복 요청 방지, 500자 제한을 반영했습니다.
- 협상 기준 채팅방 조회 경로를 최종 명세로 수정했습니다.
- 백엔드 작업 중인 계약 요약 조회 경로와 직무 필드는 추측하지 않고 후속 연동 대상으로 남겼습니다.

### 검증

- [x] 채팅 변경 파일 ESLint
- [x] `git diff --check`
- [ ] TypeScript — 기존 프리랜서 마이페이지의 `lucide-react` 모듈 해석 오류 2건
- [ ] 실제 API·STOMP·브라우저 — 인증 가능한 테스트 계정 필요

---

## 2026-08-13 — 이력서 상단 안내 및 수정 버튼 정렬

- 이력서 보기 화면의 반영 안내 문구와 `수정하기` 버튼을 같은 행의 양쪽에 배치했습니다.
- 작은 화면에서는 안내 문구와 버튼이 겹치지 않도록 세로로 전환됩니다.

### 검증

- [x] `npm run lint`
- [x] `git diff --check`

---

## 2026-08-13 — 프리랜서 기본 정보 내 비밀번호 변경 폼 확장

- 프리랜서 기본 정보의 `변경하기` 버튼이 별도 페이지로 이동하지 않고 화면 내부에서 비밀번호 변경 폼을 펼치도록 변경했습니다.
- 기본 정보, AI 매칭 설정, 등급 진행 영역은 폼이 열린 상태에서도 그대로 유지됩니다.
- 공용 비밀번호 변경 컴포넌트에 임베디드 표시 옵션을 추가했으며 기존 클라이언트·독립 페이지 동작은 유지했습니다.
- 닫기 또는 취소 시 페이지 이동 없이 비밀번호 변경 폼만 접히도록 처리했습니다.

### 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 이메일 인증 및 비밀번호 변경 — 인증 세션 필요

---

## 2026-08-13 — 프리랜서 회원 탈퇴 화면 구현

- 클라이언트 회원 탈퇴와 동일한 안내 카드, 동의 체크, 확인 문구 입력 및 탈퇴 버튼 디자인을 적용했습니다.
- 프리랜서 마이페이지 공통 레이아웃과 회원 탈퇴 사이드바 활성 상태를 유지했습니다.
- 확인 문구가 정확히 일치할 때만 탈퇴 버튼이 활성화되도록 동일한 검증을 적용했습니다.
- 회원 탈퇴 API 미연동 상태를 안내하는 모달을 동일하게 적용했습니다.

### 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 회원 탈퇴 요청 — API 미연동

---

## 2026-08-13 — AI 매칭 토글 손잡이 위치 수정

- 토글 손잡이의 기준 위치를 `left-1`로 고정하고 활성 이동 거리를 트랙 내부 너비에 맞게 조정했습니다.
- 토글 트랙에 넘침 방지를 적용해 상태 전환 중에도 원형 손잡이가 바깥으로 나오지 않도록 수정했습니다.

### 검증

- [x] `npm run lint`
- [x] `git diff --check`

---

## 2026-08-13 — 마이페이지 입력창 호버 스타일 통일 및 프리랜서 마이페이지 배치 점검

### 작업 요약

- 클라이언트·프리랜서 마이페이지 전체에서 `input`/`select` 호버 스타일을 조사해, 이미 적용돼 있던 `fieldClassName`(호버 시 남색 테두리) 패턴과 어긋난 항목을 통일했습니다.
- 보정 대상: 프리랜서 프로필 등록의 스킬 숙련도 select(`FreelancerProfileRegistration.tsx`), 클라이언트 기업정보 입력(`ClientCompanyInfo.tsx`), 클라이언트 결제수단 수정 입력의 `payment-input` 스타일(`ClientPaymentMethods.tsx`), 클라이언트·프리랜서 공용 비밀번호 변경 화면의 인증 코드·새 비밀번호 입력(`MyPagePasswordChange.tsx`).
- `ClientAccountCancellation`의 탈퇴 확인 입력창은 위험 동작 강조를 위한 빨간 포커스 테두리를 그대로 유지하고 호버 색상은 변경하지 않았습니다.
- 신규로 추가된 `FreelancerPaymentMethods.tsx`는 이미 호버 시 남색 테두리가 적용돼 있어 별도 수정하지 않았습니다.
- "프리랜서 마이페이지 배치를 전반적으로 수정해 달라"는 요청은 로그인 테스트 세션이 없어 실제 화면 확인 없이 코드 비교로만 진행했습니다. 코드 비교로 확인한 뚜렷한 불일치인 `FreelancerMyPagePlaceholder` 카드의 padding(`sm:px-8` → `sm:px-7`, 다른 프리랜서 마이페이지 카드와 통일)만 보정했고, 근거 없는 추측성 변경은 하지 않았습니다.
- `ClientMyPagePlaceholder`는 실제로 어느 페이지에서도 사용되지 않는 컴포넌트임을 확인했습니다(참고용으로만 기록, 삭제하지 않음).

### 실행한 검증

- [x] `npm run lint`
- [x] `npm run build`
- [ ] 로그인 상태 브라우저 화면 확인 — 테스트 인증 세션 없음

### 남은 주의사항

- 프리랜서 마이페이지의 추가적인 배치 조정이 필요하다면, 구체적으로 어떤 화면·구역이 어색한지 스크린샷이나 설명을 받아야 임의 변형 없이 정확히 수정할 수 있습니다.

---

## 2026-08-13 — 프리랜서 결제수단 및 리뷰관리 화면 구현

- 결제수단 카드와 계좌 요약, 카드 수정 폼, 계좌 수정 폼을 제공된 SVG 배치로 구현했습니다.
- 기존 결제수단 조회 함수를 재사용하고 조회 실패 시 디자인 확인용 기본 상태를 유지하도록 했습니다.
- 받은 리뷰와 작성한 리뷰 탭, 평균 별점, 리뷰 목록, 작성 리뷰 상세와 수정·삭제 불가 상태를 구현했습니다.
- 리뷰 API가 없어 SVG의 이름과 리뷰 문구는 화면 확인용 데이터로만 사용했습니다.
- 결제수단 수정 API가 없어 수정 완료 시 현재 컴포넌트 상태에만 반영됩니다.

### 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 로그인된 브라우저에서 실제 페이지 비교 — 테스트 세션 없음

---

## 2026-08-13 — 프리랜서 이력서 입력 동작 및 배치 보정

- 기본 정보 카드를 등록 상태 안내 바로 아래, 희망 조건보다 위로 이동했습니다.
- 희망 급여 입력 시 숫자만 유지하면서 천 단위 쉼표가 자동 표시되도록 기존 금액 입력 패턴을 적용했습니다.
- 프로젝트 시작 가능일에 오늘 날짜를 최소값으로 지정해 과거 날짜 선택을 제한했습니다.
- 예상 기간과 전체 경력 연수를 선택형에서 숫자 직접 입력형으로 변경했습니다.
- 희망 조건과 보유 스킬은 기본 상태에서 입력창 없이 값과 `수정` 버튼만 표시하고, 수정 클릭 후에만 입력창과 `취소/저장` 버튼이 나타나도록 구성했습니다.
- 조회 화면의 `수정하기` 버튼을 콘텐츠 최상단으로 이동하고, 편집 화면 하단 버튼 영역의 고정 배경·상단 테두리·그림자·블러를 제거해 버튼만 표시되도록 정리했습니다.
- 이력서 수정 화면의 약관 동의 영역과 관련 필수 검증 및 임시 저장 상태를 제거했습니다.
- 기존 카드·입력 토큰과 비활성화 스타일을 사용해 다른 이력서 영역과 시각적으로 맞췄습니다.

### 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 로그인된 브라우저 세션에서 실제 동작 및 반응형 화면 비교 — 테스트 세션 없음

---

## 2026-08-13 — 프리랜서 내 이력서/포트폴리오 화면 디자인 반영

### 작업 요약

- 프리랜서 마이페이지 공통 사이드바의 `내 이력서` 화면을 제공된 `FreelancerMyPage.svg` 및 캡처 화면에 맞춰 재배치했습니다.
- 상단 등록 상태와 안내 문구, 기본 희망 조건, 보유 스킬 관리 영역을 추가했습니다.
- 기존 학력·경력·자격증/어학·자기소개·포트폴리오·링크 입력 기능을 유지하면서 동일한 카드 흐름으로 정리했습니다.
- 포트폴리오 사이드바 항목이 이력서 화면의 포트폴리오 영역으로 이동하도록 앵커를 연결했습니다.
- 이력서 편집 화면에서는 등록용 단계 표시를 숨기고 하단 작업 버튼을 `수정 취소`, `임시 저장`, `변경사항 저장`으로 정리했습니다.
- 희망 조건과 보유 스킬은 저장 API가 확인되지 않아 UI 상태로만 구현했습니다.

### 실행한 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 로그인된 브라우저 세션에서 실제 화면 비교 — 테스트 세션 없음

### 검증 중 해결한 문제

- 초기 `npm run build`에서 단계 표시 조건의 TypeScript 타입 축소 오류가 발생했으며, 조건식을 정리한 뒤 재실행하여 통과했습니다.

---

완료된 작업을 날짜별로 기록합니다.

최신 항목을 위에 추가합니다.
진행 중인 작업은 `STATE.md`에 기록합니다.

---

## 2026-08-13 — SVG 시안 기반 프리랜서 마이페이지 기본 정보 구현

### 작업 요약

- `/freelancer/mypage/profile`의 기존 등록 폼을 기본 정보 조회 화면으로 교체했습니다.
- 마이페이지 사이드바를 콘텐츠 카드 내부가 아닌 별도의 왼쪽 레이아웃 열로 구성했습니다.
- 기본 사용자 정보, 비밀번호 변경 진입, AI 매칭 설정, 등급 진행 현황 카드를 시안 구조로 구현했습니다.
- 현재 사용자 API에 없는 생년월일·전화번호·등급 통계는 임의 값 대신 `확인 필요`로 표시했습니다.
- 기존 프로필 등록 폼은 `/freelancer/mypage/profile/edit`로 분리해 기본 정보의 수정 버튼과 연결했습니다.
- 클라이언트와 프리랜서 비밀번호 변경 화면이 동일한 `MyPagePasswordChange` 컴포넌트를 계속 공유하도록 유지했습니다.
- AI 매칭 설정 API가 확인되지 않아 토글은 현재 화면의 UI 상태로만 구현했습니다.
- 모바일·태블릿에서 사이드바와 콘텐츠가 폭을 밀어내지 않도록 `min-width`와 가로 넘침을 제어하고, 프로필·OTP·액션 행을 화면 폭에 따라 세로 배치하도록 보완했습니다.
- 긴 이메일·이름·안내 문구가 카드 밖으로 넘치지 않도록 줄바꿈을 적용하고 공통 헤더의 모바일 좌우 여백과 액션 폭을 조정했습니다.
- 클라이언트와 공유하는 비밀번호 변경 화면에도 동일한 반응형 보완을 적용해 두 역할의 화면 구조를 계속 일치시켰습니다.
- 프리랜서 마이페이지의 기본 정보·프로필 수정·이력서·비밀번호 변경·결제 내역·리뷰·결제수단·회원 탈퇴 화면을 동일한 공통 레이아웃으로 통일했습니다.
- 화면마다 달랐던 최대 콘텐츠 폭과 사이드바 배치를 `1105px`, `200px + 24px + 콘텐츠` 기준으로 정리했습니다.
- 사이드바 메뉴를 시안 순서에 맞춰 포트폴리오·매칭 설정·등급 및 혜택까지 정리하고, 기존 이력서·기본 정보의 해당 구역으로 연결했습니다.
- 기존 폼·필터·비밀번호 인증 로직은 유지하고 카드 패딩, 빈 화면 높이, 모바일 줄바꿈과 콘텐츠 넘침만 공통 기준으로 조정했습니다.

### 실행한 검증

- [x] 관련 Jest 테스트 — 1 suite, 2 tests 통과
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 로그인 상태 브라우저 화면 확인 — 테스트 인증 세션 없음
- [ ] 실제 프로필·등급·AI 매칭 설정 API — 계약 미확인

### 남은 주의사항

- 프로필 상세 API가 확정되면 생년월일, 전화번호, 전문 분야, 경력과 등급 통계를 실제 응답으로 교체해야 합니다.
- AI 매칭 설정 조회·변경 API가 확정되면 토글 상태를 서버와 동기화해야 합니다.

## 2026-08-12 — SVG 시안 기반 클라이언트 리뷰 작성 화면 반영

- `/client/projects/[projectId]/review`의 기존 별점·리뷰 입력 UI를 전달받은 기본·입력 상태 SVG와 대조했습니다.
- 시안에 맞춰 평가 대상 문구를 `클라이언트 평가`, `클라이언트 별점`, `클라이언트 리뷰`로 수정했습니다.
- 별점 필수 선택, 선택 리뷰 입력, 500자 카운터, 두 별점 선택 시 버튼 활성화 동작은 기존 구현을 유지했습니다.
- `npm run lint`, `npm run build`, `git diff --check`를 실행해 통과했습니다.
- 로컬 주소 브라우저 접근 권한이 거부되어 실제 앱 화면의 육안 비교는 미실행했습니다.
- 디자인 작업 범위이므로 리뷰 등록 API는 연동하지 않았습니다.

## 2026-08-12 — SVG 시안 기반 프리랜서 프로필 등록 구현

### 작업 요약

- 프리랜서 기본 정보 placeholder를 희망 직군·직무, 근무 조건, 급여, 프로젝트 조건, 경력 및 보유 스킬 입력 화면으로 교체했습니다.
- 이력서 placeholder를 기본 정보, 학력, 경력, 자기소개, PDF 포트폴리오, 외부 링크와 약관 동의 화면으로 교체했습니다.
- 필수 입력 누락 시 오류 표시, 등록 내용 검토, 수정 돌아가기, 등록 완료 프로필 카드까지 화면 상태로 구현했습니다.
- 프리랜서 메인 히어로에 프로필·이력서 등록 CTA를 추가하고 이용 방법의 첫 단계를 프로필 등록으로 조정했습니다.
- 헤더 프로필 드롭다운에 `프로필 등록·관리` 진입 링크를 추가했습니다.
- 시안의 카드형 레이아웃과 2단계 진행 표시를 반응형 및 라이트·다크 테마 토큰으로 구성했습니다.
- 프로젝트 시작 가능일은 오늘 이전 날짜를 선택할 수 없도록 제한했습니다.
- 예상 기간과 전체 경력 연수는 시안처럼 입력 영역 오른쪽에 단위 컨트롤을 배치했습니다.
- 이력서 기본 정보의 생년월일을 연·월·일 분리 선택으로 변경하고 월별 일수를 반영했습니다.
- 전화번호는 숫자 입력 시 `010-0000-0000` 형식으로 하이픈이 자동 입력되도록 적용했습니다.
- 이력서 기본 정보 카드를 시안의 프로필 사진 왼쪽·개인정보 오른쪽 구조로 조정했습니다.
- 직군·직무, 근무 방식·형태, 급여·기간 단위와 스킬 숙련도를 요구사항의 enum 선택 UI로 정리했습니다.
- 화면 1 필수값이 유효한 경우에만 화면 2로 이동하며 기간 1~24, 경력 최소 1년, 급여 최소 1만원을 검증합니다.
- 화면 1·2 입력값을 같은 탭의 `sessionStorage`에 임시 보관해 이전·다음 이동 후 복원합니다.
- 프로필 사진 JPG·PNG 5MB 이하, 포트폴리오 PDF 100MB 이하를 화면에서 검증합니다.
- 학력·경력·자기소개·약관을 필수 처리하고 등록 후 검토 화면에서 조회·수정할 수 있게 연결했습니다.
- 프로필 등록 API 명세가 없어 실제 서버 저장이나 파일 업로드 요청은 추가하지 않았습니다.

### 실행한 검증

- [x] `npm run lint`
- [x] 변경한 메인·헤더 파일 대상 ESLint
- [x] `git diff --check`
- [x] `npm run build` 앱 컴파일
- [ ] `npm run build` 전체 완료 — 기존 테스트 개발 의존성 모듈 미설치로 TypeScript 단계 실패
- [x] 비로그인 상태 접근 권한 확인 화면 렌더링
- [ ] 로그인 상태 프로필·이력서 브라우저 확인 — 테스트 인증 세션 없음
- [ ] 실제 프로필 등록·파일 업로드 API — API 명세 없음

### 남은 주의사항

- 등록 API가 확정되면 화면 상태를 요청 타입으로 변환하고 로딩·서버 오류·재시도 처리를 연결해야 합니다.
- 현재 개발 환경의 Jest·Testing Library 패키지를 정상 설치한 뒤 전체 build와 관련 컴포넌트 테스트를 다시 실행해야 합니다.

## 2026-08-12 — 클라이언트 프로젝트 관리 테스트 작성

### 작업 요약

- 프로젝트 목록의 기본 탭 조회, 탭 변경, 로딩·빈 상태·오류·재시도 테스트를 작성했습니다.
- 프로젝트 상세의 메타데이터 표시, 탭 전환, 등록 취소와 재조회, 조회 실패 테스트를 작성했습니다.
- 계약 목록의 직무 라벨, 금액·서명 상태, 초안 상세 이동 제한, 빈 상태·재시도 테스트를 작성했습니다.
- 진행 현황의 계약 상태 필터, 계약 상세 링크, 채팅방 이동, 빈 상태·오류 테스트를 작성했습니다.
- 프로젝트·계약 공통 fixture를 두어 테스트 간 데이터를 독립적으로 구성했습니다.

### 실행한 검증

- [x] 관련 테스트 4 suites, 16 tests 통과
- [x] 전체 테스트 8 suites, 37 tests 통과
- [x] `npx tsc --noEmit`
- [x] `npm run lint` — 오류 0건, coverage 산출물의 기존 경고 1건
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 브라우저 및 실제 API 응답 확인

### 남은 주의사항

- 서비스 모듈을 Mock 처리해 실제 프로젝트·계약·채팅 API 응답은 검증하지 않습니다.
- 결제 실행, 계약 전자서명, PDF 다운로드는 이번 테스트 범위에서 제외했습니다.

---

## 2026-08-13 — 프리랜서 내 계약 목록·상세 테스트 작성

### 작업 요약

- 계약 목록의 초기 조회, 상태 탭 변경, 로딩·빈 상태·오류·재시도 테스트를 작성했습니다.
- 계약 카드의 상태별 액션 판정, 서명 링크, DRAFT 상세 이동 제한 테스트를 작성했습니다.
- 착수금 정산 ID가 없을 때 프로젝트 정산 목록에서 결제 가능한 DEPOSIT 건을 찾는 흐름을 검증했습니다.
- 계약 상세의 조건·조항·양측 서명 상태와 서명 진입 조건을 검증했습니다.
- DRAFT 상태의 PDF·서명 제한과 PDF Blob 다운로드를 검증했습니다.
- 계약 없음·권한 없음·잘못된 계약 ID 오류를 검증했습니다.

### 실행한 검증

- [x] 관련 테스트 — 3 suites, 19 tests 통과
- [x] 전체 테스트 — 18 suites, 88 tests 통과
- [x] 변경 파일 ESLint
- [x] `git diff --check`
- [ ] `npx tsc --noEmit` — 사용자 측 코드의 미설치 `lucide-react` import로 실패
- [ ] `npm run build` — TypeScript 선행 오류로 미실행
- [ ] 실제 계약·PDF·정산 API 및 브라우저 확인

### 남은 주의사항

- 서비스 모듈을 Mock 처리해 실제 계약·PDF·정산 응답은 검증하지 않습니다.
- Canvas 기반 서명 작성과 최종 서명 제출은 후속 테스트 범위입니다.

---

## 2026-08-13 — 고객지원 FAQ 챗봇 테스트 작성

### 작업 요약

- 고객지원 메인의 챗봇 이용 한도 성공·실패 표시 테스트를 작성했습니다.
- 챗봇 초기 추천 질문·이용 횟수·대화 이력 조회와 추천 질문 선택 테스트를 작성했습니다.
- 첫 질문과 후속 질문의 `sessionId`, 질문 응답·액션 링크·잔여 횟수 갱신 테스트를 작성했습니다.
- 질문 전송 로딩·중복 방지와 `CB_001` 세션 초기화 재시도 테스트를 작성했습니다.
- `CB_003` 한도 소진과 `CB_004` AI 서버 장애·1:1 문의 연결 테스트를 작성했습니다.
- 초기 조회 실패·재시도와 초기 이용 횟수 소진 상태 테스트를 작성했습니다.

### 실행한 검증

- [x] 챗봇 관련 테스트 — 2 suites, 12 tests 통과
- [x] 변경 파일 ESLint
- [x] `git diff --check`
- [x] 전체 테스트 — 15 suites, 69 tests 통과
- [ ] `npx tsc --noEmit` — 사용자 측 코드의 미설치 `lucide-react` import로 실패
- [ ] `npm run build` — TypeScript 선행 오류로 미실행
- [ ] 실제 챗봇 API 및 브라우저 확인

### 남은 주의사항

- 초기 3개 API는 현재 `Promise.all` 구조라 부분 실패가 아닌 전체 초기 오류로 처리됩니다.
- 프리랜서 프로필의 `변경하기` 검증을 이전 링크에서 현재 인라인 토글 버튼과 `aria-expanded` 검증으로 갱신했습니다.
- 프리랜서 마이페이지 2개 파일의 `lucide-react` 의존성 문제는 이번 챗봇 작업 범위에서 수정하지 않았습니다.

---

## 2026-08-12 — 고객지원 1:1 문의 테스트 작성

### 작업 요약

- 문의 목록의 전체·대기·답변 완료 필터, 페이지 이동, 로딩·빈 상태·오류·재시도 테스트를 작성했습니다.
- 문의 작성의 필수 입력, 글자 수, 확인 모달, 첨부파일 형식 검증과 업로드 후 접수 테스트를 작성했습니다.
- 문의 접수 실패 시 업로드된 파일 정리와 API 오류 안내, 입력 상태 유지 테스트를 작성했습니다.
- 문의 상세의 대기·답변 완료 상태, 첨부파일, 존재하지 않는 문의·소유 권한 오류와 재시도 테스트를 작성했습니다.
- 문의 접수 완료 안내와 목록 이동 링크 테스트를 작성했습니다.

### 실행한 검증

- [x] 관련 테스트 4 suites, 18 tests 통과
- [x] 전체 테스트 12 suites, 55 tests 통과
- [x] `npx tsc --noEmit`
- [x] `npm run lint` — 오류 0건, coverage 산출물의 기존 경고 1건
- [x] `npm run build` — 최초 Google Fonts 네트워크 차단 실패 후 재실행 통과
- [x] `git diff --check`
- [ ] 실제 브라우저 및 실제 API 응답 확인

### 남은 주의사항

- 서비스 모듈을 Mock 처리해 실제 파일 업로드·삭제 및 문의 API 응답은 검증하지 않습니다.
- 관리자 문의 답변 작성과 알림 수신은 이번 테스트 범위에서 제외했습니다.

---

## 2026-08-12 — 프리랜서 내 계약 목록 API 연동

### 작업 요약

- 프리랜서 내 계약 화면의 목업 6건과 프론트 탭 필터를 제거했습니다.
- 전체·서명 대기·진행 중·정산 대기·완료 탭을 각각 `ALL`, `AWAITING_ME`, `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED`로 연결했습니다.
- 공통 `getContracts` 서비스에 `tab`, `page`, `size`, 선택적 `projectId`를 적용하고 클라이언트 프로젝트 계약 조회도 같은 서비스의 `ALL` 탭을 사용하도록 정리했습니다.
- `PageResponse.content`를 서버 순서 그대로 렌더링하고 페이지당 10개 이전·다음 이동, 로딩·오류·빈 상태를 추가했습니다.
- 기존 목록 응답에 확인된 필드만 카드에 표시하고 `DRAFT`는 계약서 준비 중 상태로 상세 이동을 비활성화했습니다.
- 확정된 `clientBusinessField`, `createdAt`, `workStyle`을 카드에 반영하고 왼쪽 뱃지는 `status`만 기준으로 표시하도록 수정했습니다.
- 목록의 `payableSettlementId`로 착수금 상세를 조회하고 결제 API 응답을 완료 화면에 직접 표시하도록 연결했습니다.
- 결제 완료 화면에 프로젝트명·결제 금액·결제수단·결제일시·승인번호·결제 상태를 표시하고, 삭제된 결제수단은 해당 행만 숨깁니다.
- 결제 완료 후 방금 결제한 계약이 누락될 수 있는 진행 중 탭 대신 계약 상세로 돌아가도록 변경했습니다.
- 계약 체결 이후 상태의 상세 화면이 다시 서명 대기로 표시되던 판정 오류를 수정했습니다.
- 계약 상세 화면의 직무·근무 조건 메타 추가 호출을 제거하고 `GET /contracts/{contractId}` 단일 응답으로 상태 뱃지, 서명 카드, 계약 조건, 조항과 특약사항을 렌더링하도록 재구성했습니다.
- PDF는 Blob 응답을 유지하고 계약·권한·PDF 렌더링 오류 코드를 사용자 안내로 분기했습니다.
- 전자서명 확인 모달과 요청 중 중복 제출 방지를 추가하고, 서명 성공 응답 상태에 따라 계약 체결 완료·상대방 대기 완료 화면을 즉시 표시하도록 연결했습니다.
- 서명 화면의 중복 HTML 계약 본문을 제거하고 서버 PDF Blob을 iframe으로 표시해 주요 업무, 계약 금액, 근무 장소와 동적 조항 변경이 자동 반영되도록 수정했습니다.
- 성공보수 결제 모달의 목업 데이터와 종료 안내를 제거하고 정산 상세, 카드 결제수단, 결제 API 및 완료 응답 화면을 연결했습니다.
- 프리랜서 성공보수 결제 완료 화면을 정산 목록 단일 호출 기반으로 구현하고 최종 종료일을 제거했습니다.

### 실행한 검증

- [x] `npm run lint` — 오류 없음, 기존 coverage 산출물 경고 1건
- [x] `npm run test -- --runInBand` — 4 suites, 21 tests 통과
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 로그인 상태 브라우저 확인 — 테스트 인증 세션 없음
- [ ] 실제 계약 목록 성공·오류 응답 확인 — 테스트 인증 세션 없음

### 남은 주의사항

- 목록 카드의 필드 구조는 기존 계약 목록 API 문서 기준이며 실제 네트워크 응답은 미검증입니다.
- 서버가 최신순(`id DESC`)으로 정렬하므로 프론트 정렬을 추가하지 않습니다.

## 2026-08-12 — SVG 시안 기반 클라이언트 마이페이지 디자인 구현

### 작업 요약

- 클라이언트 기본 정보 placeholder를 시안 기반 정보 카드와 비밀번호 변경 진입 카드로 교체했습니다.
- 시안 하단의 골드→다이아 승급 조건과 별점·완료 프로젝트 진행률 안내 표를 추가했습니다.
- 마이페이지 공통 콘텐츠 폭, 사이드바 행 높이, 반응형 배치를 시안에 맞게 조정했습니다.
- 비밀번호 변경을 이메일 인증, 새 비밀번호 설정, 완료의 3단계 UI로 구현했습니다.
- 비밀번호 변경 카드의 단계 표시, 이메일 안내, 인증코드 입력, 비밀번호 입력과 완료 상태를 시안에 맞춰 더 간결한 비율과 시각 위계로 재정비했습니다.
- 비밀번호 입력 표시·숨김 버튼과 인증코드 남은 시간 표시를 추가했습니다.
- 기존 이메일 인증과 비밀번호 변경 API를 유지하고 성공 직후 즉시 이동하지 않고 완료 화면을 표시하도록 변경했습니다.
- 현재 사용자 API에 없는 기업 상세 정보는 임의 데이터로 채우지 않고 `확인 필요`로 표시했습니다.
- 기업 정보 시안 3종을 바탕으로 조회·수정·저장 피드백 화면을 구현했습니다.
- 사업 분야·회사명·직원 수·회사 주소는 수정 가능하고 사업자등록번호·담당자명·업무 이메일은 읽기 전용으로 구분했습니다.
- 기업 프로필 조회·수정 API가 없어 저장 내용은 화면 상태에만 임시 반영하며 토스트 문구에 이를 명시했습니다.
- 기업 정보 카드·버튼·입력 필드를 기존 마이페이지와 회원가입 폼의 크기·모서리·색상 패턴에 맞추고, 직접 작성한 수정 아이콘을 제거했습니다.
- 선택 입력의 화살표는 `public/icons/ChevronDownIcon.svg`를 재사용했습니다.
- 리뷰 관리 시안 2종을 바탕으로 받은 리뷰·작성한 리뷰 탭과 평점 요약, 리뷰 목록, 서비스 이용 후기를 구현했습니다.
- 리뷰 API가 없어 화면 데이터는 별도 목업 상수로 분리했으며 새 아이콘 파일은 추가하지 않았습니다.
- 작성한 리뷰의 `수정 및 삭제 불가` 배지를 프로젝트명 옆으로 이동했습니다.
- 받은 리뷰 평점 요약에서 평균 점수와 별점 정보를 카드 양 끝으로 정렬했습니다.
- 결제 내역 화면을 공통 `ClientMyPageLayout`으로 교체해 다른 마이페이지와 동일한 콘텐츠 폭·제목·사이드바 간격을 적용했습니다.
- 결제수단 시안 3종을 바탕으로 카드·계좌 요약과 각 수정 폼을 구현하고 기존 결제수단 조회 API를 연결했습니다.
- 결제수단 수정 API가 없어 입력 결과는 화면 상태에만 임시 반영하며 전체 카드·계좌번호를 로그나 브라우저 저장소에 저장하지 않습니다.
- 회원탈퇴 시안 4종을 바탕으로 탈퇴 제한 상태, 주의사항 동의, 확인 문구 입력과 완료 단계 모달 UI를 구현했습니다.
- 회원탈퇴 API가 없어 실제 계정 삭제는 수행하지 않고 마지막 단계에서 API 미연동 사실을 안내합니다.
- 클라이언트 마이페이지 사이드바에서 `비밀번호 변경` 메뉴를 제거하고 기본 정보 화면의 변경 진입 버튼은 유지했습니다.

### 실행한 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [x] 비로그인 상태 접근 권한 확인 화면 렌더링
- [ ] 로그인 상태 마이페이지 브라우저 확인 — 테스트 인증 세션 없음
- [ ] 실제 이메일 인증·비밀번호 변경 API — 테스트 계정 없음

### 남은 주의사항

- 기업명·사업자등록번호·사업 분야·직원 수·휴대폰 번호를 제공하는 프로필 API가 확정되면 기본 정보 카드에 연결해야 합니다.
- 등급·별점·완료 프로젝트 수는 현재 시안 값이며 등급 현황 API가 확정되면 실제 응답으로 교체해야 합니다.
- 현재 공용 비밀번호 변경 컴포넌트를 사용하는 프리랜서 화면에도 동일한 단계형 디자인이 적용됩니다.
- 기업 정보 화면의 시안 값은 디자인 확인용이며 프로필 API가 확정되면 조회·수정 요청으로 교체해야 합니다.

### 추가 수정 (같은 날, lint·build 재검증 중 발견)

- `MyPagePasswordChange.tsx`의 비밀번호 검사 규칙이 영문 포함 여부만 확인하고 있어, 프로젝트 확정 정책(대소문자 모두 포함, `NewPasswordForm.tsx`/`SignupPasswordFields.tsx`와 동일)과 달랐습니다. 같은 규칙으로 맞추고 안내 문구도 수정했습니다.
- `npm run lint`, `npm run build` 재실행해 통과를 재확인했습니다.

## 2026-08-12 — 클라이언트 프로젝트 등록 테스트 환경·코드 작성

### 작업 요약

- 수업자료의 `next/jest`, jsdom, `jest-dom`, React Testing Library, `userEvent` 패턴을 프로젝트에 적용했습니다.
- Jest 일반 실행·watch·coverage 스크립트와 TypeScript 경로 별칭 설정을 추가했습니다.
- 프로젝트 등록 폼의 API 요청 변환, 필수값 검증, 예산 단위 변환, 선택값 정규화 단위 테스트를 작성했습니다.
- 프로젝트 등록 Context의 `sessionStorage` 복원·저장·초기화·손상 데이터 복구 테스트를 작성했습니다.
- 등록 안내의 필수 동의와 단계 이동, 최종 확인의 요약·등록 성공·실패·중복 제출 방지 컴포넌트 테스트를 작성했습니다.

### 실행한 검증

- [x] `npm run test -- --runInBand` — 4 suites, 21 tests 통과
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 브라우저 프로젝트 등록 흐름 확인
- [ ] 실제 프로젝트 등록·사전 검수 API 응답 확인

### 남은 주의사항

- 테스트는 서비스 모듈을 Mock 처리하므로 실제 네트워크 응답은 검증하지 않습니다.
- 기본 정보·직군 모집·상세 입력·사전 검수 화면의 세부 상호작용 테스트는 후속 범위입니다.

---

## 2026-08-12 — 공용 FAQ 챗봇 화면 UI 구현

### 작업 요약

- 고객지원의 챗봇 시작 버튼을 `/support/chatbot`에 연결했습니다.
- 초기 안내 메시지, 남은 AI 상담 횟수, 추천 질문과 질문 입력 UI를 구현했습니다.
- 추천 질문 선택 시 입력창에 질문이 채워지도록 처리했습니다.
- 모바일 반응형과 프로젝트 테마 토큰을 적용했습니다.
- 추천 질문, 일일 할당량과 오늘 대화 이력을 진입 시 병렬 조회하도록 API를 연결했습니다.
- 오늘 대화 이력을 사용자 질문·챗봇 답변 말풍선으로 복원하고 마지막 `sessionId`로 후속 질문을 전송합니다.
- 첫 질문은 `sessionId`를 생략하고 응답의 `remainingQuota`로 잔여 횟수를 즉시 갱신합니다.
- 초기 로딩·조회 실패·전송 실패·답변 준비·한도 소진 상태를 처리했습니다.
- 최신 연동 가이드에 따라 답변 `actions[]`의 서버 URL을 그대로 사용하는 이동 버튼을 추가했습니다.
- 서버 공통 action URL이 현재 역할별 라우트와 달라 발생한 404를 action code 기반 `/client/*`·`/freelancer/*` 매핑으로 수정했습니다.
- 챗봇 action 버튼을 답변 말풍선 내부 하단으로 옮기고 남색 브랜드 버튼으로 변경했습니다.
- 첫 질문은 `sessionId: null`로 보내고 `CB_001`·`CB_002` 발생 시 세션을 초기화해 한 번 재시도합니다.
- `CB_004` 오류를 대화 말풍선과 1:1 문의 버튼으로 표시했습니다.
- 질문 전송 즉시 사용자 말풍선을 표시하고, 실패 시 질문을 입력창에 복원하도록 보완했습니다.
- 챗봇 페이지 높이를 뷰포트에 고정하고 푸터를 숨겨 전체 스크롤 없이 대화 영역만 스크롤되도록 보정했습니다.
- 잔여 3회 이하 경고 배너와 0회 입력 차단·1:1 문의 안내를 추가했습니다.
- `CB_003` 한도 소진과 `CB_004` AI 서버 장애를 분리하고, 서버 장애 시 잔여 횟수를 유지합니다.
- 0회 상태의 우측 카운터와 대화 영역 안내를 위험 색상 패널로 보정하고 일일 최대 횟수·초기화·1:1 문의 정보를 표시했습니다.
- 잔여 3회 이하에서 중복 표시되던 큰 경고 배너를 제거하고 우측 상단 카드를 노란 경고 스타일로 대체했습니다.
- 챗봇 대화 목록과 추천 질문·입력 영역 사이에 구분선을 추가했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [x] `npm run build`
- [ ] 클라이언트·프리랜서 로그인 상태 브라우저 확인
- [ ] 모바일·데스크톱 및 라이트·다크 테마 브라우저 확인

### 남은 주의사항

- 실제 로그인 상태의 추천 질문·할당량·대화 이력·질문 전송 응답은 미검증입니다.
- 실제 action 응답을 사용한 역할별 버튼 이동은 브라우저에서 미검증입니다.

### 문의 첨부 업로드 계약 보완

- `purpose=INQUIRY_ATTACHMENT`를 multipart body에서 쿼리 파라미터로 수정했습니다.
- multipart 파트 이름은 `file`로 유지했습니다.
- 허용 확장자·10MB 초과·Content-Type·스토리지 장애 오류 안내를 분리했습니다.
- 실제 파일 업로드 오류 응답은 미검증입니다.

---

## 2026-08-12 — 클라이언트·프리랜서 공통 알림 페이지 구현

### 작업 요약

- 로그인 사용자 역할에 따라 클라이언트 또는 프리랜서 더미 알림을 표시하는 공통 화면을 구현했습니다.
- 개별 알림 클릭 시 읽음 처리 후 관련 프로젝트·협상·계약·채팅 페이지로 이동하도록 연결했습니다.
- 개별 삭제, 모두 읽음, 전체 삭제 확인 모달과 빈 상태를 구현했습니다.
- 모바일·데스크톱 반응형과 라이트·다크 테마 스타일을 적용했습니다.

## 2026-08-12 — 공용 고객지원 페이지 구현

### 작업 요약

- 클라이언트와 프리랜서가 함께 사용하는 `/support` 고객지원 화면을 구현했습니다.
- FAQ 챗봇과 1:1 문의 카드를 공용 컴포넌트로 분리했습니다.
- 프로필 메뉴에서 고객지원 화면으로 이동할 때 드롭다운이 닫히도록 보완했습니다.
- 모바일 반응형과 프로젝트 테마 토큰을 적용했습니다.
- 챗봇 일일 무료 이용 횟수는 한도 조회 API의 `dailyLimit`으로 표시하도록 연동했습니다.
- 한도 조회 중과 실패 시 대체 안내 문구를 표시합니다.
- 카드 설명, 목록과 상단 안내에서 한글 단어가 줄 중간에 분리되지 않도록 줄바꿈을 보정했습니다.
- 고객지원의 `1:1 문의하기` 버튼을 공용 `/support/inquiries` 목록 화면에 연결했습니다.
- 정적 문의 목록과 전체·대기 중·답변 완료 탭 필터, 모바일 대응 UI를 구현했습니다.
- 문의 목록의 정적 샘플을 제거하고 내 문의 목록 API, 상태별 조회와 페이지네이션을 연동했습니다.
- 문의 상세 API를 연동해 본문, 첨부파일, 답변과 답변 대기 상태를 표시합니다.
- 본인 문의가 아니거나 존재하지 않는 문의의 서버 오류 코드를 화면 안내로 분기했습니다.
- 문의 목록과 상세 화면의 콘텐츠 폭, 제목, 버튼, 행 높이와 내부 여백을 줄여 전체 크기를 보정했습니다.
- `/support/inquiries/new` 문의 작성 화면을 추가하고 목록의 새 문의 작성 버튼을 연결했습니다.
- 제목·내용 필수 입력과 최대 길이, 첨부파일 형식·10MB 용량 검증 및 선택 파일 삭제 UI를 구현했습니다.
- 문의 접수 확인 모달을 추가하고 첨부파일 선행 업로드 후 `fileIds`로 문의를 등록하도록 API를 연결했습니다.
- 접수 중 중복 실행을 막고 성공 시 목록 이동, 실패 시 업로드 완료 파일 정리와 오류 안내를 처리했습니다.
- 문의 접수 201 응답 후 `/support/inquiries/complete` 정적 완료 화면으로 이동하도록 변경했습니다.
- 완료 화면의 문의 내역 확인과 목록으로 이동 버튼을 모두 문의 목록에 연결했습니다.
- 문의 목록의 답변 등록일이 `null`이면 `답변 대기중`으로 표시하도록 변경했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [x] `npm run build`
      <<<<<<< HEAD
- [x] 비로그인 접근 시 로그인 화면 이동
- [ ] 로그인 상태 버튼 동작 — 인증 세션이 없어 브라우저에서 미실행
- [ ] 실제 알림 API — 더미 데이터 구현 범위에서 제외

### 남은 주의사항

- 알림 상태는 클라이언트 메모리에만 저장되어 새로고침하면 초기 더미 데이터로 복원됩니다.
- 더미 데이터의 ID와 이동 경로는 실제 API 연동 시 서버 응답 기준으로 교체해야 합니다.

---

## 2026-08-12 — 클라이언트 프리랜서 리뷰 작성 페이지 디자인 구현

### 작업 요약

- 프로젝트 종료 후 클라이언트가 프리랜서와 서비스에 각각 1~5점 별점을 남기는 페이지를 구현했습니다.
- 후기 입력은 선택 사항으로 두고 항목별 500자 제한과 글자 수 표시를 적용했습니다.
- 작성 후 수정·삭제 불가 및 회원가입 동의에 따른 메인 페이지·홍보 활용 가능 안내를 추가했습니다.
- 별점 두 항목을 모두 선택한 경우에만 평가 등록 버튼이 활성화되도록 구현했습니다.
- 성공보수 결제 완료 화면의 `프리랜서 평가하기` 버튼을 리뷰 페이지에 연결했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `tsc --noEmit`
- [x] `git diff --check`
- [x] `npm run build`
- [ ] 로그인 상태 브라우저 화면 확인 — 인증 세션이 없어 로그인 화면으로 이동
- [ ] 실제 리뷰 등록 API — 이번 디자인 작업 범위에서 제외

### 남은 주의사항

- 프로젝트명과 프리랜서명은 API 연동 전 화면 확인용 문구입니다.
- # 평가 등록 버튼은 디자인 상태만 구현했으며 서버 요청은 연결하지 않았습니다.
- [ ] 클라이언트·프리랜서 로그인 상태 실제 화면 확인
- [ ] 라이트·다크 테마 실제 화면 확인

### 남은 주의사항

- FAQ 챗봇 실행 화면은 아직 연결하지 않았습니다.
- 챗봇 한도 API의 실제 로그인 응답은 미검증입니다.
- 문의 목록·상세 API의 실제 로그인 응답은 미검증입니다.
- 문의 작성의 실제 파일 업로드·접수 API 응답은 미검증입니다.
- 완료 화면은 API를 호출하지 않으며 실제 201 응답의 `inquiryId` 전달은 미검증입니다.
  > > > > > > > 30a62b2844372119c20eb86f88b9eaf65a8f896f

---

## 2026-08-11 — 추천 후보·프로필·재추천 결제 흐름 구현

### 작업 요약

- 프로젝트 상세의 추천 후보 탭과 프리랜서 이력서 상세 화면을 구현했습니다.
- 후보 선택·거절 모달·매칭 요청 상태 UI를 추가했습니다.
- 재추천 인원 선택, 비용 확인, 결제수단, 결제 완료, AI 추천 진행 화면을 추가했습니다.
- 재추천 완료 알림과 내부 점수 기준 이하 후보 안내 모달을 추가했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [x] `npm run build`
- [ ] 실제 추천 후보·이력서·결제 API 요청·응답 확인

### 남은 주의사항

- 관련 API가 미정이라 후보 데이터와 사용자 액션은 UI 샘플입니다.

---

## 2026-08-11 — 프로젝트 최종 완료 요약 API 연동

### 작업 요약

- 성공보수 완료 화면의 하드코딩 정산 데이터를 제거했습니다.
- 종료 프로젝트의 등록일, 시작·종료일, 실제 기간, 계약 인원과 프로젝트 예산을 표시합니다.
- 내 정산 목록에서 착수금과 성공보수 수수료를 구분해 표시합니다.
- 완료된 계약의 프리랜서, 직무, 월 급여를 실제 계약 목록으로 표시합니다.
- 작성 리뷰 목록에서 현재 프로젝트 리뷰를 찾아 별점, 내용과 작성일을 표시합니다.
- 프로젝트 확정 인원 이상으로 계약 목록 크기를 요청합니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [ ] 실제 종료 프로젝트·정산·완료 계약·작성 리뷰 응답 — 미검증

---

## 2026-08-11 — 수수료 결제수단 응답 계약 보완

### 작업 요약

- 결제수단 배열에서 `CARD`만 필터링해 수수료 결제 모달에 표시하도록 명확히 했습니다.
- 카드의 서버 `displayName`을 그대로 표시하고 `paymentMethodId`를 결제 요청에 사용합니다.
- 계좌 전용 필드를 응답 타입에 반영하되 수수료 결제 선택지에서는 제외했습니다.
- 결제 버튼 금액은 정산 응답의 `feeAmount`를 사용합니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [ ] 실제 카드·계좌 혼합 응답과 결제 요청 — 미검증

---

## 2026-08-11 — 프로젝트 완료 후 성공보수 결제 연결

### 작업 요약

- 프로젝트 완료 처리 성공 후 성공보수 결제 여부를 묻는 확인 모달을 추가했습니다.
- 완료 응답의 `payableSettlementId`가 있을 때만 성공보수 결제 선택지를 제공합니다.
- 결제를 선택하면 기존 정산·결제수단 모달을 열어 실제 정산 정보를 조회합니다.
- 성공보수 화면에 프로젝트명, 기준 금액, 수수료, 요율, 등급 할인, 최종 금액과 납부 기한을 표시합니다.
- 금액과 수수료는 프론트에서 재계산하지 않고 서버 응답을 사용합니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 프로젝트 완료·성공보수 정산 조회·결제 — 미검증

---

## 2026-08-11 — 클라이언트 계약 진행 현황 API 연동

### 작업 요약

- 진행 현황 탭의 하드코딩 멤버와 프로젝트 정보를 제거했습니다.
- 프로젝트 상세 응답으로 우측 프로젝트 요약과 진행·정산·완료 스텝퍼를 표시합니다.
- 계약 목록과 계약 상세 응답으로 실제 프리랜서, 직무, 급여, 상태와 계약서 링크를 표시합니다.
- 계약의 협상 ID로 채팅방을 조회한 뒤 채팅방 ID를 포함해 채팅 화면으로 이동합니다.
- 로딩·오류·재시도·빈 계약 상태와 채팅 이동 중 중복 클릭 방지를 추가했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 진행 계약·채팅방 조회 및 화면 이동 — 미검증

---

## 2026-08-11 — 계약 전자서명 API 및 캔버스 연동

### 작업 요약

- 계약 상세의 중복 서명 확인 모달을 제거하고 미리보기 화면으로 바로 이동하도록 변경했습니다.
- 미리보기 화면의 전체 더미 계약서를 상세 API의 당사자·조항 데이터로 교체했습니다.
- 마우스와 터치를 지원하는 투명 PNG 전자서명 캔버스를 직접 구현했습니다.
- 캔버스 서명을 필수로 적용한 뒤 서명 파일을 업로드하고 마지막 체결 버튼에서 서명 API를 호출합니다.
- 서명 이미지가 없으면 최종 체결 버튼과 제출 함수를 모두 차단합니다.
- 서명 응답으로 완료 상태를 즉시 갱신하고 한쪽 서명과 양측 체결을 구분합니다.
- 기존 `sessionStorage` 임시 상태와 서명 기한·자동 취소·수정하기 문구를 제거했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 모바일 터치 서명·파일 업로드·계약 서명 — 미검증

---

## 2026-08-11 — 계약 상세 조회 및 PDF API 연동

### 작업 요약

- 계약 상세 페이지의 하드코딩 계약 조건·당사자·조항·서명 상태를 실제 상세 API 응답으로 교체했습니다.
- 서버가 제공하는 `clauses[]` 완성 문장을 파싱 없이 줄바꿈을 유지해 출력합니다.
- 계약 당사자 정보와 클라이언트·프리랜서 서명 진행 상태를 표시합니다.
- `DRAFT` 계약을 최대 20초 동안 폴링하고 서명·PDF 액션을 제한합니다.
- 계약 PDF 바이트를 Blob으로 내려받아 계약번호를 파일명으로 저장합니다.
- 서명 기한, 당사자 이메일과 지급일 등 응답에 없는 하드코딩 정보를 제거했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 로그인 계약 상세·DRAFT 전환·PDF 다운로드 — 미검증

---

## 2026-08-11 — 계약 탭 목록 응답 계약 보완

### 작업 요약

- 계약 목록 타입에 프로젝트 ID, 직무, 양측 서명 여부와 착수금 결제 여부를 반영했습니다.
- 직무 코드는 `/api/v1/codes/job-roles` 라벨 API로 변환합니다.
- 계약 상태, 내 서명 필요 여부와 결제 상태의 우선순위에 따라 카드 배지를 표시합니다.
- 클라이언트 화면의 프리랜서 착수금 미결제 상태를 `프리랜서 결제 대기`로 표시합니다.
- 계약서 준비 중인 `DRAFT` 카드의 상세보기 버튼을 비활성화했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [ ] 실제 로그인 계약 목록 응답 — 미검증

---

## 2026-08-11 — 프로젝트 추천 후보 더미 화면 구현

### 작업 요약

- 프로젝트 상세의 추천 후보 탭에 포지션 선택과 후보 카드 화면을 추가했습니다.
- 매칭 요청·추천 거절 확인 모달, 완료 알림, 프로필 확인 모달을 연결했습니다.
- 거절 횟수에 따라 저적합 후보 포함 가능성과 마지막 추천 안내가 표시되도록 구현했습니다.
- 제공된 SVG 디자인의 색상, 카드, 안내 배너, 버튼 구성을 기존 프로젝트 테마에 맞춰 반영했습니다.
- 데스크톱 3열·태블릿 2열·모바일 1열로 후보 카드 배치를 조정하고 더미 후보를 3명으로 구성했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [ ] 실제 프로젝트 상세 화면 브라우저 확인 — 로그인·API 응답 필요

---

## 2026-08-11 — 인증 연동 미구현 항목 보완

### 작업 요약

- Access Token 만료 시 refresh 요청을 한 번만 공유하고 기존 요청을 1회 재시도하도록 구현했습니다.
- 세션 만료·다른 기기 로그인 모달과 보호 경로·역할·임시 비밀번호 가드를 추가했습니다.
- 역할별 마이페이지에 이메일 인증 기반 비밀번호 변경 화면을 추가했습니다.
- 푸터 약관·개인정보 처리방침 조회 화면과 세부 인증 오류 처리를 보완했습니다.

### 실행한 검증

- [x] `npx next typegen`
- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [x] `npm run build`
- [ ] 실제 인증 API 요청·응답 확인

---

## 2026-08-11 — 프로젝트 상세 계약 목록 API 연동

### 작업 요약

- 프로젝트 상세 계약 탭의 하드코딩 계약 목록을 제거했습니다.
- `GET /api/v1/contracts` 페이지 응답 타입과 서비스 함수를 추가했습니다.
- 계약 번호, 상대방, 기간, 총액, 급여 단위·금액, 내 서명 필요 여부를 응답 데이터로 표시합니다.
- 로딩·오류와 재시도·빈 목록 상태를 추가했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npx tsc --noEmit`
- [x] `git diff --check`
- [ ] 실제 로그인 계약 목록 응답 — 미검증
- [ ] `projectId` 필터 지원 여부 — 확인 필요

---

## 2026-08-11 — 초기 테마 스크립트 React 경고 수정

### 작업 요약

- RootLayout의 일반 `script` 태그를 Next.js `Script`의 `beforeInteractive` 방식으로 변경했습니다.
- 초기 테마 스크립트를 루트 `head` 안에 배치해 hydration 중 script 태그 오류를 제거했습니다.
- 저장 테마 또는 시스템 테마를 클라이언트 인터랙션 전에 적용하는 기존 동작을 유지했습니다.

### 실행한 검증

- [x] 변경 파일 ESLint
- [x] `npm run build`
- [x] `git diff --check`
- [x] `/login` 브라우저 콘솔에서 script·hydration 오류 미발생 확인
- [x] `documentElement`의 `data-theme`과 `color-scheme` 초기 적용 확인

### 남은 주의사항

- Pairing 로고 이미지의 가로·세로 비율 관련 기존 경고는 별도 작업이 필요합니다.

---

## 2026-08-11 — 모집 직군 추가 버튼 분리

### 작업 요약

- 모집 직군 추가 버튼의 상단 테두리와 전체 모서리를 복원하고 위쪽 간격을 추가해 포지션 카드와 완전히 분리된 독립 박스로 변경했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-11 — 프로젝트 목록 바깥 여백 조정

### 작업 요약

- 내 프로젝트 목록 컨테이너의 최대 너비를 줄이고 좌우 패딩을 늘려 카드가 과도하게 넓어 보이지 않도록 조정했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-11 — 프로젝트 목록 단일 열 복원

### 작업 요약

- 내 프로젝트 목록을 2열 그리드에서 한 줄에 카드 하나인 단일 열로 되돌렸습니다.
- compact 카드 스타일은 유지하면서 카드 높이를 줄이고 프로젝트 정보는 넓은 화면에서 4열로 배치했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-11 — 프로젝트 등록·목록 UI 밀도 개선

### 작업 요약

- 프로젝트 등록 위저드의 공통 너비, 카드 여백, 스텝퍼와 단계별 상단 간격을 축소했습니다.
- 상세 입력 textarea와 직군 모집 카드 간격을 줄여 전체 세로 길이를 완화했습니다.
- 내 프로젝트 목록을 모바일 1열·데스크톱 2열 그리드로 변경했습니다.
- 프로젝트 카드를 낮은 2열형 구조에 맞게 제목, 상태, 태그, 프로젝트 정보와 액션 영역으로 재배치했습니다.
- 긴 제목·직무는 말줄임 처리하고 스킬은 최대 3개와 초과 개수 `+N`으로 표시합니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 및 반응형 화면 확인 — 미검증
- [ ] `npm run build` — 미실행

## 2026-08-10 — 프로젝트 등록 완료 응답 복원

### 작업 요약

- 프로젝트 등록 성공 응답이 Context 메모리에만 있어 라우트 이동 중 Provider 재마운트 시 사라지던 문제를 수정했습니다.
- 등록 응답을 `sessionStorage`에 저장하고 완료 페이지 진입 시 복원하도록 변경했습니다.
- 완료 화면에서 다른 페이지로 이동할 때 폼 초안과 등록 결과 저장값을 함께 제거합니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 실제 프로젝트 등록 후 완료 화면 이동 — 미검증

## 2026-08-10 — 역할별 접근 권한 및 403 화면 구현

### 작업 요약

- 기존 404 페이지와 동일한 레이아웃·스타일의 `/forbidden` 화면을 추가하고 역할에 맞는 홈 이동 버튼을 제공했습니다.
- 공통 `RoleGuard`를 추가해 `/client/*`는 `CLIENT`, `/freelancer/*`는 `FREELANCER`만 접근하도록 처리했습니다.
- 비로그인 401은 `returnUrl`을 포함한 로그인 화면, 역할 불일치는 403 화면, 네트워크·서버 오류는 재시도 화면으로 분리했습니다.
- 루트 권한 가드가 모든 경로 변경을 감지하도록 구성해, App Router에 이전 레이아웃이 캐시된 경우에도 역할을 다시 검증합니다.
- 상위 클라이언트 레이아웃과 중복되던 프로젝트 등록 전용 역할 가드를 제거했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 로그인 계정별 브라우저 확인
- [ ] 실제 백엔드 401·역할별 응답 확인

---

## 2026-08-10 — 전역 다크모드 테마 기반 및 기존 화면 적용

### 작업 요약

- 별도 라이브러리 없이 `light`, `dark`, `system` 테마를 제공하는 전역 ThemeProvider를 구현했습니다.
- 초기 렌더링 전에 저장 테마를 적용해 라이트 화면이 잠깐 표시되는 현상을 방지했습니다.
- Tailwind v4에서 사용하는 배경·표면·텍스트·테두리·브랜드·오류·경고·성공 의미 기반 토큰을 정의했습니다.
- 공용 및 인증 헤더에 테마 선택 UI를 추가하고 테마에 따라 로고를 자동 교체합니다.
- 공통 레이아웃·헤더·모달·상태 화면과 기존 도메인 화면의 중립·브랜드·상태 색상을 토큰으로 전환했습니다.
- 팀원과 AI가 동일한 토큰·검증 기준을 사용하도록 `docs/ai/dark-mode-guide.md`를 추가했습니다.

### 실행한 검증

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [x] 브라우저 라이트·다크 전환 및 페이지 이동 후 유지 확인
- [x] 로그인·403 화면 테마 확인
- [ ] 로그인 후 클라이언트·프리랜서 전체 화면 육안 확인

---

## 2026-08-10 — 프로젝트 페이지 Suspense 빌드 오류 수정

### 작업 요약

- `useSearchParams`를 사용하는 프로젝트 목록과 상세 클라이언트 컴포넌트를 페이지 `Suspense` 경계로 감쌌습니다.
- 정적 렌더링 중 CSR bailout으로 발생하던 Next.js 빌드 오류를 수정했습니다.
- 목록과 상세 각각의 로딩 fallback을 추가했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [x] `npm run build`

## 2026-08-10 — 인증 페이지 빌드 오류 수정 및 기업 주소 추가

### 작업 요약

- 로그인과 비밀번호 재설정 페이지의 `useSearchParams` 사용 영역에 `Suspense` 경계를 추가했습니다.
- 클라이언트 기업 정보 단계에 필수 주소 입력칸과 최대 255자 제한을 추가했습니다.
- 가입 요청 타입과 변환 함수에 `address`를 추가하고 앞뒤 공백을 제거해 전송하도록 했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npm run build`
- [x] `git diff --check`
- [ ] 실제 가입 API 요청·응답 확인

---

## 2026-08-10 — 프로젝트 상세 헤더 레이아웃 보정

### 작업 요약

- 상세 API 데이터 적용 후 과도하게 벌어진 목록 이동 링크와 제목 사이 여백을 줄였습니다.
- 제목·상태 배지 크기와 정렬을 보정하고 긴 제목이 레이아웃을 밀지 않도록 줄바꿈을 적용했습니다.
- 등록일·시작 희망일·기간·모집 인원이 화면 폭에 따라 자연스럽게 줄바꿈되도록 변경했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-10 — 클라이언트 프로젝트 상세 API 연동

### 작업 요약

- 프로젝트 상세의 제목, 상태, 기본 정보, 포지션, 첨부, 연장 횟수와 모집 마감일을 상세 조회 응답으로 교체했습니다.
- 프리랜서 현황을 프로젝트 상세 응답에서 찾지 않고 프로젝트 ID가 포함된 매칭 요청 API로 별도 조회했습니다.
- 직무·스킬·근무 방식 코드를 메타 API 라벨로 변환했습니다.
- 서버 상태에 따라 수정·등록 취소·모집 연장·모집 종료·프로젝트 완료·결제 메뉴를 구분했습니다.
- 등록 취소, 모집 연장, 모집 종료, 프로젝트 완료 API를 연결하고 성공 후 상세를 재조회합니다.
- 착수금과 성공보수 결제를 `payableSettlementId` 기준으로 기존 실제 결제 모달에 연결했습니다.
- 모집 마감일이 없으면 숨기고 연장 횟수가 2회 이상이면 연장 버튼을 비활성화했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 상세·매칭·상태 변경·결제 API — 미검증
- [ ] 프로젝트 수정 PUT — 수정 폼 미연결
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-10 — 프로젝트 상세 모집 종료 메뉴 추가

### 작업 요약

- 프로젝트 상세 `···` 관리 메뉴에 모집 종료 항목을 추가했습니다.
- 등록 취소는 등록 완료·착수금 결제 전, 모집 종료는 모집 중 상태에서만 표시되도록 분리했습니다.
- 모집 종료 확인 모달을 추가했으며 실제 종료 API 호출은 상세 API 연동 작업으로 남겼습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-10 — 프로젝트 상세 프리랜서 목록 UI 개선

### 작업 요약

- 프리랜서 현황 행을 큰 원형 이니셜, 이름·상태 배지, 직무 정보 구조로 조정했습니다.
- 상태 배지를 카드 오른쪽에서 프리랜서 이름 옆으로 이동했습니다.
- 협상 중인 프리랜서에만 카드 오른쪽 `협상 하기` 버튼을 표시했습니다.
- 행 높이, 간격, 배지와 버튼 크기를 전달받은 참고 화면에 맞게 조정했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-10 — 프로젝트 상세 관리 메뉴 UI 개선

### 작업 요약

- 프로젝트 상세 헤더에 이전 목록 탭으로 돌아가는 버튼을 명확하게 표시했습니다.
- 기본 정보 카드에 직접 노출되던 관리 버튼을 제거하고 `···` 드롭다운 메뉴로 이동했습니다.
- 드롭다운에 열림·닫힘 전환 효과, 외부 클릭 및 Escape 닫기를 적용했습니다.
- 등록 완료 상태이면서 착수금 결제 전인 프로젝트에만 `등록 취소` 메뉴가 표시되도록 처리했습니다.
- 등록 취소 확인 모달을 추가했으며 실제 취소 API 호출은 상세 API 연동 작업으로 남겼습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`
- [ ] 브라우저 UI 확인 — 미검증

## 2026-08-10 — 내 프로젝트 nullable 날짜 오류 수정

### 작업 요약

- 실제 목록 응답의 `startDesiredDate` 또는 `createdAt`이 `null`일 때 날짜 포맷에서 발생하던 런타임 오류를 수정했습니다.
- 날짜 값이 없으면 카드에 `-`를 표시하도록 처리했습니다.

### 실행한 검증

- [x] 변경 파일 대상 ESLint
- [x] `npx tsc --noEmit`

## 2026-08-10 — 클라이언트 내 프로젝트 목록 API 연동

### 작업 요약

- 내 프로젝트 화면의 탭별 목데이터를 제거하고 `GET /api/v1/projects/mine` 페이지 응답을 연결했습니다.
- 등록 완료, 매칭 중, 진행 중, 완료 대기, 종료, 취소됨 6개 탭과 URL 쿼리를 동기화했습니다.
- 서버 상태 코드 배지, 직무·스킬 라벨, 금액·날짜·인원 표시를 응답 필드 기준으로 변환했습니다.
- 목록 로딩·빈 상태·오류 재시도와 이전·다음 페이지 이동을 추가했습니다.
- 진행 중 프로젝트의 완료 API를 연결하고 성공 시 완료 대기 탭으로 이동하도록 처리했습니다.
- 정산 ID가 있는 카드만 착수금 또는 성공보수 결제 버튼을 표시하고 기존 실제 결제 모달을 재사용했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 탭별 목록·페이지네이션·완료·결제 API — 미검증
- [ ] 브라우저 화면 확인 — 미검증

## 2026-08-10 — 백엔드 프로젝트 연동 계약 문서 보관

### 작업 요약

- 백엔드 팀이 전달한 프로젝트 등록·결제·목록·상세 전체 연동 가이드를 `docs/api/frontend-project-integration.md`에 원본 보관했습니다.
- `.ai/API.md`에는 전체 계약을 중복하지 않고 실제 프론트 연동 및 검증 상태만 기록하도록 역할을 구분했습니다.
- `.ai/STATE.md`에 프로젝트 도메인 기준 문서 위치를 반영했습니다.

### 실행한 검증

- [x] 원본 문서와 저장된 문서의 내용 일치 확인
- [x] 문서 내부 상대 링크와 참조 대상 확인
- [ ] 코드 및 실제 API 동작 검증 — 문서 정리 작업으로 실행하지 않음

## 2026-08-10 — 결제 완료 페이지 이동 경합 수정

### 작업 요약

- 결제 성공 시 등록 응답을 먼저 초기화해 내 프로젝트 목록으로 리다이렉트되던 경합을 수정했습니다.
- 등록 완료 화면을 떠날 때는 작성 중 폼과 세션 저장값만 삭제하고, 등록 응답은 현재 화면이 언마운트될 때까지 유지합니다.
- 결제 응답의 프로젝트 ID가 포함된 결제 완료 페이지 이동이 우선 실행됩니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 결제 완료 페이지 프로젝트 상태 연동

### 작업 요약

- 결제 성공 시 정산 응답의 `projectId`를 결제 완료 URL에 전달합니다.
- 결제 완료 화면에서 프로젝트 상세 API를 호출해 최신 상태를 표시합니다.
- `MATCHING` 상태를 `모집 중`으로 변환해 표시합니다.
- 프로젝트 상태 조회 실패 시 결제 성공 사실은 유지하면서 오류와 내 프로젝트 이동 버튼을 제공합니다.
- 내 프로젝트 보기 버튼을 매칭 탭 쿼리가 포함된 경로로 연결했습니다.
- 결과를 사용하지 않던 결제 직후 상세 조회와 미사용 목록 조회 export를 정리했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 결제 성공 후 상태 조회와 매칭 탭 이동 — 미검증

---

## 2026-08-10 — 착수금 정산 결제 API 연동

### 작업 요약

- 등록 완료 응답의 `payableSettlementId`로 결제 모달을 실제 API 모드로 실행합니다.
- 모달을 열 때 정산 건과 로그인 계정 결제수단을 함께 조회합니다.
- 결제수단에서 카드만 필터링하고 단일 카드의 `displayName`을 그대로 표시합니다.
- 서버 `feeAmount`를 결제 요약과 버튼 금액에 사용하고 `payable`에 따라 결제 가능 여부를 제어합니다.
- 카드의 `paymentMethodId`로 결제를 실행하고 PAID·FAILED 결과를 분기합니다.
- 결제 성공 후 프로젝트 상세를 재조회하고 결제 완료 화면으로 이동합니다.
- 결제 중 중복 요청과 모달 닫기를 방지합니다.
- 정산 ID가 null이면 착수금 결제 버튼을 숨깁니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 정산·결제수단·결제 API 및 브라우저 확인 — 미검증

---

## 2026-08-10 — 프로젝트 예산 범위 안내 개선

### 작업 요약

- API 최대 10억원을 화면 만원 단위 `100,000만원`으로 명확히 표시했습니다.
- 예산이 500만원 미만 또는 100,000만원 초과일 때 필드 아래에 오류를 표시합니다.
- 예산 오류만 있는 경우 다음 버튼을 비활성화하지 않고, 클릭하면 오류를 안내하며 단계 이동은 중단합니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 프로젝트 등록 폼 세션 복원

### 작업 요약

- 프로젝트 등록 위저드 전체 상태를 탭 단위 `sessionStorage`에 저장합니다.
- 다른 페이지로 이동한 뒤 등록 화면으로 돌아오면 저장된 폼을 먼저 복원하고 단계를 렌더링합니다.
- 등록 완료 또는 등록 취소 시 Context와 세션 저장값을 함께 삭제합니다.
- 파싱할 수 없는 저장값은 제거하고 빈 폼으로 안전하게 시작합니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 요구 스킬 연속 선택 수정

### 작업 요약

- 스킬을 하나 선택한 뒤 자동완성 목록이 닫혀 추가 선택할 수 없던 문제를 수정했습니다.
- 스킬 선택 후 목록을 열린 상태로 유지해 여러 스킬을 연속 선택할 수 있습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 시작 희망일과 협의 가능 독립 처리

### 작업 요약

- 시작 희망일을 협의 가능 여부와 관계없이 필수로 변경했습니다.
- 협의 가능 체크 시 날짜를 비우거나 날짜 입력을 비활성화하던 동작을 제거했습니다.
- 최종 등록 요청에 날짜 입력의 `YYYY-MM-DD` 문자열을 그대로 전송합니다.
- Step 2 날짜 필드에 협의 가능 여부와 관계없이 필수라는 안내를 상시 표시하고 미입력 시 다음 단계 진행을 막습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 등록 완료 모집 포지션 라벨 표시

### 작업 요약

- 등록 완료 응답의 포지션에서 직무 코드보다 직무 라벨을 우선 표시하도록 수정했습니다.
- 응답의 `jobRoleLabel`, `jobRoleName`, `label`, `jobRole.label` 형태를 모두 지원합니다.
- 응답 라벨이 없으면 Step 3에서 저장한 직무 코드·라벨 매핑으로 표시합니다.
- 모집 인원 표기를 `×1` 대신 `1명` 형식으로 변경했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 프로젝트 시작 희망일 단계별 검증

### 작업 요약

- Step 2 날짜 입력의 최소값을 사용자 로컬 날짜 기준 오늘로 설정했습니다.
- 과거 날짜에는 필드 바로 아래 오류를 표시하고 다음 단계 진행을 차단합니다.
- 날짜를 선택하지 않으려면 기존 시작일 협의 가능 옵션을 사용할 수 있습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint

---

## 2026-08-10 — 프로젝트 등록 완료 응답 연동

### 작업 요약

- 등록 성공 응답 `ProjectResponse`를 Context에 저장하도록 변경했습니다.
- 완료 화면의 프로젝트명·기간·예산·시작일·상태·모집 포지션을 입력 상태가 아닌 서버 응답으로 표시합니다.
- 상세보기 버튼을 응답의 `projectId`를 사용하는 동적 상세 경로로 연결했습니다.
- 착수금 결제 모달에 `payableSettlementId`를 전달하도록 결제 요약 타입을 확장했습니다.
- 내 프로젝트 목록과 프로젝트 상세 조회 서비스를 추가했습니다.
- 등록 응답 없이 완료 URL에 직접 접근하면 내 프로젝트 목록으로 이동합니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 등록 응답·목록·상세 조회 및 결제 모달 — 미검증

### 확인 필요

- 결제 모달 내부에서 호출할 착수금 결제 API 계약은 제공되지 않았습니다.
- `jobRole`이 코드로 응답된다면 완료 화면의 한글 라벨 필드 또는 변환 계약 확인이 필요합니다.

---

## 2026-08-10 — 프로젝트 최종 등록 API 연동

### 작업 요약

- Step 6 등록 버튼을 `POST /api/v1/projects`에 연결했습니다.
- Step 1~4의 누적 상태를 기본정보·포지션·상세정보·첨부 파일 ID를 포함한 요청 본문으로 변환합니다.
- 예산을 만원에서 원 단위로 변환하고 빈 선택 상세 필드는 null로 전송합니다.
- 제출 중 중복 클릭을 막고 실패 시 서버 메시지와 기존 입력 상태를 유지합니다.
- 성공 시에만 프로젝트 등록 완료 화면으로 이동합니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 최종 등록 API 성공·실패 응답 — 미검증

### 확인 필요

- Step 3 최종 등록 요청의 경력 필드는 서버 검증 결과에 따라 `minCareerYears`로 수정했습니다.
- 성공 응답 구조는 아직 제공되지 않아 화면에서 사용하지 않습니다.

---

## 2026-08-10 — 프로젝트 상세정보 및 첨부파일 API 연동

### 작업 요약

- Step 4 필드를 `currentSituation`, `mainTask`, `detailScope`, `extraNote` 서버 계약명으로 상태에 저장합니다.
- 필수·선택 조건과 각 필드 최대 1,500자 제한을 적용했습니다.
- 프로젝트 파일 multipart 업로드와 X 버튼 삭제 API를 연결했습니다.
- PDF/JPG/JPEG/PNG, 파일당 100MB, 최대 10개를 프론트에서도 검증합니다.
- 업로드 응답의 파일 ID·원본명·크기를 Context에 보관하고 실제 파일 목록과 크기를 표시합니다.
- FormData 요청에는 브라우저가 multipart boundary를 설정하도록 공통 API 클라이언트를 보완했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 파일 업로드·삭제 및 브라우저 드래그 앤 드롭 확인 — 미검증

---

## 2026-08-10 — 프로젝트 직군별 모집 조건 메타 연동

### 작업 요약

- Step 3 진입 시 직군·직무·스킬 메타 API를 각각 한 번 조회하도록 연결했습니다.
- 직무 목록을 `parentCode`로 선택 직군에 맞게 필터링했습니다.
- 스킬 전체 목록을 클라이언트에서 검색하고 선택하는 자동완성을 구현했습니다.
- 직군·직무·스킬은 서버 코드를 상태와 API 요청에 저장하고 화면에는 라벨을 표시합니다.
- 경력·모집 인원 1~50, 스킬 1~63개, 포지션 1~100건 제약을 적용했습니다.
- 사전 검수 요청의 스킬도 자유 입력 라벨 대신 서버 코드 배열로 전송되도록 변경했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 실제 메타 API 및 브라우저 자동완성 확인 — 미검증

---

## 2026-08-10 — 프로젝트 기본 정보 선택지 API 연동

### 작업 요약

- Step 2 진입 시 `GET /api/v1/meta/work-conditions`를 한 번 호출하도록 연결했습니다.
- 근무 방식, 근무 형태, 기간 단위를 서버의 코드·라벨 선택지로 렌더링합니다.
- 기간 값과 단위 코드를 분리해 상태에 보관하고 최종 확인 화면에는 서버 라벨을 표시합니다.
- 선택지 조회 실패 안내와 다시 시도 동작을 추가했습니다.
- 화면 예산은 만원 단위로 유지하고 Step 6 요청에서 원 단위로 변환하는 계약을 문서화했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 ESLint — 오류 없음, 기존 미사용 코드 warning 4건
- [ ] 실제 선택지 API 및 브라우저 확인 — 미검증

---

## 2026-08-10 — 프로젝트 사전 검수 API 연동

### 작업 요약

- Step 3의 직무·모집 인원·요구 스킬만 `POST /api/v1/projects/pre-review` 요청으로 변환했습니다.
- 직무 메타를 조회해 화면 라벨을 서버 `jobRole` 코드로 변환하고 결과 카드 제목을 다시 라벨로 표시했습니다.
- 서버의 `notice`, `allMatchable`, `items`를 사용해 결과 화면과 버튼을 분기했습니다.
- 동일 직무의 중복 포지션을 합치지 않고 `positionIndex`로 요청 순서에 매핑했습니다.
- 등록 수정 안내, 입력 유지, 등록 취소 확인 및 폼 폐기, Step 6 이동을 연결했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 브라우저 확인 — 미실행
- [ ] 실제 사전 검수 API와 직무 메타 응답 — 미검증

---

## 2026-08-10 — 프로젝트 등록 안내 동의 및 역할 제한 연동

### 작업 요약

- 프로젝트 등록 Step 1의 필수 동의값을 서버 계약명 `noticeAgreed`로 Context에 저장해 위저드 Step 6까지 유지하도록 변경했습니다.
- 이전 단계로 돌아와도 안내 동의 체크 상태가 유지되도록 기존 로컬 상태를 제거했습니다.
- `/client/projects/new/*` 공통 레이아웃에 역할 가드를 추가해 `CLIENT`만 등록 화면을 렌더링하도록 했습니다.
- `FREELANCER`는 `/freelancer`, 인증 조회 실패 사용자는 `/login`으로 이동하도록 처리했습니다.
- `POST /api/v1/projects`의 안내 동의 계약과 오류 조건을 `.ai/API.md`에 기록했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] 브라우저 역할별 직접 URL 접근 확인 — 테스트 로그인 계정 없이 미실행
- [ ] 실제 프로젝트 등록 API — 전체 요청 스키마 미확인으로 미연동·미검증

### 남은 확인

- 프로젝트 등록 요청의 나머지 필드와 성공 응답 계약을 확인한 뒤 Step 6 POST 요청에 `noticeAgreed`를 포함해야 합니다.

---

## 2026-08-10 — 공통 채팅 화면 구현

### 작업 요약

- 역할별 헤더의 기존 채팅 링크가 이동하는 `/chat` 화면을 시안에 맞춰 구현했습니다.
- 협상 완료 요약, 대화 목록, 채팅방 헤더, 메시지 말풍선과 입력 영역을 기능 컴포넌트로 분리했습니다.
- 대화 선택과 목업 메시지 전송 동작을 추가했습니다.
- `/chat/page.tsx`는 기능 컴포넌트를 import하고 렌더링하는 역할만 담당합니다.
- 채팅 전용 레이아웃에서 로그인 사용자 역할에 맞는 공통 헤더를 표시하고 공통 푸터는 숨겼습니다.

### 실행한 검증

- [x] `npx next typegen`
- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [ ] `npm run build` — 실행 환경에서 Google Fonts에 연결할 수 없어 실패
- [ ] 브라우저 화면 확인 — 미실행
- [ ] 실제 채팅 API — API 명세 미확인으로 미연동

### 남은 확인

- 실제 대화 목록, 메시지 송수신, 협상 요약 API와 실시간 통신 방식을 확인해야 합니다.

---

## 2026-08-09 — 프리랜서 내 계약 페이지 구현

### 작업 요약

- 프리랜서 내 계약 페이지를 페이지·기능 컴포넌트·탭·카드 구조로 구현했습니다.
- 전체·서명 대기·진행 중·정산 대기·완료 상태 필터와 하드코딩 계약 6건을 추가했습니다.
- 계약 상태와 수수료 상태에 따른 배지, 안내 문구 및 액션 버튼을 구성했습니다.
- 기존 공통 결제 모달과 완료 컴포넌트를 재사용해 착수금 수수료 결제 흐름을 연결했습니다.
- 클라이언트 하위의 계약 개요·문서·서명·완료 컴포넌트를 `features/contract` 공통 기능으로 이동했습니다.
- 역할별 경로와 세션 상태를 분리하고 프리랜서 계약 확인 및 전자 서명 흐름을 연결했습니다.
- 프리랜서 내 계약의 서명 버튼이 계약서 서명 화면으로 바로 이동하도록 경로를 조정했습니다.
- 성공보수 결제 모달과 화면 모델을 공통화하고 클라이언트·프리랜서 양쪽에 연결했습니다.
- 성공보수 결제 완료 화면을 최종 정산 요약, 계약서 다운로드, 역할별 평가 액션 구조로 통일했습니다.
- 착수금과 성공보수 결제 버튼에 공통 결제 확인 모달을 추가했습니다.
- 결제 확인을 취소하면 결제 수단 화면을 유지하고, 확인한 경우에만 완료 처리하도록 구성했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [x] 브라우저 화면 확인 — 결제 모달, 210,000원 결제, 완료 화면 및 계약 목록 복귀 확인
- [x] 브라우저 화면 확인 — 클라이언트 공통 계약 화면 및 프리랜서 서명 전체 흐름, 콘솔 오류 없음
- [x] 브라우저 화면 확인 — 양 역할 성공보수 모달·완료 화면·평가 버튼 및 콘솔 오류 없음

---

## 2026-08-09 — 프리랜서 내 프로젝트 페이지 구현

### 작업 요약

- 클라이언트 내 프로젝트와 동일한 페이지·기능 컴포넌트 구조로 프리랜서 프로젝트 제안 화면을 추가했습니다.
- 전체·검토 중·협상 중·종료됨 탭과 상태별 하드코딩 프로젝트 카드를 구현했습니다.
- AI 매칭률, 협상 조건, 마감 및 거절 상태, 상태별 버튼 UI를 시안에 맞춰 구성했습니다.
- 페이지 폭과 카드 내부 여백·글자·버튼 크기를 줄여 화면 밀도를 조정했습니다.
- 전체·검토 중·협상 중·종료됨 탭에서 각각 4·1·1·2개 카드가 표시되도록 확인했습니다.
- 상세보기 클릭 시 프로젝트별 상세 화면으로 이동하도록 동적 라우트를 추가했습니다.
- 목록과 상세 화면의 거절 버튼에 공통 확인 모달과 완료 안내 모달을 연결했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [x] 브라우저 화면 확인 — 상세 이동, 목록·상세 거절 모달, 완료 안내 및 콘솔 오류 없음

---

## 2026-08-09 — 역할별 헤더 로그인 사용자 정보 연결

### 작업 요약

- `GET /api/v1/auth/me` 서비스와 헤더용 조회 hook을 추가했습니다.
- 로그인 사용자의 실제 역할과 이름을 클라이언트·프리랜서 헤더에 표시합니다.
- 프로필 아이콘은 이름 첫 글자를 사용하고 하드코딩된 이름·알림 숫자를 제거했습니다.
- 헤더 외의 페이지 본문과 기능은 변경하지 않았습니다.
- 프로필 메뉴의 로그아웃 버튼을 실제 API와 연결하고 중복 클릭을 방지했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로그인된 백엔드 환경에서 미검증

---

## 2026-08-09 — 프리랜서 소셜 로그인·회원가입 API 연결

### 작업 요약

- 카카오·구글 인증 화면 URL을 조회하는 타입과 서비스 함수를 추가했습니다.
- 프리랜서 로그인 화면의 소셜 버튼에 API 호출과 외부 인증 화면 이동을 연결했습니다.
- 요청 중 중복 클릭 방지, 실패 메시지, 앱 내부 `returnUrl` 검증을 추가했습니다.
- `/login/social/callback`에서 `code`, `state`를 백엔드에 전달하도록 구현했습니다.
- 기존 회원 로그인과 신규 회원 추가가입 응답을 분기했습니다.
- 가입 티켓은 URL이나 브라우저 저장소에 남기지 않고 메모리에만 보관합니다.
- 소셜 추가가입 화면의 목업 이메일·이름을 실제 콜백 정보로 교체했습니다.
- 소셜 프리랜서 최종 가입 API와 성공 후 프리랜서 홈 이동을 연결했습니다.
- 가입 티켓이 없을 때 소셜 로그인을 다시 시작하도록 안내합니다.
- 회원가입 역할 선택 화면의 카카오·구글 아이콘을 실제 인증 버튼으로 연결했습니다.
- 로그인과 회원가입에서 사용하는 인증 시작 로직을 공통 hook으로 정리하고 소셜 아이콘 크기를 키웠습니다.
- 공급자별 OAuth 설정에 맞춰 `/oauth/callback/google`, `/oauth/callback/kakao` 콜백 경로를 추가했습니다.
- 콜백 처리를 브라우저 전용 컴포넌트로 분리해 SSR의 `window is not defined` 오류를 수정했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] `npx next typegen`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 OAuth/API — 백엔드 및 공급자 설정 미확인으로 미검증

### 남은 확인

- 백엔드 OAuth Redirect URI와 실제 카카오·구글 인증 흐름을 확인합니다.

---

## 2026-08-09 — 회원가입 API 코드 정리

### 작업 요약

- 중복 확인과 가입 요청에 반복되던 숫자 정규화 함수를 공통 유틸로 이동했습니다.
- 클라이언트와 일반 프리랜서 위저드의 제출 로딩·오류 처리를 공통 hook으로 정리했습니다.
- API 연동 전 상태를 설명하던 오래된 주석을 현재 동작에 맞게 수정했습니다.
- 역할별 위저드 단계와 소셜 가입 흐름은 변경하지 않았습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] `npx eslint src/features/auth`
- [x] `git diff --check`
- [ ] 실제 화면·API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 일반 회원가입 제출 API 연결

### 작업 요약

- 클라이언트와 일반 프리랜서의 최종 회원가입 서비스를 추가했습니다.
- 단계별 폼 상태를 백엔드 요청 구조로 변환하는 함수를 분리했습니다.
- 숫자 필드, 생년월일, 카드·계좌, 선택 약관 미동의를 포함한 약관 배열을 요청 규격에 맞게 구성했습니다.
- 제출 로딩과 오류 표시를 추가하고 성공한 경우에만 가입 완료 화면을 표시하도록 변경했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

### 남은 작업

- 소셜 로그인 콜백에서 받은 `signUpTicket`을 연결한 뒤 소셜 프리랜서 가입 제출 API를 연동합니다.

---

## 2026-08-09 — 회원가입 이메일 인증 API 연결

### 작업 요약

- 공통 이메일 인증 서비스에 인증코드 확인 API를 추가했습니다.
- 회원가입 인증코드 발송과 확인을 실제 API 호출로 교체했습니다.
- 서버의 `expiresAt` 기준 타이머와 남은 발송 횟수, 발송·확인 로딩 상태를 반영했습니다.
- 이메일 변경, 코드 만료, 시도 횟수 초과 상황의 초기화와 재발송 처리를 추가했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 회원가입 중복 확인 API 연결

### 작업 요약

- 이메일·휴대폰번호·사업자등록번호 중복 확인 서비스를 추가했습니다.
- 공통 hook에서 요청 상태와 오류를 관리하고, 오래된 요청 결과가 최신 입력 상태를 덮어쓰지 않도록 처리했습니다.
- 입력값이 바뀌면 확인 결과를 초기화하며, 사용 가능 응답을 받은 값만 다음 단계로 진행할 수 있게 했습니다.
- 소셜 프리랜서 화면의 전화번호 입력도 공통 중복 확인 필드로 통일했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 회원가입 메타·약관 조회 API 연결

### 작업 목적

- 회원가입 화면의 목업 사업 분야·직원 수·은행·약관을 실제 조회 API로 교체했습니다.

### 작업 요약

- 메타 목록과 역할별 약관의 요청·응답 타입 및 서비스 함수를 추가했습니다.
- 공통 조회 hook에서 로딩, 실패, 재시도를 관리하도록 구성했습니다.
- 클라이언트·프리랜서·소셜 프리랜서가 같은 약관 단계를 재사용하도록 정리했습니다.
- 주요 타입과 서비스 함수에 역할을 설명하는 짧은 주석을 추가했습니다.

### 관련 Issue 및 브랜치

- Issue: `#40`
- 브랜치: `feature/common-signup-api#40`

### 실행한 검증

- [x] Next.js 라우트 타입 생성
- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [ ] 전체 lint — 120초 제한 초과
- [ ] build — 기존 `/login`의 `useSearchParams` Suspense 오류로 실패
- [ ] 실제 API — 로컬 백엔드 8080 요청 시간 초과로 미검증

### 다음 작업

- 백엔드 실행 후 메타·약관 실제 응답과 화면을 확인합니다.
- 이후 이메일·전화번호·사업자번호 중복 확인 API를 연결합니다.

---

## 2026-08-07 — 로그인 · 계정 찾기 · 로그인 상태 알림 화면 구현 (UI, PR 제출)

### 작업 목적

- 로그인 화면과 아이디·비밀번호 찾기 플로우, 로그인 상태 관련 알림(중복 로그인/세션 만료/계정 잠금/로그인 시도 제한) UI를 구현했습니다.
- 이 시점에는 실제 API 연동 전이라 화면은 전부 mock 값으로 동작합니다.

### 작업 요약

- 로그인 페이지 UI, 아이디 찾기(입력→결과), 비밀번호 찾기 4단계(입력→발송완료→임시비밀번호 발급→새 비밀번호 등록→완료) 화면을 만들었습니다.
- 공용 `ConfirmModal`을 재사용해 중복 로그인 모달·세션 만료 모달을 만들고, 확인 시 `/login`으로 이동하도록 했습니다.
- 계정 잠금 배너·로그인 시도 제한 배너 컴포넌트를 만들었습니다 (아직 로그인 폼에는 연결 안 함).
- 공용 `Modal`이 열릴 때 스크롤바가 사라지며 배경이 밀리는 버그를 스크롤바 너비만큼 `padding-right`를 보정하는 방식으로 수정했습니다.

### 관련 Issue 및 브랜치

- Issue: `#18`
- 브랜치: `feature/common-login#18`
- Pull Request: 생성 완료 (`Closes #18`)

### 수정 파일

#### 신규

- `src/app/login/findemail/page.tsx`, `src/app/login/findpassword/page.tsx`, `src/app/login/findpassword/verify/page.tsx`, `src/app/login/findpassword/reset/page.tsx`
- `src/app/signup/page.tsx` (플레이스홀더만)
- `src/features/auth/components/AuthHeader.tsx`, `BackLink.tsx`, `FindEmailForm.tsx`, `FindEmailResult.tsx`, `FindPasswordForm.tsx`, `FindPasswordSent.tsx`, `TempPasswordIssued.tsx`, `NewPasswordForm.tsx`, `NewPasswordDone.tsx`, `OtherDeviceLoginModal.tsx`, `LoginSessionExpiredModal.tsx`, `AccountLockedAlert.tsx`, `LoginRestrictedAlert.tsx`
- `src/features/auth/utils/formatPhoneNumber.ts`
- `public/icons/CheckIcon-green.svg`, `EmailIcon-green.svg`, `LeftAngleBracketIcon.svg`

#### 수정

- `src/app/login/page.tsx` — 로그인 페이지 UI 구현
- `src/features/common/components/Modal.tsx` — 스크롤 잠금 시 배경 흔들림 버그 수정

### API 변경

- 없음 (전부 mock, 실제 연동은 다음 작업(`#28`)에서 진행)

### 문제와 해결

- 문제: `findemail/page.tsx`가 `FindEmailResult`에 더 이상 없는 `onBack` prop을 넘겨 `npm run build`가 타입 에러로 실패.
- 원인: `FindEmailResult`를 뒤로가기 버튼 없는 형태로 리팩터링하면서 호출부를 같이 안 고침.
- 해결: 미해결 — PR은 이 상태로 제출했고, 정리는 다음 브랜치(`#28`)에서 진행하기로 함 (사용자 결정).
- 남은 위험: 이 상태로는 CI 빌드가 실패할 수 있음.

### 실행한 검증

- [x] lint — 통과
- [x] build — 실패 (`findemail/page.tsx` 타입 에러)
- [ ] 단위 테스트 (도구 미도입)
- [ ] E2E 테스트 (도구 미도입)
- [x] 브라우저 확인 — 아이디 찾기, 비밀번호 찾기 4단계, 모달 2종 클릭 테스트
- [ ] 실제 API 정상 응답 확인 — 연동 전
- [ ] API 에러 응답 확인 — 연동 전
- [ ] 반응형 확인

### 검증 결과

- 통과: lint, 브라우저 클릭 테스트
- 실패: build (타입 에러 1건)
- 미실행: 단위/E2E 테스트, 반응형 확인, 실제 API 확인
- 미실행 이유: 테스트 도구 미도입, 반응형은 시간상 생략, API는 연동 전

### 확인하지 못한 내용

- 실제 로그인/계정찾기 API 응답 (연동 전)

### 다음 참고사항

- PR(`Closes #18`)에 아래 정리 항목이 남아있는 상태로 제출됨. 후속 브랜치(`feature/common-login-api#28`)에서 처리 필요:
  - `findemail/page.tsx`의 `onBack` prop 제거 (빌드 실패 해결)
  - `login/page.tsx`의 모달 확인용 임시 테스트 버튼 제거
  - `TempPasswordIssued.tsx`의 "(테스트) 새 비밀번호 등록 화면 보기" 임시 링크 정리 여부 결정
  - 빈 스캐폴딩 파일 3개(`FindPasswordVerified.tsx`, `ResetPasswordComplete.tsx`, `ResetPasswordForm.tsx`) 삭제 여부 결정
- 이어지는 작업은 `.ai/STATE.md`에 새 작업(`#28` 로그인 API 연동)으로 기록함.

---

<!--
아래 블록을 복사해 최신 기록을 맨 위에 추가합니다.

## YYYY-MM-DD — 작업 제목

### 작업 목적

- 어떤 문제를 해결하기 위한 작업인지 작성합니다.

### 작업 요약

- 구현하거나 수정한 핵심 내용을 작성합니다.
- 기존 동작에서 달라진 내용을 작성합니다.
- 중요한 구조 변경이 있다면 이유를 작성합니다.

### 관련 Issue 및 브랜치

- Issue:
- 브랜치:
- Pull Request:

### 수정 파일

#### 신규
- 없음

#### 수정
- 없음

#### 삭제
- 없음

### API 변경

- 없음 (변경이 있다면 상세 내용은 `API.md`에 작성)

### 문제와 해결

- 문제:
- 원인:
- 해결:
- 남은 위험:

### 실행한 검증

- [ ] lint
- [ ] build
- [ ] 단위 테스트 (도구 도입 후)
- [ ] E2E 테스트 (도구 도입 후)
- [ ] 브라우저 확인
- [ ] 실제 API 정상 응답 확인
- [ ] API 에러 응답 확인
- [ ] 반응형 확인

### 검증 결과

- 통과:
- 실패:
- 미실행:
- 미실행 이유:

### 확인하지 못한 내용

- 없음

### 다음 참고사항

- 후속 작업자가 알아야 하는 내용
- 임시 처리와 제거 조건
- 백엔드 확인이 필요한 내용
- 관련 Issue 또는 후속 작업
-->

## 2026-08-04 — AI 협업 문서 구조 설정 (예시)

### 작업 목적

- AI가 프로젝트 규칙과 현재 작업 상태를 일관되게 확인할 수 있도록 문서 구조를 설정했습니다.

### 작업 요약

- 프로젝트 루트에 `AGENTS.md`를 추가했습니다.
- `docs/ai`에 프론트, Git, 보안, 테스트 규칙을 정리했습니다.
- `.ai`에 현재 작업, 인수인계, 완료 기록, API 문서를 추가했습니다.
- `docs/ai`는 고정 규칙, `.ai`는 현재 작업 기록으로 역할을 분리했습니다.

### 관련 Issue 및 브랜치

- Issue: `#이슈번호`
- 브랜치: `feature/common-ai-docs-setup#이슈번호`
- Pull Request: 확인 후 추가

### 수정 파일

#### 신규

- `AGENTS.md`
- `docs/ai/frontend-convention.md`
- `docs/ai/git-issue-pr-guide.md`
- `docs/ai/security-guide.md`
- `docs/ai/testing-guide.md`
- `.ai/STATE.md`
- `.ai/HANDOFF.md`
- `.ai/WORKLOG.md`
- `.ai/API.md`

### 실행한 검증

- [x] 문서 상대 경로 확인
- [x] 이전 프로젝트 관련 내용 확인
- [x] 민감 정보 포함 여부 확인
- [ ] build — 문서 변경만 포함되어 미실행
- [ ] 브라우저 확인 — 문서 변경만 포함되어 미실행

### 다음 참고사항

- 실제 프로젝트 설정이 확정되면 프론트 컨벤션의 API 클라이언트 경로와 테스트 스크립트를 갱신해야 합니다.
- 위 항목은 예시 기록입니다. 실제 작업 완료 시 이 블록을 실제 내용으로 교체하거나 삭제합니다.

---

# 2026-08-12 클라이언트 프로젝트 정보 상세 영역 확장

- 프로젝트 기본 정보에 근무 형태를 추가하고, 재택이 아닌 경우에만 근무 장소를 표시했습니다.
- 메타 API의 `workForms`를 코드 라벨로 변환해 화면에 적용했습니다.
- 기본 정보 아래에 상세 정보 토글을 추가했습니다.
- 현재 진행 상황, 주요 담당 업무, 세부 업무범위, 기타 전달사항 및 우대사항을 줄바꿈을 유지해 표시했습니다.
- 첨부 자료의 파일명, 크기, 파일 종류 아이콘과 다운로드 링크를 상세 정보 안에 배치했습니다.
- ESLint, TypeScript 검사, `git diff --check`를 통과했습니다.

# 2026-08-12 클라이언트 프로젝트 수정 페이지 구현

- 프로젝트 상세의 관리 메뉴에서 프로젝트 수정 페이지로 이동하도록 연결했습니다.
- 프로젝트 상세 GET 응답과 메타 API를 이용해 기본 정보, 모집 포지션, 상세 정보와 첨부 자료를 초기화했습니다.
- PUT 전체 교체 요청에 14개 필드를 모두 전송하도록 구현했습니다.
- 기존 포지션 ID 유지, 신규 포지션 null 처리, 배열 삭제 및 순서 반영을 구현했습니다.
- 결제 후에는 예산, 모집 인원, 포지션 추가·삭제를 비활성화하고 나머지 항목은 수정 가능하게 했습니다.
- 결제 전 포지션 변경 시 pre-review를 다시 호출하고, 저장 성공 후 프로젝트 상세를 재조회합니다.
- 프로젝트 수정 오류 코드별 사용자 안내를 추가했습니다.
- 첨부 자료 추가·제거와 파일 ID 전체 전송을 구현했습니다.
- ESLint, TypeScript 검사, `git diff --check`를 통과했습니다.

# 2026-08-12 클라이언트 컴포넌트 타입 분리

- `src/features/client` 컴포넌트 파일에 선언된 도메인 타입을 역할별 `types` 파일로 옮겼습니다.
- client 공통, 마이페이지, 내 프로젝트, 프로젝트 수정, 프로젝트 등록 타입을 분리했습니다.
- 기존 컴포넌트 경로에서 export하던 타입은 재-export해 기존 import 호환성을 유지했습니다.
- 컴포넌트 내부에는 렌더링과 상태 로직이 중심이 되도록 정리했습니다.
- 작은 보조 컴포넌트에서만 사용하는 단순 인라인 props 타입은 로컬에 유지했습니다.
- 전체 client 디렉터리 ESLint와 TypeScript 검사를 통과했습니다.

# 2026-08-12 클라이언트 계약 관리 화면 구현

- 상단 헤더의 `/client/contracts` 계약 관리 화면을 구현했습니다.
- 프로젝트 상세 계약 탭의 카드 UI를 공용 컴포넌트로 분리해 두 화면에서 함께 사용합니다.
- 프로젝트 필터 없이 전체 계약 목록을 조회하고 전체 페이지를 합쳐 표시합니다.
- 전체, 서명 대기, 서명 완료, 모두 완료 탭을 양측 서명 여부 기준으로 구현했습니다.
- 계약 카드에서 프로젝트 ID와 계약 ID를 이용해 기존 계약 상세 화면으로 이동합니다.
- 로딩, 조회 실패와 재시도, 탭별 빈 상태를 추가했습니다.
- ESLint, TypeScript 검사, `git diff --check`를 통과했습니다.

# WORKLOG

## 2026-08-16 — 협상 마지노선 방향 반영

- Issue #222, 브랜치 `fix/common-negotiation#222`
- 협상 조건 응답 타입에 `floorDirection(MAX|MIN|CHOICE|NONE)` 추가
- 마지노선 방향은 서버 값을 우선하고 미응답 시 기존 `floorComparison`·역할 로직으로 폴백
- 프리랜서 시작일도 MAX로 판정하여 가장 늦은 시작일 라벨과 `늦어도 {날짜}까지 시작해야 합니다` 안내 적용
- 마지노선 위반 판정·확인 모달과 최종 절충 문구를 같은 공용 방향 판정으로 통일
- 이미 닫힌 STOMP 세션의 `Session closed.` 종료 프레임을 정상 종료로 분류해 개발 오류 오버레이에서 제외하고, 다른 브로커 오류의 `console.error`는 유지
- 검증: 협상 Jest 2 suites/19 tests, 변경 파일 ESLint, TypeScript, 프로덕션 빌드, `git diff --check` 통과
- 전체 Jest: 39 suites/203 tests 통과, 기존 `FreelancerProfile.test.tsx`의 App Router mock 누락으로 1 suite/5 tests 실패
- 실제 백엔드 응답과 로그인 협상 화면은 미검증

---

## 2026-08-16 — 계약·결제·추천 후보 상태 표시 오류 수정

- Issue #220, 브랜치 `fix/common-contract#220`
- 계약 양측 서명 판정을 공용 유틸로 분리하고 계약 상세·서명 화면의 PDF 다운로드 조건을 동일하게 적용
- 서명 전에도 필요한 PDF iframe 미리보기 요청과 렌더링은 유지
- 프리랜서 성공보수 결제 버튼을 `payableSettlementId` 기준으로 노출하고 결제 완료 후 클라이언트 결제 대기 안내 표시
- 클라이언트 프로젝트의 `paymentStatus`를 추천 후보 컴포넌트에 전달하고 `DEPOSIT_PENDING`·`PAYMENT_FAILED`에서는 후보 조회와 스피너 대신 결제 안내 표시
- API 변경 없음
- 검증: 변경 파일 ESLint, 관련 Jest 5 suites/32 tests, 프로덕션 빌드, `git diff --check` 통과
- 실제 로그인 세션 기반 API·브라우저 확인은 미실행

---

## 2026-08-13 역할별 메인페이지 개선 및 비로그인 리뷰 API 연동

- 클라이언트·프리랜서 메인의 고정 이름을 `GET /api/v1/auth/me`의 로그인 사용자 이름으로 교체
- 두 로그인 메인의 데스크톱 콘텐츠 폭, 히어로, 타이포그래피, 진행 카드, 버튼, 등급 표 크기 확대
- 비로그인 메인의 더미 리뷰를 `GET /api/v1/home/site-reviews?size=6` 공개 API로 교체
- 공개 리뷰의 마스킹된 작성자명, 역할, 별점, nullable 본문·프로젝트명을 화면에 반영
- 리뷰 조회 실패 또는 빈 배열이어도 리뷰 섹션을 유지하고 빈 상태 안내를 표시하도록 처리
- 검증: TypeScript, lint(오류 없음·기존 경고 1건), build, diff check 통과
- 전체 테스트: 57개 중 56개 통과, 기존 프리랜서 마이페이지 테스트 1개가 현재 인라인 비밀번호 변경 UI와 불일치해 실패
- 미검증: 로그인 세션의 실제 이름 표시, 모바일·태블릿·데스크톱 화면, 실제 리뷰 API 성공·빈 배열·오류 응답

---

# 2026-08-13 — 프로젝트·계약 후속 수정 4건

- 사전 검수의 `예상 후보 수` 문구를 `매칭 가능 인원`으로 변경하고 기존 서버 `notice` 노출 유지
- 프로젝트 첨부자료를 전용 다운로드 API와 Blob으로 저장하고 상세 응답의 원본 파일명 사용
- 종료 프로젝트 진행 현황 우측에 계약 ID 기준 작성 완료·작성 대기 리뷰 표시
- 내 프로젝트와 역할별 내 계약 탭에 서버 라벨·건수 배지 표시, 0건 배지 숨김
- 계약 탭 건수 API가 아직 배포되지 않은 경우 목록은 유지하고 배지만 숨기도록 처리
- 검증: 변경 파일 ESLint, `npx tsc --noEmit`, 전체 Jest 25 suites/122 tests, `git diff --check` 통과
- 실제 로그인 세션 기반 API·브라우저·파일 저장: 미검증

---

## 2026-08-14 — 클라이언트 마이페이지 결제내역 API 연동

- 목 결제내역을 `/api/v1/settlements/mine`의 `status=PAID` 탭별 페이지 조회로 교체
- 상단 카드와 탭별 합계를 `/api/v1/settlements/mine/summary` 응답에 연결
- 결제일, 프로젝트명, `ST-` 정산번호, 수수료 구분, 금액, 결제수단 표시 및 영수증 미제공 유지
- 로딩·빈 상태·오류 재시도·서버 페이지 이동 추가
- 검증: 관련 Jest 1 suite/2 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 API·브라우저 검증: 로그인 테스트 세션이 없어 미검증

---

## 2026-08-14 — 프리랜서 마이페이지 결제내역 API 연동

- 기존 목데이터와 전체/결제완료/결제실패/환불 탭을 실제 summary·PAID 목록 API 및 전체/착수금/성공보수 탭으로 교체
- 성공보수 납부액과 DISTINCT 완료 프로젝트 수를 summary 응답으로 고정 표시
- 프로젝트명, 발주 기업명(`clientName`), 결제수단, 결제일, 금액, 상태 배지 연결
- 로딩·빈 상태·오류 재시도·서버 페이지 이동 추가
- 검증: 클라이언트·프리랜서 결제내역 Jest 2 suites/4 tests, 변경 파일 ESLint, TypeScript, `git diff --check` 통과
- 실제 API: 배포 Swagger에 summary 경로가 없어 미검증
