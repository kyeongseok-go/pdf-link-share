'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Toast from '@/components/common/Toast';
import DropZone from '@/components/upload/DropZone';
import FileInfo from '@/components/upload/FileInfo';
import ExpirySelector from '@/components/upload/ExpirySelector';
import UploadOptions from '@/components/upload/UploadOptions';
import ShareResult from '@/components/upload/ShareResult';
import type { ExpiryOption, UploadResponse } from '@/types';
import { DEFAULT_EXPIRY } from '@/lib/constants';

type Stage = 'idle' | 'fileSelected' | 'uploading' | 'done';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// FAQ accordion item
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="
          w-full flex items-center justify-between px-5 py-4
          text-left font-semibold text-text-main text-sm
          hover:bg-surface transition-colors duration-150
          bg-white
        "
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ko-text pr-4">{question}</span>
        <span
          className={`flex-shrink-0 text-muted text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-2 text-sm text-muted bg-surface ko-text leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

const FAQ_ITEMS = [
  {
    question: '파일 크기 제한이 있나요?',
    answer:
      '무료로 최대 50MB까지 업로드 가능합니다. 대부분의 교육자료는 이 범위 안에서 충분히 공유 가능합니다.',
  },
  {
    question: '공유 기간이 지나면 어떻게 되나요?',
    answer:
      '파일이 서버에서 완전히 삭제됩니다. 개인정보 보호를 위해 복구가 불가능합니다.',
  },
  {
    question: '학부모가 스마트폰으로 볼 수 있나요?',
    answer:
      '네, 카카오톡에서 링크를 누르면 바로 문서를 볼 수 있습니다. 별도 앱 설치 없이 바로 열람 가능합니다.',
  },
  {
    question: '회원가입이 필요한가요?',
    answer: '아니요, 가입 없이 바로 사용할 수 있습니다. 완전히 무료입니다.',
  },
];

const TRUST_ITEMS = [
  { icon: '👩‍🏫', text: '가정통신문을 카카오톡으로 보내는 선생님' },
  { icon: '📋', text: '교육자료를 배포하는 공무원' },
  { icon: '🏫', text: '학부모에게 안내문을 전달하는 학교' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF 링크공유기',
  description: 'PDF 파일을 링크로 변환하여 안전하게 공유하는 무료 서비스',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdfweblink.pages.dev',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  inLanguage: 'ko',
};

export default function HomePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [expiry, setExpiry] = useState<ExpiryOption>(DEFAULT_EXPIRY);
  const [allowDownload, setAllowDownload] = useState(true);
  const [generateQr, setGenerateQr] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'error') => {
    setToast({ message, type });
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setStage('fileSelected');
  }, []);

  const handleFileRemove = useCallback(() => {
    setFile(null);
    setStage('idle');
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setStage('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expiresIn', expiry);
      formData.append('allowDownload', allowDownload ? '1' : '0');

      // Simulate progress since fetch doesn't have upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json() as UploadResponse & { message?: string };

      if (!response.ok || !data.success) {
        throw new Error((data as { message?: string }).message ?? '업로드에 실패했습니다.');
      }

      setUploadResult(data);
      setStage('done');
    } catch (error) {
      setStage('fileSelected');
      setUploadProgress(0);
      showToast(
        error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.',
        'error'
      );
    }
  }, [file, expiry, allowDownload, showToast]);

  const handleReset = useCallback(() => {
    setFile(null);
    setExpiry(DEFAULT_EXPIRY);
    setAllowDownload(true);
    setGenerateQr(true);
    setUploadProgress(0);
    setUploadResult(null);
    setStage('idle');
  }, []);

  const isUploading = stage === 'uploading';
  const isDone = stage === 'done';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-white border-b border-border py-10 sm:py-14">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 ko-text leading-tight">
              PDF 파일을 링크로 바꿔드려요
            </h1>
            <p className="text-base sm:text-lg text-muted ko-text leading-relaxed">
              파일을 올리면 공유 링크와 QR코드가 바로 만들어집니다
            </p>
          </div>
        </section>

        {/* Upload section */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Done state: show result */}
          {isDone && uploadResult ? (
            <ShareResult
              result={uploadResult}
              generateQr={generateQr}
              onReset={handleReset}
            />
          ) : (
            <div className="space-y-5">
              {/* Drop zone — only show when no file selected */}
              {stage === 'idle' && (
                <DropZone
                  onFileSelect={handleFileSelect}
                  onError={(msg) => showToast(msg, 'error')}
                  disabled={isUploading}
                />
              )}

              {/* File selected / uploading state */}
              {(stage === 'fileSelected' || stage === 'uploading') && file && (
                <>
                  <FileInfo
                    file={file}
                    onRemove={handleFileRemove}
                    disabled={isUploading}
                  />

                  <ExpirySelector
                    value={expiry}
                    onChange={setExpiry}
                    disabled={isUploading}
                  />

                  <UploadOptions
                    allowDownload={allowDownload}
                    generateQr={generateQr}
                    onAllowDownloadChange={setAllowDownload}
                    onGenerateQrChange={setGenerateQr}
                    disabled={isUploading}
                  />

                  {/* Upload button */}
                  <div className="space-y-3">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className={`
                        w-full py-4 rounded-xl font-bold text-base
                        flex items-center justify-center gap-2
                        transition-all duration-200
                        ${
                          isUploading
                            ? 'bg-primary/60 text-white cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-[0.99]'
                        }
                      `}
                      aria-label={isUploading ? '업로드 중...' : '링크 만들기'}
                    >
                      {isUploading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>업로드 중...</span>
                        </>
                      ) : (
                        <>
                          <span>🔗</span>
                          <span>링크 만들기</span>
                        </>
                      )}
                    </button>

                    {/* Progress bar */}
                    {isUploading && (
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full progress-shimmer rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                          role="progressbar"
                          aria-valuenow={uploadProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    )}

                    {/* Change file */}
                    {!isUploading && (
                      <button
                        onClick={handleFileRemove}
                        className="w-full text-center text-sm text-muted hover:text-primary transition-colors"
                      >
                        다른 파일 선택
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Trust section */}
        <section className="bg-white border-y border-border py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-bold text-primary text-center mb-6">
              이런 분들이 사용하고 있어요
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TRUST_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="
                    flex flex-col items-center text-center p-5 rounded-xl
                    bg-surface border border-border card-hover
                  "
                >
                  <span className="text-3xl mb-3">{item.icon}</span>
                  <p className="text-sm font-medium text-text-main ko-text leading-snug">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section id="faq" className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-primary mb-6">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
