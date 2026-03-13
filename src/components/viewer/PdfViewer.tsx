'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  allowDownload: boolean;
  downloadUrl?: string;
}

// Skeleton loading component
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

export default function PdfViewer({
  fileUrl,
  fileName,
  allowDownload,
  downloadUrl,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [visualScale, setVisualScale] = useState(1);
  const [pdfLib, setPdfLib] = useState<typeof import('pdfjs-dist') | null>(null);
  const [pdfDoc, setPdfDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);

  // Load pdf.js dynamically (only on client)
  useEffect(() => {
    let cancelled = false;
    import('pdfjs-dist').then((pdfjsLib) => {
      if (cancelled) return;
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      setPdfLib(pdfjsLib);
    });
    return () => { cancelled = true; };
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfLib) return;
    let cancelled = false;

    async function loadPdf() {
      if (!pdfLib) return;
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfLib.getDocument({
          url: fileUrl,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfLib.version}/cmaps/`,
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setError('PDF 파일을 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [pdfLib, fileUrl]);

  // Render pages
  useEffect(() => {
    if (!pdfDoc || loading) return;

    async function renderPage(pageNum: number) {
      if (!pdfDoc) return;
      const canvas = canvasRefs.current.get(pageNum);
      if (!canvas) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        page.cleanup();
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }

    for (let i = 1; i <= numPages; i++) {
      renderPage(i);
    }
  }, [pdfDoc, numPages, scale, loading]);

  // Track current visible page via IntersectionObserver
  useEffect(() => {
    if (!numPages || loading) return;

    const options = {
      root: null,
      rootMargin: '-50% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page') ?? '1', 10);
          setCurrentPage(pageNum);
        }
      }
    }, options);

    const pageElements = document.querySelectorAll('[data-page]');
    pageElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [numPages, loading]);

  // Pinch-to-zoom: passive:false 필요하므로 useEffect로 직접 등록
  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchRef.current = {
          startDist: getPinchDist(e.touches),
          startScale: scale,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault(); // passive:false 필요
        const ratio = getPinchDist(e.touches) / pinchRef.current.startDist;
        const next = Math.min(3, Math.max(0.5, pinchRef.current.startScale * ratio));
        setVisualScale(next / scale);
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (pinchRef.current && e.touches.length < 2) {
        setScale((prev) => {
          const next = Math.min(3, Math.max(0.5, prev * visualScaleRef.current));
          return next;
        });
        setVisualScale(1);
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
  // scale이 바뀔 때마다 핸들러 재등록
  }, [scale, loading, numPages]);

  // visualScale을 ref로도 유지 (클로저 문제 방지)
  const visualScaleRef = useRef(1);
  useEffect(() => {
    visualScaleRef.current = visualScale;
  }, [visualScale]);

  const scrollToPage = useCallback((pageNum: number) => {
    const el = document.querySelector(`[data-page="${pageNum}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePrevPage = useCallback(() => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    scrollToPage(newPage);
  }, [currentPage, scrollToPage]);

  const handleNextPage = useCallback(() => {
    const newPage = Math.min(numPages, currentPage + 1);
    setCurrentPage(newPage);
    scrollToPage(newPage);
  }, [currentPage, numPages, scrollToPage]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(3, s + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(0.5, s - 0.25));
  }, []);

  if (loading) return <PdfSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-danger font-semibold mb-2">{error}</p>
        <p className="text-muted text-sm ko-text">
          페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Pages */}
      <div
        ref={pagesRef}
        className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-24"
        style={{
          transform: visualScale !== 1 ? `scale(${visualScale})` : undefined,
          transformOrigin: 'top center',
          transition: visualScale === 1 ? 'transform 0.15s ease-out' : undefined,
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
              className="max-w-full"
              style={{ display: 'block' }}
            />
          </div>
        ))}
      </div>

      {/* Fixed bottom toolbar */}
      <div className="viewer-toolbar py-3 px-4 safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="
                w-9 h-9 rounded-lg bg-white/20 text-white
                flex items-center justify-center text-lg
                hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
              aria-label="이전 페이지"
            >
              ◀
            </button>
            <span className="text-white text-sm font-mono-link font-medium min-w-[4rem] text-center">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="
                w-9 h-9 rounded-lg bg-white/20 text-white
                flex items-center justify-center text-lg
                hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
              aria-label="다음 페이지"
            >
              ▶
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="
                w-9 h-9 rounded-lg bg-white/20 text-white
                flex items-center justify-center text-base font-bold
                hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
              aria-label="축소"
            >
              −
            </button>
            <span className="text-white text-xs font-mono-link min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="
                w-9 h-9 rounded-lg bg-white/20 text-white
                flex items-center justify-center text-base font-bold
                hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
              aria-label="확대"
            >
              ＋
            </button>
          </div>

          {/* Download button */}
          {allowDownload && downloadUrl && (
            <a
              href={downloadUrl}
              download={fileName}
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-lg
                bg-accent text-white font-semibold text-sm
                hover:bg-accent/90 transition-colors
                shadow-md
              "
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
