# API

프론트에서 실제 사용하는 API와 검증 상태를 기록합니다.

## 프로젝트 도메인 기준 문서

- 백엔드가 전달한 프로젝트 도메인 전체 연동 계약은 `docs/api/frontend-project-integration.md`를 기준으로 합니다.
- 해당 문서는 프로젝트 등록, 정산 결제, 내 프로젝트 목록, 프로젝트 상세의 전체 계약을 보관합니다.
- 이 `.ai/API.md`에는 프론트에서 실제로 연동한 API, 화면 처리와 검증 상태만 기록합니다.
- 기준 문서와 실제 코드가 다르면 차이를 확인한 뒤 구현과 이 문서를 함께 갱신합니다.

## 공통 정보

- API 기본 주소 환경변수: `NEXT_PUBLIC_API_URL`
- 공통 API 클라이언트: `src/lib/api.ts`
- 인증 방식: HttpOnly 쿠키, 모든 요청에 `credentials: "include"`
- 성공 응답: 공통 응답의 `data` 반환
- 실패 응답: `ApiException(errorCode, message, status)`로 변환
- 계약 출처: 백엔드 `frontend-auth-integration.md`
- Swagger 확인: 미확인
- 실제 네트워크 응답: 미검증

## 현재 로그인 사용자 조회

- Method / Path: `GET /api/v1/auth/me`
- 사용 위치: `src/features/auth/services/currentUser.ts`
- 성공 응답: `{ accountId, email, role, name, tempPassword }`
- 인증: HttpOnly 로그인 쿠키
- 화면 처리: 실제 역할에 맞는 헤더와 사용자 이름·이름 첫 글자 표시
- 실제 응답: 미검증

## 로그아웃

- Method / Path: `POST /api/v1/auth/logout`
- 사용 위치: `src/features/auth/services/logout.ts`
- 인증: HttpOnly 로그인 쿠키
- 성공 응답: `data: null`
- 화면 처리: 중복 클릭을 막고 완료 후 `/login`으로 이동
- 실패 처리: 프론트 흐름은 로그인 화면으로 이동하되 서버 쿠키 만료 여부는 확인 필요
- 실제 응답: 미검증

## 고객지원 챗봇 일일 한도 조회

- Method / Path: `GET /api/v1/support/chatbot/quota`
- 사용 위치: `src/features/common/support/services/support.ts`
- 성공 응답 `data`: `{ quotaDate, dailyLimit, usedCount, remainingCount }`
- 화면 처리: 고객지원 FAQ 챗봇 카드에 `하루 최대 {dailyLimit}회 무료 이용` 표시
- 챗봇 화면 우측 상단에 `{remainingCount}/{dailyLimit}회` 표시
- 로딩 처리: `무료 이용 한도 확인 중` 표시
- 실패 처리: `무료 이용 한도 확인 필요` 표시
- 실제 응답: 미검증

## 고객지원 FAQ 챗봇

- 추천 질문: `GET /api/v1/support/chatbot/suggested-questions`
  - 응답 `data`: `string[]`
  - 칩 선택 시 문자열을 질문 입력창에 그대로 입력
- 오늘 대화 이력: `GET /api/v1/support/chatbot/messages`
  - 오늘 내 대화 전체를 시간순으로 반환
  - 필드: `sessionId`, `question`, `answer`, `remainingQuota`, `createdAt`
  - 진입 시 한 번 조회하고 사용자 질문·챗봇 답변 말풍선으로 복원
- 질문 전송: `POST /api/v1/support/chatbot/questions`
  - 첫 질문 요청: `{ question, sessionId: null }`
  - 후속 질문 요청: `{ question, sessionId }`
  - 후속 `sessionId`는 마지막 이력 또는 직전 응답에서 사용
  - 응답: `sessionId`, `question`, `answer`, `remainingQuota`, `createdAt`
  - 응답 `actions[]`: `code`, `label`, `url`
  - 서버 공통 URL과 실제 역할별 App Router 경로가 달라 action `code`를 기준으로 `/client/*`, `/freelancer/*` 경로에 매핑
  - 프로젝트 등록: `/client/projects/new`, 내 프로젝트·협상 목록: 역할별 `/projects`, 계약: 역할별 `/contracts`
  - 결제수단·정산: 역할별 `/mypage/payment-methods`, `/mypage/payments`
  - 이력서: `/freelancer/mypage/resume`, 문의 작성: `/support/inquiries/new`
  - 이력 조회의 `actions`는 항상 빈 배열이며 직전 질문 응답의 액션만 새로 표시
  - 응답의 `remainingQuota`로 잔여 횟수를 갱신하며 quota를 재조회하지 않음
- 화면 처리: 초기 병렬 조회, 로딩·조회 실패·전송 실패·한도 소진 처리
- 잔여 횟수가 1~3회면 프론트 기준 경고 배너 표시
- 잔여 횟수 0이면 입력·추천 질문 비활성화 후 1:1 문의 안내
- `CB_003`(429): 잔여 횟수를 0으로 갱신하고 한도 소진·1:1 문의 안내
- `CB_004`(502): 잔여 횟수를 변경하지 않고 AI 서버 장애·1:1 문의 안내
- `CB_001`(404)·`CB_002`(403): sessionId를 `null`로 초기화해 질문을 한 번 재시도
- 실제 응답: 미검증

## 내 1:1 문의 목록

- Method / Path: `GET /api/v1/support/inquiries/mine?status={status}&page={page}&size=10`
- 사용 위치: `src/features/common/support/services/support.ts`
- 전체 탭은 `status` 생략, 대기 중은 `PENDING`, 답변 완료는 `ANSWERED`
- 응답 `data`: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last` 페이지 객체
- 목록 필드: `inquiryNo`, `inquiryId`, `title`, `status`, `answeredAt`, `createdAt`
- 작성자 필드는 사용자 화면에서 사용하지 않으며 항상 `null`
- 로딩·오류와 재시도·빈 상태·이전/다음 페이지 처리
- 실제 응답: 미검증

## 1:1 문의 상세

- Method / Path: `GET /api/v1/support/inquiries/{inquiryId}`
- 사용 위치: `src/features/common/support/services/support.ts`
- 문의 번호, 제목, 본문, 작성일, 상태와 첨부파일 표시
- 첨부파일은 `files[].originalName`, `files[].fileUrl`만 표시하며 크기는 응답에 없어 미표시
- 문의 유형은 API에서 제거되어 화면에도 표시하지 않음
- `ANSWERED`: `answer`, `answererName`, `answeredAt` 표시
- `PENDING`: `관리자가 문의 내용을 확인하고 있습니다.` 안내 표시
- `IQ_001`: 존재하지 않는 문의, `IQ_002`: 본인이 작성하지 않은 문의 안내
- 실제 응답: 미검증

## 1:1 문의 작성

- 첨부파일 업로드: `POST /api/v1/files`
- 요청 경로: `POST /api/v1/files?purpose=INQUIRY_ATTACHMENT`
- multipart 필드: `file` (purpose는 body가 아닌 쿼리 파라미터)
- 허용 형식: PDF, JPG, JPEG, PNG / 파일당 최대 10MB
- 업로드 응답: `fileId`, `originalName`, `fileUrl`, `mimeType`, `sizeBytes`
- 문의 접수: `POST /api/v1/support/inquiries`
- 요청: `{ title, content, fileIds }`
- 제목 200자 이하, 내용 2,000자 이하이며 둘 다 필수
- 화면 처리: 확인 모달의 `접수 하기`에서 파일을 순서대로 업로드한 후 문의 접수
- 중복 제출 방지, 성공 토스트 후 문의 목록 이동, 실패 토스트 처리
- `GLOBAL_008`, `FI_003`, `GLOBAL_015`, `GLOBAL_007` 오류별 파일 형식·용량·전송 형식·서버 장애 안내
- 문의 접수 전 실패하면 해당 시도에서 업로드를 마친 파일을 `DELETE /api/v1/files/{fileId}`로 정리
- 실제 파일 업로드·문의 접수 응답: 미검증

## 회원가입 메타 목록

사용 위치: `src/features/auth/services/signupMeta.ts`

| Method | Path | 용도 | 인증 | 실제 응답 |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/meta/business-fields` | 사업 분야 목록 | 불필요 | 미검증 |
| GET | `/api/v1/meta/employee-counts` | 직원 수 목록 | 불필요 | 미검증 |
| GET | `/api/v1/meta/banks` | 은행 목록 | 불필요 | 미검증 |

### 성공 응답

- HTTP status: `200`
- `data`: `{ code: string, label: string }[]`
- 화면에는 `label`을 표시하고 가입 요청에는 `code`를 사용합니다.

### 화면 처리

- 요청 중 선택 UI 비활성화
- 실패 시 오류 문구와 다시 시도 버튼 표시
- 목록을 받지 못하면 다음 단계 진행 불가

## 회원가입 약관

- Method / Path: `GET /api/v1/terms?role={role}`
- 사용 위치: `src/features/auth/services/signupTerms.ts`
- Query parameter: `role=CLIENT | FREELANCER`
- 인증 필요: 불필요
- 실제 응답: 미검증

### 성공 응답

- HTTP status: `200`
- `data`: 약관 배열
- 주요 필드: `termsId`, `code`, `type`, `title`, `version`, `required`, `effectiveAt`, `content`
- `type`: `AGREEMENT | POLICY`

### 화면 처리

- `AGREEMENT`만 회원가입 동의 체크박스로 표시
- `required: true` 약관에 모두 동의해야 완료 버튼 활성화
- 서버에서 받은 `termsId`를 동의 상태의 키로 사용
- 요청 실패 시 오류 문구와 다시 시도 버튼 표시

## 회원가입 중복 확인

사용 위치: `src/features/auth/services/signupDuplicateCheck.ts`

| Method | Path | 기준 | 실제 응답 |
| --- | --- | --- | --- |
| GET | `/api/v1/auth/exists/email?email={email}&role={role}` | 이메일·역할 | 미검증 |
| GET | `/api/v1/auth/exists/phone?phone={phone}&role={role}` | 전화번호·역할 | 미검증 |
| GET | `/api/v1/auth/exists/business-no?businessNo={businessNo}` | 사업자번호 전체 | 미검증 |

### 성공 응답과 화면 처리

- `data`: `{ duplicated: boolean }`
- 전화번호와 사업자번호는 하이픈을 제거한 숫자만 전송
- 입력값 변경 시 이전 확인 결과를 초기화
- `duplicated: false`를 확인한 값만 다음 단계 또는 이메일 인증 진행 가능
- 요청 실패 시 서버 메시지를 표시하고 진행을 막음

## 회원가입 이메일 인증

사용 위치: `src/features/auth/services/emailVerification.ts`

| Method | Path | 요청 | 성공 응답 | 실제 응답 |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/email-verifications` | `{ email, purpose: "SIGNUP" }` | `{ expiresAt, remainingSendCount }` | 미검증 |
| POST | `/api/v1/auth/email-verifications/confirm` | `{ email, purpose: "SIGNUP", code }` | `null` | 미검증 |

### 화면 처리

- 서버의 `expiresAt`을 기준으로 인증코드 남은 시간을 계산
- `remainingSendCount`가 0이면 재발송 비활성화
- 코드 확인 성공 후에만 이메일 인증 단계를 통과
- 이메일 변경 시 발송·확인 상태 초기화
- `AU_005`(만료), `AU_012`(시도 초과)는 재발송 가능한 상태로 변경
- `AU_003`(발송 횟수 초과)은 재발송 잠금

## 일반 회원가입 제출

사용 위치: `src/features/auth/services/signup.ts`

| Method | Path | 용도 | 성공 응답 | 실제 응답 |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/signup/client` | 클라이언트 가입 | `{ accountId, role: "CLIENT" }` | 미검증 |
| POST | `/api/v1/auth/signup/freelancer` | 일반 프리랜서 가입 | `{ accountId, role: "FREELANCER" }` | 미검증 |

### 요청 변환과 화면 처리

- 전화번호와 사업자등록번호는 숫자만 전송
- 클라이언트 기업 주소는 필수이며 앞뒤 공백을 제거한 한 줄 문자열로 전송 (최대 255자)
- 프리랜서 생년월일은 `YYYY-MM-DD`로 전송
- 약관 조회 결과의 모든 `AGREEMENT` 항목을 `{ termsId, agreed }`로 전송하며 선택 약관 미동의도 `false`로 포함
- 가입 중 완료 버튼을 비활성화해 중복 제출 방지
- 서버 오류 메시지를 약관 단계에 표시하고 입력값 유지
- 성공 시 자동 로그인하지 않고 가입 완료 화면에서 로그인 페이지로 이동

## 프리랜서 소셜 로그인 시작

- Method / Path: `GET /api/v1/auth/social/{provider}/authorize?returnUrl={returnUrl}`
- 사용 위치: `src/features/auth/services/socialAuth.ts`
- Path parameter: `provider=kakao | google`
- Query parameter: 로그인 완료 후 이동할 앱 내부 `returnUrl`
- 성공 응답: `{ authorizeUrl: string, state: string }`
- 실제 응답: 미검증

### 화면 처리

- 프리랜서 로그인 탭과 회원가입 역할 선택 화면에서 카카오·구글 버튼 표시
- 두 화면은 `useSocialLoginStart`로 같은 인증 시작 로직 재사용
- 요청 중 두 소셜 버튼을 비활성화해 중복 요청 방지
- 성공하면 백엔드가 전달한 `authorizeUrl`로 이동
- 실패하면 로그인 화면에 서버 오류 메시지 표시
- 외부 URL이 `returnUrl`로 전달되지 않도록 앱 내부 절대 경로만 허용

## 프리랜서 소셜 로그인 콜백

- Method / Path: `POST /api/v1/auth/social/{provider}/callback`
- OAuth Redirect URI 라우트: `/oauth/callback/{provider}`
- Google: `/oauth/callback/google`
- Kakao: `/oauth/callback/kakao`
- 사용 위치: `src/features/auth/services/socialAuth.ts`
- 요청: `{ code: string, state: string }`
- 실제 응답: 미검증

### 응답 분기

- `LOGIN`: 응답 쿠키로 로그인 완료 후 기존 `returnUrl` 또는 `/freelancer`로 이동
- `SIGNUP_REQUIRED`: `signUpTicket`, `email`, `name`을 메모리에 잠시 보관하고 `/signup/freelancer/social`로 이동
- `state`는 별도 저장하지 않고 공급자 콜백 쿼리 값을 그대로 전송
- 공급자와 내부 `returnUrl`만 현재 탭의 `sessionStorage`에 보관
- `signUpTicket`은 URL·localStorage·sessionStorage에 저장하지 않음

## 프리랜서 소셜 회원가입

- Method / Path: `POST /api/v1/auth/signup/freelancer/social`
- 사용 위치: `src/features/auth/services/signup.ts`
- 실제 응답: 미검증

### 요청

- `signUpTicket`, `name`, `phone`, `birthDate`
- `card`, `bankAccount`, `agreements`
- 이메일은 요청에 넣지 않으며 가입 티켓의 소셜 이메일을 서버가 사용

### 화면 처리

- 콜백에서 받은 실제 이메일과 이름을 표시하고 목업 정보 제거
- 이메일은 읽기 전용으로 표시
- 가입 티켓이 메모리에 없으면 소셜 로그인을 다시 시작하도록 안내
- 요청 중 중복 제출 방지 및 서버 오류 메시지 표시
- 성공 시 로그인 쿠키가 발급된 상태이므로 프리랜서 홈으로 이동

## 프로젝트 등록

- Method / Path: `POST /api/v1/projects`
- 사용 위치: `src/features/client/projects/services/projectRegistration.ts`, 프로젝트 등록 Step 6
- 인증·권한: HttpOnly 로그인 쿠키, `CLIENT` 역할만 허용
- 실제 응답: 미검증

### 최종 등록 요청

- Step 6 최종 확인 후 한 번만 호출
- Step 1: `noticeAgreed`
- Step 2: `title`, `startDesiredDate`, `startNegotiable`, `periodValue`, `periodUnit`, `budgetAmount`, `workStyle`, `workForm`
- Step 3: `positions[{ jobCategory, jobRole, minCareerYears, headcount, skills }]`
- Step 4: `currentSituation`, `mainTask`, `detailScope`, `extraNote`, `fileIds`
- 화면의 만원 단위 예산을 `budgetAmount` 원 단위로 `× 10,000` 변환
- `startDesiredDate`는 협의 가능 여부와 관계없이 필수이며 `input[type=date]`의 `YYYY-MM-DD` 값을 그대로 전송
- `startNegotiable`은 날짜와 독립적인 boolean으로 전송하며 체크해도 날짜를 비우지 않음
- 선택 상세 문구가 비어 있으면 `detailScope`, `extraNote`를 `null`로 변환
- 첨부 응답의 `fileId`만 `fileIds` 배열로 변환
- 제출 중 버튼을 비활성화하고 실패 시 서버 메시지와 입력 상태 유지
- 성공 응답 구조는 미확인이라 현재 완료 화면 이동에만 사용
- Step 3 희망 경력은 `minCareerYears`로 전송하며 최소 1년
- 등록 중 다른 페이지로 이동해도 같은 탭에서는 전체 폼을 `sessionStorage`에서 복원
- 등록 완료 또는 등록 취소 시 임시 저장값 삭제, 탭 종료 시 브라우저가 세션 저장값 삭제

### 등록 성공 응답과 완료 화면

- `ProjectResponse`를 등록 Context에 저장하고 완료 화면은 입력 폼이 아닌 응답으로 렌더링
- 사용 필드: `projectId`, `title`, `periodValue`, `periodUnit`, `budgetAmount`, `startDesiredDate`, `status`, `positions`, `payableSettlementId`
- `MONTH`는 `개월`, `REGISTERED`는 `등록 완료`로 표시
- 모집 포지션 라벨은 `jobRoleLabel`, `jobRoleName`, `label`, `jobRole.label`을 지원하고 응답에 라벨이 없으면 Step 3의 코드·라벨 매핑 사용
- 모집 인원은 `제품 디자이너 1명`처럼 `라벨 + headcount + 명` 형식으로 표시
- 프로젝트 상세보기는 `/client/projects/{projectId}`로 이동
- 착수금 결제 모달에 `payableSettlementId` 전달
- 실제 결제 API 경로·요청 계약은 미확인이라 모달의 기존 결제 완료 흐름 유지

### 프로젝트 조회

| Method | Path | 용도 | 실제 응답 |
| --- | --- | --- | --- |
| GET | `/api/v1/projects/mine` | 내 프로젝트 목록 | 미검증 |
| GET | `/api/v1/projects/{projectId}` | 프로젝트 상세 조회 | 미검증 |

- 서비스 위치: `src/features/client/projects/services/projectRegistration.ts`

### Step 2 기본 정보

- 화면 진입 시 `GET /api/v1/meta/work-conditions`를 1회 호출
- 응답: `{ workStyles, workForms, periodUnits }`, 각 선택지는 `{ code, label }`
- 근무 방식·근무 형태·기간 단위에는 서버 `code`를 저장하고 화면에는 `label` 표시
- 프로젝트명·시작 희망일·협의 여부·기간 값·예산은 사용자 입력이며 별도 GET 없음
- Step 6 등록 본문 필드: `title`, `startDesiredDate`, `startNegotiable`, `periodValue`, `periodUnit`, `budgetAmount`, `workStyle`, `workForm`
- 화면 예산은 만원 단위로 보관하고 최종 요청의 `budgetAmount`만 원 단위로 `× 10,000` 변환
- API 예산 범위: 5,000,000원~1,000,000,000원
- 화면 만원 단위 범위: 500만원~100,000만원(10억원)
- 예산 범위 오류는 Step 2 필드에서 안내하며 버튼을 비활성화하지 않고 클릭 시 다음 단계 이동만 중단
- 프로젝트 수정 진입 시에만 `GET /api/v1/projects/{projectId}`로 기존 값 조회
- 신규 등록 위저드에서는 프로젝트 상세 조회를 호출하지 않음
- `startDesiredDate`는 항상 오늘 이후 날짜가 필수이며 Step 2에서 안내·진행 차단

### 등록 전 안내 동의

- Step 1의 필수 동의값을 프로젝트 등록 Context의 `noticeAgreed`로 Step 6까지 유지
- 별도 동의 API 호출 없음
- enum 또는 약관 ID 없음
- 등록 요청 본문에 `"noticeAgreed": true`로 포함
- `false` 전송 시 `400 GLOBAL_001`, 메시지 `noticeAgreed: 등록 전 안내에 동의해야 합니다.`
- 서버가 동의 시각을 자동 기록하며 응답에는 포함하지 않음
- 프로젝트 수정 `PUT` 요청에는 동의값을 다시 보내지 않음

### 화면 접근 제어

- `/client/projects/new/*` 공통 레이아웃에서 `GET /api/v1/auth/me`로 역할 확인
- `CLIENT`만 등록 화면을 렌더링
- `FREELANCER`는 등록 폼이 보이기 전에 `/freelancer`로 이동
- 인증 조회 실패 시 `/login`으로 이동

### 미확인

- `noticeAgreed` 외 등록 요청 전체 필드와 성공 응답 구조
- 실제 성공·400·403 네트워크 응답

## 프로젝트 사전 검수

- Method / Path: `POST /api/v1/projects/pre-review`
- 사용 위치: `src/features/client/projects/services/projectPreReview.ts`
- 인증·권한: HttpOnly 로그인 쿠키, `CLIENT` 역할만 허용
- 실제 응답: 미검증

### 요청

- `{ positions: [{ jobRole, headcount, skills }] }`
- Step 3 입력 순서대로 직무·모집 인원·요구 스킬만 전송
- 직군·희망 경력·프로젝트 예산은 전송하지 않음
- `jobRole` 필수, `headcount` 1~50, `skills` 1~63개
- 직무 라벨은 `GET /api/v1/meta/job-roles` 결과로 서버 코드로 변환

### 응답과 화면 처리

- `notice`를 결과 화면 상단에 그대로 표시
- `allMatchable`에 따라 후보 부족 시에만 등록 취소 버튼 표시
- `items[]`는 `positionIndex` 기준으로 요청 순서에 매핑하며 `jobRole`로 묶지 않음
- `jobRole` 코드는 직무 메타의 라벨로 변환해 카드 제목에 표시
- 카드에 모집 인원, 예상 후보 수, 매칭 가능 또는 후보 부족 상태 표시
- 등록 수정은 안내 후 Step 3으로 이동하며 입력 상태 유지
- 등록 취소는 확인 후 Context를 초기화하고 클라이언트 홈으로 이동
- 입력한 내용으로 등록하기는 API 호출 없이 Step 6으로 이동

## 프로젝트 모집 조건 메타

Step 3 화면 진입 시 아래 목록을 각각 1회 조회합니다.

| Method | Path | 용도 |
| --- | --- | --- |
| GET | `/api/v1/meta/job-categories` | 직군 목록 |
| GET | `/api/v1/meta/job-roles` | 직무 목록 |
| GET | `/api/v1/meta/skills` | 스킬 자동완성 전체 목록 |

### 화면 처리

- 직군·직무·스킬은 화면에 `label`, Context와 API 요청에는 `code`를 저장
- 직무는 `parentCode`가 선택 직군의 `code`와 같은 항목만 표시
- 직군을 변경하면 기존 직무 선택을 초기화
- 스킬 63개는 검색 파라미터 없이 한 번에 받고 클라이언트에서 코드·라벨을 필터링
- 자유 입력 스킬은 허용하지 않고 메타 목록에서 선택
- 희망 경력 1~50년, 모집 인원 1~50명, 스킬 1~63개, 모집 포지션 1~100건 검증
- 선택지 조회 실패 시 진행을 막고 다시 시도 제공

## 프로젝트 상세정보 및 첨부파일

### Step 4 텍스트

- `currentSituation`: 현재 프로젝트 진행 상황, 필수, 최대 1,500자
- `mainTask`: 주요 담당 업무, 필수, 최대 1,500자
- `detailScope`: 세부 업무 범위, 선택, 최대 1,500자
- `extraNote`: 기타 전달사항 및 우대사항, 선택, 최대 1,500자
- 작성 가이드·예시·글자 수 카운터는 프론트 고정 UI

### 파일 업로드

- Method / Path: `POST /api/v1/files?purpose=PROJECT_FILE`
- Content-Type: `multipart/form-data`, part 이름 `file`
- 성공 응답: `{ fileId, originalName, sizeBytes }`
- 허용 확장자: PDF, JPG, JPEG, PNG
- 파일당 최대 100MB, 프로젝트당 최대 10개
- 업로드 응답을 Context에 보관하고 Step 6 등록 요청에 `fileIds: number[]`로 전송
- 파일 크기는 `sizeBytes`를 KB 또는 MB 표시값으로 변환
- 10개 도달 시 업로드 클릭·드롭 비활성화

### 첨부 삭제

- Method / Path: `DELETE /api/v1/files/{fileId}`
- X 버튼을 누르면 삭제 API 성공 후 Context와 화면 목록에서 제거
- 실패 시 파일 목록을 유지하고 서버 메시지 표시

## 변경 이력

- 2026-08-11: 공통 401 refresh·1회 재시도·세션 종료 처리, 보호 경로 및 임시 비밀번호 가드 추가, 실제 응답 미검증
- 2026-08-11: 마이페이지 비밀번호 변경과 약관 문서 조회 API 연결, 실제 응답 미검증
- 2026-08-10: 백엔드 2차 답변 반영 — `WORK_FORM`(FULL_TIME/PART_TIME/ANY), 조건 값 라벨 meta API화(`getWorkConditionsMeta` + `formatConditionValue(labels)`, 하드코딩 제거), 협상 자동생성(매칭 수락)·프리랜서 현황 버튼 `status==="NEGOTIATING"` 기반, 헤더 종 배지 제거. 실제 네트워크 응답 미검증
- 2026-08-10: 백엔드 확정 답변 반영 — 필드명(`projectTitle`, 조건 `type`), 값 전부 문자열·금액 원단위 월단가, `waitingForMe` 기반 승인/재지시 패널, 조건 코드 7종·라벨 매핑, `/mine` 페이지 필드, 빨간점=매칭 API `newProposalCount`(프리랜서 현황 버튼). 실제 네트워크 응답 미검증
- 2026-08-10: 협상 목록(`/mine`)·헤더 종 배지(`waiting-count`) 연동, 협상방 라우트 `[negotiationId]` 전환, 실제 응답 미검증
- 2026-08-10: 협상 도메인 기반(타입·REST 서비스·STOMP)과 협상방 화면 연동 코드 추가, 실제 응답·STOMP 미검증
- 2026-08-10: 클라이언트 일반 회원가입 요청에 필수 `address` 필드 추가, 실제 응답 미검증
- 2026-08-10: 등록 성공 응답 기반 완료 화면, 프로젝트 목록·상세 조회 서비스 및 결제 정산 ID 전달 추가
- 2026-08-10: Step 6 `POST /api/v1/projects` 최종 등록 호출 및 전체 폼 변환 추가, 실제 응답 미검증

## 정산 결제

### 결제 모달 조회

- `GET /api/v1/settlements/{settlementId}`: 프로젝트명, 결제 단계, 결제 금액, 결제 가능 여부, 상태, 프로젝트 ID 조회
- `GET /api/v1/accounts/me/payment-methods`: 로그인 계정 결제수단 조회
- 결제수단 중 `methodType: CARD`만 표시하고 `BANK_ACCOUNT`는 제외
- 응답은 카드와 계좌가 함께 포함된 배열이며 삭제된 결제수단은 제외됨
- 계정당 카드 1장 정책에 따라 선택 목록 없이 `displayName`을 그대로 표시
- 카드 필드: `paymentMethodId`, `displayName`, `cardBrand`, `cardLast4`, `cardHolder`
- 계좌 필드 `bankName`, `accountLast4`, `accountHolder`는 타입에 반영하지만 수수료 결제 UI에서는 사용하지 않음
- 카드사 로고나 전체 카드번호를 추측하지 않음
- 정산 `feeAmount`를 상단 금액과 결제 버튼에 동일하게 사용
- `payable: false`, 카드 없음, 조회 실패 시 결제 버튼 비활성화

### 결제 실행

- `POST /api/v1/settlements/{settlementId}/payment`
- 요청: `{ paymentMethodId }`
- `status: PAID`일 때만 결제 완료 화면으로 이동
- `status: FAILED`이면 `failReason`을 모달에 표시
- 결제 중 중복 요청과 모달 닫기 방지
- 성공 후 `/client/payments/complete?projectId={projectId}`로 이동
- 결제 완료 화면에서 응답의 `projectId`로 `GET /api/v1/projects/{projectId}`를 호출해 최신 프로젝트 상태 표시
- `MATCHING` 상태는 `모집 중`으로 표시
- 내 프로젝트 보기 버튼은 `/client/projects?tab=MATCHING`으로 이동
- 등록 응답의 `payableSettlementId`가 null이면 착수금 결제 버튼을 표시하지 않음

### 프로젝트 완료 후 성공보수 안내

- `POST /api/v1/projects/{projectId}/completion` 성공 후 응답의 `payableSettlementId` 확인
- 결제할 정산이 있으면 `프로젝트가 완료되었습니다. 성공보수를 결제하시겠습니까?` 확인 모달 표시
- 취소 시 완료 상태만 유지하고, 결제 선택 시 기존 `PaymentMethodModal`을 `SUCCESS_FEE`로 열기
- `GET /api/v1/settlements/{payableSettlementId}` 응답에서 `projectTitle`, `baseAmount`, `feeAmount`, `feeRate`, `gradeDiscount`, `dueDate` 표시
- 성공보수 기준 금액과 최종 결제 금액은 프론트에서 계산하지 않고 응답값 그대로 사용
- 계산 기준은 `{feeRate}%`와 `gradeDiscount > 0`일 때 `등급 할인 {gradeDiscount}%` 표시
- 실제 완료 후 정산 생성·조회·결제 흐름: 미검증

### 프로젝트 최종 완료 요약

- 화면: `/client/projects/{projectId}/success-fee/complete`
- `GET /api/v1/projects/{projectId}`로 등록일, 시작일, 기간, 계약 인원과 프로젝트 예산 표시
- 프로젝트 상세 타입에 종료 처리 시각 `closedAt` 추가
- 금액 라벨은 `총 계약 금액`이 아니라 `프로젝트 예산` 사용
- `GET /api/v1/settlements/mine?projectId={projectId}&page=0&size=10`의 `content[]`에서 `DEPOSIT`, `SUCCESS_FEE`를 구분해 수수료 2줄 표시
- `GET /api/v1/contracts?projectId={projectId}&page=0&size={confirmedHeadcount 이상}`에서 `COMPLETED` 계약 프리랜서 표시
- 계약 카드에 `counterpartName`, `jobRole`, `payAmount`, 완료 배지 표시
- 리뷰 조회 및 작성 영역은 담당 범위에서 제외
- 실제 종료 프로젝트·정산·계약 조합 응답: 미검증

### 프로젝트 정보 탭 상세 표시

- `GET /api/v1/projects/{projectId}` 응답의 `workStyle`, `workForm`, `workLocation`을 기본 정보에 표시
- `workStyle`, `workForm` 라벨은 `GET /api/v1/meta/work-conditions`의 `workStyles`, `workForms`를 사용
- `workStyle`이 `REMOTE`이거나 라벨에 `재택`이 포함되면 근무 장소를 표시하지 않음
- 기본 정보 아래 상세 정보 토글에서 `currentSituation`, `mainTask`, `detailScope`, `extraNote`를 줄바꿈을 유지해 표시
- 같은 토글에서 `files[]`의 `originalName`, `sizeBytes`, `fileUrl`을 이용해 첨부 자료와 다운로드 링크 표시

## 클라이언트 내 프로젝트 목록

- 서비스 위치: `src/features/client/myprojects/services/clientProjects.ts`
- `GET /api/v1/projects/mine?tab={tab}&page={page}&size={size}`
- 탭 코드: `REGISTERED`, `MATCHING`, `IN_PROGRESS`, `COMPLETION_PENDING`, `CLOSED`, `CANCELED`
- 응답 `data`는 `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`를 가진 페이지 객체
- 탭 변경 시 URL의 `tab` 쿼리와 목록 요청을 함께 갱신하고 페이지를 0으로 초기화
- `MATCHING` 탭에는 `RECRUITING`, `NEGOTIATING`, `CONTRACT_PENDING` 상태가 함께 표시되며 카드 배지는 실제 상태 코드로 구분
- `jobRoleLabels`, `skillLabels`, `periodLabel`은 서버 라벨을 그대로 표시
- `budgetAmount`는 원 단위 콤마 포맷, 날짜는 `YYYY.MM.DD`, `totalHeadcount`는 `N명`으로 표시
- 실제 목록 응답에서 `startDesiredDate`, `createdAt`이 `null`일 수 있어 화면에는 `-`로 표시
- `payableSettlementId`가 있을 때만 등록 완료의 착수금 또는 완료 대기의 성공보수 결제 버튼 표시
- 결제 모달은 기존 정산 조회·결제 API를 공용으로 사용
- `POST /api/v1/projects/{projectId}/completion` 성공 시 완료 대기 탭으로 이동해 목록 재조회
- 로딩, 빈 목록, 조회 실패와 재시도, 이전·다음 페이지 처리
- 실제 네트워크 응답: 미검증

## 클라이언트 프로젝트 상세

- 서비스 위치: `src/features/client/myprojects/services/projectDetail.ts`
- `GET /api/v1/projects/{projectId}`로 프로젝트 기본 정보, 포지션, 첨부, 연장 횟수, 모집 마감일과 현재 상태 조회
- 프로젝트 상세 응답에 프리랜서 배열이 있다고 가정하지 않음
- `GET /api/v1/matchings/requests?projectId={projectId}&size=100`으로 해당 프로젝트의 프리랜서 현황을 별도 조회
- 매칭 응답의 `counterpartName`, `jobRole`, `status`, `negotiationId`를 카드에 사용
- 직무·스킬·근무 방식 코드는 프로젝트 메타 API 라벨로 변환
- `negotiationId == null`인 매칭 카드에 협상 하기 버튼 표시
- `recruitDeadline == null`이면 마감일 표시를 숨김
- `extensionCount >= 2`이면 모집 연장 버튼 비활성화
- `payableSettlementId != null`이면서 등록 완료 또는 완료 대기 상태일 때만 결제 버튼 표시
- 등록 완료: 수정, 등록 취소, 착수금 결제
- 모집중: 수정, 모집 연장, 모집 종료
- 협상중·계약 대기: 수정
- 진행중: 수정, 프로젝트 완료
- 완료 대기: 수정, 성공보수 결제
- 종료·취소됨: 관리 메뉴 숨김
- 상태 변경 성공 후 프로젝트 상세를 재조회해 버튼과 화면 갱신
- `POST /api/v1/projects/{projectId}/registration-cancellation`
- `POST /api/v1/projects/{projectId}/recruit-extensions`
- `POST /api/v1/projects/{projectId}/recruit-close`
- `POST /api/v1/projects/{projectId}/completion`
- 프로젝트 상세의 관리 메뉴에서 `/client/projects/{projectId}/edit`로 이동
- 수정 화면 진입 시 프로젝트 상세와 직군·직무·스킬·근무 조건 메타를 함께 조회해 폼 초기화
- `PUT /api/v1/projects/{projectId}`에 `title`, `startDesiredDate`, `startNegotiable`, `periodValue`, `periodUnit`, `budgetAmount`, `workStyle`, `workForm`, `positions`, `currentSituation`, `mainTask`, `detailScope`, `extraNote`, `fileIds` 전체 전송
- `workLocation`은 수정 요청에서 제외
- `positions[]`의 기존 항목은 `positionId` 유지, 신규 항목은 `null`, 삭제 항목은 배열에서 제외하며 배열 순서를 유지
- 직무 선택 시 메타의 `parentCode`를 `jobCategory`에 함께 반영
- `REGISTERED`는 결제 전으로 판단해 전체 수정 가능, 이후 상태는 `budgetAmount`, `headcount`, 포지션 추가·삭제 비활성화
- 결제 전 포지션 변경 시 저장 후 `POST /api/v1/projects/pre-review` 재호출
- PUT 성공 후 `GET /api/v1/projects/{projectId}`를 재조회해 서버에서 갱신한 예산·수수료 관련 상태를 반영
- 오류 코드 `BUDGET_NOT_CHANGEABLE`, `HEADCOUNT_NOT_CHANGEABLE`, `POSITION_NOT_CHANGEABLE`, `PROJECT_NOT_FOUND`, `NOT_PROJECT_OWNER`, `INVALID_STATUS`를 사용자 메시지로 분기
- 기존 파일 삭제는 전체 요청의 `fileIds`에서 제외하고, 수정 화면에서 신규 업로드 후 제거한 파일만 `DELETE /api/v1/files/{fileId}` 호출
- 실제 네트워크 응답: 미검증

## 계약 목록 (프리랜서 내 계약·계약 관리·프로젝트 계약 탭 공용)

- 공용 서비스 위치: `src/features/contract/services/contracts.ts`
- `GET /api/v1/contracts?tab={tab}&page={page}&size={size}`
- 프로젝트로 좁힐 때만 `projectId={projectId}`를 추가
- 응답 `data`는 `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last` 페이지 객체
- 항목 필드: `contractId`, `contractNo`, `projectId`, `projectTitle`, `jobRole`, `counterpartName`, `clientBusinessField`, `status`, `totalAmount`, `payUnit`, `payAmount`, `startDate`, `endDate`, `createdAt`, `workStyle`, `signatureRequired`, `clientSigned`, `freelancerSigned`, `depositPaid`
- 탭: `ALL`, `AWAITING_ME`, `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED`
- `AWAITING_ME`는 상대방의 서명 여부와 무관하게 현재 사용자의 서명이 필요한 계약
- `DRAFT`(AI 계약 문구 작성 중)는 `ALL` 탭에만 포함
- 프리랜서 카드의 왼쪽 상태 뱃지는 `status`만 사용: `DRAFT` 작성 중, `SIGN_PENDING` 서명 대기, `SIGNED` 계약 체결 완료, `IN_PROGRESS` 진행 중, `COMPLETION_PENDING` 정산 대기, `COMPLETED` 완료
- 회사·업종은 `counterpartName · clientBusinessField`, 생성일은 `createdAt`, 근무 방식은 `workStyle`(`REMOTE` 재택, `ONSITE` 상주, `ANY` 모두 가능) 사용
- 카드 하단 안내 문구는 서버 필드가 아니라 프론트 고정 문구
- 실제 화면의 오류 스택에서 일부 항목의 `createdAt` 누락을 확인함. 생성일은 선택 타입으로 처리하고 누락 시 `-`를 표시하며, 정확한 nullable 정책은 백엔드 확인 필요

### 프리랜서 착수금 결제

- 착수금 결제 버튼은 `SIGNED && !depositPaid` 계약에 표시하고, 실제 결제 진입에는 목록 카드의 `payableSettlementId`가 필수
- `payableSettlementId`가 누락되어도 목업 결제로 대체하지 않음
- 현재 실제 목록 응답에서 `payableSettlementId` 누락 사례가 확인되어, 누락 시 `GET /api/v1/settlements/mine?projectId={projectId}`의 `content`에서 `phase === DEPOSIT && payable === true`인 정산 ID를 보완 조회한 뒤 상세 모달을 엶
- 모달 진입 시 `GET /api/v1/settlements/{payableSettlementId}`로 결제 상세 조회
- 상세 필드: `projectTitle`, `baseAmount`, `feeRate`, `gradeDiscount`, `feeAmount`
- 결제는 기존 `POST /api/v1/settlements/{settlementId}/payment`를 사용하고, 완료 화면은 별도 조회 없이 결제 API 응답을 그대로 표시
- 완료 필드: `projectTitle`, `feeAmount`, `paymentMethodLabel`, `paidAt`, `approvalNo`, `phase`, `status`
- 상태: `DEPOSIT + PAID` → 착수 수수료 결제 완료, `SUCCESS_FEE + PAID` → 성공보수 수수료 결제 완료
- `paymentMethodLabel`이 `null`이면 결제수단 행만 숨기고 결제일시·승인번호는 유지
- 결제 완료 후 `IN_PROGRESS` 탭이 아니라 `/freelancer/contracts/{contractId}` 계약 상세로 이동
- 결제 내역: `GET /api/v1/settlements/mine?page={page}&size={size}`, 프로젝트 한정 시에만 `projectId` 추가
- 실제 착수금 상세·결제 성공 및 실패 응답: 미검증

### 프리랜서 성공보수 결제

- 목록 카드의 `payableSettlementId`로 `GET /api/v1/settlements/{payableSettlementId}` 상세 조회
- `projectTitle`, `baseAmount`, `feeRate`, `gradeDiscount`, `feeAmount`를 표시하며 금액은 서버 값을 그대로 사용
- 할인율은 `feeRate - gradeDiscount`만 화면에서 계산하고, 할인이 0보다 크면 `{feeRate}% → 마스터 할인 {gradeDiscount}% = {적용률}%` 형식 표시
- 계약 기간은 목록 카드의 `startDate`, `endDate`로 개월 수를 계산
- `GET /api/v1/accounts/me/payment-methods`에서 `methodType === CARD`만 표시하고 `isDefault` 카드에 `(기본)` 표기 및 초기 선택
- `POST /api/v1/settlements/{settlementId}/payment` 요청 중 중복 제출 방지, 성공 응답으로 완료 화면 즉시 표시
- 오류: `SETTLEMENT_NOT_FOUND`, `NOT_PAYER`, `NOT_PAYABLE`; `NOT_PAYABLE`은 목록 새로고침 안내
- 프리랜서 성공보수 결제 후에도 계약은 정산 대기일 수 있으므로 계약 종료 문구를 표시하지 않음
- 실제 성공보수 정산 상세·결제 성공 및 실패 응답: 미검증

### 프리랜서 성공보수 결제 완료

- 화면: `/freelancer/contracts/{contractId}/success-fee/complete?projectId={projectId}`
- `GET /api/v1/settlements/mine?projectId={projectId}&page=0&size=10` 한 번만 호출
- `content[]`에서 `phase === DEPOSIT`, `phase === SUCCESS_FEE`를 찾아 계약 금액(`baseAmount`), 각 `feeRate`·`gradeDiscount`·`feeAmount`, 결제일(`paidAt`) 표시
- 전체 플랫폼 수수료는 두 `feeAmount`를 화면에서 합산
- 등급 할인이 있으면 표시 요율에 `gradeDiscount` 적용 사실을 함께 표시
- 최종 종료일은 제공하지 않으며 화면에서도 제거
- 실제 정산 2건 조회 응답: 미검증
- 목록 정렬은 서버의 `id DESC` 고정값을 그대로 사용하며 프론트에서 재정렬하지 않음
- 프리랜서 내 계약은 페이지당 10개를 조회하고 서버 페이지 정보로 이전·다음 이동
- 계약 탭의 기존 하드코딩 목록을 제거하고 로딩·오류·빈 상태와 실제 목록을 표시
- 계약 가이드의 `GET /api/v1/codes/job-roles`는 현재 백엔드에서 `404 GLOBAL_004`가 발생해, 실제 프로젝트에서 사용하는 `GET /api/v1/meta/job-roles` 결과로 `jobRole` 코드를 라벨로 변환
- `payUnit`은 계약에서 `MONTHLY` 고정이며 카드에는 `월 {payAmount}원`으로 표시
- `clientSigned`, `freelancerSigned`로 양측 서명 여부 표시
- 배지는 `DRAFT` → `signatureRequired` → `SIGN_PENDING` → `SIGNED && !depositPaid` → `SIGNED` → 후속 상태 순으로 판정
- 클라이언트 화면에서 `SIGNED && !depositPaid`는 `프리랜서 결제 대기`로 표시
- `DRAFT` 계약은 상세보기 버튼 비활성화
- 실제 네트워크 응답: 미검증

### 클라이언트 계약 관리

- 화면: `/client/contracts?tab={tab}`
- `GET /api/v1/contracts?tab=ALL&page={page}&size=100`으로 프로젝트 조건 없이 본인의 전체 계약 조회
- 첫 응답의 `totalPages`가 2 이상이면 나머지 페이지를 추가 조회해 탭 필터 누락 방지
- 탭 `ALL`: 전체 계약
- 탭 `CLIENT_PENDING`: `clientSigned === false`
- 탭 `CLIENT_SIGNED`: `clientSigned === true && freelancerSigned === false`
- 탭 `ALL_SIGNED`: `clientSigned === true && freelancerSigned === true`
- 계약 카드 UI는 프로젝트 상세의 계약 탭과 공용 컴포넌트 사용
- 상세 이동: `/client/projects/{projectId}/contracts/{contractId}`
- 실제 네트워크 응답: 미검증

## 계약 상세

- 공용 서비스 위치: `src/features/contract/services/contracts.ts`
- `GET /api/v1/contracts/{contractId}`로 계약 기본 정보, 당사자, 계약 조건, 조항과 서명 상태 조회
- 계약 전체 상태: `DRAFT`, `SIGN_PENDING`, `SIGNED`, `IN_PROGRESS`, `COMPLETION_PENDING`, `COMPLETED` (목록에 없는 값은 원문 표시)
- 상세 화면은 `GET /api/v1/contracts/{contractId}` 응답 하나만 사용하며 직무·근무 조건 메타를 추가 조회하지 않음
- 서명 상태: `signatures[].partyRole`(`CLIENT`, `FREELANCER`)과 `status`(`PENDING`, `SIGNED`, `REJECTED`)
- 계약 본문은 `clauses[]`의 `no`, `title`, `content`를 서버 순서 그대로 렌더링하고 `content`에 `white-space: pre-line` 적용
- `DRAFT` 동안 안내를 표시하고 2초 간격 최대 10회 재조회하며 서명 버튼 비활성·PDF 버튼 숨김
- `SIGN_PENDING`이면서 현재 사용자의 서명이 `PENDING`일 때만 서명 화면 진입 가능
- 현재 사용자가 이미 서명했으면 상대방 서명 대기, `SIGNED`면 계약 체결 완료 표시
- `signatures[]`는 `partyRole`로 프리랜서·클라이언트 서명 칸에 배치하고 `name`, `status`, `signedAt` 표시
- 계약 확정 칸은 최상위 `status`, `signedAt`으로 구성: `SIGN_PENDING`은 서명 대기, 그 외는 계약 최종 확정
- 계약 조건은 `projectTitle`, `jobRole`, `startDate`, `endDate`, 최상위 `signedAt`, `clientName`, `payUnit`, `payAmount`, `workStyle`, `workForm` 사용
- 근무 코드: `REMOTE` 재택, `ONSITE` 상주, `ANY` 모두 가능 / `FULL_TIME` 풀타임, `PART_TIME` 파트타임
- `clauses[]`의 `no`, `title`, `content`를 서버 순서 그대로 표시하고 `specialTerms`가 있을 때만 특약사항 표시
- 상세 오류: `CONTRACT_NOT_FOUND`, `NOT_CONTRACT_PARTY`; PDF 오류: `PDF_RENDER_FAILED`
- 서명 기한, 당사자 이메일, 지급일, 별도 업무 범위 필드를 화면에서 제거
- 직무·근무 방식·근무 형태 라벨은 현재 백엔드에서 동작하는 `/api/v1/meta/*` API 사용

### 계약 PDF

- `GET /api/v1/contracts/{contractId}/pdf`
- JSON 공통 응답이 아니라 PDF 바이트를 Blob으로 수신
- 파일명은 상세 응답의 `{contractNo}.pdf` 사용
- 공통 `apiBlob`에서 쿠키 인증, 토큰 갱신과 세션 종료 오류 처리
- `DRAFT`에서는 PDF 버튼을 숨기고 그 외 상태에서 다운로드 가능
- 실제 상세·PDF 네트워크 응답: 미검증

## 클라이언트 계약 진행 현황

- 화면 위치: `src/features/client/myprojects/progress/components/ProjectProgress.tsx`
- 우측 프로젝트 정보와 상태 스텝퍼는 상위 상세 화면이 조회한 `GET /api/v1/projects/{projectId}` 응답 사용
- `GET /api/v1/contracts?tab=ALL&page=0&size=100&projectId={projectId}`로 프로젝트 계약 목록 조회
- `IN_PROGRESS`, `COMPLETION_PENDING`, `COMPLETED`, `TERMINATED` 계약만 진행 현황 카드로 표시
- 카드에 `counterpartName`, `jobRole`, `payAmount`, `status` 표시하고 아바타 이니셜은 상대방 이름 첫 글자로 생성
- 계약 상세 링크는 실제 `contractId` 사용
- 계약 목록에는 `negotiationId`가 없어 카드별 `GET /api/v1/contracts/{contractId}`로 조회
- 채팅 버튼은 `GET /api/v1/chat-rooms/by-negotiation/{negotiationId}`의 `chatRoomId`를 받아 `/chat?chatRoomId={chatRoomId}`로 이동
- 현재 `/chat` 화면은 `chatRoomId` 쿼리를 사용하지 않는 더미 구현이라 실제 채팅방 선택은 후속 연동 필요
- 실제 진행 계약·채팅방 조회 응답: 미검증

### 전자서명

- 계약 상세의 서명 버튼은 확인 모달 없이 `/sign` 미리보기 화면으로 이동하며 API를 호출하지 않음
- 미리보기 진입 시 `GET /api/v1/contracts/{contractId}`로 계약서와 현재 사용자 서명 상태 조회
- 계약 본문은 별도 HTML로 복제하지 않고 `GET /api/v1/contracts/{contractId}/pdf` Blob URL을 iframe에 표시해 서버 PDF와 동일하게 유지
- 주요 업무 유무에 따른 조항 번호 이동, 월 용역대금·총 계약 금액, 상주/재택 근무 장소, 조항과 서명 이미지 표시는 서버 PDF가 담당
- 대금 분할(`downAmount`, `finalAmount`)과 계약서 수정 UI는 사용하지 않음
- 서명란을 누르면 투명 배경 canvas를 열고 마우스·터치 포인터로 서명 작성
- canvas는 `devicePixelRatio`를 반영하고 `touch-action: none`을 적용
- 백엔드의 `signatureFileId`는 선택 필드지만 현재 화면 정책상 그림 서명을 필수로 요구하고 `POST /api/v1/files?purpose=SIGNATURE`로 PNG 업로드
- 파일 업로드 성공 응답의 `fileId`를 `signatureFileId`로 사용
- 마지막 `[전자 서명 및 계약 체결]`에서만 `POST /api/v1/contracts/{contractId}/signature`
- 요청: `{ agreed: true, signatureFileId }`. 캔버스 서명 적용 전에는 최종 체결 버튼 비활성화
- 최종 제출 전에 되돌릴 수 없음을 알리는 확인 모달을 표시하고, 모달 확인 시에만 서명 API 호출
- 제출 요청 중에는 모달 확인·닫기와 화면 제출 버튼을 비활성화해 중복 요청 방지
- 성공 응답 `status === SIGNED`는 마지막 서명자로 계약 체결 완료, `SIGN_PENDING`은 내 서명 완료·상대방 대기로 분기
- 서명 완료 모달은 별도 조회 없이 서명 API 응답의 `contractNo`, `projectTitle`, `freelancerName`, `startDate`, `endDate`, `payUnit`, `payAmount`를 직접 표시
- `payUnit === MONTHLY`는 급여를 `월 {payAmount}원`, 지급 방식을 `월별 지급`으로 파생 표시
- 완료 모달의 계약서 다운로드는 `GET /api/v1/contracts/{contractId}/pdf` Blob 응답 사용
- 서명 버튼과 확인 모달은 상세 `status === SIGN_PENDING`일 때만 노출
- 오류: `CONTRACT_NOT_FOUND`, `NOT_CONTRACT_PARTY`, `INVALID_CONTRACT_STATUS`, `ALREADY_SIGNED`
- 서명 API가 반환한 최신 계약 상세로 화면과 완료 모달을 갱신하며 별도 재조회하지 않음
- 한쪽만 서명한 `SIGN_PENDING`은 상대방 서명 대기, 양측 서명한 `SIGNED`는 계약 체결 완료 표시
- 기존 중복 확인 모달, `sessionStorage` 임시 서명 상태, 서명 기한·자동 취소·수정하기 UI 제거
- 실제 파일 업로드·서명 성공 및 실패 응답: 미검증
- 2026-08-10: 프로젝트 상세정보 필드와 첨부 업로드·삭제 API 연동 코드 추가, 실제 응답 미검증
- 2026-08-10: 프로젝트 사전 검수 요청·응답 및 직무 메타 연동 코드 추가, 실제 응답 미검증
- 2026-08-10: 프로젝트 등록 안내 동의 및 클라이언트 역할 제한 계약 추가, 실제 응답 미검증
- 2026-08-09: 프리랜서 소셜 로그인 시작·콜백·추가 회원가입 코드 추가, 실제 응답 미검증
- 2026-08-09: 회원가입 메타·약관 조회, 중복 확인, 이메일 인증, 일반 회원가입 제출 코드 추가, 실제 응답 미검증

## 협상 도메인

- 계약 기준 문서: `docs/api/negotiation-realtime-frontend.md`(STOMP), `docs/api/negotiation-screen-api-map.md`(화면↔API)
- 타입: `src/features/negotiation/types/negotiation.ts`
- REST 서비스: `src/features/negotiation/services/negotiation.ts`
- STOMP: `src/features/negotiation/stomp/client.ts`, `src/features/negotiation/stomp/useNegotiationEvents.ts`
- 필드 계약은 **백엔드 확정 답변(2026-08)** 으로 확정. **실제 네트워크 응답만 미검증.**
- 모든 응답은 공통 래퍼 `{ timestamp, status, code, message, data }`. 아래 필드는 전부 `data` 안.

#### 확정된 필드 (주의점)

- 상세 `GET /{id}`: `negotiationId, projectId, projectTitle, positionId, counterpartName, viewerRole, waitingForMe, status, totalRound, maxRound, agreedAmount, chatRoomId, aiOutAt, finalApprovalRequired, conditions[]`
  - `title` 아님 → **`projectTitle`**. `viewerRole`(CLIENT|FREELANCER) 제공 → 역추정 불필요. `finalApprovalRequired` 미사용(항상 false).
- `conditions[]`: `conditionId, type, clientValue, freelancerValue, proposedValue, reason, agreedValue, status, roundCount, myFloor`
  - 조건 종류 필드명은 **`type`** (요청 바디의 `conditionType` 과 다름). 값 필드는 **전부 문자열**.
- `conditionType` 코드: `AMOUNT`(월 단가·원), `PERIOD`("4 MONTH"), `START_DATE`("2026-09-01"), `WORK_STYLE`(REMOTE/ONSITE/ANY), `WORK_FORM`(FULL_TIME/PART_TIME/ANY), `SCOPE`, `OTHER`.
- **값 라벨은 하드코딩 금지 → meta API 사용**: `GET /api/v1/meta/work-conditions`(비로그인 가능) 의 `workStyles/workForms/periodUnits`({code,label}) 로 해결. 서비스 `getWorkConditionsMeta`, 유틸 `formatConditionValue(type, value, labels)`. (조건 "종류" 라벨 AMOUNT="단가(월)" 등은 협상 고유 개념이라 `CONDITION_LABEL` 로 관리)
- (2026-08-13 추가) `endReason: string | null` — `frontend-matching-negotiation-guide.md` 3.12 기준으로 타입에 추가. `status === "FAILED"`일 때만 값이 있고 타결(`AGREED`)이면 `null`. 사용자가 직접 쓴 문장이 그대로 오므로 화면엔 텍스트 자식으로만 렌더링(`NegotiationResultCard`의 `summary`), `dangerouslySetInnerHTML` 금지. **실제 응답에 이 필드가 내려오는지는 미검증** — 안 내려오면 `undefined`로 와서 카드가 기존 고정 문구로 자연스럽게 폴백한다.

#### 추가 클라리피케이션 (2차)

- 협상 화면의 근무형태 토글(상주/혼합/재택)은 **`WORK_STYLE`** 이다. `WORK_FORM`(FULL_TIME/PART_TIME/ANY)은 **협상 화면에 안 나옴**. 혼합=`ANY`(`HYBRID` 보내면 거부).
- 헤더 배지 3종은 소스가 다름: 말풍선=`GET /chat-rooms/unread-count`(미연동), 종=`GET /notifications/unread-count`, 카드 빨간점=매칭 `newProposalCount`.
- (2026-08-13 갱신) 종 배지는 `frontend-notification-integration.md` 연동으로 실제 `unread-count`에 연결했습니다. **다만 협상 3종(`NEGOTIATION_STARTED/PROPOSED/FAILED`) 알림은 여전히 발행되지 않아** 협상이 시작·제안·결렬돼도 종 배지가 켜지지 않습니다. 협상 도메인에서 알림 발행 호출이 붙으면 프론트 수정 없이 반영됩니다. 상세는 아래 "알림" 절 참고.
- 빨간점: 켜기=매칭 응답 `newProposalCount > 0`, 끄기=협상방 진입 시 `POST /negotiations/{id}/read`. (이미 반영)
- 메시지에 `(stub)` 표기 = AI 서버 폴백 상태(상대 제시값 무조건 수락 → 1라운드 전조건 합의). 프론트 문제 아님, AWS 설정 후 자연어로 전환.
- 상단 상태 배지는 `status` 기준(결렬/타결/협상 중) — 이미 반영. 초기 카드의 "상시" 값은 존재하지 않으므로 무시.
- 매칭 카드 "남은 시간"은 매칭 응답 `expiresAt` 기준으로 **프론트가 계산**(서버가 잔여시간 안 내려줌).
- 값 형식: 금액은 **원 단위 월 단가**(만원 ×10,000 전송, 표시 ÷10,000). 기간 "N MONTH", 날짜 "YYYY-MM-DD".
- 메시지 `GET /{id}/messages`: `messageId, roundNo, senderType, messageType(PROPOSAL|RESPONSE|SYSTEM), conditionType, content, reason, proposedValue, response, createdAt`. 서버가 roundNo→id 정렬. SYSTEM 은 `conditionType` null.
- 승인/재지시 판정: 상세의 **`waitingForMe === true`** 일 때만 패널 노출. 패널 안 조건별 분기는 `status`(PENDING/AGREED/REJECTED).
- `answers.roundNo` = 상세 `totalRound` 그대로(늦은 응답 필터용). `give-up` `reason` 선택(생략 시 서버가 "협상 포기" 기록).

### REST (협상방)

| Method | Path | 용도 | 요청 바디 | 실제 응답 |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/negotiations/{id}` | 협상 상세(조건·라운드·상태) | - | 미검증 |
| GET | `/api/v1/negotiations/{id}/messages` | 협상 로그(초기/재동기화) | - | 미검증 |
| POST | `/api/v1/negotiations/{id}/start` | 협상 시작(마지노선 저장) | `{ conditions:[{ conditionType, value }] }` | 미검증 |
| POST | `/api/v1/negotiations/{id}/answers` | 조건 승인/재지시 | `{ roundNo, answers:[{ conditionId, accepted, proposedValue? }] }` | 미검증 |
| POST | `/api/v1/negotiations/{id}/give-up` | 협상 포기 | `{ reason? }`(선택, 생략 시 `{}`) | 미검증 |
| POST | `/api/v1/negotiations/{id}/read` | 안 읽은 새 제안 표시 해제 | - | 미검증 |

- 시작/승인·재지시/포기 액션의 성공 응답 구조는 미검증이라, 호출 후 상세·메시지를 GET 재조회해 화면을 재동기화한다.

### REST (목록)

| Method | Path | 용도 | 실제 응답 |
| --- | --- | --- | --- |
| GET | `/api/v1/negotiations/mine?projectId={id}` | 협상 탭 후보 목록 | 미검증 |

- 목록(`getMyNegotiations`): **페이지 객체**(`content, page, size, totalElements, totalPages, first, last`). 항목: `negotiationId, negotiationNo, projectId, projectTitle, counterpartName, clientName, freelancerName, status, totalRound, waitingForMe, lastProposalBy, lastProposalAt, startedAt, endedAt`.
  - 목록에 **없는 것**: `maxRound`(상수 15), `newProposalCount`(매칭 API), `jobRole`(매칭 API).
  - `status` 는 협상 상태(IN_PROGRESS/AGREED/FAILED). §1 와이어프레임의 수락/대기/거절 배지는 **매칭 요청 상태**라 매칭 API와 합쳐 그려야 함.
  - `lastProposalBy` 는 `SenderType`. AI 는 `CLIENT_AGENT`/`FREELANCER_AGENT` → 화면에선 `_AGENT` 를 "AI"로 뭉침.
- `ProjectNegotiation`(협상 탭) → `CandidateCard`(상태·라운드·마지막 제안) → 카드 클릭 시 협상방 이동.
- **알림(빨간점)은 "협상방 가기" 버튼에만** 표시 (결정: 헤더 종 배지 미사용). 데이터는 매칭 요청 API(`MatchingRequestItem.newProposalCount`) → `ProjectFreelancerStatus`의 "협상방 가기" 버튼, `newProposalCount > 0` 이면 빨간점. 협상 시작·내부 변동 시 증가, 협상방 진입(`read`)으로 해제.
- `GET /negotiations/waiting-count` 는 현재 프론트에서 **미사용**(헤더 종 배지 연동 제거). 필요 시 서비스에 다시 추가.
- **협상방 생성**: 별도 생성 엔드포인트 없음. 매칭 수락(`POST /api/v1/matchings/requests/{requestId}/acceptance`, 프리랜서 화면) 시 같은 트랜잭션에서 자동 생성되고 응답 `MatchingRequestResponse.negotiationId` 로 즉시 이동 가능. 그래서 `negotiationId == null` = 아직 수락 전(PENDING/REJECTED/EXPIRED).
- 프리랜서 현황(`ProjectFreelancerStatus`, 클라 화면) 버튼: `status === "NEGOTIATING" && negotiationId != null` 일 때만 "협상방 가기". 수락 전/계약 단계엔 버튼 없음. (매칭 응답의 `currentRound/maxRound/newProposalCount` 는 협상 시작 전 null)

### STOMP 실시간

- 핸드셰이크: `wss://{host}/ws` (REST `NEXT_PUBLIC_API_URL`의 http(s)→ws(s) 변환 후 `/ws`)
- 인증: 로그인 accessToken **쿠키** 자동 인증(별도 헤더/쿼리 없음). SockJS 미사용.
- 협상방 구독 토픽: `/topic/negotiations/{negotiationId}` → `NegotiationEvent`
- 이벤트 타입: `NEW_PROPOSAL` / `ANSWERED` / `CONDITION_LOCKED` / `AGREED` / `FAILED`
- 화면 처리: 협상방 마운트 시 구독, 언마운트 시 해제. 이벤트 수신 시 상세/메시지 재조회.
- 크로스 오리진 시: 서버 `app.cors.allowed-origins`에 프론트 도메인 등록 필요(WS 핸드셰이크 동일 값), 프론트 `credentials:'include'`, 쿠키 `SameSite=None; Secure`. **프론트 배포 도메인 정해지면 백엔드에 CORS 등록 요청 필요.**

### 화면 처리 (협상방 `NegotiationRoom`)

- `negotiationId`는 동적 라우트 파라미터로 수신 (`/client/projects/{projectId}/negotiation/{negotiationId}`, `useParams`)
- 진입 시 상세+메시지 병렬 로드, `read` 호출, 로딩/에러/빈 상태 처리
- 상태별 화면: `IN_PROGRESS` 로그+인라인 패널 / `AGREED` 타결 카드 / `FAILED` 결렬 카드
- 타결 시 `chatRoomId != null`일 때만 [채팅으로 이어가기] 노출, null이면 "계약 체결 후 대화" 안내 (screen-api-map §10)

### 배포·확정 (백엔드 회신 2026-08-12, develop HEAD 41895de3)

- **배포 완료**: `floorComparison`(#158) `enum:["RANGE","CHOICE","NONE"]`, `PATCH /floors`(#135), `/api/ws`·`/ws` 둘 다 열림, CORS `http://localhost:17000` 등록됨 → **지금부터 실서버로 검증 가능**
- 대기 문구 판정(확정): `agentState RUNNING/FAILED` → 배포 후 우선 처리 · `waitingForMe` → 내 차례 · `REJECTED` → 상대 재입력 · `totalRound>0` → 상대 응답 대기 · `totalRound===0` → 상대 조건 입력 중
  - 프론트 현재: `totalRound` 규칙 반영 완료. `agentState`는 **미배포**라 타입만 준비(렌더/폴링은 배포 후)
- `floorComparison` NONE(SCOPE/OTHER): 안내 문구 미표시로 반영
- `PATCH /floors`: 성공 응답 `data`=상세와 동일 형태 확정(재조회 X). `AGREED` 수정 시 `CONDITION_ALREADY_LOCKED` → 현재 인라인 오류(catch)로 처리
- STOMP: SockJS off, 하트비트 `10000,10000` 명시 반영. 인증=핸드셰이크 인터셉터(JWT 쿠키)
- Gemini 연결됨(모델 호출 16~17초). 말풍선 `(stub)` 보이면 그 시점 파이썬 미연결 → 백엔드 통보

### 남은 확인/결정

- **실서버 실동작 검증**: 로그인 STOMP 클라이언트로 붙어 실시간 흐름 + `CONNECTED` heart-beat `10000,10000` 확인 (백엔드와 같이)
- 테스트 데이터: 매칭 수락 실경로로 `NEGOTIATING` 건 생성 예정 → **어느 테스트 계정(프리/클라)** 기준일지 백엔드에 알려주기
- `agentState` 배포되면: RUNNING/FAILED 라벨 + **RUNNING 동안 GET 폴링(2~3s) 폴백** 추가 (STOMP 이벤트 오면 즉시 재조회·폴링 중단)
- WS 배포 CORS: 프론트 배포 도메인/프리뷰 패턴 확정 후 `CORS_ALLOWED_ORIGINS` 등록 요청(패턴 가능: `https://*.vercel.app`)
- 프리랜서 측 대칭 화면, 조건 종류별 입력 UI는 완료. 전역 STOMP(`/user/queue/notifications`)는 후속
# 비로그인 메인 노출 리뷰 (2026-08-13)

- `GET /api/v1/home/site-reviews?size=6`
- 로그인 및 인증 쿠키 없이 호출하며 `size` 허용 범위는 1~20
- 응답 `data`는 페이징 객체가 아닌 배열
- 항목: `siteReviewId`, `writerRole`, `writerName`, `score`, `content`, `projectTitle`, `visibility`, `promoted`, `createdAt`
- `content`, `projectTitle`은 nullable이며 작성자명은 서버가 마스킹한 값을 그대로 표시
- 빈 배열 또는 조회 실패 시 리뷰 섹션을 유지하고 `아직 공개된 이용자 리뷰가 없습니다.` 안내 표시
- 실제 백엔드 성공·오류 응답: 미검증

## AI 매칭 추천 후보 1차 연동 (2026-08-13)

- 서비스: `src/features/matching/services/matching.ts`
- 타입: `src/features/matching/types/matching.ts`
- 화면: 클라이언트 프로젝트 상세 > 추천 후보
- `GET /api/v1/matchings/positions/{positionId}/candidates`
  - 프로젝트 상세의 실제 `positions[].positionId`로 포지션 탭별 조회
  - `headcount`를 선택 상한으로 사용
  - `lowScoreWarned`, `budgetWarned`는 독립 배너로 모두 표시
  - 카드에는 숫자 적합도를 표시하지 않고 `fitReasons`를 중립 태그로 표시
  - `requested=true`는 요청 완료, `rejected=true`는 카드 비활성 처리
- `POST /api/v1/matchings/candidates/{candidateId}/rejection`
  - 요청 body 없음
  - 성공 응답의 최신 `CandidateListResponse`로 후보 목록을 즉시 교체
- `POST /api/v1/matchings/requests`
  - 요청: `{ positionId, candidateIds }`
  - `candidateIds`는 `freelancerId`가 아니라 후보 조회의 `candidateId`
  - 성공 후 해당 포지션 후보 목록을 재조회해 `requested` 상태 동기화
- `MT_005`, `MT_014`, `MT_017` 사용자 안내 분기 반영
- `MT_017`은 안내 후 후보 목록 재조회
- 실제 로그인 세션 기반 성공·오류 응답: 미검증

## AI 매칭 나머지 화면 연동 (2026-08-13)

- `POST /api/v1/matchings/positions/{positionId}/rerecommendations`
  - 무료 `{ type: "FREE" }`, 유료 `{ type: "PAID", quantity }`
  - 202 접수 후 요청 버튼을 잠그고 `MATCHING_RECOMMENDED` 알림을 기다림
  - 완료 알림 수신 시 해당 포지션 후보를 재조회
- `GET /api/v1/matchings/requests/received?tab={tab}&page={page}&size={size}`
  - 프리랜서 제안 목록의 `ALL/REVIEWING/NEGOTIATING/CLOSED` 탭에 연결
  - `rejectReason=EXPIRED`와 `DIRECT_REJECT` 문구 분기
- `GET /api/v1/matchings/requests/{requestId}`
  - 프리랜서 제안 상세에서 호출하며 상세 전용 `mainTask` 표시
- `POST /api/v1/matchings/requests/{requestId}/acceptance`
  - `NEGOTIATING + negotiationId`면 협상방 이동
  - 조건 완전 일치로 `CONTRACT_PENDING`이 오면 상세 상태 유지
- `POST /api/v1/matchings/requests/{requestId}/rejection`
  - 선택 사유를 `{ reason }`으로 전송, 공백/미입력은 `{}` 전송, 최대 255자
  - `MT_016`은 상세 재조회
- `GET`, `PUT /api/v1/freelancers/me/matching-settings`
  - 조회 응답으로 토글 초기화, 변경 시 `aiMatchingAgreed`, `matchingPaused` 둘 다 전송
  - `matchable`, `unmatchableReason`을 서버 기준으로 표시
- WebSocket `/topic/users/{accountId}/notifications`
  - 공용 STOMP 클라이언트를 재사용하며 재추천 화면에서 `MATCHING_RECOMMENDED` 완료 신호 처리
  - 알림 목록 REST 계약과 클라이언트 요청 상세 라우트는 문서에 없어 알림 센터 목데이터 교체는 미적용
- 유료 재추천은 기존 화면 디자인을 유지하면서 프론트엔드·백엔드 각 `positionId`로 요청하고, 모든 포지션의 `MATCHING_RECOMMENDED` 이벤트를 받은 뒤 후보 탭으로 이동
- 유료 수량 상한은 각 포지션의 보낸 요청 목록에서 종료되지 않은 요청을 제외한 남은 자리로 제한
- 받은 요청 목록에 메타 라벨, `expiresAt` D-day, 자동 만료 안내, 서버 페이지 이동 적용
- 클라이언트 프리랜서 현황의 `requestId`로 `/client/projects/{projectId}/requests/{requestId}` 상세 화면 연결
- 알림 화면이 열려 있는 동안 4종 매칭 STOMP 이벤트를 실시간 항목으로 추가. 알림 이력 REST 계약이 없어 새로고침 후 영속 복원은 불가
- 매칭 설정에서 일시 중지/재개와 AI 활용 동의/철회를 각각 서버에 저장
- 실제 로그인 쿠키 기반 REST/STOMP 응답: 미검증
- 받은 요청 목록은 서버 `page/totalPages`로 10건씩 이동하며, 거절 모달에서 선택 사유를 최대 255자로 전송합니다.
- 수락·거절의 `MT_016` 발생 시 서버 메시지를 표시하고 목록/상세를 다시 조회해 자동 만료 상태로 동기화합니다.
- 매칭 설정은 `aiMatchingAgreed`와 `matchingPaused`를 별도 스위치로 표시하되 PUT에는 두 값을 항상 함께 보내며 `unmatchableReason`은 서버 문구 그대로 표시합니다.
- 알림의 요청 링크는 역할별 상세로 변환하고 재추천 링크는 포지션 후보 API를 재조회하는 전용 결과 화면으로 연결합니다.
- 재추천 알림에 `projectId`가 없어 특정 프로젝트 상세로 직접 이동하는 것은 현재 계약상 불가능합니다.

## 알림 센터 (2026-08-13, `frontend-notification-integration.md` 연동)

- 타입: `src/features/notification/types/notification.ts`
- REST 서비스: `src/features/notification/services/notification.ts`
- STOMP: `src/features/notification/stomp/useNotificationStream.ts`(전체 타입 공용), 헤더 배지 `src/features/notification/hooks/useUnreadNotificationCount.ts`
- 화면: `src/features/notification/components/Notifications.tsx` (`/notifications`)
- 이전까지 목데이터였던 알림 센터를 실제 REST로 교체했습니다. 위 "AI 매칭 나머지 화면 연동"의 매칭 전용 STOMP(`useMatchingNotifications`)는 그대로 두고, 알림 센터·헤더 배지는 전체 타입을 수신하는 별도 구독을 추가했습니다(같은 토픽에 구독자 2개, `subscribeTopic`이 지원).

### REST

| Method | Path | 용도|
| --- | --- | --- |
| GET | `/api/v1/notifications?unreadOnly=false&page=0&size=20` | 목록(최신순 고정) |
| GET | `/api/v1/notifications/unread-count` | 헤더 종 배지 |
| PUT | `/api/v1/notifications/{notificationId}/read` | 읽음 처리 |
| PUT | `/api/v1/notifications/read-all` | 모두 읽음 |
| DELETE | `/api/v1/notifications/{notificationId}` | 삭제 |
| DELETE | `/api/v1/notifications` | 모두 삭제 |

- 알림 객체: `{ notificationId, type, title, content, linkUrl, read, createdAt }`. `title`·`content`는 서버가 완성한 문구라 프론트에서 조립하지 않습니다.
- 목록은 "더 보기" 버튼으로 다음 페이지를 이어 붙입니다(서버 `page/totalPages` 기준).
- 클릭 시 `read`가 아니면 `PUT .../read` 호출과 함께 로컬 상태를 낙관적으로 갱신하고, `linkUrl`이 있으면 **그대로** `router.push`합니다(경로 재구성 금지).
- 삭제/모두 읽음/모두 삭제는 실패 시 이전 상태로 롤백하고 토스트로 안내합니다.

### 실시간 (STOMP)

- 구독 경로: `/topic/users/{accountId}/notifications` (기존 협상/매칭과 같은 공용 클라이언트 `src/features/negotiation/stomp/client.ts` 재사용)
- 수신 payload는 알림 객체와 같지만 `read` 필드가 없어 프론트에서 `false`로 채웁니다.
- 수신 시 토스트 표시 + 목록 맨 위에 추가, 헤더 배지는 재조회 없이 `+1`.
- 재연결 감지를 위해 `client.ts`에 `onStompConnect` 리스너 레지스트리를 추가했습니다(기존 매칭/협상 구독 동작에는 영향 없음, 추가 전용 변경). 알림 센터는 재연결 시 목록 1페이지를 다시 조회합니다(끊긴 동안 온 알림은 STOMP로 재전송되지 않기 때문).
- `INQUIRY_ANSWERED`는 관리자 서버가 생성해 실시간 push가 오지 않습니다(REST 목록·배지는 정상 반영). 프론트에서 별도 처리 없이 새로고침/재진입 시 보이는 것을 그대로 둡니다.

### `CONTRACT_CREATED`/`CONTRACT_SIGNED` linkUrl 리다이렉트

- 가이드 문서상 두 타입의 `linkUrl`은 `/contracts/{contractId}`로 오지만, 실제 화면은 역할별로 분리돼 있습니다(프리랜서 `/freelancer/contracts/{contractId}`, 클라이언트 `/client/projects/{projectId}/contracts/{contractId}`).
- 계약 상세 응답(`GET /api/v1/contracts/{contractId}`, `ContractDetailResponse`)에는 `projectId`가 없어 클라이언트 쪽은 기존에 검증된 `getAllClientContracts()`(계약 목록, `projectId` 포함)에서 `contractId`로 찾아 이동합니다.
- 리다이렉트 페이지: `src/app/contracts/[contractId]/page.tsx` → `src/features/contract/components/ContractNotificationRedirect.tsx` (매칭 알림의 `MatchingNotificationRedirect`와 동일한 패턴).
- 목록에서 못 찾으면(가입 계약이 아니거나 데이터 지연 등) `/client/contracts` 목록으로 이동합니다.

### 미검증·확인 필요

- `NEGOTIATION_STARTED`/`NEGOTIATION_PROPOSED`/`NEGOTIATION_FAILED`, `SETTLEMENT_DUE`의 실제 `linkUrl` 형식은 가이드 문서에 명시돼 있지 않아 서버 값을 그대로 이동시킵니다. 실제 협상방 경로(`/client|freelancer/projects/{projectId}/negotiation/{negotiationId}`)나 정산 경로와 다르면 확인이 필요합니다.
- 실제 로그인 세션 기반 REST 응답, STOMP 수신, 재연결 시 재조회 동작은 테스트 계정이 없어 브라우저로 확인하지 못했습니다.
## 회원 탈퇴 (2026-08-13)

- 탈퇴 가능 여부 조회: `GET /api/v1/accounts/me/withdrawal-eligibility`
- 회원 탈퇴: `DELETE /api/v1/accounts/me`
- 사용 위치: `src/features/common/services/withdrawal.ts`, `src/features/common/hooks/useWithdrawal.ts`
  - 화면: `src/features/client/mypage/components/ClientAccountCancellation.tsx`, `src/features/freelancer/mypage/components/FreelancerAccountCancellation.tsx`
- 인증: HttpOnly 로그인 쿠키. 둘 다 로그인 필요
- 조회 성공 응답 `data`: `{ withdrawable, blockers: [{ type, label, count, linkUrl }] }`
  - `label`·`linkUrl`은 서버 값을 그대로 사용(프론트 조립 금지), `blockers`는 0건이면 내려오지 않음
  - `UNPAID_SETTLEMENT`는 `count`가 항상 1이라 화면에 건수를 표시하지 않음
- 탈퇴 요청 바디: `{ agreed: true, confirmText: "탈퇴하겠습니다", reason?: string(500자) }`
  - `confirmText`는 프론트에서 앞뒤 공백만 정리(trim) 후 전송
  - 탈퇴 성공 시 `data: null` → 완료 모달 표시 후 `window.location.replace("/")`로 이동
- 화면 진입 시 조회 API를 먼저 호출해 `withdrawable === false`면 탈퇴 버튼을 비활성화하고 `blockers`를 그대로 나열
- 실패 처리
  - `AC_009`(확인 문구 불일치): 입력칸 아래 인라인 오류로 표시, 입력값 유지
  - `AC_010`(진행 중인 프로젝트·계약), `AC_011`(미납 수수료): 인라인 오류 표시 + 조회 API 재호출로 안내 갱신
  - `AC_008`(이미 탈퇴한 계정): 완료 상태로 처리해 메인으로 이동
  - `GLOBAL_002`(agreed/confirmText 누락): 폼 검증 메시지
  - `401`: "로그인이 필요합니다" 표시(현재 공통 `apiCall`의 `GLOBAL_009/010/011` 자동 처리와 별개로 이 화면 자체 401은 메시지만 표시, 별도 리다이렉트 미구현)
- 실제 백엔드 성공·오류 응답: 미검증 — 테스트 계정 없어 로그인 상태 브라우저 확인 불가

---
# 채팅 도메인 (2026-08-13, 최종 매핑 재연동)

- 목록: `GET /api/v1/chat-rooms` — `lastMessageAt` 기준 프론트 최신순 정렬, `unreadCount` 0이면 배지 숨김
- 상세: `GET /api/v1/chat-rooms/{chatRoomId}`
- 메시지: `GET /api/v1/chat-rooms/{chatRoomId}/messages?page=0&size=30` — 최신순 페이지를 시간 오름차순으로 뒤집어 표시
- 전송: `POST /api/v1/chat-rooms/{chatRoomId}/messages`, 요청 `{ content }`, 최대 500자
- 읽음: `POST /api/v1/chat-rooms/{chatRoomId}/read` — 방 진입 및 열린 방에서 STOMP 메시지 수신 시 호출
- 협상으로 방 조회: `GET /api/v1/chat-rooms/by-negotiation/{negotiationId}`
- 나가기: `POST /api/v1/chat-rooms/{chatRoomId}/leave` (`leaveEnabled`가 true일 때만 후속 UI 노출)
- 읽지 않은 전체 채팅 수: `GET /api/v1/chat-rooms/unread-count` (서비스만 추가, 헤더 연결은 후속)
- 합의안: `GET /api/v1/contracts/by-negotiation/{negotiationId}`. `CT_001`이면 카드만 숨김
- 실시간 구독: `/topic/chat-rooms/{chatRoomId}`. broadcast에는 `mine`이 없으므로 `/auth/me`의 `accountId`와 `senderId`를 비교하고 내 이벤트는 무시
- 프로필 이미지가 null이면 이름 첫 글자 아바타 표시
- `messageType === SYSTEM`은 말풍선이 아닌 중앙 구분선, 그 외 메시지는 `mine`으로 좌우 배치
- 프로필 이미지는 PR #199 배포 후 CloudFront 절대 URL을 그대로 사용하며 null 또는 로드 실패 시 첫 글자 아바타로 대체
- 실제 성공·실패 응답 및 STOMP payload: 미검증

### 백엔드 최종 회신 반영 (2026-08-13)

- 채팅방 `status`는 `ACTIVE | CLOSED` (`OPEN` 아님)
- `projectTitle`, `counterpartName`은 nullable
- 프로필 이미지 필드는 PR #199 배포 후 CloudFront 절대 URL로 반환. 프론트에서 URL 조립 금지
- 더미 데이터는 URL이 있어도 실제 객체가 없어 403일 수 있으므로 이미지 `onError` 시 첫 글자 아바타로 대체
- STOMP broadcast도 내 메시지를 제외하지 않고 `senderId === /auth/me.accountId`로 `mine`을 계산한 뒤 `messageId`로 REST 응답과 중복 제거
- 실제 채팅 오류: `CH_001` 방 없음, `CH_002` 비당사자, `CH_003` 입력 비활성, `CH_004` 나가기 불가, `CH_005` 이미 나간 방
- `GET /api/v1/chat-rooms`: PostgreSQL 파라미터 타입 추론 서버 오류 수정·배포 완료, 운영 응답 200 및 채팅방 9건 확인

---
