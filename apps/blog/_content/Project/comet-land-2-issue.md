---
title: '[Comet-land] 2. 겪었던 이슈들과 앞으로'
subtitle: '프로젝트를 개발하며 겪었던 이슈와 앞으로의 방향 공유하고 회고를 마칩니다.'
date: 2022-04-11 00:02:00
category: 'Project'
---

![comet-land-resume](https://user-images.githubusercontent.com/26461307/160653172-c56a3b64-dfa9-4708-bf95-fca2fff47964.png)

블로그와 이력서를 같은 스타일로 사용할 수 있는, 오픈소스 프로젝트 [Comet-land](https://github.com/hyesungoh/comet-land)를 개발하면서 겪은 이슈들을 공유합니다.

## 코드 하이라이트 w/ line highlight

[이전 포스트](https://www.hyesungoh.xyz/comet-land-1-development-log)에서 해당 기능에 대한 필요성을 기술하였습니다.

> 축약하자면 아래의 code section의 강조하는 줄 표시 기능 (line highlight)를 꼭 구현하고자 했습니다.

```js {1}
console.log('comet-land');
console.log('awesome');
```

개발에 앞서 [prismjs](https://prismjs.com/)라는 코드 하이라이터의 `line-highlight` 기능을 사용할 수 있는 것으로 파악을 하였습니다.

이를 기반으로한 [remark-prism](https://github.com/sergioramos/remark-prism)를 이용해 서버 사이드에서 마크다운을 파싱할 계획이였으나, 해당 라이브러리는 line-highlight 기능을 지원하지 않았습니다.

그렇기에 해당 remark-prism 라이브러리에 line-highlight 기능을 추가하여 커스텀[^1]하였으나 **서버 사이드에서 마크다운을 파싱하는 과정에서 prismjs는 동적으로 pre 태그 값을 계산하여 인라인 스타일로 부여하기 때문에 특정 줄을 찾지 못한다**는 이슈를 확인하였습니다.

[^1]: remark-prism을 [커스텀한 Github repo](https://github.com/hyesungoh/remark-prism)

> 이를 확인하기 위해 `prismjs`의 코드를 뜯어보고, 의존성으로써 깃헙의 repo를 사용할 수 있다는 것을 알게 되었습니다.

이를 해결하기 위해 원본이 되는 라이브러리 `prismjs`를 직접 사용하여 클라이언트 사이드에서 마운트 시, 하이라이트하여 해결할 수 있었지만, `remark-prism`의 엄청난 bundle size[^2]에 더해 동일한 일을 두 번하기 때문에 부적합한 방법이라고 판단하였습니다.

[^2]: [remark-prism의 bundle 사이즈](https://bundlephobia.com/package/remark-prism@1.3.6)는 3.9mb이며, gzip 압축 후에도 1mb에 가깝습니다.

이를 해결하기 위해 많은 서칭을 하였고 [rehype-prism-plus](https://github.com/timlrx/rehype-prism-plus)라는 라이브러리를 찾을 수 있었습니다.

제가 꼭 구현하고자 했던 기능인 line-highlight를 지원하며 bundle size 또한 `remark-prism`에 비해 6배 가량 적었습니다.

이에 더해 텍스트 범용 처리와 markdown화에 `remark`를 사용하는 것이 아닌, `unified`와 `remark-parse`를 사용하고 `remark-html` 대신 `remark-rehype`와 `rehype-stringify`를 사용해 gzip 압축 전 기준으로 bundle size를 아래와 같이 줄일 수 있었습니다.

```diff
변경 전
remark: 82kb
remark-html: 48.6kb
remark-prism: 3.9mb
prismjs: 18.4kb
-총: 4049kb

변경 후
unified: 11.6kb
remark-parse: 53.1kb
remark-rehype: 14.6kb
rehype-prism-plus : 629.7kb
rehype-stringify : 30.6kb
+총: 739.6kb
```

확인하신 것처럼 bundle size를 약 **5.5배 감소**함과 동시에 목표로 했던 기능을 중복되는 로직없이 구현할 수 있었습니다.

## 정적 파일 생성

총 3 종류의 정적 파일을 사용자가 관리했어야 했습니다.

> `KBar 검색을 위한 파일`, 각 어플리케이션의 `robots.txt`와 `sitemap.xml`

robots.txt의 경우 간단하여 사용자가 직접 작성하기에 무리가 없지만, 검색을 위한 파일과 sitemap의 경우 블로그의 글이 늘어날 수록 추가해줘야하는 번거로움이 있었습니다.

robots.txt 또한 알지 못하는 사용자에게는 번거로울 수 있을 것이라 판단해 위 3 종류의 정적 파일 생성을 자동화하였습니다.

![static file generator](https://user-images.githubusercontent.com/26461307/162629703-7da872f3-1d7f-439d-9850-fc6eebe00b60.png)

적용 방식으로는 자동화 스크립트를 작성 후 package.json의 `predev`, `prebuild`에 실행 명렁어를 적용해 개발 혹은 빌드 전에 자동으로 실행될 수 있도록 하였습니다.

- 해당 코드는 [다음 링크](https://github.com/hyesungoh/comet-land/blob/main/apps/blog/scripts/generate-static-files.mjs)에서 확인할 수 있습니다.

### 검색을 위한 파일

사실 검색을 위한 파일의 경우 정적 파일을 생성이 꼭 필요하진 않습니다.

KBar의 경우 `KBarProvider`에 `action`을 주입하고 주입된 요소가 KBar에 표시되는 방법으로 작동하는데 `_app`에서는 `getStaticProps`를 사용하여 파일을 읽고 주입할 수 없기 때문에

모든 하위 page 컴포넌트에서 모든 블로그 글들을 읽어 KBar의 `useRegisterActions` hook을 이용해서 클라이언트 사이드에서 동적으로 추가할 수도 있었습니다.

당연히 모든 page 컴포넌트에서 불필요하게 모든 블로그 글들을 읽는 것은 빌드 시간을 대폭 저해시키며, DRY하지 않다고 판단하였습니다.

그렇기 때문에 KBar 요소에 필요한 데이터만 포함된 json 형식의 정적 파일을 생성하고, `_app`의 `KBarProvider`에 주입하는 방식으로 개발하였습니다.

이에 더해 `generateKbarAction` 유틸에서 모든 초기 KBar Action에 대한 로직을 처리하는 것이 높은 응집도를 이유로 가독성이 높을 것이라고 판단하여 모듈화 하였습니다.

## Post Progressbar

![Post Progressbar](https://user-images.githubusercontent.com/26461307/162628632-83307217-1095-4fad-b779-c836043f344e.gif)

위 이미지처럼 전체 글을 얼마나 읽었는 지 표시하는 Progressbar를 개발하며 겪은 이슈입니다.

첫번째로 간단히 화면의 전체 크기와, 현재 스크롤을 간단히 비율로 계산하여 Styled의 `Props`로 넘겨주어 transform하는 방법으로 개발하였습니다.

하지만 위처럼 적용하게 될 시 해당 요소의 Css 클래스를 스크롤 이벤트마다 생성하는 것으로 파악하였습니다. Css 클래스가 계속해서 생성될 시 성능 저하를 일으킬 수 있다 판단하며 Inline style을 적용하는 방법으로 우회하였습니다.

이 때 이슈가 발생하였는데, iOS safari 환경에서 `-webkit-transform`을 추가적으로 선언하지 않아 동작하지 않는 것을 파악하였지만 어떤 이유에선지 -webkit-transform을 작성하여도 동작하지 않았습니다.

이를 해결하기 위해 position 값이 fixed이기 때문에 reflow 리소스가 크지 않다는 판단하에 직접적으로 width 값을 수정하는 방식으로 수정하였습니다.

- 해당 PR은 [다음 링크](https://github.com/hyesungoh/comet-land/pull/7)에서 확인하실 수 있습니다.

## replaceAll

겪었던 이슈중에 가장 간단하면서 많은 분들이 모르실 수도 있겠다 생각한 이슈입니다.

Date format을 파싱하는데 있어서 `따옴표`를 없앴어야 했는데, 이를 단순히 `replaceAll` 메소드를 사용하여 발생한 이슈였습니다.

![replace All error log](https://user-images.githubusercontent.com/26461307/162631694-f1e8898b-fd51-4250-bbcf-660f2411b945.png)

에러는 vercel 빌드 타임에서 발생하였었는데, 로컬에서 빌드할 때는 에러가 없이 원활하여 갈피를 잡기 힘들었습니다.

찾아보니 `replcaeAll`의 경우 기본적인 자바스크립트에서 제공되고 있지 않아서 발생한 이슈였습니다.

기존에 사용하던 replaceAll의 경우 브라우저 혹은 Node.js 버전에 따라 지원해주었기 때문에 사용 가능한 것이였습니다.

![replaceAll compatibility](https://user-images.githubusercontent.com/26461307/162631949-71d5d7f6-a633-49a8-b815-304ae3205d60.png)

> 15.0 이상의 Node.js 환경에서는 사용할 수 있으나, vercel의 경우 가장 최신의 환경이 14.x 환경이라 발생한 것이였습니다.

해결 방법으로는 서버 사이드에서 실행되는 replaceAll의 경우 `replace`와 `regex`를 이용해 동일한 처리를 해주어 해결할 수 있었습니다.

## Scroll restoration

직접 블로그를 사용하는 단계에서 발생한 이슈입니다.

블로그 메인에서 스크롤을 내려 어떤 아티클을 본 후, 뒤로가기 하였을 때 스크롤 복구(Scroll restoration)이 되지 않는 이슈였는데요,

이는 사용성에 있어 굉장한 불편함을 주었으며, [Baymard의 통계](https://baymard.com/blog/return-same-place)에 따르면 87%의 사용자가 뒤로가기 시에 스크롤이 유지되는 것을 기대한다고 하니 꼭 해결해야 되는 문제라고 판단하였습니다.

### next.config.js + history

첫 접근은 Next.js의 실험적인 기능을 사용하는 것이였습니다.

```js
// next.config.js
module.exports = {
  experimental: {
    scrollRestoration: true,
  },
};
```

하지만 이는 실험적인 기능인만큼 동작하지 않았으며, [해당 Next.js의 이슈](https://github.com/vercel/next.js/issues/20951)에서도 아직 버그로써 다뤄지고 있는 내용입니다.

이에 더해 [history의 scrollRestoration](https://developer.mozilla.org/ko/docs/Web/API/History/scrollRestoration) 스펙을 직접 사용도 해보았지만 동작하지 않았습니다.

### Route as Modal

많은 방법을 찾아보던 중 해당 [원티드 제품 팀블로그의 아티클](https://medium.com/wantedjobs/next-js-%EB%AC%B4%ED%95%9C-%EC%8A%A4%ED%81%AC%EB%A1%A4-%EC%9D%B4%EC%8A%88%EC%97%90-route-as-modal-%EC%A0%91%EB%AA%A9%EC%8B%9C%ED%82%A4%EA%B8%B0-bf2951550a73)을 참고하여 `Route as Modal` 방법을 알 수 있었습니다.

간단히 설명드리자면 `next/link`의 `as`를 이용하여 Url은 페이지의 url을 보여주지만, 내부적으로는 Modal로써 띄워주어 뒤로가기를 하여도 Modal만 내려가는 것이기 때문에 스크롤을 복구하지 않아도 되는 로직입니다.

적용 후 문제는 해결하였지만, 다음 부분에서 제 상황에는 적합한 해결 방법은 아니라고 판단하였습니다.

- 프로젝트 구조에 대한 가독성이 떨어지는 것
- SSG 환경이기 때문에 `pages/index`에서 모든 포스트의 본문까지 `getStaticProps`로 가져오기 때문에 `data can reduce performance alert` 발생
- window와 Modal 두 스크롤 환경에 `Page Progressbar` 컴포넌트가 대응해야되는 점입니다.

원티드 팀의 환경은 어쨌든 서버에 데이터를 요청해야하는 점과 Route as Modal의 생김새와 직접 방문한 as Url의 모습이 다른 점 등에서 적합한 방법이라고 생각되었지만 제가 놓인 상황에서는 프로젝트 구조에 대한 가독성을 떨어트리는 오버스펙이라고 판단되어 다른 방법을 고민해보았습니다.

### scrollTo

많이 돌아온 것같지만, 프로젝트 구조를 동일하게 가져가면서 직접적으로 문제를 해결할 수 있는 방법으로 **스크롤된 위치를 기억하고 돌아왔을 때 내리는 방법**을 적용하였습니다.

블로그 메인과 함께 각 카테고리 페이지들도 스크롤 복구가 되어야하기 때문에, `next/router`의 `routeChangeStart` 이벤트[^3]시에 **url path를 key 값으로 스크롤 값을 session storage에 저장**하여 관리하였습니다.

[^3]: [next/router event](https://nextjs.org/docs/api-reference/next/router#routerevents)

그리고 `routeChangeComplte` 이벤트시에 session storage에 저장된 값만큼 `scrollTo` 메소드를 사용하여 스크롤하였습니다.

> 이 때 setTimeout을 사용하여 비동기적으로 scrollTo를 사용해야되는데, Race condition[^4]에 따라 DOM 조작이 block 될 수도 있기 때문입니다.

- 해당 코드는 [다음 링크](https://github.com/hyesungoh/comet-land/blob/main/apps/blog/src/hooks/useScrollRestoration.ts)에서 확인할 수 있습니다.

[^4]: [Race condition 위키](https://ko.wikipedia.org/wiki/%EA%B2%BD%EC%9F%81_%EC%83%81%ED%83%9C)

### scrollTo with Infinite scroll

위 scrollTo 방법은 Infinite scroll이 갱신되기 전까지 원활히 동작하였습니다. 하지만 추가적인 갱신을 요구하는 영역에 도달하였을 때는 원하는 곳까지 내려가지 못하는 모습을 보였습니다.

이 이슈도 위 스크롤 위치를 기억하는 것과 동일하게 `next/router` 이벤트시에 얼마나 Infinite scroll이 갱신되었는지 저장하고, 돌아왔을 때 스크롤에 필요한 갱신 값만큼 초기 크기를 지정하여 원활히 스크롤될 수 있도록 수정하여 해결하였습니다.

- 해당 코드는 [다음 링크](https://github.com/hyesungoh/comet-land/blob/main/apps/blog/src/hooks/useInfiniteScroll.ts)에서 확인할 수 있습니다.

## 앞으로

기본적으로 생각했었던 기능들은 전부 개발하여, 자잘한 버그 혹은 기능들을 수정하고 테스트 커버리지를 높혀가는 식으로 운영할 계획입니다.

테스트 커버리지가 어느정도 올라간다면 메이저 기능이라고 할 수 있는 것들도 과하지 않는 선에서 추가하여 더욱 많은 환경에 대처할 수 있는 블로그 템플릿이 되길 바라고 있습니다.

생각하고 있는 기능으론 '시리즈', '이전, 다음 포스트', '태그' 정도가 있는데 이를 어떻게 과하지 않고 깔끔하게 적용할 수 있을지 고민을 더욱 해봐야될 것 같습니다.

## 마치며

이슈들을 단순히 나열하는 형태로 작성하여 읽으시는데 불편함이 있진 않으셨을까 걱정됩니다.

앞으로 기능과 테스트 코드등을 추가하며 발생할 이슈들도 있겠지만, 해당 이슈들은 Github wiki를 통해 관리할 생각입니다. 아직 많이 부족한 프로젝트이지만, 생각보다 많은 분들이 그것도 해외에서도 관심을 주시고 있어 같이 공유함에 있어서 Github wiki가 접근하기 쉬울 것이라 생각되기 때문입니다.

여기까지 긴 글 읽어주셔서 감사드리고 블로그 혹은 이력서 템플릿에 관심이 가셨다면 아래 링크 방문을 부탁드리겠습니다.

감사합니다.

- [Comet-land github](https://github.com/hyesungoh/comet-land)
- [Blog demo](https://comet-land-blog.vercel.app/)
- [Resume demo](https://comet-land-resume.vercel.app/)
