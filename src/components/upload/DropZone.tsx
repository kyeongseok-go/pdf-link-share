'use client';

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { validatePdfClient } from '@/lib/validation';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function DropZone({ onFileSelect, onError, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const result = await validatePdfClient(file);
      if (!result.valid) {
        onError(result.error ?? '파일 업로드에 실패했습니다.');
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, onError]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      if (files.length > 1) {
        onError('파일을 하나씩 업로드해 주세요.');
        return;
      }
      await handleFile(files[0]);
    },
    [disabled, handleFile, onError]
  );

  const handleInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      await handleFile(files[0]);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="PDF 파일 업로드 영역. 클릭하거나 파일을 끌어다 놓으세요."
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full rounded-2xl py-12 px-8 text-center
        border-2 border-dashed cursor-pointer
        transition-all duration-200 ease-out select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${
          isDragging
            ? 'border-secondary bg-trust scale-[1.01] shadow-lg'
            : 'border-border bg-white hover:border-secondary hover:bg-blue-50/30'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={`
          text-5xl mb-4 transition-transform duration-200
          ${isDragging ? 'scale-110 animate-bounce' : ''}
        `}
      >
        {isDragging ? '📂' : '📄'}
      </div>

      {/* Main text */}
      <p className="text-lg font-semibold text-primary mb-1 ko-text">
        {isDragging ? 'PDF 파일을 여기에 놓으세요' : 'PDF 파일을 여기에 끌어다 놓으세요'}
      </p>
      <p className="text-muted text-sm mb-4">
        또는 <span className="text-secondary underline underline-offset-2">클릭하여 파일 선택</span>
      </p>

      {/* Subtext */}
      <p className="text-xs text-muted">
        무료 · 최대 50MB · 회원가입 불필요
      </p>
    </div>
  );
}
