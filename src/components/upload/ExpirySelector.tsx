'use client';

import type { ExpiryOption } from '@/types';
import { EXPIRY_OPTIONS } from '@/lib/constants';

interface ExpirySelectorProps {
  value: ExpiryOption;
  onChange: (value: ExpiryOption) => void;
  disabled?: boolean;
}

export default function ExpirySelector({ value, onChange, disabled }: ExpirySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-3">
        공유 기간
      </label>
      <div className="grid grid-cols-4 gap-2">
        {EXPIRY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                relative py-3 px-2 rounded-xl text-center
                border-2 font-semibold text-sm
                transition-all duration-150 ease-out
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-md scale-105'
                    : 'border-border bg-white text-text-main hover:border-secondary hover:text-secondary'
                }
              `}
              aria-pressed={isSelected}
            >
              {option.label}
              {option.value === '7d' && !isSelected && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] px-1 py-0.5 rounded-full font-bold leading-none">
                  기본
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
