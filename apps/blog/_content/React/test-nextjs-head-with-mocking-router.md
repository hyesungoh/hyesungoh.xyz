---
title: 'Next.js Head 테스트 작성하기 w/ Next.js router mock'
subtitle: 'Next.js Head안의 meta 태그들을 테스트했던 경험을 공유합니다.'
date: 2022-06-30 00:02:00
category: 'React'
---

![Next.js Head 테스트 작성하기](https://user-images.githubusercontent.com/26461307/182628713-5064455b-2acf-4062-b4ce-864a0079344b.png)

`jest`, `react-testing-library`를 이용해 Next.js Head안의 meta 태그들을 테스트했던 방법을 공유합니다.

## 문제

```tsx
function SEO({ title, description, ogImage }: Props) {
  const router = useRouter();

  const TITLE = title ? `${title} - ${authorName}` : `${blogName} - ${authorName}`;
  const DESCRIPTION = description ? description : blogDescription;
  const URL = blogUrl + router.asPath;
  const IMAGE = ogImage ? ogImage : defaultMetaBackground.default.src;

  return (
    <Head>
      <title>{TITLE}</title>
      <link rel="canonical" href={URL} />
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:image" content={IMAGE} />
      <meta property="og:url" content={URL} />

      {/* for twitter */}
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={IMAGE} />
    </Head>
  );
}
```

운영중인 [`comet-land`](https://github.com/hyesungoh/comet-land) 프로젝트에서는 위와 같이 매 페이지마다 달라야하는 meta 태그들을 `SEO`라는 이름의 컴포넌트로 관리하고 있는데요.

이 컴포넌트를 일반적인 컴포넌트를 테스트하듯 `render`하고 확인해보면 결과는 아래와 같습니다.

```tsx
it('test', () => {
  render(<SEO />);
  console.log(document.head.children.length);
  // 0

  console.log(screen.debug());
  // <body>
  //   <div />
  // </body>
});
```

이와 같은 상황에서는 개발자의 의도대로 title, meta 등의 태그가 올바르게 작성되었는지 확인하기 어렵습니다.

## Mocking 'next/head'

이를 확인하기 위해서 우선 `next/head`, 즉 `Head` 컴포넌트를 mocking 할 수 있습니다.

> mock이란 사전적으로 '거짓된', '가짜의'의 뜻을 갖으며, 테스트 코드를 작성할 때 허위의 구문이나 값으로 대체하는 기법을 뜻합니다.

```tsx
import { ReactElement } from 'react';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: ReactElement[] }) => {
      return <>{children}</>;
    },
  };
});
```

이렇게 children을 반환하도록 mocking 후 screen의 값을 확인해보면 다음과 같은 결과를 확인할 수 있습니다.

```tsx
it('test', () => {
  render(<SEO />);
  console.log(document.head.children.length);
  // 0

  console.log(screen.debug());
  // <body>
  //     <div>
  //       <title>
  //         Cometin' - hyesungoh
  //       </title>
  //       <link
  //         href="https://comet-land-blog.vercel.app"
  //         rel="canonical"
  //       />
  //       <meta
  //         content="I like to share my knowledge."
  //         name="description"
  //       />
  //       ...
  //     </div>
  //   </body>
});
```

실제 사용될 때처럼 document.head에 렌더링되진 않았지만, body에는 정상적으로 태그들이 렌더링된 모습을 확인할 수 있습니다.

이 상황에서도 테스트 코드를 작성할 수도 있지만 보다 실제 사용할 때처럼 테스트를 하기 위해서는 간단히 render되는 container를 바꿔줄 수 있습니다.

## render container 설정

[react-testing-library의 공식 문서](https://testing-library.com/docs/react-testing-library/api/#render-options)에서 확인할 수 있듯이, render 메소드는 container 옵션을 설정할 수 있습니다.

```tsx {2}
it('test', () => {
  render(<SEO />, { container: document.head });
  console.log(document.head.children.length);
  // 10 (SEO 컴포넌트의 태그 수)

  console.log(screen.debug());
  // <body />
});
```

이처럼 body가 아닌 head에 렌더링하여 실제 사용할 때와 같은 모습으로 렌더링되는 모습을 확인할 수 있습니다.

```tsx {1-3}
function renderAtHead(element: ReactElement) {
  render(element, { container: document.head });
}

it('test 1', () => {
  renderAtHead(<SEO />);
  // ...
});

it('test 2', () => {
  renderAtHead(<SEO foo={foo} />);
  // ...
});
```

여기에 더해, 간단한 함수를 만들어 각 테스트 케이스마다 container를 설정하지 않도록 할 수 있습니다.

## 테스트 방법

```tsx
expect(document.title).toBe('올바른 타이틀');
```

title 태그의 값은 위처럼 document에서 직접적으로 접근하여 테스트할 수 있지만,

다른 태그들의 경우 container 값을 수정하여 `screen`은 `body` 태그만을 렌더링하고 있기 때문에 `getBy*`, `queryBy*`와 같은 screen api를 사용하지 않으면서 각 태그들의 값들을 확인해야하는데요.

Vanilla에 익숙하신 분들은 친숙하실 `querySelector`를 이용해 테스트할 수 있습니다.

```tsx
<meta property="og:title" content="foo" />
```

예를 들어 위와 같은 오픈 그래프 meta 태그의 content 값을 확인하기 위해서는

```tsx {5}
it('should be foo', () => {
  renderAtHead(<SEO />);

  // og:title
  expect(document.querySelector("meta[property='og:title']")?.getAttribute('content')).toBe('foo');
});
```

이렇게 meta 태그이면서 property가 'og:title'인 것의 attribute를 확인하는 방법으로 테스트할 수 있습니다.

> lint 설정으로 인해, 테스트 코드 내에서는 querySelector가 에러를 일으킬 수 있습니다. 저는 다른 테스트 코드에서는 querySelector를 사용하지 않으면서 Head를 확인해야하는 상황에서만 `testing-library/no-node-access` rule을 disable[^1]하여 테스트하였습니다.

[^1]: [testing-library/no-node-access rule disable하는 법](https://github.com/hyesungoh/comet-land/blob/24aedf3ebd9ff26700e487493e61906a3f7b5052/apps/blog/src/components/SEO/SEO.test.tsx#L1)

## route에 따른 태그 확인하기

```tsx
<meta property="og:url" content={'https://some.url'} />
```

`og:url`과 같은 각 route path에 따라 달라져야하는 메타 태그들이 존재하는데요.

props로 주입하는 형태가 된다면 테스트하기 용이하겠지만, 저는 컴포넌트 내에서 `next/router`의 `useRouter`를 사용하고 있습니다.

```tsx
import { useRouter } from 'next/router';

const router = useRouter();
const URL = ROOT_URL + router.asPath;

<meta property="og:url" content={URL} />;
```

이런 상황에서는 useRouter를 mocking하는 방향으로 테스트를 진행할 수 있습니다.

## mocking useRouter

```tsx
const mockPath = '/foo';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');

useRouter.mockImplementation(() => ({
  asPath: mockPath,
}));
```

위와 같이 jest의 `spyOn`, `mockImplementation`를 이용해 useRouter asPath의 반환값을 mocking 할 수 있습니다.

전역으로 선언하여 모든 테스트 케이스에서 mocking한 값을 기준으로 테스트할 수도 있지만, 저는 각 경우들을 테스트하기 위해 아래와 같이 각 테스트 케이스에서 mocking하는 방법으로 작성하였습니다.

```tsx
afterEach(() => {
  jest.restoreAllMocks();
});

it('should URL to be ROOT URL', () => {
  renderAtHead(<SEO />);

  // og:url
  expect(document.querySelector("meta[property='og:url']")?.getAttribute('content')).toBe(ROOT_URL);
});

it('should URL contain router path', () => {
  const mockPath = '/foo';
  const useRouter = jest.spyOn(require('next/router'), 'useRouter');
  useRouter.mockImplementation(() => ({
    asPath: mockPath,
  }));

  renderAtHead(<SEO title={mockTitle} />);

  // og:url
  expect(document.querySelector("meta[property='og:url']")?.getAttribute('content')).toBe(ROOT_URL + mockPath);
});
```

언급하지 않았던 아래의 코드를 확인하실 수 있으실텐데요.

```tsx
afterEach(() => {
  jest.restoreAllMocks();
});
```

이는 모든 테스트 케이스 이후에 (`afterEach`), mocking한 값을 원래의 값으로 복원하는 (`restoreAllMocks`) 구문입니다.

## 마치며

이와 같이 `next/head`, `next/router의 useRouter`를 mocking하여 head 내부의 태그들의 단위 테스트를 작성해보았는데요.

mocking하며 사용한 메소드들인 `jest.mock`, `jest.spyOn`, `jest.mockImplementation`의 경우 [jest 공식 문서](https://jestjs.io/)에 자세히 설명되어 있으니 참고하시면 좋을 것 같습니다.

제가 작성한 전체적인 코드는 [다음 링크](https://github.com/hyesungoh/comet-land/blob/24aedf3ebd9ff26700e487493e61906a3f7b5052/apps/blog/src/components/SEO/SEO.test.tsx#L1)에서 확인하실 수 있으며 긴 글 읽어주셔서 감사드리고 피드백 부탁드리겠습니다. 감사합니다.

## 참고

- [Next.js issue - how to test metadata](https://github.com/vercel/next.js/discussions/11060)
