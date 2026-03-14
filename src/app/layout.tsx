import type { Metadata } from 'next';
import './globals.css';
import KakaoInit from '@/components/common/KakaoInit';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdfweblink.pages.dev'),
  title: {
    default: 'PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요',
    template: '%s - PDF 링크공유기',
  },
  description:
    'PDF 파일을 드래그앤드롭으로 올리면 공유 링크와 QR코드가 즉시 생성됩니다. 가정통신문, 교육자료를 카카오톡으로 간편하게 공유하세요. 무료, 회원가입 불필요.',
  keywords: ['PDF 링크 공유', 'PDF 링크 만들기', '가정통신문 공유', 'PDF QR코드', '무료 PDF 공유', 'PDF 링크 변환', '가정통신문 링크'],
  authors: [{ name: 'PDF 링크공유기' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'PDF 링크공유기',
    title: 'PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요',
    description:
      'PDF 파일을 드래그앤드롭으로 올리면 공유 링크와 QR코드가 즉시 생성됩니다.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF 링크공유기',
    description: 'PDF 파일을 링크로 바꿔드려요. 무료, 회원가입 불필요.',
    images: ['/opengraph-image'],
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_NAVER_VERIFICATION
      ? { other: { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_VERIFICATION } }
      : {}),
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1B4965" />
        {/* Naver site verification placeholder */}
        {/* <meta name="naver-site-verification" content="YOUR_CODE" /> */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-pretendard bg-surface text-text-main antialiased">
        <KakaoInit />
        {children}
      </body>
    </html>
  );
}
