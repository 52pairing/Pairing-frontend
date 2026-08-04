# API

프론트에서 **실제로 사용하는** API와 그 변경 사항을 기록합니다.

추측으로 채우지 않습니다. Swagger 또는 실제 네트워크 응답으로 확인한 내용만 작성하고,
확인하지 못한 항목은 `미검증`으로 표시합니다.

관련 규칙은 `docs/ai/frontend-convention.md`(7. API 호출 규칙)와
`docs/ai/git-issue-pr-guide.md`(9. API 연동 변경)를 따릅니다.

## 공통 정보

- API 기본 주소 환경변수: `NEXT_PUBLIC_API_URL` (실제 값은 문서에 작성하지 않음)
- 공통 API 클라이언트 경로: 미도입 (확인 필요)
- 인증 방식: 확인 필요 (예: Access/Refresh token, 쿠키)
- 공통 에러 응답 형식: 확인 필요 (`errorCode`, `message` 등)

## 엔드포인트 목록

아직 연동한 API가 없습니다. 연동 시 아래 템플릿을 복사해 추가합니다.

<!-- 아래 블록을 복사해 사용합니다. -->

### [도메인] 엔드포인트 이름

- Method / Path: `GET /api/...`
- 사용 위치: `src/features/...`
- 인증 필요: 예 / 아니오
- Swagger 확인: 확인 / 미확인
- 실제 응답 확인: 확인 / 미검증

#### Request

- Path parameter:
- Query parameter:
- Request body:

#### Response (성공)

- HTTP status:
- 주요 필드:
- nullable 필드:
- enum:

#### Error

| status | errorCode | 처리 방식 |
| --- | --- | --- |
|  |  |  |

#### 비고

- 백엔드 확인 필요 내용:
- 미검증 항목:

---

## 변경 이력

- (없음)
