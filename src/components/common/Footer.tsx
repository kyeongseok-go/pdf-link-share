export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-muted ko-text leading-relaxed">
          업로드된 파일은 설정 기간 후 자동 삭제되며, 열람 외 용도로 사용되지 않습니다.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted">
          <span>📄 PDF 링크공유기</span>
          <span>·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
