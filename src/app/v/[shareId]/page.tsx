import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import { isExpired } from '@/lib/date';
import ExpiredNotice from '@/components/expired/ExpiredNotice';
import Header from '@/components/common/Header';
import SecurityBanner from '@/components/viewer/SecurityBanner';
import PdfViewer from '@/components/viewer/PdfViewer';
import type { DocumentMeta } from '@/types';

export const runtime = 'edge';

interface Props {
  params: Promise<{ shareId: string }>;
}

async function fetchDocumentMeta(shareId: string): Promise<DocumentMeta | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/doc/${shareId}`, {
      // Revalidate every 60s for SSR caching
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json() as { data?: DocumentMeta };
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId: sid } = await params;
  const doc = await fetchDocumentMeta(sid);

  if (!doc) {
    return {
      title: `문서를 찾을 수 없습니다 - ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${doc.fileName} - ${SITE_NAME}`,
    description: '📄 안전하게 공유된 문서입니다. 탭하여 열람하세요.',
    robots: { index: false, follow: false }, // Do not index shared documents
    openGraph: {
      title: doc.fileName,
      description: '📄 안전하게 공유된 문서입니다. 탭하여 열람하세요.',
      siteName: SITE_NAME,
      type: 'website',
      locale: 'ko_KR',
    },
  };
}

export default async function ViewerPage({ params }: Props) {
  const { shareId } = await params;

  // Validate shareId format
  if (!shareId || shareId.length > 20 || !/^[a-zA-Z0-9]+$/.test(shareId)) {
    return <ExpiredNotice />;
  }

  const doc = await fetchDocumentMeta(shareId);

  // Not found or expired
  if (!doc || isExpired(doc.expiresAt)) {
    return <ExpiredNotice />;
  }

  const fileUrl = `/api/file/${shareId}`;
  const downloadUrl = doc.allowDownload ? `/api/file/${shareId}?download=1` : undefined;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header minimal />

      {/* Security Banner */}
      <SecurityBanner
        fileName={doc.fileName}
        createdAt={doc.createdAt}
        expiresAt={doc.expiresAt}
      />

      {/* File name header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-sm font-semibold text-primary truncate"
            title={doc.fileName}
          >
            📄 {doc.fileName}
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 pb-20">
        <PdfViewer
          fileUrl={fileUrl}
          fileName={doc.fileName}
          allowDownload={doc.allowDownload}
          downloadUrl={downloadUrl}
        />
      </div>
    </div>
  );
}
