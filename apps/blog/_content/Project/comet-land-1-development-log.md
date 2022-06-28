---
title: '[Comet-land] 1. 왜 그리고 어떻게 만들까'
subtitle: '왜 개발하게 되었으며 어떻게 개발할지에 대한 고민과 결과를 공유합니다.'
date: 2022-04-10 00:02:00
category: 'Project'
---

![comet-land-blog](https://user-images.githubusercontent.com/26461307/159371599-95b2acd5-e5eb-482c-9ead-d8f601f034b5.png)

블로그와 이력서를 같은 스타일로 사용할 수 있는, 오픈소스 프로젝트 [Comet-land](https://github.com/hyesungoh/comet-land)를 개발하였습니다.

왜, 어떻게 개발하였는 지 공유하여 앞으로 본인만의 블로그 혹은 이력서를 만드시는 분들에게 도움이 되고자 회고를 기록합니다.

## 왜 개발하게 되었나?

물론 기존의 블로그도 잘 사용하고 있었습니다.

> 제가 필요하다 생각한 기능은 원본 프로젝트에 기여도 해보고, 적절히 커스텀해서 사용하고 있었습니다.

하지만 전체적으로 다른 스타일의 블로그가 되었으면 좋겠다는 마음과 함께, 취직을 준비함에 앞서 노션과 달리 블로그와 동일한 스타일의 이력서가 있으면 좋을 것 같다고 생각하였습니다.

두 가지 어플리케이션을 공통되는 스타일로 개발하는 문제에 사용해보고 싶었던 Monorepo 기술도 적절한 도구라고 판단되어 새로운 경험을 쌓을 수 있을 것이라 판단되어 저만의 템플릿을 개발하기로 마음 먹었습니다.

### 오픈소스화

기존에 사용했던 블로그 템플릿처럼, 제가 개발한 템플릿 또한 많은 분들께서 사용하고, 새로운 기능을 추가하고, 부족한 부분을 수정하는 등 오픈소스화되었으면 좋겠다 생각하였습니다.

> 간단하지만 오픈소스에 기여했던 경험들이 오픈소스에 대한 동경심이 되었던 것 같습니다.

그렇기 때문에 다른 분들, 즉 사용자가 운영 관리하기 편한 것을 또 하나의 목표로 삼아 개발에 임하였습니다.

## 어떤 도구를 이용할까?

개발을 시작하기전에 프로젝트의 스펙을 정하는 데 가장 고민되는 것은 아래 두 사항이였습니다.

1. `Next.js` vs `Gatsby`
2. `Turborepo` vs `Lerna`

### Next.js vs Gatsby

두 프레임워크를 선정한 이유는 SEO와 사용 간편함을 보장하기 위해 마크다운을 이용해 SSG가 되어야하는 점과 러닝커브와 제가 더욱 배우고싶은 분야인 이유로 React 기반인 것입니다.

결론부터 말씀드리자면 `Next.js`를 사용하였습니다.

Gatsby의 경우 기존 사용하던 블로그가 Gatsby를 이용해 개발되어 있어 Migrate하기 쉽다는 장점이 있었지만 기술에 대한 투자 대비 효율이 Next.js보다 낮다고 판단하였습니다. 제가 앞으로 커리어를 쌓는데에 있어서 Gatsby에 대한 경험보다 Next.js에 대한 경험이 효용성이 높다고 판단하였기 때문입니다.

추가적으로 두 도구를 비교하면서 많은 블로그 아티클들을 참고하였는데, 제가 기존에 Gatsby 블로그에 대해 불편함으로 인식하고 있었던 빌드 시간 외에 다른 단점들을 알 수 있었습니다.

물론 제가 직접 체감하진 않았지만 확인했던 단점은 다음과 같습니다.

- 정적 사이트를 만들 뿐인데 GraphQl은 너무 무겁다
- Gatsby-plugin에 의존적이다
- Gatsby 내부의 GraphQl, Webpack 등으로 인해 추상화되어 있어 디버깅이 어렵다
- 빌드 시간

<i> [yceffort님 블로그 발췌](https://yceffort.kr/2020/10/migrate-gatsby-from-nextjs) </i>

위 Gatsby의 단점들과 함께 Next.js를 선택했던 이유들을 정리해보자면 다음과 같습니다.

- 투자 대비 효율이 높다
- 사용해본 경험이 있어 러닝커브가 낮다
- Gatsby 대비 사용자가 많아 사용자가 커스터마이징하기 더욱 용이할 것이라고 판단 [^1]
- 현재 프로젝트 스펙에 통일감을 준다 (vercel)
- Nextra와 같은 도구를 사용할 수도 있었다 (결국 사용하진 않았지만)

[^1]: 22년 4월 기준 Next는 250만 다운로드, Gatsby는 42만 다운로드수를 가지고 있다. [참고 링크](https://www.npmtrends.com/gatsby-vs-next)

현재 되돌아보면 `Next.js`로 개발하기 잘했다는 생각을 하고 있습니다.

Gatsby의 좋은 plugin들 대신 scroll restoration, static file generator 등을 직접 개발해보면서 많은 것을 배웠다고 생각하기 때문입니다.

더불어 기존 블로그 1개를 빌드하는 시간보다 블로그, 이력서 두 어플리케이션을 빌드하는 시간이 빨라져 마음의 안정을 찾을 수 있었습니다.

### Turborepo vs Lerna

두 가지 어플리케이션을 같은 스타일로써 개발함에 있어 공통되는 configuration 파일들이나, 컴포넌트가 많을 것이라 판단하였습니다. 그렇기 때문에 Monorepo를 사용하는 것이 DRY하게 프로젝트를 운영, 개발하는 방법이라고 판단되어 도입하기로 하였고 후보는 보셨던 것과 같이 Truborepo와 Lerna로 추렸습니다.

> Monorepo에 대해 서칭하다 Yarn-berry의 workspace를 이용해 monorepo를 구성할 수 있는 것을 알게 되었습니다. 하지만 의존성이 많지는 않다고 판단해 yarn-berry를 도입하는 것은 오히려 러닝커브를 높힐 수 있으며 오버스펙이 될 것이라는 판단에 후보에 넣지 않았습니다. 관련 링크는 토스 기술 블로그[^2]와 kimik님의 아티클[^3] 참고하시면 좋을 것 같습니다.

[^2]: [node_modules로부터 우리를 구원해 줄 yarn berry](https://toss.tech/article/node-modules-and-yarn-berry)
[^3]: [yarn berry로 monorepo 구성하기](https://minify.tistory.com/40)

Monorepo 기술은 사용해본 적이 없지만 서칭을 통해 다음과 같은 장점들을 기록할 수 있었습니다.

![monorepo compare](https://user-images.githubusercontent.com/26461307/162615844-24d2aa74-766f-458c-a13e-0e629580d2ec.png)

_모든 기술 스택을 정함에 있어 노션에 간단히 정리하였습니다_

물론 Turborepo의 장점들이 체감되진 않았지만 Lerna 대비 빌드 시간을 줄일 수 있는 것은 알 수 있었으며, 공식 문서가 Lerna에 비해 보기 좋게 되어있었으며 깔끔한 Youtube 가이드 영상을 찾을 수 있어서 러닝커브가 더욱 낮을 것이라 판단함에 더해 Vercel 생태계를 좋아하는 개인적인 취향이 더해져 `Turborepo`를 사용하기로 판단하였습니다.

Turborepo의 장점과, Pipeline에 대한 설명은 다음 링크를 읽어보시면 좋을 것 같습니다.

- [Why turborepo](https://turborepo.org/docs#why-turborepo)
- [Pipelining package tasks](https://turborepo.org/docs/features/pipelines)

도입 후에 되돌아보자면, 상당히 만족스러운 개발자 경험이였습니다.

```bash
├── apps
│   ├── blog
│   └── resume
└── packages
    ├── config
    ├── core
    └── tsconfig
```

`blog`와 `resume` 어플리케이션에서 공용으로 사용하는 컴포넌트는 `core`에 위치하게 개발하였고 lint, jest 그리고 tsconfig와 같은 설정 파일들은 `config`, `tsconfig`에 작성하여 DRY하게 사용할 수 있었습니다.

이에 더해 이쁜 cli부터 직관적이고 어렵지 않은 구조, Vercel을 이용한 간단한 배포, 거기에 닉값하는 빠릿빠릿한 커맨드 처리 시간까지 전체적으로 만족스러운 경험이였다고 말씀드릴 수 있을 것 같습니다.

물론 다른 Monorepo 기술을 사용해보지 않아 객관적인 판단은 어렵겠지만, 다음에도 Monorepo를 사용해야 될 환경이 주어진다면 Turborepo를 강력히 추천해보고 싶을 정도의 경험이였습니다.

### Markdown compile

마크다운을 컴파일하는 것 또한 경험이 없어 Next.js의 예제와 많은 블로그들의 코드를 뜯어보며 일반적으로 `unified`, `remark` 그리고 `rehype`을 사용하는 것으로 파악하였습니다.

마크다운 컴파일 라이브러리를 선택함에 있어서 가장 우선이 되는 사항은 **code section에서 강조하는 줄 기능**입니다.

```js {2}
console.log('foo');
console.log('bar');
```

바로 위 코드의 2번째 줄에 적용된 기능입니다.

블로그를 운영하며 독자의 이해를 위해 코드를 작성해야되는 경험은 수도 없이 많은데, 이 때 효과적으로 중요한 줄을 알려줄 수 있으면 독자가 이해하기 더욱 쉬울 것이라 생각했기 때문에 **꼭 필요한 기능**으로 정의하였습니다.

> 이번 포스트는 어떻게를 다루는 글이니 만큼, 이를 적용하며 겪었던 일들은 다음 포스트에서 더욱 자세히 다뤄보겠습니다.

결론적으로는 `unified`를 사용해 텍스트의 범용 처리를, `remarkParse`를 통해 마크다운으로, `remarkRehype`를 이용해 HTML로, 마지막으로 `rehypeStringify`를 사용해 문자열로 컴파일하였습니다.

이 외에 다양한 마크다운 문법을 지원하기 위해 사용한 라이브러리들은 [다음 파일](https://github.com/hyesungoh/comet-land/blob/main/apps/blog/src/libs/markdownToHtml/markdownToHtml.ts)에서 확인하실 수 있습니다.

## 어떤 모습으로 보이면 좋을까?

가장 먼저 추구했던 가치는 깔끔함을 기반으로 한 **덜어냄의 미학**입니다.

제가 기존 블로그에 추가되었으면 했던 기능들을 구현하면서 적절히 덜어내어 깔끔하고 직관적이게 보여지길 바랬습니다.

수 많은 블로그와 이력서를 참고하면서 가장 영감이 되었던 프로젝트들은 다음과 같습니다.

- [Overreacted](https://overreacted.io/)
- [hyunseob.github.io/resume](https://hyunseob.github.io/resume/)
- [gatsby-starter-bee](https://gatsby-starter-bee.netlify.app/)
- [Yceffort](https://yceffort.kr/)
- [vallista-land](https://vallista.kr/)

이 중 기존에 사용했던 블로그 템플릿인 `gatsby-starter-bee`를 제외하고 디자인적으로 가장 많은 영감을 받은 것은 dan의 `Overreacted`와 이현섭님의 프로젝트입니다.

`Yceffort`님과 `Vallista`님의 프로젝트에서는 개발적인 관점에 많은 영감을 받았습니다.

> 콜드 메일을 보내기에는 많이 쑥스러워 블로그 포스트를 빌어 감사를 전합니다.

덜어냄의 미학을 유지하면서 다양한 기능을 사용하기 위해 사용한 도구들은 다음과 같습니다.

### [NextUI](https://nextui.org/)

블로그를 만들고 싶었던 이유가 되는 라이브러리 중 하나입니다.

Next.js 디자인 시스템을 따르고, [React Aria](https://react-spectrum.adobe.com/react-aria/index.html) 기반 [Vuesax](https://vuesax.com/)에서 영감을 얻은 UI 라이브러리로써, 제가 추구하던 **덜어냄의 미학**을 가장 이쁘게 표현할 수 있을 것 같은 UI 라이브러리였습니다.

물론 모든 스타일링을 제가 할 수도 있었겠지만, 가장 빠르고 이쁘게 할 수 있는 방법은 UI 라이브러리를 사용하는 것이라 판단되어 사용하였습니다.

### [KBar](https://kbar.vercel.app/)

위 NextUI와 더불어 블로그를 만들고 싶었던 이유가 되는 라이브러리 중 하나입니다.

`Cmd + k` 입력으로 간단히 메뉴를 토글할 수 있고, 여러 서비스에서 사용하는 모습을 통해 제가 느낀 사용자 경험이 매우 좋았어서 항상 도입해보고 싶었던 라이브러리입니다.

블로그의 카테고리 이동, 검색과 이력서의 연락처 확인을 위해 사용하였으며 이를 통해 화면을 더욱 깔끔히 유지할 수 있어서 제가 지키고자 했던 **덜어냄의 미학**을 지킬 수 있었다고 생각합니다.

### Emotion

Css-in-JS 도구로 `Emotion`을 사용하였습니다. 기존의 목표는 Emotion의 `css`만을 인라인으로 사용하는 것이였으나, NextUI가 `Stitches` 기반으로 되어있어 충돌이 일어나는 모습을 확인하였습니다.

이 때문에 `emotion/styled`를 이용해 wrapping하여 사용했는데, 사용자가 커스텀함에 있어서 더욱 많은 사용자를 가지고 있는 Emotion이 이점이 있을 것이라고 생각하였기 때문입니다.

> 하지만 지금 돌이켜 생각해보니 어차피 비슷한 css 문법을 사용하는데 이것이 사용자가 편하게 느낄 지점인가 생각이 됩니다. 번들링 사이즈를 줄이기 위해서 stitches로 migrate하는 것 또한 방법이 될 수 있을 것 같습니다.

## 이력서

블로그는 대부분의 개발자분들이 마크다운을 사용해 관리하는 것으로 알고 있어 어렵지 않게 방향을 정해 개발할 수 있었지만

이력서의 경우 노션, 워드 등 사용하시는 도구들이 따로 존재하는 경우가 있는 것으로 파악해 이와 대비해 어떻게하면 Comet-land의 이력서가 이점을 가지고 유연하게 대응할 수 있을까를 중점적으로 고민하였습니다.

마크다운을 이용해 관리하자니 구조적으로 작성하고 사용하기에 불편할 것이라고 판단하여 내린 결론은 `json`을 이용해 관리하는 방법입니다.

Comet-land의 사용자중 거의 전부는 개발자일 것이라고 판단함과 동시에 어느 분야든 익숙하게 다룰 수 있는 형식은 마크다운 그리고 json이라고 판단하였습니다. 동시에 데이터 오브젝트를 전달하기 위해 개발된 것이기 때문에 가장 적합한 방식으로 판단하였습니다.

이에 더해 각 section 별로 directory를 나눠 사용자가 파악하기 쉽도록 하였으며,

![resume interative point](https://user-images.githubusercontent.com/26461307/162624018-d3ea011a-b555-4f56-9390-504a615e2ed5.png)

Github와 일반 링크를 Tooltip으로 나눠 보여주고 Work experience section에서 요소를 Sticky하게 보여주어 읽는 사람으로 하여금 가독성을 보장하면서 과하지 않게 동적으로 보여줄 수 있도록 노력하였습니다.

## 지속적 통합

위에도 기술하였듯이 Comet-land는 오픈소스 프로젝트로써 많은 사람들이 사용하고 개선해나갔으면 하는 바램이 있었습니다.

제가 많지는 않지만 기여했던 오픈소스 라이브러리에서는 굉장히 많은 CI 도구들을 이용해 많은 것을 자동화하고 있는 것을 확인하였고 Comet-land 또한 많은 것을 자동화하면 좋겠다고 생각하였습니다.

> 이전에도 자동화에 관심이 많았기도 하였으며 PR시 많은 bot들이 댓글을 남겨주는 것이 상당히 멋있어 보였습니다.

이에 더해 Unit, E2E 테스트까지 작성하여 더욱 안정화된 프로젝트가 됨과 동시에 제가 기존 부족했던 테스트 코드에 대한 부분까지 채울 수 있을 것이라 생각해 CI에서 자동화한 것은 다음과 같습니다.

![CI in comet land](https://user-images.githubusercontent.com/26461307/162624574-7329a7f5-de9c-4f08-9916-c5e106870d68.gif)

_[해당 PR](https://github.com/hyesungoh/comet-land/pull/29)_

- Lint 확인
- Unit test 확인 (Jest)
- Codecov 실행 + 댓글
- E2E test 확인 (Cypress)
- Cypress record + 댓글
- LGTM bot (코드리뷰)
- Vercel preview

아직 테스트 케이스가 많이 부족해 효과가 있진 않지만 커버리지 99%를 목표로 작성하여 프로젝트 안정화와 동시에 개인적으로 테스트 코드에 익숙해지는 것을 바라고 있습니다.

## 마치며

제가 직접 사용할 것이기 때문에 조금 더 심혈을 기울여 개발하게 되었던 것 같습니다. 이처럼 Dog-foodin한 서비스를 개발할 때 더욱 재미를 느끼는 제 모습을 알 수 있었던 프로젝트였습니다.

거기에 더해 새로 시도했던 것이 많은만큼 배우고 겪은 것이 많았었다고 말씀드릴 수 있을 것 같습니다.

겪었던 이슈들은 다음 블로그 글에서 다룰 예정이며, Comet-land에 대해 궁금하신 분들은 아래 링크 참고해주시면 감사드릴 것 같습니다.

긴 글 읽어주셔서 감사합니다.

- [Comet-land github](https://github.com/hyesungoh/comet-land)
- [Blog demo](https://comet-land-blog.vercel.app/)
- [Resume demo](https://comet-land-resume.vercel.app/)
