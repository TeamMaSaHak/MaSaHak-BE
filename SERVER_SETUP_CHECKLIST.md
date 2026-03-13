# 미니PC 서버 셋업 체크리스트

> 미니PC(`<server-local-ip>`)에 백엔드 서버를 띄워 클라이언트 개발자가 테스트할 수 있도록 하는 가이드

---

## Phase 1: 미니PC 환경 준비 ✅ 완료

- [x] SSH 접속: `ssh <your-username>@<server-local-ip>`
- [x] Node.js v20.20.0 (nvm으로 업그레이드, 기존 v18은 crypto 미지원 문제)
- [x] pnpm 10.29.3 설치 완료 (`sudo npm install -g pnpm`)
- [x] PM2 6.0.13 확인됨 (기존 디스코드 봇용으로 이미 설치)
- [x] 방화벽: ufw inactive 상태 (포트 차단 없음, 규칙 추가 완료)

---

## Phase 2: 프로젝트 클론 및 의존성 설치 ✅ 완료

- [x] 프로젝트 클론 완료 (`~/masahak_app/backend`)
  ```
  git clone https://github.com/TeamMaSaHak/MaSaHak-BE.git masahak_app/backend
  ```
- [x] `pnpm install` 완료 (798 패키지)

---

## Phase 3: .env 수정 ✅ 완료

- [x] 로컬 `.env`를 scp로 미니PC에 전송
- [x] `NODE_ENV` 변경: `production` → `development`
- [x] `DISCORD_REDIRECT_URI` 변경: `localhost` → Cloudflare Tunnel URL
- [x] MCP 섹션 제거 (서버에 불필요)
- [ ] `JWT_SECRET` 강화 (권장, 테스트 단계에서는 현재 값으로 동작)
- [x] 나머지 키 확인 완료 (SUPABASE, FIREBASE, GEMINI 등 기존 값 유지)

---

## Phase 4: Discord Developer Portal 설정 ✅ 완료

- [x] Discord Developer Portal 접속
- [x] OAuth2 → Redirects에 `http://<server-local-ip>:3000/api/auth/discord/callback` 추가
- [x] OAuth2 → Redirects에 `https://bradford-discovery-cruz-casa.trycloudflare.com/api/auth/discord/callback` 추가
- [x] 기존 localhost URI도 유지 (로컬 개발용)

---

## Phase 5: 빌드 및 서버 실행 ✅ 완료

- [x] `pnpm build` 완료
- [x] PM2로 서버 실행 (`pm2 start dist/main.js --name masahak-backend`)
- [x] `pm2 save` 완료
- [x] 헬스체크 통과: `{"success":true,"data":{"status":"ok","service":"masahak-api"}}`

---

## Phase 5.5: Cloudflare Tunnel (외부 접속) ✅ 완료

- [x] cloudflared 2026.2.0 설치
- [x] Quick Tunnel 실행 (`cloudflared tunnel --url http://localhost:3000`)
- [x] 공개 URL 발급: `https://bradford-discovery-cruz-casa.trycloudflare.com`
- [ ] (추후) Named Tunnel + 도메인 연결로 URL 고정

> **참고**: Quick Tunnel은 프로세스 종료 시 URL이 변경됨. 재시작 명령:
> ```bash
> cloudflared tunnel --url http://localhost:3000
> ```

---

## Phase 6: 클라이언트 개발자에게 전달

- [ ] 아래 정보를 클라이언트 개발자에게 공유

| 항목 | 값 |
|------|-----|
| API Base URL (외부) | `https://bradford-discovery-cruz-casa.trycloudflare.com/api` |
| Swagger 문서 (외부) | `https://bradford-discovery-cruz-casa.trycloudflare.com/api-docs` |
| API Base URL (내부) | `http://<server-local-ip>:3000/api` |
| Discord Client ID | `1419219230812799076` |
| Discord Redirect URI | `https://bradford-discovery-cruz-casa.trycloudflare.com/api/auth/discord/callback` |

> **주의**: `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `FIREBASE_PRIVATE_KEY` 등 서버 전용 시크릿은 절대 클라이언트에 전달 금지
> **참고**: Quick Tunnel URL은 재시작 시 변경될 수 있음. 변경 시 클라이언트에 재공유 필요

---

## 이후 코드 업데이트 시

```bash
ssh <your-username>@<server-local-ip>
cd ~/masahak_app/backend
git pull
pnpm install
pnpm build
pm2 restart masahak-backend
```
