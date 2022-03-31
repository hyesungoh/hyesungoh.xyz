---
title: 'TypeScript React - Prompt message location TypeError'
date: 2021-10-10 20:24:00
category: 'React'
draft: false
---

## 문제

```tsx
import { Prompt } from "react-router-dom";

function Foo = () => {
    const handleBlockedNavigation = (location: Location) => {}

    return <Prompt when={when} message={handleBlockedNavigation} />
}
```

custom prompt를 개발하는 중, 위 코드의 message에 해당하는 부분이 에러 발생

> Type 'Location<unknown>' is missing the following properties from type 'Location': ancestorOrigins, host, hostname, href, and 6 more.

`Location`은 `Location<unknown>`보다 속성 몇가지가 없다고 한다.

그래서 위 `handleBlockedNavigation`에 `Location<unknown>`으로 작성을 하면

> Type 'Location' is not generic.ts(2315)

제너릭으로 사용할 수 없다는 에러가 나를 반겨주었다.

## 해결 방법

```tsx
import * as H from "history";

...
const handleBlockedNavigation = (lastLocation: H.Location) => {}

...
<Prompt when={when} message={handleBlockedNavigation} />
```

위와 같이 `history` 패키지의 Location으로 Type을 지정해주면 된다.

해결 방법은 `react-router`의 `index.d.ts`에서 찾았으며 아래가 해당 부분이다.

```ts
// This is the type of the context object that will be passed down to all children of
// a `Router` component:
export interface RouterChildContext<
  Params extends { [K in keyof Params]?: string } = {}
> {
  router: {
    history: H.History;
    route: {
      location: H.Location;
      match: match<Params>;
    };
  };
}
export interface MemoryRouterProps {
  children?: React.ReactNode;
  initialEntries?: H.LocationDescriptor[] | undefined;
  initialIndex?: number | undefined;
  getUserConfirmation?:
    | ((message: string, callback: (ok: boolean) => void) => void)
    | undefined;
  keyLength?: number | undefined;
}

export class MemoryRouter extends React.Component<MemoryRouterProps, any> {}

export interface PromptProps {
  message:
    | string
    | ((location: H.Location, action: H.Action) => string | boolean);
  when?: boolean | undefined;
}
```
