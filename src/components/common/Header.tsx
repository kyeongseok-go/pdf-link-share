import Link from 'next/link';

interface HeaderProps {
  minimal?: boolean;
}

export default function Header({ minimal = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">📄</span>
          <span>PDF 링크공유기</span>
        </Link>
        {!minimal && (
          <nav className="flex items-center gap-4">
            <a
              href="#faq"
              className="text-sm text-muted hover:text-primary transition-colors hidden sm:block"
            >
              자주 묻는 질문
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
