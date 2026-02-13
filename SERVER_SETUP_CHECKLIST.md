# 미니PC 서버 셋업 체크리스트

> 미니PC(192.168.0.103)에 백엔드 서버를 띄워 클라이언트 개발자가 테스트할 수 있도록 하는 가이드

---

## Phase 1: 미니PC 환경 준비 ✅ 완료

- [x] SSH 접속: `ssh s980903@192.168.0.103`
- [x] Node.js v18.19.1 확인됨 (시스템 Node, nvm 미사용)
- [x] pnpm 10.29.3 설치 완료 (`sudo npm install -g pnpm`)
- [x] PM2 6.0.13 확인됨 (기존 디스코드 봇용으로 이미 설치)
- [x] 방화벽: ufw inactive 상태 (포트 차단 없음, 규칙 추가 완료)

---

## Phase 2: 프로젝트 클론 및 의존성 설치

- [ ] 프로젝트 클론
  ```bash
  cd ~
  git clone https://github.com/TeamMaSaHak/masahak_app.git
  cd masahak_app/backend
  ```
- [ ] 의존성 설치
  ```bash
  pnpm install
  ```

---

## Phase 3: .env 수정

- [ ] `.env` 파일 생성/편집
  ```bash
  nano .env
  ```
- [ ] `NODE_ENV` 변경
  ```
  NODE_ENV=development
  ```
- [ ] `DISCORD_REDIRECT_URI` 변경
  ```
  DISCORD_REDIRECT_URI=http://192.168.0.103:3000/api/auth/discord/callback
  ```
- [ ] `JWT_SECRET` 강화 (권장)
  ```bash
  openssl rand -hex 32
  # 출력된 값을 JWT_SECRET에 설정
  ```
- [ ] 나머지 키 확인 (SUPABASE, FIREBASE, GEMINI 등은 기존 값 그대로 사용)

---

## Phase 4: Discord Developer Portal 설정

- [ ] [Discord Developer Portal](https://discord.com/developers/applications) 접속
- [ ] 해당 앱 선택 → OAuth2 → Redirects
- [ ] 새 Redirect URI 추가: `http://192.168.0.103:3000/api/auth/discord/callback`
- [ ] 저장

---

## Phase 5: 빌드 및 서버 실행

- [ ] 빌드
  ```bash
  pnpm build
  ```
- [ ] PM2로 서버 실행
  ```bash
  pm2 start dist/main.js --name masahak-backend
  pm2 save
  ```
- [ ] 서버 동작 확인
  ```bash
  curl http://localhost:3000/api/health
  pm2 list
  pm2 log masahak-backend
  ```

---

## Phase 6: 클라이언트 개발자에게 전달

- [ ] 아래 정보를 클라이언트 개발자에게 공유

| 항목 | 값 |
|------|-----|
| API Base URL | `http://192.168.0.103:3000/api` |
| Swagger 문서 | `http://192.168.0.103:3000/api-docs` |
| Discord Client ID | `1419219230812799076` |
| Discord Redirect URI | `http://192.168.0.103:3000/api/auth/discord/callback` |

> **주의**: `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `FIREBASE_PRIVATE_KEY` 등 서버 전용 시크릿은 절대 클라이언트에 전달 금지

---

## 이후 코드 업데이트 시

```bash
ssh s980903@192.168.0.103
cd ~/masahak_app/backend
git pull
pnpm install
pnpm build
pm2 restart masahak-backend
```
