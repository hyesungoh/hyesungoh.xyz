---
title: 'bundle-analyzer, gzip으로 Next.js 최적화하기'
subtitle: '현실 다이어트는 매번 실패하니, 서비스 다이어트라도 해보자'
date: 2022-02-25 20:24:00
category: 'React'
draft: false
---

Next.js를 사용해 개발한 교내 동아리 랜딩 페이지를 최적화한 경험을 공유합니다.

> 해당 랜딩 페이지는 [다음 링크](https://www.dogvelopers.com)를 통해 확인하실 수 있습니다!

## 들어가기 앞서

Lighthouse 지표와 추천 사항을 기준으로 최적화 작업을 진행하였습니다.

저는 최적화 작업이 익숙하지 않지만, 제가 검색한 결과 최신의, 깔끔하게 정리된 내용이 없어 공유하기로 생각했다는 점 말씀드립니다.

## Bundle-analyzer 적용하기

![bundle analyzer](https://user-images.githubusercontent.com/26461307/155719898-d59e0146-718f-4244-9957-a00df8f64c95.png)

**bundle analyzer**를 사용하면 위 사진처럼 빌드 후 각 모듈의 번들링된 사이즈를 확인하실 수 있으며, 이는 번들링 크기를 줄이는 **tree shaking**의 지표로 활용할 수 있습니다.

### Next.js에서 적용 방법

```bash
npm install @next/bundle-analyzer --save-dev
# or
yarn add @next/bundle-analyzer -D
```

우선 설치를 진행해준 후,

```js
// next.config.js

// 환경변수 ANALYZE가 true일 시에
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});
```

루트 디렉토리에 위치한 `next.config.js` 파일에 위 내용과 함께 `.env.local`, `.env`와 같은 환경 변수 파일에서 아래 내용을 추가해주시면 적용하실 수 있습니다.

```text
ANALYZER=true
```

적용 후, Build 해보시면 아래 사진과 같이 `analyze` 디렉토리에 client, server로 나뉜 html 파일을 확인해보실 수 있으실 겁니다.

![analyze image](https://user-images.githubusercontent.com/26461307/155726038-e44e85ba-bdc2-4e4e-8486-83d72077c8d5.png)

[Next.js github](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)에서 적용 방법에 대한 문서를 확인하실 수 있으며, [npm 주소는 다음 링크](https://www.npmjs.com/package/@next/bundle-analyzer)에서 확인하실 수 있습니다.

## 다른 Plugin들과 함께 사용하기

위 문서를 확인하셨다면 아시겠지만, **next-compose-plugins**를 사용하여 다른 plugin들과 함께 `next.config.js` 파일을 더욱 깔끔히 관리할 수 있습니다.

```bash
npm install next-compose-plugins --save-dev
# or
yarn add next-compose-plugins -D
```

설치 후 다음과 같은 형태로 `next.config.js` 파일을 작성하실 수 있습니다.

```js
// next.config.js
const withPlugins = require('next-compose-plugins');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// 해당 내용은 아래 공식 문서를 참고하시면 좋을 것 같습니다.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPlugins(
  [
    withBundleAnalyzer,
    withFooPlugin,
    // 추가적인 Plugin들을 작성해주시면 됩니다.
  ],
  nextConfig
);
```

보시는 것처럼 저는 sentry plugin이 기존에 작성되어 있었으며, `next-compose-plugins`를 사용하여 `bundle-analyzer`와 함께 작성한 모습을 확인하실 수 있습니다.

[next-compose-plugins의 npm 주소는 다음 링크](https://www.npmjs.com/package/next-compose-plugins)에서 확인하실 수 있습니다.

## Gzip compress(압축)하기

Gzip이란 파일 압축에 쓰이는 응용 소프트웨어로써, HTML, CSS, JS 등을 압축하여 리소스를 받는 시간을 줄여주는 방식으로 성능을 개선할 수 있습니다.

> gzip은 파일 압축에 쓰이는 응용 소프트웨어이다. gzip은 GNU zip의 준말이며, 초기 유닉스 시스템에 쓰이던 압축 프로그램을 대체하기 위한 자유 소프트웨어이다. gzip은 ... [더욱 자세한 내용은 출처 위키피디아](https://ko.wikipedia.org/wiki/Gzip)를 확인해보시면 좋을 것 같습니다.

### Next.js에서 적용 방법

```bash
npm install compression-webpack-plugin --save-dev
# or
yarn add compression-webpack-plugin -D
```

설치 후 다음과 같은 형태로 `next.config.js` 파일을 작성하실 수 있습니다.

```js
// next.config.js
const withPlugins = require('next-compose-plugins');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const CompressionPlugin = require('compression-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.plugins.push(new CompressionPlugin());
    return config;
  },
};

module.exports = withPlugins(
  [
    withBundleAnalyzer({
      compress: true,
    }),
    withFooPlugin,
  ],
  nextConfig
);
```

작성하신 후, Build를 해보시면 아래 사진과 같이 `gz` 확장자의 파일을 확인하실 수 있으실 겁니다.

![gz image](https://user-images.githubusercontent.com/26461307/155725646-5b2f7f62-b707-4a2d-bfd3-7d41ed3016a7.png)

해당 Plugin의 자세한 옵션과 사용방법들은 [Webpack 문서](https://webpack.js.org/plugins/compression-webpack-plugin/)에서 확인하실 수 있습니다.

### gzip은 무조건 좋은 것인가?

- 사용자 측면

  ![gzip brower support](https://user-images.githubusercontent.com/26461307/155727003-4a83dbfc-032c-4f9a-9a85-e288e654b2d1.png)

  _이미지 출처 : https://caniuse.com/?search=gzip_

  보시는 것처럼 대부분의 브라우저가 gzip을 지원하고 있습니다. 하지만 웹프록시, 보안 소프트웨어 등의 문제로 요청 헤더가 깨져서 사용하지 못하는 사용자가 전체 사용자의 15%가 된다고 합니다.

- 성능 향상 측면

  Gzip은 많은 경우에서 성능 향상을 야기할 수 있지만, 통상적으로 1~2kb 이하의 파일은 압축하지 않는 것이 좋다고 합니다. 그 이유는 압축해서 얻는 효과보다 압축을 푸는 데 사용되는 리소스, 서버 혹 웹 브라우저의 CPU가 더욱 크기 때문입니다.

  또한 이미지, Binary 파일 등은 효과를 볼 수 없다고 합니다.

더욱 자세한 사항은 [스티브 사우더스 저의 초고속 웹사이트 구축 서적](http://www.yes24.com/Product/Goods/3768154)과 함께 [해당 블로그 아티클](https://vnthf.github.io/blog/Front-Gzip%EC%97%90-%EA%B4%80%ED%95%98%EC%97%AC/)에서 확인하시면 좋을 것 같습니다.

## Before and After

제 경우에는 랜딩 페이지로써 bundle analyzer를 통해 확인한 결과 사용한 라이브러리 중 Tree shaking을 필요로하진 않은 것 같다는 판단하에 gzip 압축만을 진행하였습니다.

![before](https://user-images.githubusercontent.com/26461307/155728696-956d82e4-1f15-4237-9ec1-6e55b12775b7.png)

_적용 전_

![after](https://user-images.githubusercontent.com/26461307/155728708-7d603c42-2772-4ab6-9506-f529e9d5a1c8.png)

_적용 후_

상호 작용까지의 시간을 가르키는 TTI 지표가 0.3초, 페이지의 메인 콘텐츠(가장 큰 콘텐츠)가 표시되는 시점인 LCP 지표가 0.5초 단축된 것을 확인할 수 있었습니다.

> 동일한 환경, 네트워크에서 확인하였으나 Lighthouse 지표는 절대적이지 않습니다.

## 마치며

최적화 작업은 익숙하지 않지만, 신선하고 재밌었던 경험이였습니다.

웹 서비스의 성능은 사용자 경험, 유추와 직접적으로 관계가 있다고 생각하기 때문에 항상 도전의식이 있는 영역이였는데, 부족하게나마 성능을 개선하고 lighthouse를 통해 시각적으로 확인할 수 있어 더욱 재밌게 느껴졌던 것 같습니다.

앞으로는 더욱 다양한 방법으로 성능 개선을 해보고 싶은 마음이 들었으며, 저와 같이 익숙하지 않은 분들에게 도움이 되길 바라며 글을 마치도록 하겠습니다. 감사합니다.

> 성능 개선에 관심이 있으신 분들은 [Bundle Diet라는 주제의 Toss SLASH 21 세션](https://toss.im/slash-21/sessions/3-2)을 꼭 들어보시길 추천드립니다.

## 참고

- [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [next-compose-plugins](https://www.npmjs.com/package/next-compose-plugins)
- [compressionWebpackPlugin](https://webpack.js.org/plugins/compression-webpack-plugin/)
- [caniuse - gzip](https://caniuse.com/?search=gzip)
- [gzip에 관하여](https://vnthf.github.io/blog/Front-Gzip%EC%97%90-%EA%B4%80%ED%95%98%EC%97%AC/)
- [Next 배포를 위한 준비](https://darrengwon.tistory.com/833)
- [Webpack Bundle.js 파일 성능개선](https://drhot552.github.io/web/Bundle.js%ED%8C%8C%EC%9D%BC-%EC%84%B1%EB%8A%A5%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0/#)
