# PDF 링크공유기 - Claude 구현용 프롬프트 (v2)

아래 프롬프트를 Claude에게 전달하면 구현을 시작할 수 있습니다.
설계 문서(01~07)를 먼저 첨부한 뒤 이 프롬프트를 입력하세요.

---

## 프롬프트 (복사하여 사용)

```
당신은 TypeScript 전문 풀스택 개발자입니다. 첨부된 설계 문서를 기반으로 "PDF 링크공유기" 프로젝트를 구현해주세요.

## 프로젝트 요약
"PDF 링크공유기"는 교사/공무원이 PDF 교육자료를 카카오톡 등으로 안전하게 공유할 수 있는 한국형 웹 서비스입니다.
- 드래그앤드롭으로 PDF 업로드 → 공유 링크 + QR코드 즉시 생성
- 설정한 기간(1일/7일/30일/90일) 후 자동 삭제
- 모바일(카카오톡 인앱브라우저) 최적화 PDF 뷰어
- 완전 무료, 회원가입 불필요

## 기술 스택
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + Pretendard 폰트 (Google Fonts CDN)
- Cloudflare Pages + R2 (스토리지) + D1 (SQLite DB)
  - R2 버킷명: pdfweblink-storage
  - D1 데이터베이스명: pdfweblink-db
  - D1 Database ID: e90461ae-88be-487f-85c3-17bf483c02f9
- pdf.js 기반 PDF 뷰어 (@react-pdf-viewer/core 또는 직접 구현)
- nanoid (공유 ID 생성)
- qrcode (npm, QR코드 생성)

## 핵심 특징: 한국 시장 특화
이 서비스는 한국 교사/공무원이 주 사용자입니다. 다음을 반드시 반영해주세요:
- UI 전체가 한글 (영어 텍스트 최소화)
- 카카오톡 인앱브라우저 완벽 대응
- QR코드 자동 생성 (종이 가정통신문에 인쇄용)
- 모바일 퍼스트 (학부모의 80%가 스마트폰으로 접근)
- 한국 공공서비스 느낌의 신뢰감 있는 디자인
- 네이버/구글 SEO 최적화 (키워드: "PDF 링크 공유", "가정통신문 공유")

## 구현 순서

### Step 1: 프로젝트 초기 설정
- Next.js + TypeScript + Tailwind 프로젝트 생성
- Pretendard 폰트 설정 (CDN: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css)
- 링크 표시용 JetBrains Mono 폰트
- wrangler.toml 작성 (위 R2/D1 정보 사용)
- 타입 정의 (src/types/index.ts)
- 상수 정의 (src/lib/constants.ts)
- 디렉토리 구조 생성

### Step 2: 메인 페이지 ( / ) — 랜딩 + 업로드 통합
하나의 페이지에서 랜딩과 업로드를 모두 처리합니다.

**상단 영역:**
- 서비스명: "📄 PDF 링크공유기"
- 메인 카피: "PDF 파일을 링크로 바꿔드려요"
- 서브 카피: "파일을 올리면 공유 링크와 QR코드가 바로 만들어집니다"

**드래그앤드롭 영역 (DropZone):**
- 넉넉한 크기의 점선 박스
- 안내: "PDF 파일을 여기에 끌어다 놓으세요 / 또는 클릭하여 파일 선택"
- 하단에 흐린 텍스트: "무료 · 최대 50MB · 회원가입 불필요"
- 드래그 진입 시: 테두리 색상 변경 + 배경색 변경
- PDF 아닌 파일: "PDF 파일만 업로드 가능합니다" 에러
- 50MB 초과: "파일 크기가 50MB를 초과합니다. 현재 무료 서비스로 50MB 이하 파일만 지원됩니다." 에러
- 파일 검증: 확장자 + MIME 타입 + PDF 매직바이트(%PDF)

**파일 선택 후 옵션:**
- 파일 정보 표시: 파일명 + 크기 + 제거 버튼
- 공유 기간 선택: 카드형 버튼 (1일 / 7일(기본) / 30일 / 90일)
- 체크박스: ☑ 다운로드 허용 (기본 ON) / ☑ QR코드 생성 (기본 ON)
- "🔗 링크 만들기" 버튼

**링크 생성 완료 후 결과 카드:**
- "✅ 공유 링크가 만들어졌습니다!"
- 링크 URL (JetBrains Mono 폰트, 클릭 시 복사)
- [📋 링크 복사] 버튼 (메인, 큰 버튼)
- [💬 카카오톡 공유] [📱 QR코드 보기] 버튼
- QR코드 이미지 표시 + "QR코드 이미지 저장" 링크 (PNG 다운로드)
- QR코드 하단 안내: "종이 통신문에 인쇄하여 사용할 수 있습니다"
- 만료일 표시
- 경고: "⚠️ 이 링크는 만료 후 삭제됩니다. 지금 복사하거나 공유해주세요."
- [+ 새 파일 올리기] 버튼

**신뢰 섹션 (하단):**
- "이런 분들이 사용하고 있어요"
- 👩‍🏫 가정통신문을 카카오톡으로 보내는 선생님
- 📋 교육자료를 배포하는 공무원
- 🏫 학부모에게 안내문을 전달하는 학교

**FAQ 섹션:**
- "파일 크기 제한이 있나요?" → "무료로 최대 50MB까지 업로드 가능합니다."
- "공유 기간이 지나면 어떻게 되나요?" → "파일이 서버에서 완전히 삭제됩니다."
- "학부모가 스마트폰으로 볼 수 있나요?" → "네, 카카오톡에서 링크를 누르면 바로 문서를 볼 수 있습니다."
- "회원가입이 필요한가요?" → "아니요, 가입 없이 바로 사용할 수 있습니다."
- 아코디언 스타일 (클릭하여 펼치기)

**푸터:**
- "업로드된 파일은 설정 기간 후 자동 삭제되며, 열람 외 용도로 사용되지 않습니다."

### Step 3: API Routes

**POST /api/upload**
- multipart/form-data로 파일 수신
- 파일 검증 (PDF 여부, 크기 제한, 매직바이트)
- nanoid(12)로 id, nanoid(8)로 shareId 생성
- R2에 파일 저장: docs/{shareId}/file.pdf
- D1에 메타데이터 INSERT
- IP 기반 rate limiting (시간당 10회, 일 50회)
- 응답: { success, shareId, shareUrl, expiresAt, fileName }

**GET /api/doc/[shareId]**
- D1에서 메타데이터 조회
- 만료 체크 (expires_at < now → 404)
- viewCount 증가
- 응답: { fileName, fileSize, allowDownload, expiresAt, createdAt, viewCount }

**GET /api/file/[shareId]**
- 만료 체크
- R2에서 PDF 바이너리 스트리밍
- Content-Type: application/pdf
- Cache-Control: private, max-age=3600

**DELETE /api/doc/[shareId]** (향후 인증 연동용 미리 구현)

**Cron cleanup** (매시간)
- expires_at < now() 인 문서 R2 삭제 + D1 soft delete
- 30일 지난 soft delete 완전 삭제

### Step 4: 뷰어 페이지 ( /v/[shareId] )

**서버 컴포넌트에서:**
- 메타데이터 fetch (SSR)
- 만료 시 ExpiredNotice 렌더링
- OG 태그 동적 생성:
  - og:title = "{파일명}"
  - og:description = "📄 안전하게 공유된 문서입니다. 탭하여 열람하세요."
  - og:site_name = "PDF 링크공유기"

**보안 안내 배너 (SecurityBanner):**
- 연한 파란 배경 (#E8F4FD)
- 🔒 아이콘 + "안전하게 공유된 문서입니다"
- 내용:
  - "이 문서는 PDF 링크공유기를 통해 안전하게 공유된 자료입니다."
  - "열람 기간: {시작일} ~ {만료일}"
  - "기간 종료 시 자동으로 삭제됩니다"
  - "무단 배포를 삼가해 주세요"
  - "본 서비스는 파일을 열람 외 목적으로 사용하지 않습니다."
- 접기/펼치기 토글 (기본: 펼침, 접으면 한 줄 요약만)
- 만료 3일 이내: 배너 색상 주황으로 변경 + "열람 기간이 곧 종료됩니다" + 남은 시간
- 만료 후: 빨간 배너 + "문서 열람 기간이 종료되었습니다"

**PDF 뷰어:**
- pdf.js 기반 뷰어
- 모바일: 스크롤 기반 페이지 넘김, 핀치 투 줌
- 데스크톱: 스크롤 + 확대/축소
- 로딩 중: 스켈레톤 UI (문서 형태)
- 하단 고정 툴바:
  - ◀ {현재 페이지} / {전체 페이지} ▶
  - 🔍+ 🔍- (확대/축소)
  - ⬇ 저장 (allowDownload true일 때만, 한국어로 "저장")

### Step 5: QR코드 기능
- qrcode npm 패키지로 클라이언트 사이드 생성
- 링크 생성 시 자동으로 QR코드 생성
- QR코드 표시: 200x200px (화면용)
- "QR코드 이미지 저장" 클릭 → 600x600px PNG 다운로드 (인쇄용)
- QR코드 하단에 "PDF 링크공유기" 텍스트

### Step 6: 만료/에러 페이지
- 문서 없거나 만료 시:
  - "📋 문서 열람 기간이 종료되었습니다"
  - "이 문서는 보안을 위해 자동 삭제되었습니다."
  - "필요하시면 문서를 보내주신 분께 다시 요청해 주세요."
  - [PDF 링크공유기 홈으로] 버튼

## 디자인 요구사항

### 반드시 참고:
- frontend-design 스킬을 활용하여 세련되고 기억에 남는 UI를 만들어주세요
- 한국 공공서비스의 신뢰감 + 현대적 웹 서비스의 세련됨을 조합
- 과하지 않은 깔끔함, 따뜻한 전문성

### 컬러 팔레트:
- Primary: #1B4965 (Deep Navy — 신뢰)
- Secondary: #4A90D9 (Korean Blue — 한국적 파랑)
- Accent: #2ECC71 (Fresh Green — 행동 유도)
- Surface: #F8FAFB
- Trust: #E8F4FD (보안 배너 배경)
- Warning: #E67E22 (만료 경고)
- Danger: #E74C3C
- Text: #1A1A2E
- Muted: #8B95A2
- Border: #E2E8F0

### 폰트:
- 본문: Pretendard (CDN: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css)
- 링크/코드: JetBrains Mono (Google Fonts)
- 폰트 크기: 본문 16px, 작은 텍스트 14px, 제목 24-32px

### 애니메이션:
- 파일 드롭 시 부드러운 바운스
- 링크 생성 완료 시 결과 카드 슬라이드업
- 링크 복사 시 "복사 완료!" 체크마크 전환 (0.3s)
- 보안 배너 접기/펼치기 accordion
- 업로드 프로그레스 바 그라디언트
- FAQ 아코디언 열기/닫기

### 모바일 대응:
- 브레이크포인트: 640px / 1024px
- 드래그앤드롭은 모바일에서 "클릭하여 파일 선택"으로 자연스럽게 전환
- 터치 이벤트 최적화
- 카카오톡 인앱브라우저 대응 (clipboard fallback, fixed position 이슈)

## SEO 메타 태그

메인 페이지:
- <title>PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요</title>
- <meta name="description" content="PDF 파일을 드래그앤드롭으로 올리면 공유 링크와 QR코드가 즉시 생성됩니다. 가정통신문, 교육자료를 카카오톡으로 간편하게 공유하세요. 무료, 회원가입 불필요." />
- <html lang="ko" />

뷰어 페이지:
- <title>{파일명} - PDF 링크공유기</title>
- <meta name="robots" content="noindex" /> (공유 문서 검색 노출 차단)

## D1 스키마 (프로젝트 시작 시 마이그레이션으로 실행)

CREATE TABLE documents (
    id              TEXT PRIMARY KEY,
    share_id        TEXT UNIQUE NOT NULL,
    file_name       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    file_type       TEXT NOT NULL DEFAULT 'pdf',
    r2_key          TEXT NOT NULL,
    allow_download  INTEGER DEFAULT 1,
    expires_at      TEXT NOT NULL,
    uploader_ip     TEXT,
    view_count      INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    deleted_at      TEXT
);
CREATE INDEX idx_share_id ON documents(share_id);
CREATE INDEX idx_expires_at ON documents(expires_at);

## 코드 품질
- TypeScript strict 모드
- 일관된 API 응답 형식: { success: boolean, data?: ..., error?: string, message?: string }
- 에러 핸들링 철저히 (try-catch + 사용자 친화적 한글 에러 메시지)
- 서버/클라이언트 컴포넌트 분리 명확히
- 향후 Office 변환 확장 가능하도록 fileType 필드 유지

위 사항을 모두 반영하여 완전하고 동작하는 코드를 작성해주세요.
각 파일을 하나씩 생성하며 진행하고, 최종적으로 전체 프로젝트가 빌드 가능한 상태를 만들어주세요.
```

---

## 사용 방법

1. Claude에게 새 대화를 시작한다
2. 01~07 파일을 모두 첨부한다 (특히 07-KOREAN-REDESIGN.md 필수)
3. 위 프롬프트를 붙여넣는다
4. Step별로 순차 진행 ("다음 Step 진행해줘"로 이어감)

## 참고: Step별 예상 소요

| Step | 내용 | 예상 메시지 수 |
|------|------|--------------|
| Step 1 | 프로젝트 세팅 | 1-2회 |
| Step 2 | 메인 페이지 | 3-5회 (가장 복잡) |
| Step 3 | API Routes | 2-3회 |
| Step 4 | 뷰어 페이지 | 2-3회 |
| Step 5 | QR코드 | 1회 |
| Step 6 | 에러 페이지 | 1회 |
