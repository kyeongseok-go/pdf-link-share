'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UploadResponse } from '@/types';
import { formatKoreanDate, formatShortDate } from '@/lib/date';

interface ShareResultProps {
  result: UploadResponse;
  generateQr: boolean;
  onReset: () => void;
}

export default function ShareResult({ result, generateQr, onReset }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);

  // Generate QR code on client side
  useEffect(() => {
    if (!generateQr) return;
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      if (cancelled) return;
      QRCode.toDataURL(result.shareUrl, {
        width: 600,
        margin: 2,
        color: { dark: '#1B4965', light: '#FFFFFF' },
      }).then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrVisible(true);
        }
      });
    });
    return () => { cancelled = true; };
  }, [result.shareUrl, generateQr]);

  const copyToClipboard = useCallback(async () => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.shareUrl);
      } else {
        // Fallback for KakaoTalk in-app browser
        const textarea = document.createElement('textarea');
        textarea.value = result.shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail - user can manually copy
    }
  }, [result.shareUrl]);

  const downloadQr = useCallback(async () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR코드_${result.fileName.replace('.pdf', '')}.png`;
    link.click();
  }, [qrDataUrl, result.fileName]);

  const shareKakao = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `📄 ${result.fileName}`,
          text: 'PDF 링크공유기로 공유된 문서입니다.',
          url: result.shareUrl,
        });
        return;
      } catch {
        // 사용자가 공유 취소 시 무시
      }
    }
    // Web Share API 미지원 시 클립보드 복사로 대체
    await copyToClipboard();
  }, [result.shareUrl, result.fileName, copyToClipboard]);

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-lg animate-slide-up">
      {/* Success header */}
      <div className="bg-accent/10 border-b border-accent/20 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h2 className="text-lg font-bold text-primary">공유 링크가 만들어졌습니다!</h2>
            <p className="text-sm text-muted mt-0.5">링크를 복사하거나 카카오톡으로 공유하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* URL display */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            공유 링크
          </label>
          <div
            className="
              flex items-center gap-2 bg-surface border border-border rounded-xl
              px-4 py-3 cursor-pointer hover:border-secondary transition-colors
              group
            "
            onClick={copyToClipboard}
            role="button"
            tabIndex={0}
            aria-label="링크 복사"
            onKeyDown={(e) => e.key === 'Enter' && copyToClipboard()}
          >
            <code className="flex-1 text-sm font-mono-link text-primary truncate min-w-0">
              {result.shareUrl}
            </code>
            <span className="flex-shrink-0 text-xs text-muted group-hover:text-secondary transition-colors">
              복사
            </span>
          </div>
        </div>

        {/* Main copy button */}
        <button
          onClick={copyToClipboard}
          className={`
            w-full py-4 rounded-xl font-bold text-base
            flex items-center justify-center gap-2
            transition-all duration-300 ease-out
            ${
              copied
                ? 'bg-accent text-white shadow-md scale-[1.01]'
                : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
            }
          `}
          aria-label={copied ? '복사 완료' : '링크 복사'}
        >
          <span className="transition-all duration-300">
            {copied ? '✅' : '📋'}
          </span>
          <span className="transition-all duration-300">
            {copied ? '복사 완료!' : '링크 복사'}
          </span>
        </button>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareKakao}
            className="
              py-3 rounded-xl font-semibold text-sm
              bg-[#FEE500] text-[#3A1D1D] hover:bg-[#FDD835]
              flex items-center justify-center gap-2
              transition-all duration-150 shadow-sm hover:shadow
            "
          >
            <span>💬</span>
            <span>카카오톡 공유</span>
          </button>
          {generateQr && qrDataUrl && (
            <button
              onClick={() => setQrVisible((v) => !v)}
              className="
                py-3 rounded-xl font-semibold text-sm
                bg-secondary/10 text-secondary hover:bg-secondary/20
                flex items-center justify-center gap-2
                transition-all duration-150 border border-secondary/20
              "
            >
              <span>📱</span>
              <span>QR코드 {qrVisible ? '숨기기' : '보기'}</span>
            </button>
          )}
        </div>

        {/* QR Code section */}
        {generateQr && qrDataUrl && qrVisible && (
          <div className="bg-surface rounded-xl p-5 text-center border border-border animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="공유 링크 QR코드"
              width={200}
              height={200}
              className="mx-auto rounded-xl shadow-md"
            />
            <p className="text-xs text-muted mt-3 mb-3">PDF 링크공유기</p>
            <button
              onClick={downloadQr}
              className="
                text-sm text-secondary hover:text-primary
                underline underline-offset-2 font-medium
                transition-colors duration-150
              "
            >
              📥 QR코드 이미지 저장 (PNG)
            </button>
            <p className="text-xs text-muted mt-2 ko-text">
              종이 통신문에 인쇄하여 사용할 수 있습니다
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-surface rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">파일명</span>
            <span className="font-medium text-text-main truncate max-w-[60%] text-right" title={result.fileName}>
              {result.fileName}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">만료일</span>
            <span className="font-medium text-text-main">
              {formatKoreanDate(result.expiresAt)}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
          <span className="text-warning mt-0.5 flex-shrink-0">⚠️</span>
          <p className="text-sm text-warning font-medium ko-text">
            이 링크는 만료 후 삭제됩니다. 지금 복사하거나 공유해주세요.
          </p>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="
            w-full py-3 rounded-xl font-semibold text-sm text-muted
            border border-border bg-white hover:bg-surface hover:text-primary
            flex items-center justify-center gap-2
            transition-all duration-150
          "
        >
          <span>+</span>
          <span>새 파일 올리기</span>
        </button>
      </div>
    </div>
  );
}
