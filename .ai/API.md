# API

프론트에서 실제 사용하는 API와 검증 상태를 기록합니다.

## 공통 정보

- API 기본 주소 환경변수: `NEXT_PUBLIC_API_URL`
- 공통 API 클라이언트: `src/lib/api.ts`
- 인증 방식: HttpOnly 쿠키, 모든 요청에 `credentials: "include"`
- 성공 응답: 공통 응답의 `data` 반환
- 실패 응답: `ApiException(errorCode, message, status)`로 변환
- 계약 출처: 백엔드 `frontend-auth-integration.md`
- Swagger 확인: 미확인
- 실제 네트워크 응답: 미검증

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
- 프리랜서 생년월일은 `YYYY-MM-DD`로 전송
- 약관 조회 결과의 모든 `AGREEMENT` 항목을 `{ termsId, agreed }`로 전송하며 선택 약관 미동의도 `false`로 포함
- 가입 중 완료 버튼을 비활성화해 중복 제출 방지
- 서버 오류 메시지를 약관 단계에 표시하고 입력값 유지
- 성공 시 자동 로그인하지 않고 가입 완료 화면에서 로그인 페이지로 이동

## 변경 이력

- 2026-08-09: 회원가입 메타·약관 조회, 중복 확인, 이메일 인증, 일반 회원가입 제출 코드 추가, 실제 응답 미검증
