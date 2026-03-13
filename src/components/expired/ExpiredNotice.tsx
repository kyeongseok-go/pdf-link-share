import Link from 'next/link';

export default function ExpiredNotice() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">📋</div>
        <h1 className="text-2xl font-bold text-text-main mb-3 ko-text">
          문서 열람 기간이 종료되었습니다
        </h1>
        <p className="text-muted text-base ko-text leading-relaxed mb-2">
          이 문서는 보안을 위해 자동 삭제되었습니다.
        </p>
        <p className="text-muted text-base ko-text leading-relaxed mb-8">
          필요하시면 문서를 보내주신 분께 다시 요청해 주세요.
        </p>
        <Link
          href="/"
          className="
            inline-flex items-center gap-2 px-6 py-3 rounded-xl
            bg-primary text-white font-semibold text-base
            hover:bg-opacity-90 transition-all duration-200
            shadow-md hover:shadow-lg
          "
        >
          <span>📄</span>
          <span>PDF 링크공유기 홈으로</span>
        </Link>
      </div>
    </div>
  );
}
