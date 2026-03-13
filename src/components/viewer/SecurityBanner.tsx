'use client';

import { useState, useMemo } from 'react';
import { isExpiringSoon, isExpired, formatShortDate, formatRemainingTime } from '@/lib/date';

interface SecurityBannerProps {
  fileName: string;
  createdAt: string;
  expiresAt: string;
}

export default function SecurityBanner({ fileName, createdAt, expiresAt }: SecurityBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  const expiringSoon = useMemo(() => isExpiringSoon(expiresAt), [expiresAt]);
  const expired = useMemo(() => isExpired(expiresAt), [expiresAt]);
  const remainingTime = useMemo(() => formatRemainingTime(expiresAt), [expiresAt]);

  // Determine banner color
  let bannerBg: string;
  let bannerBorder: string;
  let iconText: string;
  let titleText: string;

  if (expired) {
    bannerBg = 'bg-red-50';
    bannerBorder = 'border-danger/30';
    iconText = '🚫';
    titleText = '문서 열람 기간이 종료되었습니다';
  } else if (expiringSoon) {
    bannerBg = 'bg-orange-50';
    bannerBorder = 'border-warning/30';
    iconText = '⏰';
    titleText = '열람 기간이 곧 종료됩니다';
  } else {
    bannerBg = 'bg-trust';
    bannerBorder = 'border-secondary/20';
    iconText = '🔒';
    titleText = '안전하게 공유된 문서입니다';
  }

  const titleColor = expired ? 'text-danger' : expiringSoon ? 'text-warning' : 'text-primary';

  return (
    <div
      className={`${bannerBg} border-b ${bannerBorder} transition-all duration-300`}
      role="region"
      aria-label="보안 안내"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        {/* Collapsed state: one-line summary */}
        {collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span>{iconText}</span>
              <span className={`font-semibold ${titleColor}`}>{titleText}</span>
              {expiringSoon && !expired && (
                <span className="text-warning text-xs">· 남은 기간: {remainingTime}</span>
              )}
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className="text-xs text-muted hover:text-primary transition-colors ml-3 flex-shrink-0"
              aria-label="보안 안내 펼치기"
            >
              자세히 ▼
            </button>
          </div>
        ) : (
          /* Expanded state */
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{iconText}</span>
                <h2 className={`font-bold text-sm sm:text-base ${titleColor}`}>
                  {titleText}
                </h2>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="text-xs text-muted hover:text-primary transition-colors flex-shrink-0 mt-0.5"
                aria-label="보안 안내 접기"
              >
                접기 ▲
              </button>
            </div>

            <div className="text-xs sm:text-sm text-muted space-y-1 pl-7 ko-text">
              <p>이 문서는 PDF 링크공유기를 통해 안전하게 공유된 자료입니다.</p>
              <p>
                열람 기간:{' '}
                <span className="font-medium text-text-main">
                  {formatShortDate(createdAt)}
                </span>
                {' ~ '}
                <span className={`font-medium ${expiringSoon ? 'text-warning' : 'text-text-main'}`}>
                  {formatShortDate(expiresAt)}
                </span>
              </p>

              {expiringSoon && !expired && (
                <p className="text-warning font-semibold">
                  ⏰ 남은 시간: {remainingTime} — 필요하시면 지금 저장해 주세요.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
                <span>• 기간 종료 시 자동으로 삭제됩니다</span>
                <span>• 무단 배포를 삼가해 주세요</span>
              </div>
              <p>본 서비스는 파일을 열람 외 목적으로 사용하지 않습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
