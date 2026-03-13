'use client';

interface UploadOptionsProps {
  allowDownload: boolean;
  generateQr: boolean;
  onAllowDownloadChange: (value: boolean) => void;
  onGenerateQrChange: (value: boolean) => void;
  disabled?: boolean;
}

interface CheckboxProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function Checkbox({ id, label, description, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`
        flex items-start gap-3 p-3 rounded-xl cursor-pointer
        border transition-all duration-150
        ${checked ? 'border-primary/30 bg-primary/5' : 'border-border bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-secondary/40 hover:bg-secondary/5'}
      `}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="custom-checkbox mt-0.5 flex-shrink-0"
        aria-label={label}
      />
      <div>
        <p className="text-sm font-semibold text-text-main">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </label>
  );
}

export default function UploadOptions({
  allowDownload,
  generateQr,
  onAllowDownloadChange,
  onGenerateQrChange,
  disabled,
}: UploadOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Checkbox
        id="allow-download"
        label="다운로드 허용"
        description="열람자가 파일을 저장할 수 있습니다"
        checked={allowDownload}
        onChange={onAllowDownloadChange}
        disabled={disabled}
      />
      <Checkbox
        id="generate-qr"
        label="QR코드 생성"
        description="종이 통신문에 인쇄하여 사용"
        checked={generateQr}
        onChange={onGenerateQrChange}
        disabled={disabled}
      />
    </div>
  );
}
