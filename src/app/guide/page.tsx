import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: '가정통신문을 카카오톡으로 공유하는 방법',
  description:
    'PDF 파일을 링크로 변환하여 카카오톡, 문자, 밴드 등으로 간편하게 공유하는 방법을 알려드립니다. 무료, 회원가입 불필요.',
  alternates: {
    canonical: '/guide',
  },
  openGraph: {
    title: '가정통신문을 카카오톡으로 공유하는 방법 - PDF 링크공유기',
    description:
      'PDF 파일을 링크로 변환하여 카카오톡, 문자, 밴드 등으로 간편하게 공유하는 방법을 알려드립니다.',
    type: 'article',
    locale: 'ko_KR',
  },
};

const STEPS = [
  {
    num: '01',
    title: 'PDF 링크공유기 접속',
    desc: 'PDF 링크공유기 사이트에 접속합니다. 별도 앱 설치나 회원가입이 필요 없습니다.',
  },
  {
    num: '02',
    title: 'PDF 파일 업로드',
    desc: 'PDF 파일을 드래그앤드롭으로 올리거나 클릭하여 선택합니다. 공유 기간(1일~90일)을 설정합니다.',
  },
  {
    num: '03',
    title: '링크 공유',
    desc: '생성된 공유 링크를 카카오톡, 문자, 밴드 단체방에 붙여넣기 하면 완료입니다.',
  },
];

const FEATURES = [
  { icon: '🔗', title: '공유 링크 즉시 생성', desc: '업로드 즉시 공유 가능한 단축 링크가 만들어집니다.' },
  { icon: '📱', title: 'QR코드 자동 생성', desc: '종이 통신문에 QR코드를 인쇄하면 학부모가 카메라로 바로 열람할 수 있습니다.' },
  { icon: '⏰', title: '공유 기간 설정', desc: '1일~90일 중 선택하면 기간이 지난 후 파일이 자동 삭제됩니다.' },
  { icon: '📲', title: '모바일 최적화', desc: '카카오톡에서 링크를 누르면 앱 설치 없이 바로 열람됩니다.' },
  { icon: '🆓', title: '무료·회원가입 불필요', desc: '완전 무료이며 별도 계정 없이 사용할 수 있습니다.' },
];

const FAQ = [
  {
    q: '학부모가 앱 설치 없이 볼 수 있나요?',
    a: '네, 링크를 누르면 스마트폰 브라우저에서 바로 열립니다. 별도 앱 설치가 필요 없습니다.',
  },
  {
    q: '파일 크기 제한이 있나요?',
    a: '최대 50MB까지 무료로 사용 가능합니다. 대부분의 가정통신문은 이 범위 안에서 충분히 공유 가능합니다.',
  },
  {
    q: '공유 기간이 지나면 어떻게 되나요?',
    a: '파일이 서버에서 완전히 삭제됩니다. 개인정보 보호를 위해 복구가 불가능합니다.',
  },
  {
    q: '한 번에 여러 파일을 올릴 수 있나요?',
    a: '현재는 파일 1개씩 공유 링크를 생성할 수 있습니다. 파일별로 따로 링크를 만들어 공유해 주세요.',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1">
        {/* 히어로 */}
        <section className="bg-white border-b border-border py-12 sm:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <p className="text-sm font-semibold text-accent mb-3 ko-text">사용 가이드</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 ko-text leading-tight">
              가정통신문을 카카오톡으로<br className="sm:hidden" /> 공유하는 방법
            </h1>
            <p className="text-base text-muted ko-text leading-relaxed">
              종이 가정통신문을 디지털로 전환하고 싶으신가요? PDF 링크공유기를 사용하면 PDF 파일을
              링크 하나로 바꿔서 카카오톡, 문자, 네이버 밴드 등으로 간편하게 공유할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 대상 */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-lg font-bold text-primary mb-5 ko-text">이런 분들에게 유용합니다</h2>
          <ul className="space-y-3">
            {[
              { icon: '👩‍🏫', text: '가정통신문을 학부모 단체방에 보내야 하는 선생님' },
              { icon: '📋', text: '교육자료를 배포해야 하는 공무원' },
              { icon: '🏫', text: '안내문을 디지털로 전달하고 싶은 학교 관계자' },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-border px-4 py-3.5"
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium text-text-main ko-text leading-snug pt-0.5">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 사용 방법 */}
        <section className="bg-white border-y border-border py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-bold text-primary mb-6 ko-text">사용 방법 (3단계)</h2>
            <ol className="space-y-5">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {step.num}
                  </span>
                  <div className="pt-1.5">
                    <p className="font-semibold text-text-main ko-text mb-1">{step.title}</p>
                    <p className="text-sm text-muted ko-text leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-lg font-bold text-primary mb-5 ko-text">주요 기능</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-semibold text-text-main text-sm ko-text mb-0.5">{f.title}</p>
                  <p className="text-xs text-muted ko-text leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white border-t border-border py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg font-bold text-primary mb-5 ko-text">자주 묻는 질문</h2>
            <dl className="space-y-4">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <dt className="bg-surface px-5 py-3.5 font-semibold text-sm text-text-main ko-text">
                    Q. {item.q}
                  </dt>
                  <dd className="px-5 py-3.5 text-sm text-muted ko-text leading-relaxed border-t border-border bg-white">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-base text-muted ko-text mb-5">
            지금 바로 무료로 사용해 보세요. 회원가입 없이 30초면 공유 링크가 만들어집니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md text-base ko-text"
          >
            <span>🔗</span>
            <span>지금 바로 사용해보기 →</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
