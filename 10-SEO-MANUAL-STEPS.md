# PDF 링크공유기 - 내가 직접 해야 하는 것들 (SEO)

Claude가 코드를 추가한 뒤, 아래 작업은 본인이 직접 해야 합니다.
순서대로 진행하세요.

---

## ✅ 1. 구글 Search Console 등록

**소요 시간: 5분**

1. https://search.google.com/search-console 접속 (구글 계정 로그인)
2. 왼쪽 상단 "속성 추가" 클릭
3. "URL 접두어" 선택 → 사이트 URL 입력 (예: `https://pdflink.kr`)
4. 소유권 확인 방법 → "HTML 태그" 선택
5. 제공되는 `<meta name="google-site-verification" content="xxxxxx" />` 에서 **content 값만 복사**
6. 프로젝트의 `.env` 파일에 추가:
   ```
   NEXT_PUBLIC_GOOGLE_VERIFICATION=xxxxxx
   ```
7. 재배포 후 구글에서 "확인" 클릭
8. 좌측 메뉴 "Sitemaps" → `https://사이트/sitemap.xml` 제출

### 등록 후 할 일
- "URL 검사" 메뉴에서 `https://사이트/` 입력 → "색인 생성 요청" 클릭
- `https://사이트/guide` 도 동일하게 색인 요청
- 이렇게 하면 크롤링이 며칠 내로 시작됩니다

---

## ✅ 2. 네이버 서치어드바이저 등록

**소요 시간: 5분**

1. https://searchadvisor.naver.com 접속 (네이버 계정 로그인)
2. "웹마스터 도구" → "사이트 관리" → 사이트 URL 입력
3. 소유권 확인 → "HTML 태그" 선택
4. 제공되는 `<meta name="naver-site-verification" content="xxxxxx" />` 에서 **content 값만 복사**
5. 프로젝트의 `.env` 파일에 추가:
   ```
   NEXT_PUBLIC_NAVER_VERIFICATION=xxxxxx
   ```
6. 재배포 후 네이버에서 "소유확인" 클릭
7. 좌측 "요청" → "사이트맵 제출" → `https://사이트/sitemap.xml` 입력

### 추가 설정
- "요청" → "웹 페이지 수집" → 메인 URL 직접 수집 요청
- "검증" → "robots.txt" → 정상 동작 확인

---

## ✅ 3. .env 파일 최종 모습

```env
NEXT_PUBLIC_SITE_URL=https://실제도메인
NEXT_PUBLIC_GOOGLE_VERIFICATION=구글에서받은코드
NEXT_PUBLIC_NAVER_VERIFICATION=네이버에서받은코드
```

이 값을 넣은 후 **재배포**해야 적용됩니다.

Cloudflare Pages를 사용 중이라면:
- Cloudflare 대시보드 → Pages → 프로젝트 → Settings → Environment variables
- 위 3개 변수를 Production에 추가
- 재배포 (git push 또는 대시보드에서 Retry deployment)

---

## ✅ 4. 검색 노출 확인 (등록 후 1~2주 뒤)

### 구글 확인
- 구글에서 `site:사이트도메인` 검색
- 메인 페이지와 /guide 페이지가 나오면 성공

### 네이버 확인
- 네이버에서 `site:사이트도메인` 검색
- 또는 "PDF 링크 공유" 검색하여 노출 확인

---

## 📌 5. 추가로 하면 좋은 것 (선택사항)

### 네이버 블로그 글 작성
네이버 검색에서 블로그가 상위 노출되는 경우가 많습니다.
본인 네이버 블로그에 다음과 같은 글을 작성하면 효과적:

> **제목 예시**: "가정통신문을 카카오톡으로 보내는 무료 방법 — PDF 링크공유기"
> 
> **내용 포인트**:
> - 왜 만들었는지 (여자친구가 선생님이라 필요했다는 스토리)
> - 사용법 3단계 스크린샷
> - 무료, 회원가입 불필요 강조
> - 사이트 링크 삽입

### 교사 커뮤니티 공유
실제 사용자 확보에 가장 효과적인 채널:
- **인디스쿨** (indischool.com) — 초등교사 커뮤니티
- **참쌤스쿨** — 교사 자료 공유 커뮤니티
- **에듀넷** — 교육부 산하 교육 플랫폼
- 각 커뮤니티의 "자유게시판" 또는 "유용한 사이트" 게시판에 소개글 작성

### 도메인 (.kr 추천)
아직 커스텀 도메인이 없다면:
- `pdflink.kr` 또는 `pdfdrop.kr` 같은 .kr 도메인 추천
- 한국 사용자에게 신뢰감 줌
- 가비아(gabia.com) 또는 후이즈(whois.co.kr)에서 연 1~2만원

---

## 📋 체크리스트

| 순서 | 작업 | 누가 | 완료 |
|------|------|------|------|
| 1 | SEO 코드 추가 (sitemap, robots, 메타태그, guide 페이지) | Claude | ☐ |
| 2 | 재배포 | 나 | ☐ |
| 3 | 구글 Search Console 등록 + 인증코드 받기 | 나 | ☐ |
| 4 | 네이버 서치어드바이저 등록 + 인증코드 받기 | 나 | ☐ |
| 5 | .env에 인증코드 입력 (또는 Cloudflare 환경변수) | 나 | ☐ |
| 6 | 재배포 (인증코드 반영) | 나 | ☐ |
| 7 | 구글/네이버에서 소유권 확인 클릭 | 나 | ☐ |
| 8 | 사이트맵 제출 (구글 + 네이버) | 나 | ☐ |
| 9 | URL 색인 요청 (구글: /, /guide) | 나 | ☐ |
| 10 | (선택) 네이버 블로그 글 작성 | 나 | ☐ |
| 11 | (선택) 교사 커뮤니티 소개글 작성 | 나 | ☐ |
| 12 | 1~2주 뒤 site:도메인 검색하여 노출 확인 | 나 | ☐ |
