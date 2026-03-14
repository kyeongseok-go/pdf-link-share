import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PDF 링크공유기 | 파일을 링크로, 안전하게 공유하세요';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#1B4965',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        {/* 아이콘 */}
        <div
          style={{
            fontSize: '96px',
            marginBottom: '24px',
            lineHeight: 1,
          }}
        >
          📄
        </div>

        {/* 서비스명 */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}
        >
          PDF 링크공유기
        </div>

        {/* 슬로건 */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255,255,255,0.80)',
            fontWeight: 400,
          }}
        >
          파일을 링크로, 안전하게 공유하세요
        </div>

        {/* 하단 태그 */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            display: 'flex',
            gap: '16px',
          }}
        >
          {['무료', '회원가입 불필요', '카카오톡 공유'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '100px',
                padding: '8px 20px',
                color: 'rgba(255,255,255,0.90)',
                fontSize: '20px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
