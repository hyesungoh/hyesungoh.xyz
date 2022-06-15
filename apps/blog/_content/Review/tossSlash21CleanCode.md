---
title: 'Toss SLASH 21 - 실무에서 바로 쓰는 Frontend Clean Code 정리'
date: 2022-02-17 20:24:00
category: 'Review'
draft: false
---

![toss slash 21](https://user-images.githubusercontent.com/26461307/116906670-878c3600-ac7b-11eb-8e5a-7779faf5b884.png)

토스 SLASH 21의 `실무에서 바로 쓰는 Frontend Clean Code`라는 주제로 진유림님이 발표하신 내용을 정리한 내용입니다.

[토스 SLASH 21 주소](https://toss.im/slash-21)

## 실무에서 클린 코드의 의의

`유지보수 시간의 단축`

코드 리뷰, 디버깅 시 소모되는 시간이 적어 유지보수가 용이하다.

## 안일한 코드 추가의 함정

```jsx
function Foo() {
  async function handleQuestionSubmit() {
    const 약관동의여부 = await 약관동의_받아오기();
    if (!약관동의여부) {
      await 약관동의_팝업열기();
    }
    await 질문전송(questionValue);
    alert('질문이 등록되었어요.');
  }

  return (
    <main>
      <form>
        <textarea placeholder="어떤 내용이 궁금한가요?" />
        <Button onClick={handleQuestionSubmit}>질문하기</Button>
      </form>
    </main>
  );
}
```

만약 위 상태에서 연결 전문가에 대한 팝업을 추가하는 기능을 개발하게 될 시

```jsx
function Foo() {
  const [popupOpened, setPopupOpened] = useState(false); // 팝업 상태

  async function handleQuestionSubmit() {
    const 연결전문가 = await 연결전문가_받아오기(); // 연결 중인 전문가가 있으면 팝업 띄우기
    if (연결전문가 !== null) {
      setPopupOpened(true);
    } else {
      const 약관동의여부 = await 약관동의_받아오기();
      if (!약관동의여부) {
        await 약관동의_팝업열기();
      }
      await 질문전송(questionValue);
      alert('질문이 등록되었어요.');
    }
  }

  async function handleMyExpertQuestionSubmit() {
    await 연결전문가_질문선송(questionValue, 연결전문가.id);
    alert(`${연결전문가.name}에게 질문이 등록되었어요.`);
  }

  return (
    <main>
      <form>
        <textarea placeholder="어떤 내용이 궁금한가요?" />
        <Button onClick={handleQuestionSubmit}>질문하기</Button>
      </form>
      {popupOpened && <연결전문가팝업 onSubmit={handleMyExpertQuestionSubmit} />}
    </main>
  );
}
```

이는 타당하다고 생각되지만 나쁜 코드인데 이유는 다음과 같다.

- 하나의 목적인 코드가 흩뿌려져 있다.
- 하나의 함수가 여러 가지 일을 하고 있다.
- 함수의 세부 구현 단계가 제각각이다.

이를 리팩토링 하자면 다음과 같다.

```jsx
function Foo() {
  const 연결전문가 = useFetch(연결전문가_받아오기);

  // 새로운 전문가에게 질문하는 로직만
  async function handleNewExpertQuestionSubmit() {
    await 질문전송(questionValue);
    alert('질문이 등록되었어요.');
  }

  // 연결중인 전문가에게 질문하는 로직만
  async function handleMyExpertQuestionSubmit() {
    await 연결전문가_질문선송(questionValue, 연결전문가.id);
    alert(`${연결전문가.name}에게 질문이 등록되었어요.`);
  }

  // 함수 하나에서 하나의 일만 하도록 쪼갰다
  async function openPopupToNotAgreedUsers() {
    const 약관동의 = await 약관동의_받아오기();
    if (!약관동의) {
      await 약관동의_팝업열기();
    }
  }

  return (
    <main>
      <form>
        <textarea placeholder="어떤 내용이 궁금한가요?" />
        {연결전문가.connected ? (
          <PopupTriggerButton popup={<연결전문가팝업 onButtonSubmit={handleMyExpertQuestionSubmit} />}>
            질문하기
          </PopupTriggerButton>
        ) : (
          <Button
            onClick={async () => {
              await openPopupToNotAgreedUsers();
              await handleMyExpertQuestionSubmit();
            }}
          ></Button>
        )}
      </form>
    </main>
  );
}
```

클린한 코드는 짧은 코드가 아닌, 원하는 로직을 빠르게 찾을 수 있는 코드이다.

## 원하는 로직을 빠르게 찾으려면?

### 하나의 목적을 가진 코드가 흩뿌려져 있을 때, **응집도**를 높여야 한다.

응집도를 높힐려 Custom hook에 위임을 할 수 있지만 중요한 정보가 Custom hook에 가려져 읽기 어려워진다.

> Custom hook의 대표적인 안티패턴

그러면 무엇을 뭉쳐두어야 할까? -> 당장 몰라도 되는 디테일

**선언적 프로그래밍**을 통해 해결할 수 있다.

```jsx
<Popup onSubmit={질문전송} onSuccess={홈으로이동} />
```

선언적 프로그래밍 :

- '무엇'을 하는 함수인지 빠르게 이해가능
- 세부 구현을 안쪽에 뭉쳐두어 신경 쓸 필요가 없다.
- '무엇'만 바꿔 쉽게 재사용할 수 있다.

> 이의 반대는 명령형 프로그래밍

### 함수가 여러 가지 일을 하고 있을 때, **단일책임** 원칙에 의거하여 쪼개줘야 한다.

중요 포인트가 모두 담겨 있지 않은 함수명은 위험하다.

> 이는 코드에 대한 신뢰 하락으로 이어진다.

이를 통해 중요 포인트를 기준으로 함수를 분리하여 적재적소에 사용할 수 있다.

함수가 아닌 리액트 컴포넌트에도 적용을 할 수 있는데,

```jsx
// 💩
<button onClick={async () => {
    log("제출 버튼 클릭");
    await openConfirm();
}}>
```

```jsx
// 👍
<LogClick message="제출 버튼 클릭">
  <button onClick={openConfirm} />
</LogClick>
```

```jsx
// 👍
<IntersectionArea onImpression={() => fetchFoo(nextPage)}>
  <div>더 보기</div>
</IntersectionArea>
```

위 방법처럼 컴포넌트를 감싸는 방식으로 리팩토링 할 수 있다.

> 추가적으로 한글 변수명으로 더욱 읽기 좋은 코드를 만들 수 있다.

### 함수의 세부구현 단계가 제각각일 때. **추상화** 단계를 조정해 핵심 개념을 필요한 만큼만 노출해야 한다.

```jsx
// 💩
// 팝업 코드 제로부터 구현
<div style={팝업스타일}>
  <button
    onClick={async () => {
      const res = await 회원가입();
      if (res.success) {
        프로필로이동();
      }
    }}
  >
    전송
  </button>
</div>
```

```jsx
// 👍
// 중요 개념만 남기고 추상화
<Popup onSubmit={회원가입} onSuccess={프로필로이동}>
```

```jsx
// 💩
// 설계사 라벨을 얻는 코드 세부 구현
const planner = await fetchPlanner(plannerId);
const label = planner.new ? '새로운 상담사' : '연결중인 상담사';
```

```jsx
// 👍
// 중요 개념을 함수 이름에 담아 추상화
const label = await getPlannerLabel(plannerId);
```

얼마나 추상화시킬지에 정답은 없고, 상황에 따라 필요한 만큼 추상화하면 된다.

하지만 **추상화 수준이 섞여 있으면** 코드 파악이 어려워진다.

```jsx
// 💩
<Title>별점을 매겨주세요</Title> // 높은 추상화
<div> // 낮은 추상화
    {STARS.map(() => <STARS />)}
</div>
<Reviews /> // 높은 추상화
{rating !== 0 && ( // 중간 추상화
    <>
        <Agreement />
        <Button rating={rating}>
    </>
)}
```

```jsx
// 👍
<Title>별점을 매겨주세요</Title>
<Stars />
<Reviews />
<AgreementButton show={rating !== 0} />
```

> 전체적인 코드가 어느정도 구체적으로 작성되어 있는 지 파악이 어려워 코드를 읽는 사고가 널뛰게 되기 때문이다.

## 액션 아이템

**1. 담대하게 기존 코드 수정하기**

두려워하지 말고 기존 코드를 수정하자.

**2. 큰 그림 보는 연습하기**

기능 추가 자체는 클린해도, 전체적으로는 어지러울 수 있다.

**3. 팀과 함께 공감대 형성하기**

코드에 정답은 없으므로 명시적으로 이야기를 하는 시간이 필요하다.

**4. 문서로 적어보기**

향후 어떤 점에서 위험할 수 있는지, 어떻게 개선할 수 있는 지 글로 적어보자.

## 마치며

저번에 정리한 `우아하게 비동기 처리하기` 세션보다 더욱 이해와 공감이 되었습니다.

> 약 8개월이란 시간동안 시야가 넓어졌다고 믿고 싶습니다.

그 중에서 Custom hooks를 통해 응집도를 높혔지만, 중요 정보들을 숨겨두었던 안티패턴이 내가 많이 져질렀던 일이라고 생각되어 더욱 선언적 프로그래밍을 통해 해결해 나가보아야겠다고 생각하였습니다.
