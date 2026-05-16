export const siteConfig = {
  name: "견적서 뷰어",
  description:
    "Notion으로 작성한 견적서를 토큰 링크로 공유하고 PDF로 다운로드받는 도구",
  url: "https://example.com",
  nav: [] as ReadonlyArray<{ title: string; href: string }>,
  links: {
    github: "https://github.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type NavItem = { title: string; href: string };
