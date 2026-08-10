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

- 2026-08-10: 클라이언트 일반 회원가입 요청에 필수 `address` 필드 추가, 실제 응답 미검증
- 2026-08-10: 등록 성공 응답 기반 완료 화면, 프로젝트 목록·상세 조회 서비스 및 결제 정산 ID 전달 추가
- 2026-08-10: Step 6 `POST /api/v1/projects` 최종 등록 호출 및 전체 폼 변환 추가, 실제 응답 미검증

## 정산 결제

### 결제 모달 조회

- `GET /api/v1/settlements/{settlementId}`: 프로젝트명, 결제 단계, 결제 금액, 결제 가능 여부, 상태, 프로젝트 ID 조회
- `GET /api/v1/accounts/me/payment-methods`: 로그인 계정 결제수단 조회
- 결제수단 중 `methodType: CARD`만 표시하고 `BANK_ACCOUNT`는 제외
- 계정당 카드 1장 정책에 따라 선택 목록 없이 `displayName`을 그대로 표시
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
- 수정 `PUT`은 수정 폼 연결 전이라 현재 메뉴만 표시하고 요청하지 않음
- 실제 네트워크 응답: 미검증
- 2026-08-10: 프로젝트 상세정보 필드와 첨부 업로드·삭제 API 연동 코드 추가, 실제 응답 미검증
- 2026-08-10: 프로젝트 사전 검수 요청·응답 및 직무 메타 연동 코드 추가, 실제 응답 미검증
- 2026-08-10: 프로젝트 등록 안내 동의 및 클라이언트 역할 제한 계약 추가, 실제 응답 미검증
- 2026-08-09: 프리랜서 소셜 로그인 시작·콜백·추가 회원가입 코드 추가, 실제 응답 미검증
- 2026-08-09: 회원가입 메타·약관 조회, 중복 확인, 이메일 인증, 일반 회원가입 제출 코드 추가, 실제 응답 미검증
