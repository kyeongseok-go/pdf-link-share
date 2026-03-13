'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  allowDownload: boolean;
  downloadUrl?: string;
}

function PdfSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="skeleton h-[800px] w-full" />
        </div>
      ))}
    </div>
  );
}

function getPinchDist(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function PdfViewer({ fileUrl, fileName, allowDownload, downloadUrl }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  // CSS 즉각 피드백용 (버튼/핀치 중 시각적 스케일)
  const [cssScale, setCssScale] = useState(1);

  const pdfLibRef = useRef<typeof import('pdfjs-dist') | null>(null);
  const pdfDocRef = useRef<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);

  // 1. pdf.js 로드
  useEffect(() => {
    import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      pdfLibRef.current = lib;
      loadPdf(lib);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. PDF 문서 로드
  const loadPdf = useCallback(async (lib: typeof import('pdfjs-dist')) => {
    setLoading(true);
    setError(null);
    try {
      const task = lib.getDocument({
        url: fileUrl,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/cmaps/`,
        cMapPacked: true,
      });
      const doc = await task.promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setLoading(false);
    } catch (err) {
      console.error('PDF load error:', err);
      setError('PDF 파일을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [fileUrl]);

  // 3. 페이지 렌더링 (scale 변경 시 재실행)
  const renderPages = useCallback(async (targetScale: number) => {
    const doc = pdfDocRef.current;
    if (!doc) return;

    const renderId = ++renderIdRef.current;

    for (let i = 1; i <= doc.numPages; i++) {
      if (renderIdRef.current !== renderId) return; // stale render 취소

      const canvas = canvasRefs.current.get(i);
      if (!canvas) continue;

      try {
        const page = await doc.getPage(i);
        if (renderIdRef.current !== renderId) { page.cleanup(); return; }

        const viewport = page.getViewport({ scale: targetScale });
        const ctx = canvas.getContext('2d');
        if (!ctx) { page.cleanup(); continue; }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        page.cleanup();
      } catch (err) {
        console.error(`Page ${i} render error:`, err);
      }
    }
    // 렌더 완료 후 CSS 스케일 초기화
    if (renderIdRef.current === renderId) {
      setCssScale(1);
    }
  }, []);

  // scale 변경 시 재렌더링
  useEffect(() => {
    if (!loading && numPages > 0) {
      renderPages(scale);
    }
  }, [scale, loading, numPages, renderPages]);

  // 4. IntersectionObserver로 현재 페이지 추적
  useEffect(() => {
    if (!numPages || loading) return;

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const p = parseInt(entry.target.getAttribute('data-page') ?? '1', 10);
          setCurrentPage(p);
        }
      }
    }, { rootMargin: '-50% 0px', threshold: 0 });

    document.querySelectorAll('[data-page]').forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [numPages, loading]);

  // 5. 핀치-투-줌 (passive:false 필요)
  const currentPinchScaleRef = useRef(1); // 핀치 중 최종 스케일 추적

  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchRef.current = { startDist: getPinchDist(e.touches), startScale: scale };
        currentPinchScaleRef.current = scale;
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const ratio = getPinchDist(e.touches) / pinchRef.current.startDist;
        const next = Math.min(3, Math.max(0.5, pinchRef.current.startScale * ratio));
        currentPinchScaleRef.current = next;
        setCssScale(next / scale);
      }
    }
    function onTouchEnd() {
      if (pinchRef.current) {
        const finalScale = currentPinchScaleRef.current;
        setScale(finalScale);
        setCssScale(1);
        pinchRef.current = null;
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [scale]);

  const scrollToPage = useCallback((p: number) => {
    document.querySelector(`[data-page="${p}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePrevPage = useCallback(() => {
    const p = Math.max(1, currentPage - 1);
    setCurrentPage(p);
    scrollToPage(p);
  }, [currentPage, scrollToPage]);

  const handleNextPage = useCallback(() => {
    const p = Math.min(numPages, currentPage + 1);
    setCurrentPage(p);
    scrollToPage(p);
  }, [currentPage, numPages, scrollToPage]);

  const handleZoomOut = useCallback(() => {
    const next = Math.max(0.5, parseFloat((scale - 0.25).toFixed(2)));
    if (next === scale) return;
    setCssScale(next / scale);
    setScale(next);
  }, [scale]);

  const handleZoomIn = useCallback(() => {
    const next = Math.min(3, parseFloat((scale + 0.25).toFixed(2)));
    if (next === scale) return;
    setCssScale(next / scale);
    setScale(next);
  }, [scale]);

  if (loading) return <PdfSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-danger font-semibold mb-2">{error}</p>
        <p className="text-muted text-sm">페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 페이지 목록 */}
      <div
        ref={pagesRef}
        className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-24"
        style={{
          transform: cssScale !== 1 ? `scale(${cssScale})` : undefined,
          transformOrigin: 'top center',
          transition: cssScale === 1 ? 'transform 0.1s ease-out' : 'none',
        }}
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            data-page={pageNum}
            className="bg-white rounded-xl shadow-md overflow-hidden flex justify-center"
          >
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current.set(pageNum, el);
                else canvasRefs.current.delete(pageNum);
              }}
              style={{ display: 'block', maxWidth: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* 하단 툴바 */}
      <div className="viewer-toolbar py-3 px-4 safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* 페이지 이동 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 disabled:opacity-40 transition-colors"
              aria-label="이전 페이지"
            >◀</button>
            <span className="text-white text-sm font-medium min-w-[4rem] text-center">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 disabled:opacity-40 transition-colors"
              aria-label="다음 페이지"
            >▶</button>
          </div>

          {/* 줌 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center text-xl font-bold hover:bg-white/30 disabled:opacity-40 transition-colors"
              aria-label="축소"
            >−</button>
            <span className="text-white text-xs min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center text-xl font-bold hover:bg-white/30 disabled:opacity-40 transition-colors"
              aria-label="확대"
            >＋</button>
          </div>

          {/* 다운로드 */}
          {allowDownload && downloadUrl && (
            <a
              href={downloadUrl}
              download={fileName}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors shadow-md"
              aria-label="파일 저장"
            >
              <span>⬇</span>
              <span>저장</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
