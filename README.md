# Hacklog

해커톤 참가 기록 및 랭킹 관리 웹 애플리케이션. React 19 + TypeScript + Vite + Tailwind CSS 기반의 프론트엔드 전용 프로토타입입니다. 백엔드 없이 모든 상태를 localStorage에서 관리합니다.

## 개발 명령어

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # tsc + vite build → dist/
npm run preview  # dist/ 로컬 서버
npm run lint     # ESLint
```

---

## Seed 데이터 & 유저 시스템

### 개요

앱 최초 로드 시 `src/data/` 아래의 JSON 파일들을 localStorage로 자동 시딩합니다. 이미 localStorage에 데이터가 있으면 seed는 무시됩니다.

> **seed 데이터 재적용**: 브라우저 DevTools → Application → Storage → **Clear site data**

---

### Seed 유저 목록 (`src/data/users.json`)

총 37명의 seed 유저가 있습니다. seed 유저(user-seed-*)의 비밀번호는 `seed1234`, 테스터 계정(user-test-*)의 비밀번호는 `123456`입니다.

**어드민 계정** — `admin@a.com` / `123456` (`isAdmin: true`)

| ID | username | email | 소속 팀 | 역할 |
|----|----------|-------|---------|------|
| user-seed-001 | jiho_kim | jiho@example.com | Team Alpha | 리더 |
| user-seed-002 | suyeon_lee | suyeon@example.com | Team Alpha | 멤버 |
| user-seed-003 | donghyun_park | donghyun@example.com | Team Alpha | 멤버 |
| user-seed-004 | areum_choi | areum@example.com | Team Alpha | 멤버 |
| user-seed-005 | minsu_jung | minsu@example.com | Team Alpha | 멤버 |
| user-seed-006 | jiwon_yoon | jiwon@example.com | Team Gamma | 리더 |
| user-seed-007 | hyunwoo_shin | hyunwoo@example.com | Team Gamma | 멤버 |
| user-seed-008 | sooyoung_han | sooyoung@example.com | Team Gamma | 멤버 |
| user-seed-009 | seungho_oh | seungho@example.com | PromptRunners | 리더 |
| user-seed-010 | dahee_kwon | dahee@example.com | PromptRunners | 멤버 |
| user-seed-011 | jaehun_lim | jaehun@example.com | PromptRunners | 멤버 |
| user-seed-012 | yejin_moon | yejin@example.com | PromptRunners | 멤버 |
| user-seed-013 | sungjoon_bae | sungjoon@example.com | AIdeation | 리더 |
| user-seed-014 | narae_go | narae@example.com | AIdeation | 멤버 |
| user-seed-015 | sehee_jeon | sehee@example.com | AIdeation | 멤버 |
| user-seed-016 | minwoo_hong | minwoo@example.com | 404found | 리더 |
| user-seed-017 | yuri_kang | yuri@example.com | 404found | 멤버 |
| user-seed-018 | hyeongi_song | hyeongi@example.com | 404found | 멤버 |
| user-seed-019 | kyungmin_cho | kyungmin@example.com | LGTM | 리더 |
| user-seed-020 | jiyeon_nam | jiyeon@example.com | LGTM | 멤버 |
| user-seed-021 | taehyuk_ahn | taehyuk@example.com | LGTM | 멤버 |
| user-seed-022 | seojun_im | seojun@example.com | CodeCrafters | 리더 |
| user-seed-023 | haerin_yang | haerin@example.com | CodeCrafters | 멤버 |
| user-seed-024 | jungwon_ryu | jungwon@example.com | HandoverHeroes | 리더 |
| user-seed-025 | chaeun_hwang | chaeun@example.com | SpecRunners | 리더 |
| user-seed-026 | wooseok_bang | wooseok@example.com | SpecRunners | 멤버 |
| user-test-001 | 테스터1 | test1@a.com | — | — |
| user-test-002 | 테스터2 | test2@a.com | — | — |
| user-test-003 | 테스터3 | test3@a.com | — | — |
| user-test-004 | 테스터4 | test4@a.com | — | — |
| user-test-005 | 테스터5 | test5@a.com | — | — |
| user-test-006 | 테스터6 | test6@a.com | — | — |
| user-test-007 | 테스터7 | test7@a.com | — | — |
| user-test-008 | 테스터8 | test8@a.com | — | — |
| user-test-009 | 테스터9 | test9@a.com | — | — |
| user-test-010 | 테스터10 | test10@a.com | — | — |

---

### 팀 ↔ 유저 매핑 (`src/data/teams.json`)

`Team` 타입에 `members: string[]`(userId 배열)과 `createdBy: string`(팀장 userId), `memberRoles: Record<string, string>`(포지션 맵)이 추가되어 있습니다.

| teamCode | 팀명 | 해커톤 | createdBy (팀장) | 멤버 수 |
|----------|------|--------|----------------------|---------|
| team-001 | CodeCrafters | daker-handover-2026-03 | user-seed-022 | 2 |
| team-002 | HandoverHeroes | daker-handover-2026-03 | user-seed-024 | 1 |
| team-003 | PromptRunners | monthly-vibe-coding-2026-02 | user-seed-009 | 4 |
| team-004 | SpecRunners | daker-handover-2026-03 | user-seed-025 | 2 |
| team-005 | Team Alpha | aimers-8-model-lite | user-seed-001 | 5 |
| team-006 | 404found | daker-handover-2026-03 | user-seed-016 | 3 |
| team-007 | Team Gamma | aimers-8-model-lite | user-seed-006 | 3 |
| team-008 | AIdeation | monthly-vibe-coding-2026-02 | user-seed-013 | 3 |
| team-009 | LGTM | daker-handover-2026-03 | user-seed-019 | 3 |

---

### Rankings 점수 집계 방식

Rankings 페이지는 **개인 점수 총합** 기준으로 순위를 산정합니다.

```
leaderboard entry 처리 순서:
  1. hackathonSlug + teamName 으로 teams 배열에서 팀 조회
  2. team.members 가 있고 비어있지 않으면 → 멤버 전원에게 entry.score 귀속
  3. members가 없거나 비어있으면 → submissions에서 (hackathonSlug + teamName) 매칭해 submittedBy 유저에게 귀속
  4. submittedBy도 없으면 → 팀명 key('team:{teamName}')로 fallback (팀 단위 표시)
```

같은 팀의 모든 멤버가 동일한 점수를 공유합니다. 4위 이하는 10개씩 페이지네이션 처리됩니다.

---

### localStorage 키 목록

| 키 | 초기값 출처 | 비고 |
|----|-----------|------|
| `hacklog_users` | `src/data/users.json` | 비어있을 때만 seed 적용 |
| `hacklog_session` | 없음 | 로그인 시 userId 저장 |
| `hacklog_hackathons` | `src/data/hackathons.json` | 변경 불가 |
| `hacklog_details` | `src/data/hackathon_details.json` | 변경 불가 |
| `hacklog_teams` | `src/data/teams.json` | addTeam() 으로 추가 가능 |
| `hacklog_leaderboards` | `src/data/leaderboards.json` | addSubmission() 내부에서만 변경 |
| `hacklog_submissions` | `[]` | addSubmission() |
| `hacklog_invitations` | `[]` | addInvitation() / updateInvitation() |
| `hacklog_chats` | `{}` | addChatMessage() |
