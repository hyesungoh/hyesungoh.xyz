---
title: 'Toss SLASH 21 - 프론트엔드 웹 서비스에서 우아하게 비동기 처리하기 정리'
date: 2021-05-04 20:24:00
category: 'Review'
draft: false
---

![toss slash 21](https://user-images.githubusercontent.com/26461307/116906670-878c3600-ac7b-11eb-8e5a-7779faf5b884.png)

토스 SLASH 21의 `프론트엔드 웹 서비스에서 우아하게 비동기 처리하기`라는 주제로 박서진님이 발표하신 내용을 정리한 내용입니다.

[토스 SLASH 21 주소](https://toss.im/slash-21)

### 좋은 코드란 ?

```js
// 💩
function getBazFromX(x) {
  if (x === undefined) {
    return undefined;
  }

  if (x.foo === undefined) {
    return undefined;
  }

  if (x.foo.bar === undefined) {
    return undefined;
  }

  return x.foo.bar.baz;
}
```

- 하는 일은 단순하지만 코드가 너무 복잡하다

- 각 프로퍼티에 접근하는 `핵심 기능이 코드로 잘 드러나지 않는다`

```js
// 👍
function getBazFromX(x) {
  return x?.foo?.bar?.baz;
}
```

- `Optional Chaining` 문법을 활용한 동일한 함수

- 함수가 하는 일을 흐리게 만들던 if 문을 없애고, 성공 시의 모양과 큰 차이가 없다

- 같은 역할을 하는 식이 비슷하게 표현된다는 것은 코드에 있어서 좋은 징조

### 비동기 처리시에는 ?

```js
// 💩
function fetchAccounts(callback) {
  fetchUserEntity((err, user) => {
    if (err != null) {
      callback(err, null);
      return;
    }

    fetchUserAccount(user.no, (err, accounts) => {
      if (err != null) {
        callback(err, null);
        return;
      }

      callback(null, accounts);
    });
  });
}
```

- `성공하는 경우`와 `실패하는 경우`가 섞여서 처리된다

- 코드를 작성하는 입장에서 매번 에러 유무를 확인해야 한다

```js
// 👍
async function fetchAccounts() {
  const user = await fetchUserEntity();
  const accounts = await fetchUserAccounts(user.no);
  return accounts;
}
```

- 성공하는 경우만 다루고 실패하는 경우는 catch절에서 분리해 처리한다

- 실패하는 경우에 대한 처리를 외부에 위임할 수 있다.

### 좋은 코드의 특징

- 성공, 실패의 경우를 **분리**해 처리할 수 있다

- 비즈니스 로직을 한눈에 파악할 수 있다

### 어려운 코드의 특징

- 실패, 성공의 경우가 서로 섞여 처리된다

- 비즈니스 로직을 파악하기 어렵다

### 지금까지의 비동기처리

보통 API 호출 시에, SWR, react-query와 같은 라이브러리 사용

Promise를 반환하는 함수를 React Hook의 인자로 넘기고, Promist 상태에 따라 Hook이 반환하는 data, error의 값을 적절히 작성

```jsx
function Profile() {
  const foo = useAsyncValue(() => {
    return fetchFoo();
  });

  if (foo.error) return <div>로딩에 실패했습니다.</div>;
  if (!foo.data) return <div>로딩중입니다 ...</div>;
  return <div>{foo.data.name}님 안녕하세요!</div>;
}
```

- 성공하는 경우, 실패하는 경우가 섞여서 처리된다

- 실패하는 경우에 대한 처리를 외부에 위임하기 어려워졌다

### 여러 개의 비동기 작업이 동시에 실행된다면 ?

```jsx
// 💩
function Profile() {
  const foo = useAsyncValue(() => {
    return fetchFoo();
  });

  const bar = useAsyncValue(() => {
    if (foo.error || !foo.data) {
      return undefined;
    }

    return fetchBar(foo.data);
  });

  if (foo.error || bar.error) return <div>로딩에 실패했습니다.</div>;
  if (!foo.data || !bar.data) return <div>로딩중입니다 ...</div>;
  return (
    <div>
      {foo.data}, {bar.data}
    </div>
  );
}
```

- 복잡한 if문

```jsx
async function fetchFooBar() {
  const foo = await fetchFoo();
  const bar = await fetchBar(foo);
  return bar;
}
```

- 성공하는 경우에만 집중해 복잡도를 낮춘다

- 일반적으로 작성하는 동기 로직과 큰 차이가 없다

### React의 비동기 처리는 어렵다

- 성공하는 경우에만 집중해 컴포넌트를 구성하기 어렵다

- 2개 이상의 비동기 로직이 개입할 때, 비즈니스 로직을 파악하기 점점 어려워진다

---

### 우아하게 해결하는 도구, React Suspense for Data Fetching

데이터를 가져오기 위한 Suspense

React의 실험 버전에서만 사용 가능

### 목표로 하는 코드

```jsx
function FooBar() {
  const foo = useAsyncValue(() => fetchFoo());
  const bar = useAsyncValue(() => fetchBar(foo));

  return (
    <div>
      {foo}
      {bar}
    </div>
  );
}
```

- 성공한 경우에만 집중할 수 있다

- 동기와 거의 같게 사용할 수 있다

- 로딩, 에러 상태는 외부에 위임

### 에러 상태와 로딩 상태가 분리되는 방법

```jsx
<ErrorBoundary fallback={<MyErrorPage />}>
  <Suspense fallback={<Loader />}>
    <FooBar />
  </Suspense>
</ErrorBoundary>
```

- 컴포넌트를 `쓰는 쪽`에서 로딩 처리와 에러 처리를 한다

- 로딩 상태는 가장 가까운 `Suspense`의 `Fallback`으로 그려진다

- 에러 상태는 가장 가까운 `ErrorBoundary`가 `componentDidCatch()`로 처리한다

- Async Await의 Try - Catch문과 유사성

### 사용하는 방법

> Recoil : Async Selector
> SWR, React Query : {suspense: true}

### 어떻게 사용할 수 있는가 ?

`runPureTask`로 실행시키면, 비동기 함수도 동기적으로 작성할 수 있다

### 대수적 효과 (Algebraic Effects) ?

어떤 코드 조각을 감싸는 맥락으로 책임을 분리하는 방식을 대수적 효과(Algebraic Effects)라고 한다

객체지향의 의존성 주입(DI), 의존선 역전(IoC)과도 유사

### 추가적으로 사용자 경험을 향상시킬 수 있는 키워드

컴포넌트의 렌더 트리를 부분적으로로 완성함으로써 사용자 경험을 향상시킬 수 있다

`React Concurrent Mode`, `useTransition`, `useDeferredValue`

### 그래서 내가 부족한 것 ?

> useMemo, useCallback
> SWR? React-Query?

### 마치며

이해하기 어려운 부분이 많았지만 많은 부분을 알고, 깨닫게 된 느낌을 받았다.

직군이 앓고 있는 문제를 제시하고 어려운 코드, 좋은 코드를 보여줌과 동시에 해결 방안을 제시하고 회사에서는 어떻게 사용하여 해결하였는 지를 설명해주는 기승전결이 너무 좋다고 느껴졌으며, 무료로 들을 수 있는 것에 감사하다고 생각된다.

개발하는 시간 외에 공부하는 시간을 만들어야겠다.
