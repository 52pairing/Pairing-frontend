# Pairing Frontend

> 개발자 프리랜서와 클라이언트를 연결하고,  
> AI 기반 매칭과 에이전트 간 협상을 지원하는 프리랜서 매칭 플랫폼입니다.

<br />

## 🥒 Team OI

| 구분 | 내용 |
| --- | --- |
| 팀명 | 오이 |
| 프로젝트명 | 페어링 |
| Repository | Pairing-frontend |
| Frontend | 2명 |
| Backend | 5명 |

---

## 📌 프로젝트 소개

**페어링(Pairing)**은 프로젝트에 적합한 개발자 프리랜서를 찾는 클라이언트와 새로운 프로젝트를 찾는 프리랜서를 연결하는 매칭 플랫폼입니다.

단순한 조건 검색을 넘어 AI가 프로젝트 요구사항과 프리랜서의 경력, 기술 스택, 근무 조건 등을 분석하여 적합한 상대를 추천합니다.

매칭 이후에는 AI 에이전트가 단가, 계약 기간, 근무 방식 등의 조건 협상을 지원합니다. 사용자는 협상 과정을 확인하고, AI가 제안한 조건을 검토한 뒤 최종 결정을 내릴 수 있습니다.

---

## 🎯 프로젝트 목표

- 프로젝트 조건에 적합한 프리랜서를 AI가 추천
- 프리랜서와 클라이언트 사이의 반복적인 조건 협상 지원
- AI의 추천 및 협상 결과를 사용자가 이해할 수 있도록 시각화
- 중요한 결정은 사용자가 직접 승인하는 Human-in-the-loop UX 제공
- 역할별 사용자 흐름을 분리하여 복잡한 매칭 과정을 쉽게 이용할 수 있도록 구현

---

## ✨ 주요 기능

### 🔐 로그인 · 공통

- 이메일 로그인 및 회원가입
- 역할별 회원가입
- 이메일 인증
- 소셜 로그인
- 로그인 유지 및 인증 상태 관리
- 중복 로그인 처리
- 역할별 접근 권한 처리
- 알림 조회
- 마이페이지
- 계정 정보 수정
- 회원 탈퇴

### 🧑‍💼 클라이언트

- 국내 기업 회원가입
- 기업 정보 등록 및 수정
- 프로젝트 등록 및 수정
- 프로젝트 요구사항 입력
- 직무, 기술 스택, 경력, 근무 방식 설정
- AI 기반 프리랜서 추천
- 프리랜서 매칭 요청
- 매칭 요청 수락 및 거절 결과 확인
- AI 에이전트 협상 진행
- 협상 과정 및 조건 비교
- 협상 결과 승인
- 계약서 조회 및 다운로드
- 프리랜서 리뷰 작성

### 👩‍💻 프리랜서

- 프리랜서 회원가입
- 기본 프로필 등록 및 수정
- 이력서 작성
- 경력 및 프로젝트 경험 등록
- 기술 스택과 숙련도 등록
- 포트폴리오 등록
- 희망 급여 및 근무 조건 설정
- 매칭 요청 수락 및 거절
- AI 에이전트 협상 과정 확인
- 협상 결과 승인
- 계약서 조회 및 서명
- 클라이언트 리뷰 작성

### 🛡️ 관리자

- 회원 관리
- 프로젝트 관리
- 사이트 리뷰 관리
- 정산 관리
- AI Agent 관리

---

## 🛠️ 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | Next.js App Router |
| Library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Package Manager | npm |
| Unit Test | Jest |
| E2E Test | Playwright |
| Version Control | Git, GitHub |
| Collaboration | GitHub, Figma |
| Deployment | 추후 추가 |

---

## 🚀 프로젝트 실행 방법

### 1. 저장소 Clone

```bash
git clone https://github.com/52pairing/Pairing-frontend.git
```

### 2. 프로젝트 폴더 이동

```bash
cd Pairing-frontend
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_URL=
```

> `.env.local`에는 실제 서버 주소와 민감한 값이 포함될 수 있으므로 GitHub에 Push하지 않습니다.

공유가 필요한 환경변수 이름은 `.env.example` 파일에 작성하고 실제 값은 작성하지 않습니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

로컬 접속 주소:

```text
http://localhost:17000
```

---

# 📋 오이팀 프론트엔드 코드 컨벤션

> 이 문서는 팀원 모두가 일관된 코드를 작성하고 효율적으로 협업하기 위한 규칙입니다.  
> 모든 팀원은 작업 전에 아래 규칙을 확인해 주세요.

---

## 📁 1. Branch 명명 규칙

브랜치는 작업 종류, 관련 역할, 작업 목적이 명확하게 드러나도록 작성합니다.

### 브랜치 구조

| 브랜치명 | 용도 |
| --- | --- |
| `main` | Production 배포용 최종 브랜치 |
| `develop` | 프론트엔드 개발 통합 브랜치 |
| `feature/*` | 새로운 기능 및 화면 개발 |
| `fix/*` | 기능 또는 화면 오류 수정 |
| `refactor/*` | 기능 변경 없는 코드 구조 개선 |
| `test/*` | 테스트 코드 추가 및 수정 |
| `docs/*` | 문서 추가 및 수정 |
| `hotfix/*` | Production 긴급 장애 수정 |
| `release/*` | 배포 및 버전 준비 |

### 브랜치 작성 형식

```text
{작업유형}/{역할}-{작업명}#이슈번호
```

예시:

```text
feature/auth-login#12
feature/freelancer-resume#24
feature/client-project-form#31
fix/auth-redirect#45
refactor/common-api-client#52
test/auth-login-form#61
docs/common-branch-guide#70
hotfix/auth-login-error#83
release/common-v0-1-0#90
```

### 역할명

| 역할 | 설명 |
| --- | --- |
| `auth` | 로그인 및 회원가입 |
| `common` | 공통 기능 또는 여러 역할에 걸친 기능 |
| `freelancer` | 프리랜서 기능 |
| `client` | 클라이언트 기능 |
| `admin` | 관리자 기능 |

### 작성 규칙

- 브랜치명은 영문으로 작성합니다.
- 영문 소문자와 하이픈만 사용합니다.
- 언더스코어 `_`는 사용하지 않습니다.
- 이슈 번호 앞에는 하이픈을 추가하지 않습니다.
- 브랜치명만 보고 작업 범위를 알 수 있도록 작성합니다.

---

## 🔀 2. Branch 운영 방식

### 일반 작업

일반 작업 브랜치는 `develop`에서 생성하고 `develop`으로 PR을 보냅니다.

```text
develop
├── feature/*
├── fix/*
├── refactor/*
├── test/*
└── docs/*
```

작업 흐름:

```text
develop 최신화
→ 작업 브랜치 생성
→ 기능 개발
→ 작업 브랜치 Push
→ develop 대상 PR 생성
→ 코드 리뷰
→ develop 병합
```

작업 시작 전:

```bash
git switch develop
git pull origin develop
```

작업 브랜치 생성 예시:

```bash
git switch -c "feature/auth-login#12"
```

### Production 배포

배포할 기능이 모두 `develop`에 병합되면 Release PR을 생성합니다.

```text
develop → main
```

`main` 브랜치에는 직접 Push하지 않습니다.

### Hotfix

Production에서 긴급한 장애가 발생한 경우 `main`을 기준으로 Hotfix 브랜치를 생성합니다.

```text
main
→ hotfix/*
→ main
→ Production 배포 확인
→ 동일한 수정 내용을 develop에 반영
```

---

## ✍️ 3. Commit Message 규칙

커밋 메시지는 다음 형식을 사용합니다.

```text
[TYPE] 작업 내용#이슈번호
```

예시:

```text
[FEATURE] 로그인 화면 구현#12
[FIX] 로그인 후 이동 경로 오류 수정#24
[REFACTOR] 공통 API 요청 로직 분리#31
[TEST] 로그인 폼 유효성 검사 테스트 추가#42
[DOCS] GitHub 협업 규칙 수정#55
[HOTFIX] Production 로그인 불가 문제 수정#68
[RELEASE] v0.1.0 배포 준비#74
```

### Type 종류

| Type | 설명 |
| --- | --- |
| `FEATURE` | 새로운 기능 또는 화면 추가 |
| `FIX` | 기능, UI 또는 API 오류 수정 |
| `REFACTOR` | 기능 변경 없는 코드 구조 개선 |
| `TEST` | 테스트 코드 추가 및 수정 |
| `DOCS` | 문서 추가 및 수정 |
| `HOTFIX` | Production 긴급 장애 수정 |
| `RELEASE` | 배포 및 버전 관련 작업 |

### 작성 규칙

- Type은 대문자로 작성합니다.
- Type은 대괄호로 감쌉니다.
- Type 뒤에는 한 칸 띄어씁니다.
- 작업 내용은 50자 이내로 작성합니다.
- 작업 내용 끝에는 마침표를 붙이지 않습니다.
- 완료형보다 명령문 형태로 작성합니다.
- 관련 이슈가 있다면 마지막에 이슈 번호를 작성합니다.

좋은 예시:

```text
[FEATURE] 프리랜서 이력서 등록 기능 구현#15
```

피해야 할 예시:

```text
프리랜서 이력서 등록 기능을 구현했습니다.
```

### 커밋 본문

추가 설명이 필요한 경우 커밋 본문에는 **무엇을 변경했는지**, **왜 변경했는지** 작성합니다.

```text
[FIX] 로그인 오류 메시지 분기 처리#24

중복 로그인과 토큰 만료 상황에서 동일한 안내 문구가 표시되는 문제를 수정했습니다.
백엔드 오류 코드를 기준으로 사용자 안내 문구를 분리했습니다.
```

---

## 🔖 4. Issue 규칙

작업을 시작하기 전에 관련 이슈를 생성합니다.

### Issue 종류

- FEATURE
- FIX
- REFACTOR
- TEST
- DOCS
- HOTFIX
- RELEASE

### Issue 작성 내용

- 작업 목적
- 관련 역할
- 상세 작업 내용
- 관련 화면 및 라우트
- API 및 데이터 연동
- 완료 조건
- 관련 브랜치
- 참고 자료

이슈 생성 후 이슈 번호를 포함해 브랜치를 생성합니다.

```text
feature/freelancer-resume#15
```

---

## 🔗 5. Pull Request 규칙

### PR 제목

```text
[TYPE] 작업 내용
```

예시:

```text
[FEATURE] 로그인 화면 구현
[FIX] 프로젝트 등록 검증 오류 수정
[REFACTOR] API 요청 모듈 구조 개선
[TEST] 이력서 폼 테스트 추가
[DOCS] GitHub 협업 규칙 수정
[HOTFIX] Production 로그인 장애 수정
[RELEASE] v0.1.0 초기 기능 배포
```

### PR 작성 규칙

- 관련 이슈를 연결합니다.
- 작업 내용을 구체적으로 작성합니다.
- 변경된 화면이 있다면 스크린샷을 첨부합니다.
- 테스트 방법과 결과를 작성합니다.
- 리뷰가 필요한 부분을 작성합니다.
- 일반 PR의 Base 브랜치는 `develop`으로 설정합니다.
- Release PR의 Base 브랜치는 `main`으로 설정합니다.
- Hotfix PR의 Base 브랜치는 `main`으로 설정합니다.

관련 이슈를 자동 종료하려면 PR 본문에 다음 형식을 사용합니다.

```text
Closes #12
```

---

## 💻 6. 코드 작성 규칙

### 공통 규칙

- 함수와 변수는 하나의 역할만 수행하도록 작성합니다.
- 컴포넌트의 책임이 커지면 작은 단위로 분리합니다.
- 함수가 어떤 역할을 하는지 필요한 경우 주석으로 설명합니다.
- 주석은 코드 자체보다 해당 구현을 선택한 이유를 설명합니다.
- 의미 없는 축약어를 사용하지 않습니다.
- 사용하지 않는 코드와 주석은 제거합니다.
- 디버깅용 `console.log`는 작업 완료 전에 제거합니다.

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 변수 및 함수 | camelCase | `getUserInfo`, `isLoading` |
| React 컴포넌트 | PascalCase | `LoginForm`, `ProjectCard` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 커스텀 훅 | `use` 접두사 + camelCase | `useAuth`, `useProjectForm` |
| 컴포넌트 파일 | PascalCase | `LoginForm.tsx` |
| 훅 파일 | camelCase | `useAuth.ts` |
| 유틸리티 파일 | camelCase | `formatDate.ts` |
| 타입 및 인터페이스 | PascalCase | `ProjectResponse` |
| CSS 클래스 | kebab-case | `login-button` |

### TypeScript 규칙

- `var`는 사용하지 않습니다.
- 변경되지 않는 값은 `const`를 사용합니다.
- 값이 변경되어야 하는 경우에만 `let`을 사용합니다.
- `any` 타입은 사용을 지양합니다.
- `any`가 불가피하다면 사용 이유를 주석으로 작성합니다.
- API 요청 및 응답 데이터에는 타입을 작성합니다.
- 컴포넌트 Props 타입을 명시합니다.
- 중복되는 타입은 공통 타입으로 분리합니다.

### React 규칙

- 함수형 컴포넌트를 사용합니다.
- 컴포넌트와 함수는 기본적으로 화살표 함수로 작성합니다.
- 하나의 컴포넌트가 너무 많은 역할을 담당하지 않도록 분리합니다.
- 반복되는 로직은 커스텀 훅으로 분리합니다.
- 중첩 삼항 연산자는 사용을 지양합니다.
- 중첩 삼항 연산자가 불가피한 경우 동작을 설명하는 주석을 작성합니다.
- 리스트 렌더링 시 안정적인 `key`를 사용합니다.
- 불필요한 상태와 Effect 사용을 줄입니다.

---

## 🎨 7. Styling 규칙

- Tailwind CSS 유틸리티 클래스를 사용합니다.
- 별도 CSS 파일 생성은 공통 스타일 등 필요한 경우로 제한합니다.
- 동일한 스타일 조합이 반복되면 컴포넌트로 분리합니다.
- 인라인 스타일은 동적으로 계산되는 값에만 사용합니다.
- 임의의 색상보다 프로젝트 디자인 토큰을 우선 사용합니다.
- 모바일과 데스크톱 화면을 모두 확인합니다.

---

## 📂 8. 폴더 구조

Next.js App Router와 도메인 단위 구조를 사용합니다.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (client)/
│   ├── (freelancer)/
│   ├── admin/
│   ├── layout.tsx
│   └── page.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── client/
│   ├── freelancer/
│   ├── matching/
│   ├── negotiation/
│   ├── contract/
│   ├── notification/
│   └── common/
│
├── components/
│   └── ui/
│
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

### 폴더 작성 규칙

- `src/app`에는 페이지, 레이아웃, 라우팅 관련 코드를 작성합니다.
- 실제 기능 로직은 `src/features`에 작성합니다.
- 특정 도메인에서만 사용하는 컴포넌트는 해당 도메인의 `components`에 둡니다.
- 여러 도메인에서 사용하는 UI 컴포넌트는 `src/components/ui`에 둡니다.
- 여러 도메인에서 사용하는 기능은 `src/features/common`에 둡니다.
- API 클라이언트 인스턴스, 인증·쿠키 설정 등 인프라는 `src/lib`에 둡니다.
- 여러 도메인이 공유하는 API 호출은 `src/services`에 둡니다.
- 특정 도메인 전용 API 호출은 해당 도메인의 `src/features/<도메인>/services`에 둡니다.
- 프로젝트 전체에서 사용하는 타입은 `src/types`에 둡니다.
- 프로젝트 전체에서 사용하는 순수 함수는 `src/utils`에 둡니다.
- 폴더 위치가 애매한 경우 팀원과 먼저 논의합니다.

> `lib`은 API 클라이언트를 **만드는** 인프라 계층, `services`는 그 클라이언트로 실제 API를 **호출하는** 계층입니다. 공통이면 `src/services`, 도메인 전용이면 `features/<도메인>/services`에 둡니다.

현재 전역 상태 관리 라이브러리는 사용하지 않습니다. 도입이 필요할 경우 팀원과 논의한 후 결정합니다.

---

## 🧪 9. 테스트 규칙

### 테스트 도구

| 테스트 | 도구 |
| --- | --- |
| 단위 테스트 | Jest |
| 컴포넌트 테스트 | Jest |
| E2E 테스트 | Playwright |

### 테스트 폴더

```text
unit-tests/    # Jest 단위 및 컴포넌트 테스트
tests/         # Playwright E2E 테스트
```

### 테스트 실행

```bash
npm run test
```

```bash
npm run test:e2e
```

### 테스트 작성 기준

- 핵심 사용자 흐름을 우선 테스트합니다.
- 정상 동작과 예외 상황을 함께 테스트합니다.
- API 성공과 실패 상황을 확인합니다.
- 로딩, 에러, 빈 상태를 확인합니다.
- 다른 테스트의 실행 결과에 의존하지 않도록 작성합니다.
- 동일한 테스트는 실행 순서와 관계없이 같은 결과가 나와야 합니다.

---

## 🛠️ 10. 개발 환경 및 설정

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** npm
- **Unit Test:** Jest
- **E2E Test:** Playwright
- **Local Server:** `npm run dev`
- **Local Port:** `17000`
- **Environment File:** `.env.local`

환경변수 파일은 GitHub에 올리지 않습니다.

```text
.env
.env.local
.env.development.local
.env.production.local
.env*.local
```

공유가 필요한 환경변수 이름은 `.env.example`에 작성하고 실제 값은 작성하지 않습니다.

AI 개발 도구 사용 규칙과 프로젝트 기술 스택의 상세 내용은 다음 문서를 참고합니다.

- [`AGENTS.md`](AGENTS.md)
- [`CLAUDE.md`](CLAUDE.md)

---

## 💬 11. 코드 리뷰 원칙

- 수정 요청에는 이유를 함께 작성합니다.
- 가능한 경우 대안을 함께 제시합니다.
- 이해되지 않는 코드는 질문 형태로 리뷰합니다.
- 칭찬과 긍정적인 피드백도 적극적으로 작성합니다.
- 긴급하지 않은 리뷰는 충분한 검토 시간을 제공합니다.

---

## 📌 12. 버전 관리 규칙

프로젝트 버전은 다음 형식을 사용합니다.

```text
vMAJOR.MINOR.PATCH
```

예시:

```text
v0.1.0
v0.2.0
v0.2.1
```

### Version Update 기준

| 유형 | 증가 예시 | 기준 |
| --- | --- | --- |
| `MAJOR` | `v1.0.0 → v2.0.0` | 기존 버전과 호환되지 않는 구조 또는 사용 방식 변경 |
| `MINOR` | `v1.0.0 → v1.1.0` | 새로운 기능, 화면 또는 API 연동 추가 |
| `PATCH` | `v1.0.0 → v1.0.1` | 버그, UI, 성능 또는 문서 수정 |

---

## 📖 13. Release 규칙

여러 작업이 `develop`에 병합되고 배포 준비가 완료되면 Release PR을 생성합니다.

```text
feature/* → develop
fix/* → develop
refactor/* → develop
test/* → develop
docs/* → develop

develop → main
```

### Release Note 분류

- `Added`: 새로 추가된 기능
- `Changed`: 기존 기능, UI, 구조 또는 로직 변경
- `Fixed`: 버그 및 오류 수정

Release PR에는 다음 내용을 포함합니다.

- 배포 버전
- 포함된 기능과 수정 사항
- 관련 이슈와 PR
- 통합 테스트 결과
- 배포 전 확인 사항
- 배포 후 확인 사항
- 위험 요소
- 롤백 계획

---

## 🏷️ 14. Git Tag

Production 배포가 완료되면 해당 버전의 Git Tag를 생성합니다.

```bash
git tag v0.1.0
git push origin v0.1.0
```

태그 목록 확인:

```bash
git tag
```

잘못 생성한 로컬 태그 삭제:

```bash
git tag -d v0.1.0
```

원격 태그 삭제:

```bash
git push origin --delete v0.1.0
```

---

## 📎 관련 문서

- [AI 작업 규칙](AGENTS.md)
- [Claude 작업 규칙](CLAUDE.md)
- [GitHub Issue Templates](.github/ISSUE_TEMPLATE)
- [GitHub Pull Request Templates](.github/PULL_REQUEST_TEMPLATE)

---

> 📝 **마지막 업데이트:** 2026.08.04  
> 🥒 **Team OI — Pairing**