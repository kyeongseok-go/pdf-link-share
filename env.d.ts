interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
}

interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoShareContent {
  title: string;
  description: string;
  imageUrl?: string;
  link: KakaoShareLink;
}

interface KakaoShareButton {
  title: string;
  link: KakaoShareLink;
}

interface Window {
  Kakao: {
    init(key: string): void;
    isInitialized(): boolean;
    Share: {
      sendDefault(options: {
        objectType: string;
        content: KakaoShareContent;
        buttons?: KakaoShareButton[];
      }): void;
    };
  };
}
