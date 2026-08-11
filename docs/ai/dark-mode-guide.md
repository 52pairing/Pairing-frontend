# Dark Mode Guide

이 문서는 Pairing Frontend에서 라이트·다크 테마를 일관되게 적용하기 위한 작업 규칙입니다.

다크모드 관련 코드를 작성하거나 기존 화면을 다크모드에 대응할 때 이 문서를 확인합니다.

## 1. 기본 원칙

- 컴포넌트에 라이트·다크 색상을 각각 직접 작성하지 않습니다.
- 실제 색상값보다 요소의 의미와 역할을 기준으로 토큰을 선택합니다.
- 신규 중립색은 Tailwind 기본 색상이나 arbitrary color로 직접 추가하지 않습니다.
- 기존 공통 컴포넌트가 있다면 페이지에서 색상을 다시 정의하지 않고 공통 컴포넌트를 수정합니다.
- 브랜드, 오류, 경고, 성공 등 상태 색상을 중립색으로 일괄 치환하지 않습니다.
- 라이트모드와 다크모드를 모두 확인하지 않았다면 검증 완료로 기록하지 않습니다.

피해야 하는 방식:

```tsx
<div className="bg-white text-[#172033] dark:bg-gray-900 dark:text-white" />
```

권장 방식:

```tsx
<div className="bg-surface text-theme-primary" />
```

테마별 실제 색상은 `src/app/globals.css`에서 관리합니다.

## 2. 테마 종류

프로젝트는 다음 테마 선택값을 사용합니다.

```ts
type ThemePreference = "light" | "dark" | "system";
```

- `light`: 라이트 테마 고정
- `dark`: 다크 테마 고정
- `system`: 운영체제의 색상 설정 사용

테마 선택값만 `localStorage`에 저장할 수 있습니다.

인증 정보, 사용자 개인정보, 토큰 등은 테마 설정과 함께 저장하지 않습니다.

## 3. 색상 토큰

| 용도 | 사용 클래스 |
| --- | --- |
| 전체 페이지 배경 | `bg-background` |
| 카드·모달·입력창 배경 | `bg-surface` |
| 보조 영역 배경 | `bg-surface-subtle` |
| 비활성 영역 배경 | `bg-surface-muted` |
| 제목·주요 내용 | `text-theme-primary` |
| 설명·일반 내용 | `text-theme-secondary` |
| placeholder·비활성 내용 | `text-theme-muted` |
| 기본 테두리 | `border-theme` |
| 강조 테두리 | `border-theme-strong` |
| 브랜드 배경 | `bg-brand` |
| 브랜드 글자 | `text-brand` |
| 브랜드 버튼 글자 | `text-brand-contrast` |
| 브랜드 hover | `hover:bg-brand-hover` |
| 오류 글자 | `text-theme-danger` |
| 오류 배경 | `bg-danger-surface` |
| 경고 글자 | `text-theme-warning` |
| 경고 배경 | `bg-warning-surface` |
| 경고 테두리 | `border-warning-border` |
| 성공 글자 | `text-theme-success` |
| 성공 배경 | `bg-success-surface` |
| 모달 오버레이 | `bg-theme-overlay` |

색상의 실제 값이 같더라도 역할이 다르면 다른 토큰을 사용할 수 있습니다.

## 4. 변환 예시

### 페이지

변경 전:

```tsx
<main className="min-h-screen bg-[#f5f7fa] text-[#172033]" />
```

변경 후:

```tsx
<main className="min-h-screen bg-background text-theme-primary" />
```

### 카드

변경 전:

```tsx
<section className="border border-[#dce2e8] bg-white" />
```

변경 후:

```tsx
<section className="border border-theme bg-surface" />
```

### 입력창

변경 전:

```tsx
<input className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
```

변경 후:

```tsx
<input className="border border-theme bg-surface text-theme-primary placeholder:text-theme-muted" />
```

### 보조 버튼

변경 전:

```tsx
<button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
  취소
</button>
```

변경 후:

```tsx
<button className="border border-theme bg-surface text-theme-secondary hover:bg-surface-subtle">
  취소
</button>
```

### 주요 버튼

변경 전:

```tsx
<button className="bg-[#17365d] text-white hover:bg-[#102a49]">
  확인
</button>
```

변경 후:

```tsx
<button className="bg-brand text-brand-contrast hover:bg-brand-hover">
  확인
</button>
```

### 상태 안내

```tsx
<p className="bg-danger-surface text-theme-danger">오류 안내</p>
<p className="bg-warning-surface text-theme-warning">경고 안내</p>
<p className="bg-success-surface text-theme-success">성공 안내</p>
```

## 5. 고정색 예외

다음 항목은 디자인상 필요한 경우 고정색을 유지할 수 있습니다.

- 브랜드 로고
- 외부 서비스 로고
- 사용자 아바타
- 차트 데이터 색상
- 상태를 구분하는 고유 색상
- 카카오·구글 등 외부 브랜드 버튼
- 이미지와 SVG 내부 색상

고정색을 사용할 때는 다음을 확인합니다.

- 라이트·다크 배경에서 내용을 식별할 수 있는지
- 텍스트와 배경의 대비가 충분한지
- 색상만으로 상태를 구분하고 있지 않은지
- 기존 토큰으로 표현할 수 없는지

새 arbitrary color를 추가했다면 PR에 사용 이유를 작성합니다.

## 6. 작업 순서

화면별 다크모드 작업은 다음 순서로 진행합니다.

1. 페이지 전체 배경
2. 카드·패널·모달 배경
3. 제목·본문·보조 문구
4. 테두리와 구분선
5. 입력창과 placeholder
6. 버튼과 hover 상태
7. focus와 disabled 상태
8. 오류·경고·성공 상태
9. 아이콘·로고·이미지
10. 모바일·태블릿·데스크톱 확인

페이지에서 공통 컴포넌트의 색상을 덮어쓰기 전에 공통 컴포넌트 자체를 수정해야 하는지 확인합니다.

## 7. 영향 범위 확인

공통 색상 토큰이나 공통 컴포넌트를 변경하기 전에 사용 위치를 확인합니다.

```bash
rg -n "bg-surface|text-theme-primary|border-theme" src
```

신규 하드코딩 색상이 포함됐는지 확인합니다.

```bash
rg -n "bg-white|text-gray-|border-gray-|#[0-9A-Fa-f]{3,8}" src
```

검색 결과가 있다고 해서 기존 상태·브랜드 색상을 무조건 삭제하지 않습니다.

해당 색상의 역할과 다크모드 대비를 확인한 뒤 수정합니다.

## 8. 화면 검증

헤더의 테마 선택 메뉴에서 라이트와 다크를 각각 확인합니다.

- [ ] 전체 배경이 테마에 맞게 변경됩니다.
- [ ] 카드와 페이지 배경이 구분됩니다.
- [ ] 제목과 설명 문구를 읽을 수 있습니다.
- [ ] 입력값과 placeholder가 구분됩니다.
- [ ] 테두리와 구분선이 보입니다.
- [ ] hover와 focus 상태를 확인할 수 있습니다.
- [ ] disabled 상태가 구분됩니다.
- [ ] 오류·경고·성공 상태의 의미가 유지됩니다.
- [ ] 모달과 오버레이가 구분됩니다.
- [ ] 로고와 아이콘이 보입니다.
- [ ] 테마 변경 시 레이아웃이 움직이지 않습니다.
- [ ] 새로고침 후 선택한 테마가 유지됩니다.
- [ ] `system` 선택 시 운영체제 설정을 따릅니다.

## 9. 코드 검증

현재 프로젝트에 실제로 존재하는 검증 명령을 실행합니다.

```bash
npm run lint
npm run build
```

실행하지 않은 브라우저 검증이나 명령은 통과로 기록하지 않습니다.

## 10. Issue·PR 범위

다크모드 작업은 가능한 한 공통 영역 또는 도메인 단위로 나눕니다.

예시:

```text
공통 컴포넌트 다크모드
인증 화면 다크모드
클라이언트 프로젝트 화면 다크모드
프리랜서 프로젝트 화면 다크모드
협상·채팅 화면 다크모드
계약·결제 화면 다크모드
```

한 PR에 unrelated 기능 개발이나 대규모 구조 변경을 함께 포함하지 않습니다.

PR에는 다음 내용을 작성합니다.

- 적용한 화면과 라우트
- 변경한 공통 컴포넌트
- 추가하거나 변경한 색상 토큰
- 고정색을 유지한 요소와 이유
- 라이트 화면 이미지
- 다크 화면 이미지
- 실제 lint와 build 결과
- 확인하지 못한 화면과 상태

## 11. 완료 조건

- [ ] 신규 하드코딩 중립색을 추가하지 않았습니다.
- [ ] 의미 기반 색상 토큰을 사용했습니다.
- [ ] 라이트모드에서 기존 디자인이 유지됩니다.
- [ ] 다크모드에서 글자와 배경의 대비를 확인했습니다.
- [ ] 주요 hover·focus·disabled 상태를 확인했습니다.
- [ ] 공통 컴포넌트의 영향 범위를 확인했습니다.
- [ ] `npm run lint`를 통과했습니다.
- [ ] `npm run build`를 통과했습니다.
- [ ] 실제 확인하지 못한 내용을 PR에 작성했습니다.
