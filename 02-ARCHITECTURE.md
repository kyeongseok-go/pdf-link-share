# SafeShare - 기술 아키텍처

## 시스템 구조도

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                       │
│                  (Next.js Frontend)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   랜딩 페이지   │  │  업로드 페이지  │  │  뷰어 페이지   │  │
│  │   /           │  │  /upload     │  │  /v/[shareId]  │  │
│  └──────────────┘  └──────┬───────┘  └───────▲───────┘  │
│                           │                   │          │
└───────────────────────────┼───────────────────┼──────────┘
                            │                   │
                    ┌───────▼───────────────────┼────────┐
                    │     Cloudflare Workers (API)        │
                    │     (Next.js API Routes - Edge)     │
                    │                                     │
                    │  POST /api/upload     ← 파일 업로드   │
                    │  POST /api/presign    ← R2 직접 업로드 │
                    │  GET  /api/doc/[id]   → 문서 메타     │
                    │  GET  /api/file/[id]  → PDF 파일     │
                    │  DELETE /api/doc/[id] → 수동 삭제     │
                    │  CRON  cleanup        → 만료 삭제     │
                    └───────┬──────────────┬──────────────┘
                            │              │
                   ┌────────▼────┐  ┌──────▼──────┐
                   │ Cloudflare  │  │ Cloudflare  │
                   │     R2      │  │     D1      │
                   │  (Storage)  │  │  (Database)  │
                   │             │  │              │
                   │ /docs/      │  │ documents    │
                   │  {shareId}/ │  │ table        │
                   │   file.pdf  │  │              │
                   └─────────────┘  └──────────────┘
```

## 데이터베이스 스키마

```sql
-- Cloudflare D1 (SQLite 기반)

CREATE TABLE documents (
    id          TEXT PRIMARY KEY,          -- nanoid(12)
    share_id    TEXT UNIQUE NOT NULL,      -- nanoid(8) - URL용 짧은 ID
    file_name   TEXT NOT NULL,             -- 원본 파일명
    file_size   INTEGER NOT NULL,          -- 바이트 단위
    file_type   TEXT NOT NULL DEFAULT 'pdf', -- 향후 확장용 (pdf, pptx, docx, xlsx)
    r2_key      TEXT NOT NULL,             -- R2 객체 키
    
    -- 공유 설정
    allow_download  INTEGER DEFAULT 1,     -- 다운로드 허용 (0/1)
    expires_at      TEXT NOT NULL,         -- ISO 8601 만료일시
    
    -- 보안
    uploader_ip     TEXT,                  -- 업로더 IP (rate limit용)
    view_count      INTEGER DEFAULT 0,     -- 조회수
    
    -- 타임스탬프
    created_at      TEXT DEFAULT (datetime('now')),
    deleted_at      TEXT                   -- soft delete
);

CREATE INDEX idx_share_id ON documents(share_id);
CREATE INDEX idx_expires_at ON documents(expires_at);
CREATE INDEX idx_uploader_ip ON documents(uploader_ip);

-- 향후 확장용: 변환 상태 추적 테이블
-- Phase 2에서 Office 변환 지원 시 활성화
-- CREATE TABLE conversions (
--     id              TEXT PRIMARY KEY,
--     document_id     TEXT REFERENCES documents(id),
--     source_type     TEXT NOT NULL,        -- pptx, docx, xlsx
--     status          TEXT DEFAULT 'pending', -- pending, converting, done, failed
--     converted_r2_key TEXT,
--     error_message   TEXT,
--     created_at      TEXT DEFAULT (datetime('now')),
--     completed_at    TEXT
-- );
```

## API 엔드포인트 상세

### POST /api/upload

파일 업로드 및 공유 링크 생성.

```typescript
// Request
Content-Type: multipart/form-data
{
    file: File,              // PDF 파일 (최대 50MB)
    expiresIn: string,       // "1d" | "7d" | "30d" | "90d"
    allowDownload: boolean   // 다운로드 허용 여부
}

// Response 200
{
    success: true,
    shareId: "a8Kd2mXp",
    shareUrl: "https://safeshare.kr/v/a8Kd2mXp",
    expiresAt: "2026-04-12T15:30:00Z",
    fileName: "2학년_가정통신문.pdf"
}

// Response 400
{
    success: false,
    error: "PDF_ONLY" | "FILE_TOO_LARGE" | "RATE_LIMITED"
}
```

### GET /api/doc/[shareId]

문서 메타데이터 조회 (뷰어 페이지에서 사용).

```typescript
// Response 200
{
    fileName: "2학년_가정통신문.pdf",
    fileSize: 1234567,
    allowDownload: true,
    expiresAt: "2026-04-12T15:30:00Z",
    createdAt: "2026-03-13T15:30:00Z",
    viewCount: 42
}

// Response 404 (만료 또는 미존재)
{
    error: "DOCUMENT_NOT_FOUND",
    message: "문서가 존재하지 않거나 공유 기간이 만료되었습니다."
}
```

### GET /api/file/[shareId]

실제 PDF 파일 스트리밍 (뷰어에서 렌더링용).

```
Response Headers:
    Content-Type: application/pdf
    Content-Disposition: inline (열람) 또는 attachment (다운로드)
    Cache-Control: private, max-age=3600
```

### DELETE /api/doc/[shareId]

작성자가 수동으로 문서 삭제 (향후 인증 연동 시 사용).

### CRON /api/cron/cleanup

만료된 문서 자동 삭제 (Cloudflare Cron Trigger, 매시간 실행).

```typescript
// 로직
1. D1에서 expires_at < now() AND deleted_at IS NULL 인 문서 조회
2. R2에서 해당 파일 삭제
3. D1에서 deleted_at 업데이트 (soft delete)
4. 30일 이상 지난 soft delete 레코드 완전 삭제
```

## 파일 업로드 플로우 상세

### 직접 업로드 방식 (50MB 이하)

```
1. 브라우저 → POST /api/upload (multipart/form-data)
2. API Route에서:
   a. 파일 검증 (PDF인지, 크기 제한)
   b. nanoid로 id, shareId 생성
   c. R2에 파일 저장: docs/{shareId}/file.pdf
   d. D1에 메타데이터 저장
   e. shareUrl 반환
```

### Presigned URL 방식 (대용량 지원 - 향후)

```
1. 브라우저 → POST /api/presign (파일 메타만 전송)
2. API에서 R2 presigned URL 생성하여 반환
3. 브라우저 → R2 presigned URL로 직접 업로드
4. 브라우저 → POST /api/confirm (업로드 완료 알림)
5. API에서 D1 메타데이터 저장, shareUrl 반환
```

## Rate Limiting

```
- IP당 시간당 최대 10회 업로드
- IP당 일 최대 50회 업로드
- 파일당 최대 50MB
- Cloudflare의 기본 DDoS 보호 활용
```

## 보안 고려사항

1. **파일 검증**: Content-Type과 매직 바이트로 실제 PDF인지 확인 (확장자만으로 판단 X)
2. **R2 접근 제한**: R2 버킷은 퍼블릭 접근 불가, 반드시 API를 통해서만 파일 제공
3. **만료 처리**: Cron으로 정기 삭제 + 뷰어 접근 시에도 만료 체크
4. **CORS**: 자사 도메인만 허용
5. **URL 추측 방지**: shareId는 nanoid(8) = 약 2조개 경우의 수
