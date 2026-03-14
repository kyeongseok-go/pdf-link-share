# SafeShare - 구현 가이드

## 프로젝트 디렉토리 구조

```
safeshare/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃 (폰트, 메타데이터)
│   │   ├── page.tsx                # 메인 페이지 (랜딩 + 업로드)
│   │   ├── globals.css             # Tailwind + 커스텀 스타일
│   │   │
│   │   ├── v/
│   │   │   └── [shareId]/
│   │   │       └── page.tsx        # 문서 뷰어 페이지
│   │   │
│   │   └── api/
│   │       ├── upload/
│   │       │   └── route.ts        # POST: 파일 업로드
│   │       ├── doc/
│   │       │   └── [shareId]/
│   │       │       └── route.ts    # GET: 문서 메타, DELETE: 삭제
│   │       ├── file/
│   │       │   └── [shareId]/
│   │       │       └── route.ts    # GET: PDF 파일 스트리밍
│   │       └── cron/
│   │           └── cleanup/
│   │               └── route.ts    # 만료 문서 정리
│   │
│   ├── components/
│   │   ├── upload/
│   │   │   ├── DropZone.tsx        # 드래그앤드롭 영역
│   │   │   ├── FileInfo.tsx        # 업로드된 파일 정보 표시
│   │   │   ├── ExpirySelector.tsx  # 만료 기간 선택
│   │   │   ├── UploadOptions.tsx   # 추가 옵션 (다운로드 허용 등)
│   │   │   ├── UploadButton.tsx    # 업로드 버튼 + 프로그레스
│   │   │   └── ShareResult.tsx     # 생성된 링크 표시
│   │   │
│   │   ├── viewer/
│   │   │   ├── PdfViewer.tsx       # PDF 뷰어 (pdf.js 래퍼)
│   │   │   ├── ViewerToolbar.tsx   # 하단 페이지/줌 컨트롤
│   │   │   └── SecurityBanner.tsx  # 보안 안내 배너
│   │   │
│   │   ├── common/
│   │   │   ├── Header.tsx          # 공통 헤더
│   │   │   ├── Footer.tsx          # 공통 푸터
│   │   │   ├── Toast.tsx           # 토스트 알림
│   │   │   └── LoadingSpinner.tsx  # 로딩 스피너
│   │   │
│   │   └── expired/
│   │       └── ExpiredNotice.tsx   # 만료/에러 화면
│   │
│   ├── lib/
│   │   ├── r2.ts                   # R2 클라이언트 유틸리티
│   │   ├── db.ts                   # D1 쿼리 유틸리티
│   │   ├── validation.ts          # 파일 검증 (타입, 크기, 매직바이트)
│   │   ├── nanoid.ts              # ID 생성 유틸리티
│   │   ├── date.ts                # 날짜/만료 유틸리티
│   │   └── constants.ts           # 상수 (파일 크기 제한, 만료 옵션 등)
│   │
│   └── types/
│       └── index.ts               # TypeScript 타입 정의
│
├── public/
│   ├── favicon.ico
│   └── og-image.png               # 카카오톡 공유 시 미리보기 이미지
│
├── wrangler.toml                   # Cloudflare 배포 설정
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 핵심 타입 정의

```typescript
// src/types/index.ts

export type ExpiryOption = '1d' | '7d' | '30d' | '90d';

export interface Document {
    id: string;
    shareId: string;
    fileName: string;
    fileSize: number;
    fileType: 'pdf';  // 향후: 'pptx' | 'docx' | 'xlsx'
    r2Key: string;
    allowDownload: boolean;
    expiresAt: string;  // ISO 8601
    uploaderIp: string | null;
    viewCount: number;
    createdAt: string;
    deletedAt: string | null;
}

export interface UploadRequest {
    file: File;
    expiresIn: ExpiryOption;
    allowDownload: boolean;
}

export interface UploadResponse {
    success: true;
    shareId: string;
    shareUrl: string;
    expiresAt: string;
    fileName: string;
}

export interface UploadError {
    success: false;
    error: 'PDF_ONLY' | 'FILE_TOO_LARGE' | 'RATE_LIMITED' | 'UPLOAD_FAILED';
    message: string;
}

export interface DocumentMeta {
    fileName: string;
    fileSize: number;
    allowDownload: boolean;
    expiresAt: string;
    createdAt: string;
    viewCount: number;
}

// 향후 확장용
export interface ConversionJob {
    id: string;
    documentId: string;
    sourceType: 'pptx' | 'docx' | 'xlsx';
    status: 'pending' | 'converting' | 'done' | 'failed';
    convertedR2Key: string | null;
    errorMessage: string | null;
}
```

## 핵심 상수

```typescript
// src/lib/constants.ts

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const EXPIRY_OPTIONS = [
    { value: '1d',  label: '1일',  days: 1 },
    { value: '7d',  label: '7일',  days: 7 },
    { value: '30d', label: '30일', days: 30 },
    { value: '90d', label: '90일', days: 90 },
] as const;

export const DEFAULT_EXPIRY: ExpiryOption = '7d';

export const ALLOWED_MIME_TYPES = [
    'application/pdf',
] as const;

// 향후 확장용
// export const FUTURE_MIME_TYPES = [
//     'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // docx
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         // xlsx
// ] as const;

export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

export const RATE_LIMIT = {
    UPLOADS_PER_HOUR: 10,
    UPLOADS_PER_DAY: 50,
};

export const SECURITY_MESSAGES = {
    BANNER_TITLE: '안전하게 공유된 문서입니다',
    BANNER_BODY: [
        '설정된 기간이 지나면 자동으로 삭제됩니다',
        '외부에 무단 배포하지 말아 주세요',
    ],
    FOOTER_TRUST: 'SafeShare는 업로드된 파일을 열람 제공 외 어떤 용도로도 사용하지 않습니다.',
    EXPIRING_SOON: '이 문서의 열람 기간이 곧 만료됩니다',
    EXPIRED: '문서 열람 기간이 만료되었습니다',
};
```

## 파일 검증 로직

```typescript
// src/lib/validation.ts

import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES, PDF_MAGIC_BYTES } from './constants';

export async function validatePdf(file: File): Promise<{
    valid: boolean;
    error?: string;
}> {
    // 1. 크기 검증
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: '파일 크기는 50MB 이하만 가능합니다.' };
    }

    // 2. MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        return { valid: false, error: 'PDF 파일만 업로드 가능합니다.' };
    }

    // 3. 매직 바이트 검증 (실제 PDF인지)
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isPdf = PDF_MAGIC_BYTES.every((b, i) => bytes[i] === b);

    if (!isPdf) {
        return { valid: false, error: '올바른 PDF 파일이 아닙니다.' };
    }

    return { valid: true };
}
```

## Cloudflare 배포 설정

```toml
# wrangler.toml

name = "safeshare"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2"
bucket_name = "safeshare-files"

[[d1_databases]]
binding = "DB"
database_name = "safeshare-db"
database_id = "<자동 생성됨>"

[triggers]
crons = ["0 * * * *"]  # 매시간 만료 문서 정리
```

## OG 메타데이터 (카카오톡 미리보기)

카카오톡으로 링크 공유 시 미리보기가 중요하다.

```typescript
// 뷰어 페이지의 메타데이터
export async function generateMetadata({ params }): Promise<Metadata> {
    const doc = await getDocumentMeta(params.shareId);

    return {
        title: `${doc.fileName} - SafeShare`,
        description: '안전하게 공유된 문서입니다. 클릭하여 열람하세요.',
        openGraph: {
            title: doc.fileName,
            description: '🔒 SafeShare로 안전하게 공유된 문서',
            type: 'website',
            images: ['/og-image.png'],  // SafeShare 브랜드 이미지
        },
    };
}
```

## 에러 처리 패턴

```typescript
// 모든 API에서 일관된 에러 응답
export function errorResponse(
    error: string,
    message: string,
    status: number
) {
    return Response.json(
        { success: false, error, message },
        { status }
    );
}

// 사용 예시
if (!file) return errorResponse('NO_FILE', '파일이 필요합니다.', 400);
if (!isPdf) return errorResponse('PDF_ONLY', 'PDF 파일만 업로드 가능합니다.', 400);
if (isRateLimited) return errorResponse('RATE_LIMITED', '잠시 후 다시 시도해주세요.', 429);
```
