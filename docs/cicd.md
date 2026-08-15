# Pairing-frontend CI/CD (적용 안내)

레포 루트에 그대로 얹으면 됩니다. **기존 파일을 덮어쓰지 않습니다.**

```
Pairing-frontend/
├── Dockerfile                     (신규)
├── .dockerignore                  (신규)
└── .github/workflows/
    ├── ci.yml                     (신규)
    └── deploy.yml                 (신규)
```

`.github/workflows/auto-pr-template.yml` 은 그대로 두면 됩니다. 이름이 겹치지 않습니다.

---

## 1. 네이밍 (다른 레포와 같은 규칙)

| 항목 | 값 |
| --- | --- |
| ECR 리포지토리 | `team02-02/pairing-frontend` |
| ECS 클러스터 | `team02-02-pairing-cluster` |
| 태스크 정의 패밀리 | `team02-02-pairing-frontend-task` |
| ECS 서비스 | `team02-02-pairing-frontend-service` |
| 컨테이너 이름 | `pairing-frontend` |
| 컨테이너 포트 | `17000` |
| CloudWatch 로그 그룹 | `/ecs/team02-02-pairing-frontend` |
| FireLens 로그 라벨 | `job=pairing-frontend,env=dev` |
| 이미지 태그 | main → `{sha}` + `latest` / develop → `develop-{sha}` + `develop` |

`CONTAINER_NAME` 이 태스크 정의의 컨테이너 이름과 **반드시 같아야** 합니다. 다르면 render 스텝이
조용히 통과하고 옛 이미지가 그대로 배포됩니다.

포트가 17000 인 것은 `package.json` 의 `start` 스크립트(`next start -p 17000`)를 그대로 따른 것입니다.

### Cloud Map 은 필요 없습니다

`spring` / `python` 은 서버끼리 이름으로 부르기 위해 등록했지만, 프론트엔드는 브라우저가 ALB 를 통해
들어오는 쪽이라 서비스 디스커버리가 필요 없습니다. 나중에 서버가 프론트를 호출할 일이 생기면
같은 네임스페이스에 `front` 로 등록하면 됩니다.

---

## 2. GitHub 설정

### Secrets (Settings → Secrets and variables → Actions → Secrets)

| 이름 | 값 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | 배포용 IAM 사용자 액세스 키 (백엔드·파이썬 레포와 같은 키 사용 가능) |
| `AWS_SECRET_ACCESS_KEY` | 위 시크릿 키 |

### Variables (같은 화면의 Variables 탭)

| 이름 | 값 | 비고 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://52pairing.kro.kr` | 없으면 워크플로가 이 값을 기본으로 씁니다 |

**시크릿이 아니라 Variables 인 이유:** 이 값은 브라우저 번들에 그대로 박혀서 누구나 볼 수 있는
공개 정보입니다. 시크릿에 넣으면 워크플로 로그에서 마스킹되어 오히려 디버깅만 어려워집니다.

---

## 3. AWS 사전 준비 (워크플로가 만들어주지 않음)

- ECR 리포지토리 `team02-02/pairing-frontend`
- 태스크 정의 `team02-02-pairing-frontend-task` **리비전 1 을 콘솔에서 먼저 등록**
  (컨테이너 이름 `pairing-frontend`, 포트 17000, 실행 역할 `ecsTaskExecutionRole`)
- 서비스 `team02-02-pairing-frontend-service` (클러스터 `team02-02-pairing-cluster`)
- ALB 타깃그룹: 프로토콜 HTTP, 포트 17000, 헬스체크 경로 `/`

`deploy.yml` 은 `describe-task-definition` 으로 최신 리비전을 받아 **이미지만 교체**하는 구조라,
최초 1회는 태스크 정의가 AWS 에 있어야 합니다.

### 태스크 정의 환경변수

프론트엔드는 **런타임 환경변수가 필요 없습니다.** `NEXT_PUBLIC_API_URL` 은 빌드 시점에 번들로
들어가므로 태스크 정의에 넣어도 화면 동작이 바뀌지 않습니다. 넣을 값은 아래 정도입니다.

```
NODE_ENV=production      (Dockerfile 에 이미 있음)
PORT=17000               (Dockerfile 에 이미 있음)
TZ=Asia/Seoul            (선택 — 로그 시각을 KST 로 보고 싶을 때)
```

API 주소를 바꾸려면 태스크 정의가 아니라 **Variables 를 고치고 재배포**해야 합니다.

---

## 4. 이미지 크기 (선택)

지금 Dockerfile 은 `next.config.ts` 를 건드리지 않고 동작하도록 `next start` 방식으로 만들었습니다.
런타임에 프로덕션 의존성이 들어가서 이미지가 큽니다(수백 MB).

`next.config.ts` 에 한 줄을 추가하면 크게 줄어듭니다.

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

그 뒤 Dockerfile 실행 스테이지를 파일 하단 주석 블록으로 교체하면 됩니다.

---

## 5. 동작 흐름

```
[PR]    ci.yml      npm ci → lint → next build          (타입 오류·프리렌더 오류를 여기서 잡음)
[머지]  deploy.yml  lint → docker build(--build-arg API_URL) → ECR push
                    → 최신 태스크 정의 받아 이미지만 교체 → 서비스 업데이트(안정화까지 대기)
```

`next build` 는 `useSearchParams` 를 Suspense 없이 쓴 경우처럼 프리렌더 단계에서만 드러나는 문제도
잡아냅니다. 실제로 그 문제가 있던 3개 페이지는 이미 수정되어 현재 빌드는 통과합니다.
