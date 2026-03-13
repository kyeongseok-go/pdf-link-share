'use client';

import { formatFileSize } from '@/lib/date';

interface FileInfoProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export default function FileInfo({ file, onRemove, disabled }: FileInfoProps) {
  return (
    <div className="flex items-center gap-3 bg-trust border border-secondary/20 rounded-xl p-4 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
        <span className="text-xl">📄</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-primary truncate"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {formatFileSize(file.size)}
        </p>
      </div>
      <button
        onClick={onRemove}
        disabled={disabled}
        className={`
          flex-shrink-0 w-8 h-8 rounded-lg text-sm
          flex items-center justify-center
          text-muted hover:text-danger hover:bg-red-50
          transition-colors duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="파일 제거"
        title="파일 제거"
      >
        ✕
      </button>
    </div>
  );
}
