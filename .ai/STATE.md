# STATE

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
