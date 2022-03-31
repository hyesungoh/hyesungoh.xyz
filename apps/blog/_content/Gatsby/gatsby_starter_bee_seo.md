---
title: 'gatsby-starter-bee theme 네이버, 구글 검색 노출시키기'
date: 2021-02-07 17:50:00
category: 'Gatsby'
draft: false
---

해당 블로그는 [gatsby-starter-bee](https://github.com/JaeYeopHan/gatsby-starter-bee) theme을 수정하여 사용중입니다.

해당 테마의 경우 구글 검색 엔진 최적화 (SEO)를 위한 sitemap은 설치돼 있으나,

네이버 검색 노출을 위한 robots는 작성돼 있지 않아 추가하는 법과

등록 방법을 공유하도록 하겠습니다. :D

## 구글 검색 노출 등록

- [구글 서치 콘솔](https://search.google.com/search-console/about?hl=ko)에 접속하여 로그인
- URL 접두어 선택 후 하단에 있는 HTML meta 태그 클릭
- 해당 태그를 복사

```js
// src/components/head/index.js
    <Helmet
    htmlAttributes={{
    lang,
    }}
    title={title}
    titleTemplate={`%s | ${data.site.siteMetadata.title}`}
    meta={[
    ...
    // <meta name="google-site-verification" content="verificationCode" />
    // <meta name="naver-site-verification" content="verificationCode" />

    {
        name: `google-site-verification`,
        content: `verificationCode`,
    },
    {
        name: `naver-site-verification`,
        content: `verificationCode`,
    },
    ...
```

- gatsby-starter-bee theme의 경우 helmet을 사용하여 html의 head 태그를 관리하기 때문에 위 모습과 동일하게 작성
- 배포 후 개발자 도구등을 이용하여 head 태그에 적용이 된 것을 확인 후 구글 서치 콘솔 상 확인 버튼을 클릭하면 인증이 완료
- 좌측 sitemaps 메뉴에 sitemap.xml을 제출하면 끝 !

<img width="1324" alt="스크린샷 2021-02-07 오후 6 01 11" src="https://user-images.githubusercontent.com/26461307/107141891-f7d23680-696e-11eb-8ff8-43d20cb4f1f4.png" />

~~~ robots.txt 추가 부분은 되나 해봤습니다 ... ~~~

- 몇 시간 정도 후에 `site:www.hyesungoh.xyz`와 같이 검색

## 네이버 검색 노출 등록

- robots.txt 작성을 위해 플러그인을 설치

```terminal
yarn add gatsby-plugin-robots-txt
or
npm i gatsby-plugin-robots-txt
```

- `gatsby-config.js`에 플러그인 등록 후 모든 URL을 오픈하도록 설정, 제외하고 싶은 URL은 disallow에 추가

```js
 plugins: [
...
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://dyjh-blog.netlify.app',
        sitemap: 'https://dyjh-blog.netlify.app/sitemap.xml',
        policy: [{
          userAgent: '*',
          allow: '/'
        }]
      }
    },
...
  ]
```

- 'npm start' 후 /robots.txt 접속이 잘 된다면 배포
- [네이버 웹 마스터](https://searchadvisor.naver.com/console/board) 접속 후 사이트 인증 진행
- 위 구글 인증 방법과 동일하게 `helmet`에 추가
- 배포, 확인 후 좌측 사이트맵 제출 클릭 후 `sitemap.xml` 제출

<img width="1111" alt="스크린샷 2021-02-07 오후 6 15 22" src="https://user-images.githubusercontent.com/26461307/107142238-c195b680-6970-11eb-84de-0bca5f3c8558.png" />

- 좌측 검증 탭의 robots.txt 검증 및 수집요청

<img width="1064" alt="스크린샷 2021-02-07 오후 6 16 07" src="https://user-images.githubusercontent.com/26461307/107142239-c490a700-6970-11eb-978c-9e95f32bf996.png" />

- 몇 시간 정도 후에 `site:{www.hyesungoh.xyz}`와 같이 검색
- 끝 !!

> 참고 : [dyih님 블로그](https://dyjh-blog.netlify.app/posts/2020-gatsby-blog-seo)
