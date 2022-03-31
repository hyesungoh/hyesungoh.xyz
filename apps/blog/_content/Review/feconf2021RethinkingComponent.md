---
title: "'FECONF 2021 컴포넌트, 다시 생각하기' 정리"
date: 2022-02-15 17:50:00
category: 'Review'
draft: false
---

_본 게시물은 원지혁 님이 발표하신 [FE CONF 2021의 '컴포넌트, 다시 생각하기'](https://www.youtube.com/watch?v=HYgKBvLr49c)를 듣고 정리한 내용입니다._

![feconf 2021](https://user-images.githubusercontent.com/26461307/154068327-be828984-6634-4bca-919d-029e3f254eb8.jpg)

_이미지 출처 : [FEConf 페이스북](https://www.facebook.com/feconf.kr/)_

## 의존성

`케이크`를 만드려면 `밀가루, 설탕, 계란`이 필요하다

-> `케이크`의 의존성 : `밀가루, 설탕, 계란`

---

`React Component`의 의존성: 스타일, 로직, 전역 상태, 리모트 데이터 스키마

> 리모트 데이터 스키마 : API 서버에서 내려주는 데이터의 모양

## 숨은 의존성

케이크에 딸기를 얹으려면 딸기뿐 아니라 `생크림`이 필요하다

-> 딸기 케이크의 숨은 의존성 : `생크림`

---

React Component에 정보를 추가하려면 정보뿐 아니라 `루트 컴포넌트와 현재 컴포넌트 사이의 수 많은 컴포넌트들`이 변경되어야 한다.

## 비슷한 관심사라면 가까운 곳에, Keep Locality

비슷한 관심사라면 같은 파일 안에 두거나 바로 옆에 두는 것이 좋다.

```jsx
function Foo() {
  useFoo();
  return <StyledDiv> </StyledDiv>;
}

function useFoo() {} // 로직

const StyledDiv = styled.div``; // 스타일
```

---

Props를 통해 ID만 받고, 스키마는 전역 상태에서 받아 의존성을 느슨하게 할 수 있다.

```tsx
interface Props {
  id: string;
}

function Foo({ id }: Props) {
  const article = useArticle(id);

  return <div>{article.title}</div>;
}
```

## 데이터를 ID 기반으로 정리하기, Abstraction by Normalization

```json
{
    id: '123'
    user: {
        name: 'foo'
    }
}
```

위 데이터를 id로 쉽게 접근할 수 있도록 아래처럼 바꾸는 작업을 정규화 (Normalization)이라 함

```json
{
    '123': {
        id: '123'
        user: {
            name: 'foo'
        }
    }
}
```

> 추천 라이브러리 : normalizr

#### Global ID

보통 모델명과 ID를 string concat해서 사용

```tsx
function Foo({ id }: Props) {
  const article = useArticle(id);

  return <div>{article.title}</div>;
}
```

`article`을 사용한다는 것도 컴포넌트 밖에서 주입받고 있는 모습

```tsx
function Foo({ id }: Props) {
  const article = useNode({on: 'Article'}, props: {id});

  return <div>{article.title}</div>;
}
```

사용할 모델을 컴포넌트 내부에 함께두는 모습

#### GOI

Global ID를 이용해 데이터를 가져올 수 있는 API 서버

이를 이용하면 refetch 로직을 쉽게 구현할 수 있게됨

## 의존한다면 그대로 드러내기, Make Explicit

```ts
interface Props {
    userName: string;
    userNickname: string:
    userImageUrl: string;
}
```

위는 의존성을 들어낸 것 같지만 아래와 같이 User와 Image 모델 사이의 관계 정보를 나타낼 수 있다.

```ts
interface Props {
  user: {
    name: string;
    nickname: string;
    image: {
      url: string;
    };
  };
}
```

훨씬 직관적인 모습이지만 한 컴포넌트에서 여러 모델의 정보를 표현하는 것은

**관심사의 분리가 제대로 안되어있다는 신호**이기도 하다.

## 재사용

재사용은 개발할때 편리하기 위한 것이 아닌, 변경할 때 편리하기 위한

즉, 유지보수가 쉬운 방법으로 재사용할 수 있다.

> 컴포넌트의 변화는 리모트 데이터 스키마 변화 방향에 따라 바뀐다.

## 모델 기준으로 컴포넌트 분리하기, Separating Components by Model

우리의 제품은 끊임없이 변화하면서 일관적인 경험을 주어야한다.

변화는 대부분 모델을 기준으로 일어나기 때문이 이를 인식하고 변화 방향성을 고려할 수 있다.

`같은 모델을 의존하는 컴포넌트 : 재사용`

`다른 모델을 의존하는 컴포넌트 : 분리`

## 정리

- 비슷한 관심사라면 가까운 곳에
- 데이터를 ID 기반으로 정리하기
- 의존한다면 그대로 드러내기
- 모델 기준으로 컴포넌트 분리하기

> 관점이 기술보다 중요하다.

스스로의 코드 설계를 더 깊게, 다르게 바라보기

기술 도입이 성공하기 위해선 유저 경험에 이르기까지 영향을 미칠 수 있어야 한다.

## 내 정리

기존 컴포넌트를 바라보는 시각을 많이 넓혀줄 수 있었던 발표였다.

그 중 모델을 기준으로 컴포넌트의 재사용과 분리를 판단하는 것은 상당히 정답에 가까운 것처럼 들렸으며 앞으로 도입해볼 방향으로 생각되었다.
