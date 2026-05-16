# PDF 엔진 결정 — @react-pdf/renderer 채택

> 작성일: 2026-05-16 (Phase 4 P4-T1 Spike)
> 검토 후보: `@react-pdf/renderer` v4.5.1 · print-to-PDF (Playwright/Puppeteer)

## 채택: `@react-pdf/renderer`

견적서 PDF 생성은 `@react-pdf/renderer` v4 (이미 Phase 1에서 의존성 설치 완료)로
서버 사이드 렌더링한다.

## PoC 측정치 (`scripts/pdf-spike.mjs`)

| 항목          | 값                                          |
| ------------- | ------------------------------------------- |
| 항목 수       | 60 (페이지 분할 강제용)                     |
| 출력 PDF 크기 | **37.3 KB** (37,165 bytes 측정 시점 38,165) |
| 페이지 수     | **2** (35 행/페이지 자동 분할)              |
| 시그니처      | `%PDF` (첫 4바이트)                         |
| 한글 글리프   | OK (Pretendard 자동 서브셋 임베드)          |
| Node          | v24.13 · Windows 11                         |
| 렌더 시간     | < 1초 (cold)                                |

PoC 스크립트 출력:

```json
{ "sig": "%PDF", "size": 38165, "sizeKB": 37.3, "pageCount": 2, "ok": true }
```

400KB PDF 사이즈 목표 대비 9% 사용 — 한글 60행에도 ~37KB라 PRD §3 목표 매우 여유.

## 폰트 파일 결정 — `.otf` 채택 (vs `.woff2`)

P1-T7에서 배치한 `Pretendard-Regular.woff2` (260KB, KS X 1001 subset)는
`@react-pdf/renderer`의 `Font.register`에서 **fontkit의 글리프 인코딩 단계가
실패**한다:

```
RangeError: Offset is outside the bounds of the DataView
  at DataView.setUint16 (...)
  at EmbeddedFont.embed (@react-pdf/pdfkit)
```

원인: WOFF2의 압축된 글리프 테이블에서 일부 오프셋 계산이 fontkit과 어긋남.
WOFF2는 브라우저 다운로드 압축 포맷이고, fontkit은 `.ttf`/`.otf` 원본 친화.

해결: jsDelivr에서 `Pretendard-Regular.otf` (1.54MB)를 `public/fonts/`에 추가.
PDF 생성 시 사용 글리프만 자동 서브셋 임베드되므로 최종 PDF 크기는 ~37KB로
WOFF2 사용 시와 동등하거나 더 작다. 디스크 비용 1.5MB는 서버 정적 자산 한정,
배포 번들에는 PDF 본문에 들어간 글리프만 영향.

`Pretendard-Regular.woff2`는 향후 웹 폰트 `@font-face` 용도로 보존하되 현재는
미사용. P1-T7 verification 기준(파일 존재 + 400KB 이하)은 그대로 유지된다.

## 회피한 대안 — print-to-PDF (Playwright/Puppeteer)

| 단점                                                   | 영향                       |
| ------------------------------------------------------ | -------------------------- |
| Chromium 추가 의존 (~150MB 이미지)                     | 빌드/배포 비용 ↑           |
| 메모리 사용량 (브라우저 1 인스턴스 / 요청)             | 동시 요청 ↑ 시 OOM 위험    |
| HTML→PDF 시 한글 폰트 등록 별도 (브라우저 폰트 시스템) | 한글 일관성 추가 검증 비용 |
| 페이지 분할 CSS hack (`page-break-*`)                  | 마크업 복잡도 ↑            |
| 응답 latency (브라우저 부팅 ~1초 추가)                 | UX 저하                    |

`@react-pdf/renderer`는 위 모든 단점이 없고 단일 npm 의존만으로 작동.

## 알려진 한계

1. **HTML 미지원**: 마크업이 별도(`Document/Page/View/Text/StyleSheet`). 화면 UI
   컴포넌트와 PDF 컴포넌트가 같은 데이터를 받지만 트리는 분리.
2. **폰트 weight 별도 등록**: 현재 weight 400만 등록. 헤더 강조 등에 bold 필요시
   `Pretendard-Bold.otf`를 추가 등록 (P1-T7 spec note의 "weight 700·SemiBold 추가는
   Phase 4 PDF 컴포넌트에서 필요할 때 진행" 그대로 적용).
3. **이미지 임베드 필요시 별도 `<Image>` 컴포넌트** — 견적서 MVP에는 불필요.

## 다음 단계 영향

- **P4-T2 PDF 컴포넌트**: `Font.register({family:'Pretendard', src: ...otf})` 사용.
  스타일은 `StyleSheet.create`로 정의, 마크업은 `View`/`Text` 구성.
- **P4-T3 PDF Route Handler**: `renderToStream` 또는 `renderToBuffer` 후 `Response`에
  실어 보냄. 응답 헤더 3종은 변경 없음.

## 참고

- PoC 스크립트: `scripts/pdf-spike.mjs`
- 폰트: `public/fonts/Pretendard-Regular.otf`
- 라이브러리 문서: https://react-pdf.org
