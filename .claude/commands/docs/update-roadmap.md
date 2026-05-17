---
description: "ROADMAP.md 완료 기준 감사 + 사용자 승인 후 [x]/[ ] 체크박스 동기화"
argument-hint: "[phase-number | all]"
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---

# /docs:update-roadmap

`docs/ROADMAP.md` 의 완료 기준을 감사하고, 사용자 승인 후 체크박스(`[x]`/`[ ]`)를 동기화한다.

**모드**: 하이브리드 — 기존 `[x]` 회귀 감지 + 신규 `[ ]` 완료 검출.

**안전 원칙**: 회귀를 발견해도 자동으로 `[x]` → `[ ]` 로 되돌리지 않는다. 사용자가 의식적으로 결정하도록 인라인 노트만 추가한다. `Write` 도구는 미허용이므로 ROADMAP.md 외의 어떤 파일도 새로 만들지 않는다.

---

## Arguments

`$ARGUMENTS` 해석:

- (없음) 또는 `all` → 모든 phase 감사
- `<숫자>` (예: `3`, `5`) → 해당 Phase 만 감사
- 그 외 → 즉시 종료, 어떤 명령도 실행하지 않음

올바른 사용법 예시:

```
/docs:update-roadmap          # 전체 (기본값)
/docs:update-roadmap 3        # Phase 3 만
/docs:update-roadmap all      # 전체 (명시적)
```

인자 검증 정규식: `^(\d+|all)?$`. 매칭 실패 시 사용법 안내 후 즉시 종료한다.

---

## Phase 1: Discovery

1. `Read` 로 `docs/ROADMAP.md` 전체를 로드.
2. `$ARGUMENTS` 를 해석해 대상 phase 집합을 결정.
3. ROADMAP 본문에서 `## Phase N — …` 헤더를 동적으로 탐색 (5에 하드코딩 금지 — Phase 6+ 확장 대비).
4. 각 대상 phase 의 `### 완료 기준` 섹션 아래 `- [x]` 또는 `- [ ]` 라인을 모두 수집:
   - 원문 텍스트 (한 줄)
   - 라인 번호
   - 현재 체크 상태
   - 소속 Phase 번호

---

## Phase 2: Classification

수집한 각 기준을 본문 키워드 매칭으로 다음 5개 카테고리에 분류한다. 한 항목이 여러 카테고리에 걸치면 **가장 자동화 가능한 것**을 우선.

| 카테고리       | 시그니처 키워드 (예)                                            | 검증 방식                         |
| -------------- | --------------------------------------------------------------- | --------------------------------- |
| `build-cmd`    | `npm run lint`, `npm run build`, `npm run test`, `tsc --noEmit` | Bash + exit code                  |
| `file-exists`  | `<path> 존재`, `<path>에 …`                                     | Glob                              |
| `grep-pattern` | `.next/` + 시크릿/토큰 grep, `0 hit`                            | Grep                              |
| `http-header`  | `DevTools`, `응답 헤더`, `Content-Disposition`, `Cache-Control` | `Invoke-WebRequest` (dev 가동 시) |
| `manual`       | Playwright, Notion API, 스크린샷, 코드 리뷰 기준, 주관 판정     | 자동 skip, `?` 라벨               |

---

## Phase 3: Verification

**중요**: 모든 검증은 read-only 다. 이 단계에서 ROADMAP.md 를 절대 수정하지 않는다.

### 자동 검증 명령 매핑

| 본문 키워드                           | 실행 명령                                               | 통과 조건                                   |
| ------------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| `npm run lint` 통과 / 경고 0          | `npm run lint`                                          | exit 0 + stderr 에 `error`·`warning` 토큰 0 |
| `npm run build` 통과                  | `npm run build`                                         | exit 0                                      |
| `/invoice/[id]` `ƒ (Dynamic)`         | build stdout grep                                       | `ƒ (Dynamic)` 라인에 `/invoice/[id]` 포함   |
| `/api/invoice/[id]/pdf` `ƒ (Dynamic)` | 동일                                                    | `/api/invoice/[id]/pdf` 포함                |
| `npm run test` exit 0 / 전수 통과     | `npm run test`                                          | exit 0                                      |
| `tsc --noEmit` 0 에러                 | `npx tsc --noEmit`                                      | exit 0, 출력 길이 0                         |
| `.next/` 시크릿 grep 0                | `Grep pattern='ntn_' path='.next/' output_mode='count'` | 매치 0                                      |
| `<file> 존재`                         | `Glob pattern=<file>`                                   | 결과 ≥ 1                                    |
| `<file> 크기 < N KB`                  | PowerShell `(Get-Item <file>).Length`                   | < N \* 1024                                 |

### 조건부 검증 (`http-header`)

1. 먼저 dev 서버 가동 확인:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
   ```
2. 가동 중 → `Invoke-WebRequest -Method Head http://localhost:3000/<path>` 로 헤더 추출 후 키 매칭.
3. 미가동 → 자동 skip + `?` 라벨 + 안내 메시지("dev 서버 미가동 — `!npm run dev` 후 재실행 시 추가 검증 가능").

### Manual 라벨

`manual` 카테고리는 실행하지 않고 `?` 라벨만 부여. 라인 끝에 한 줄 가이드를 추가:

- Playwright 시나리오 → "Playwright MCP 로 V1~V7 재실행 필요"
- Notion API 라운드트립 → "실 Notion row 로 매핑 검증 필요"
- 스크린샷 비교 → "`.playwright-mcp/` 에 증거 스크린샷 보존 필요"
- 코드 리뷰 기준 → "사용자 수동 코드 리뷰 필요"

### 환경 의존 분리

`npm run build` 또는 `npm run test` 실패 시 stderr 에 `NOTION_TOKEN` 또는 `NOTION_DATABASE_ID` 누락 메시지가 있으면 **회귀가 아니라 환경 의존 누락**으로 분리 보고. 사용자에게 `.env.local` 확인을 요청.

---

## Phase 4: Report

검증 결과를 4-bucket 표로 사용자에게 보고:

```
✓ 유지         <N개>   ([x] + 검증 통과)
⚠ 회귀        <N개>   ([x] + 검증 실패)
+ 신규 완료   <N개>   ([ ] + 검증 통과 → [x] 후보)
? 수동 확인   <N개>   (자동 검증 불가)
```

각 bucket 아래에 항목을 다음 형식으로 나열:

```
Phase N: <본문 일부 ~50자> — <검증 명령 또는 사유 한 줄>
```

예시 출력:

```
✓ 유지 (3)
  Phase 5: npm run lint 통과 — `npm run lint` exit 0
  Phase 5: .next/에서 ntn_ grep 0 — `Grep ntn_ .next/` 0 matches
  Phase 2: components/ui/에 card·table 4종 존재 — Glob 4 results

⚠ 회귀 (1)
  Phase 5: /invoice/[id] ƒ (Dynamic) 표기 — build stdout grep 0 matches

+ 신규 완료 (0)

? 수동 확인 (28)
  Phase 5: V1~V7 Playwright 시나리오 — Playwright MCP 로 재실행 필요
  ...
```

---

## Phase 5: Approval & Update

보고서 끝에 한 줄로 사용자에게 묻는다:

> ROADMAP.md 를 갱신할까요? (y/N)

### 응답 처리

- `y` / `yes` / `진행` / `네` → 갱신 진행
- 그 외(빈 응답 포함) → 변경 0, 즉시 종료. "ROADMAP.md 변경 없음" 한 줄 출력.

### 갱신 규칙

오늘 날짜를 `YYYY-MM-DD` 형식으로 준비한다 (Bash `Get-Date -Format yyyy-MM-dd` 또는 동일).

**+ 신규 완료 후보** (`[ ]` → `[x]`):

1. `Edit` 로 라인을 `- [x]` 로 교체. `old_string` 에 앞뒤 1줄 컨텍스트를 포함해 unique anchor 를 보장.
2. 바로 다음 줄에 인라인 노트를 삽입:
   ```
         > ✓ <오늘 날짜>: <검증 명령 한 줄>
   ```
3. 같은 항목 아래 같은 날짜의 노트가 이미 존재하면 명령 텍스트만 교체 (날짜 라인 중복 회피).

**⚠ 회귀** (`[x]` 유지 + 노트):

1. `[x]` 는 그대로 유지 — **자동으로 `[ ]` 로 되돌리지 않는다**. 사용자가 의식적으로 결정해야 한다.
2. 바로 다음 줄에 인라인 노트를 삽입:
   ```
         > ⚠ <오늘 날짜>: <실패 사유 한 줄>
   ```

**✓ 유지** / **? 수동 확인**:

- 변경 없음. 같은 phase 의 다른 항목 갱신으로 인해 ROADMAP.md 가 수정되더라도 이 항목 라인은 건드리지 않는다.

### 갱신 종료 후

`git diff --stat docs/ROADMAP.md` 로 변경 라인 수 요약 한 줄을 출력해 사용자가 즉시 검토할 수 있게 한다:

```
docs/ROADMAP.md | 4 ++++
1 file changed, 4 insertions(+)
```

---

## 사용 가이드

- **권장 호출 시점**: Phase 단위 작업 완료 후 / 새 phase 추가 후 / 회의 전 ROADMAP 검토 시.
- **호출 빈도**: 변동성 낮은 문서이므로 매일 호출은 과함. Phase 완료 시 1회가 적정.
- **본 커맨드의 한계**: Playwright 시나리오·Notion API 라운드트립·스크린샷 비교는 자동 검증 불가 — 후속 `/docs:audit-playwright` 같은 별도 커맨드 분리 검토.
- **Plan mode 호환**: Plan mode 에서 호출 시 Phase 5 (Update) 는 자동 skip 하고 보고서만 출력해야 한다. (사용자가 명시적으로 Plan 종료 후 재호출하도록 안내.)

---

## 작동 자체 검증 (커맨드 추가 직후 1회 실행 권장)

1. **정상 감사**: `/docs:update-roadmap 5` → Phase 5 의 build/lint/grep/Content-Disposition 자동 검증, V1~V7 Playwright 는 `?` 라벨로 분류되는지.
2. **신규 완료 검출**: ROADMAP.md 의 Phase 2 첫 `[x]` 를 임시로 `[ ]` 로 변경 후 `/docs:update-roadmap 2` → `+ 신규 완료 후보` 에 잡히는지. 승인 후 다시 `[x]` + 인라인 노트가 붙는지.
3. **회귀 감지**: `lib/notion.ts` 끝에 의도적 TS 에러 추가 → `/docs:update-roadmap 5` → `tsc --noEmit` 통과 항목이 `⚠ 회귀` 에 잡히는지. `n` 응답 시 ROADMAP.md 무변경.
4. **인자 검증**: `/docs:update-roadmap phase-3` → 사용법 안내 후 즉시 종료, 어떤 검증 명령도 실행하지 않음.

검증 후 의도적 변경(TS 에러·`[x]` 토글)은 원복한다.
