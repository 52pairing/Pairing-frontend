# =====================================================================
# Next.js 프로덕션 이미지 (multi-stage)
#
# 주의 1: NEXT_PUBLIC_* 는 빌드 시점에 번들에 문자열로 박힌다.
#         ECS 태스크 정의의 environment 에 넣어도 브라우저 코드에는 반영되지 않아서 build arg 로 받는다.
# 주의 2: next.config.ts 에 output: "standalone" 을 켜지 않은 현재 구성에 맞춘 Dockerfile 이다.
#         (레포를 건드리지 않고 그대로 동작하게 만든 형태다. 이미지 축소 방법은 아래 참고)
# =====================================================================

# ---------- 빌드 ----------
FROM node:22-alpine AS builder
WORKDIR /app

# lock 파일만 먼저 복사해 레이어 캐시를 살린다. 소스가 바뀌어도 npm ci 를 다시 돌지 않는다.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 값이 없으면 src/lib/api.ts 의 API_BASE 가 undefined 가 되어 런타임 요청이 전부 깨진다.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- 실행 ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# package.json 의 start 스크립트(next start -p 17000)와 포트를 맞춘다.
# HOSTNAME 을 0.0.0.0 으로 두지 않으면 컨테이너 밖에서 접속되지 않는다.
ENV PORT=17000
ENV HOSTNAME=0.0.0.0

# 런타임에는 프로덕션 의존성만 둔다. devDependencies(타입·eslint·tailwind)는 이미지에 들어가지 않는다.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# root 로 돌리지 않는다.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 17000

CMD ["./node_modules/.bin/next", "start", "-p", "17000"]

# ---------------------------------------------------------------------
# 이미지를 더 줄이고 싶으면 next.config.ts 에 output: "standalone" 을 추가하고
# 실행 스테이지를 아래로 바꾼다. node_modules 전체 대신 필요한 파일만 들어가 수백 MB 가 줄어든다.
#
#   COPY --from=builder /app/public ./public
#   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
#   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#   CMD ["node", "server.js"]
#
# (.next/static 은 standalone 산출물에 포함되지 않아 따로 복사해야 한다. 빠뜨리면 CSS/JS 가 404 다)
# ---------------------------------------------------------------------
