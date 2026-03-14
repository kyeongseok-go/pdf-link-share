# PDF 링크공유기 - SEO 구현 프롬프트

아래 프롬프트를 Claude에게 전달하여 SEO 관련 코드를 추가하세요.
기존 프로젝트 코드가 있는 상태에서 진행합니다.

---

## 프롬프트 (복사하여 사용)

```
현재 Next.js 14+ (App Router) + TypeScript + Cloudflare Pages로 배포된 "PDF 링크공유기" 프로젝트에 검색엔진 최적화(SEO) 관련 코드를 추가해주세요.

## 추가해야 할 것들

### 1. sitemap.xml (정적 생성)

Next.js App Router의 sitemap.ts 규칙을 사용하여 src/app/sitemap.ts 파일을 생성해주세요.

포함할 페이지:
- / (메인 페이지) — priority: 1.0, changefreq: monthly
- /guide (사용 가이드 페이지, 아래에서 새로 만듦) — priority: 0.8, changefreq: monthly

제외할 페이지 (절대 포함하지 않음):
- /v/[shareId] (뷰어 페이지 — 사용자 문서이므로 검색 노출 금지)
- /api/* (API 경로)

도메인은 환경변수 NEXT_PUBLIC_SITE_URL에서 가져오되, 없으면 기본값을 사용하세요.

### 2. robots.txt (정적 생성)

Next.js App Router의 robots.ts 규칙을 사용하여 src/app/robots.ts 파일을 생성해주세요.

규칙:
- User-agent: * 에 대해
  - Allow: /
  - Disallow: /api/
  - Disallow: /v/
- Sitemap URL 포함

### 3. 메타데이터 보강

src/app/layout.tsx의 루트 metadata를 다음과 같이 보강해주세요:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://도메인'),
  title: {
    default: 'PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요',
    template: '%s - PDF 링크공유기',
  },
  description: 'PDF 파일을 드래그앤드롭으로 올리면 공유 링크와 QR코드가 즉시 생성됩니다. 가정통신문, 교육자료를 카카오톡으로 간편하게 공유하세요. 무료, 회원가입 불필요.',
  keywords: ['PDF 링크 공유', 'PDF 링크 만들기', '가정통신문 공유', 'PDF QR코드', '무료 PDF 공유', 'PDF 링크 변환', '가정통신문 링크'],
  authors: [{ name: 'PDF 링크공유기' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'PDF 링크공유기',
    title: 'PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요',
    description: 'PDF 파일을 드래그앤드롭으로 올리면 공유 링크와 QR코드가 즉시 생성됩니다.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF 링크공유기',
    description: 'PDF 파일을 링크로 바꿔드려요. 무료, 회원가입 불필요.',
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    other: {
      'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_VERIFICATION || '',
    },
  },
  alternates: {
    canonical: '/',
  },
};
```

### 4. 뷰어 페이지 noindex 확인

src/app/v/[shareId]/page.tsx의 generateMetadata에서 반드시 다음이 포함되어야 합니다:

```typescript
robots: {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
},
```

### 5. 사용 가이드 페이지 생성 (/guide)

SEO 유입을 위한 콘텐츠 페이지를 새로 만들어주세요.
경로: src/app/guide/page.tsx

이 페이지는 검색엔진에서 "가정통신문 카카오톡 공유 방법", "PDF 링크 만들기" 같은 키워드로 유입되는 랜딩 역할을 합니다.

메타데이터:
- title: '가정통신문을 카카오톡으로 공유하는 방법'
- description: 'PDF 파일을 링크로 변환하여 카카오톡, 문자, 밴드 등으로 간편하게 공유하는 방법을 알려드립니다. 무료, 회원가입 불필요.'

페이지 내용 (한글, 자연스러운 문체):

**제목**: 가정통신문을 카카오톡으로 공유하는 방법

**도입부**:
종이 가정통신문을 디지털로 전환하고 싶으신가요? PDF 링크공유기를 사용하면 PDF 파일을 링크 하나로 바꿔서 카카오톡, 문자, 네이버 밴드 등으로 간편하게 공유할 수 있습니다.

**섹션 1: 이런 분들에게 유용합니다**
- 가정통신문을 학부모 단체방에 보내야 하는 선생님
- 교육자료를 배포해야 하는 공무원
- 안내문을 디지털로 전달하고 싶은 학교 관계자

**섹션 2: 사용 방법 (3단계)**
1단계: PDF 링크공유기 사이트에 접속합니다
2단계: PDF 파일을 드래그앤드롭으로 올립니다
3단계: 생성된 링크를 카카오톡으로 공유합니다
(각 단계에 간단한 설명 추가)

**섹션 3: 주요 기능**
- 공유 링크 즉시 생성
- QR코드 자동 생성 (종이 통신문에 인쇄 가능)
- 공유 기간 설정 (1일~90일, 자동 삭제)
- 모바일 최적화 (카카오톡에서 바로 열람)
- 무료, 회원가입 불필요

**섹션 4: 자주 묻는 질문**
- 학부모가 앱 설치 없이 볼 수 있나요? → 네, 링크를 누르면 바로 열립니다.
- 파일 크기 제한이 있나요? → 최대 50MB까지 무료로 사용 가능합니다.
- 공유 기간이 지나면? → 파일이 서버에서 완전히 삭제됩니다.

**하단 CTA**:
[지금 바로 사용해보기 →] 버튼 (메인 페이지로 이동)

디자인: 메인 페이지와 동일한 스타일, Pretendard 폰트, 깔끔한 레이아웃.
헤더/푸터는 메인 페이지와 공유.

### 6. JSON-LD 구조화 데이터

메인 페이지에 JSON-LD를 추가하여 구글이 서비스를 더 잘 이해하도록 해주세요.

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF 링크공유기',
  description: 'PDF 파일을 링크로 변환하여 안전하게 공유하는 무료 서비스',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://도메인',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  inLanguage: 'ko',
};
```

이걸 메인 페이지의 <head>에 <script type="application/ld+json">으로 삽입해주세요.

### 7. OG 이미지 생성

public/og-image.png를 위한 간단한 OG 이미지를 만들어주세요.
- 크기: 1200x630px
- 내용: "📄 PDF 링크공유기" + "파일을 링크로, 안전하게 공유하세요"
- 배경: #1B4965 (Deep Navy)
- 텍스트: 흰색, Pretendard
- Next.js의 opengraph-image.tsx (ImageResponse)를 사용하거나, 
  SVG로 만들어서 public/og-image.png로 저장해주세요.

## 환경변수 (.env)

프로젝트 루트에 .env.example 파일도 만들어주세요:

NEXT_PUBLIC_SITE_URL=https://도메인
NEXT_PUBLIC_GOOGLE_VERIFICATION=여기에_구글_인증코드
NEXT_PUBLIC_NAVER_VERIFICATION=여기에_네이버_인증코드

## 최종 확인

구현 완료 후 다음을 확인해주세요:
1. / 접속 시 메타태그 정상 출력
2. /guide 접속 가능
3. /sitemap.xml 접속 시 XML 정상 출력
4. /robots.txt 접속 시 텍스트 정상 출력
5. /v/테스트ID 접속 시 noindex 메타태그 확인
6. 페이지 소스 보기에서 JSON-LD 확인
```
