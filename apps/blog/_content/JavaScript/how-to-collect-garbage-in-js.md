---
title: '그래서 자바스크립트는 어떻게 쓰레기를 수거하나요?'
subtitle: '자바스크립트(V8)는 어떻게 메모리를 관리하고 있는지 공유합니다.'
date: 2022-08-26 20:24:00
category: 'JavaScript'
---

![그래서 자바스크립트는 어떻게 쓰레기를 수거하나요](https://user-images.githubusercontent.com/26461307/186742188-520a8f7b-15a8-4805-85a9-95444049fcc9.png)

[MDN의 '자바스크립트의 메모리 관리'](https://developer.mozilla.org/ko/docs/Web/JavaScript/Memory_Management)를 읽어보면 자바스크립트가 어떤 알고리즘으로 메모리를 관리하고 있는지에 대해 알 수 있습니다.

이를 조금 더 자세히 알고 싶다는 궁금증에 시작해, 구글의 자바스크립트 엔진 `V8`은 어떻게 메모리를 관리하고 있는지 알아본 내용을 공유합니다.

## 자바스크립트의 가비지 콜렉션

> 위 MDN 문서를 읽어보신 분은 skip하셔도 좋은 내용이에요.

C 언어와 같은 저수준 언어는 개발자가 의도적으로 메모리 해제를 할 수 있어요.
하지만, 자바스크립트의 경우 메모리 할당부터 해제(가비지 콜렉션)까지 자동으로 관리를 하고 있는데요.

간단한 메모리의 Life cycle은 다음과 같아요.

1. 메모리가 필요할 때 할당
2. 할당된 메모리를 사용
3. **더 이상 필요하지 않으면 해제**

여기서 중요한 부분이 **더 이상 필요하지 않을 때를 판별하는 방법**입니다.

위에서 언급했던 것처럼 저수준 언어는 메모리의 필요성을 개발자가 직접 결정하지만, 자바스크립트와 같은 고수준의 언어들은 <strong>가비지 콜렉션(GC)</strong>라는 자동 메모리 관리 방법을 사용해요.

> 그렇다고 가비지 콜렉션이 무조건적으로 좋은 방법은 아니에요. 왜냐하면 어떤 메모리의 필요성에 대해 판단하는 것은 [비결정적](https://en.wikipedia.org/wiki/Decidability_%28logic%29)인 문제이기 때문이에요.

### Reference counting 가비지 콜렉션

Reference counting(참조 세기) 알고리즘은 **더 이상 필요 없는 오브젝트**를 **어떤 다른 오브젝트도 참조하지 않는 오브젝트**라고 정의하는 알고리즘이에요.

즉, A라는 오브젝트를 참조하는 다른 오브젝트가 하나도 없을 경우 **가비지**로 판단해 수집(메모리 해제)해요.

#### Reference counting의 한계

Reference counting 알고리즘은 적절한 해결 방법이라고 생각되지만, 사실 한계가 존재해요.

```js
function foo() {
  var a = {};
  var b = {};

  a.bar = b;
  b.baz = a;

  return 'clear';
}
```

위 경우에서 함수 호출이 완료되면 `a`와 `b` 객체는 스코프를 벗어나기 때문에 불필요한, 그러니까 회수되어야 하는 메모리가 됩니다.

하지만 두 객체가 서로를 참조하고 있기 때문에, Reference counting 알고리즘은 둘 다 가비지 컬렉션의 대상으로 판단하지 못해 메모리 누수의 원인이 됩니다.

> 실제로 IE 6과 7의 경우 DOM 오브젝트에 대해 Reference counting 알고리즘으로 가비지 콜렉션을 수행했었어요. 자세한 예제는 [MDN 게시물](https://developer.mozilla.org/ko/docs/Web/JavaScript/Memory_Management#%EC%B0%B8%EC%A1%B0-%EC%84%B8%EA%B8%B0reference-counting_%EA%B0%80%EB%B9%84%EC%A7%80_%EC%BD%9C%EB%A0%89%EC%85%98)을 참고하시면 좋을 거 같아요.

### Mark and sweep 알고리즘

Mark and sweep(표시하고 쓸기) 알고리즘의 경우 **닿을 수 없는 오브젝트**를 **더 이상 필요 없는 오브젝트**로 정의하는 알고리즘이에요.

이 알고리즘의 동작 방법은 다음과 같아요.

1. `roots`라는 오브젝트의 집합을 가지고 있어요.
2. 주기적으로 가비지 콜렉터는 roots부터 roots가 참조하는 오브젝트, roots가 참조하는 오브젝트가 참조하는 오브젝트들 ... 을 닿을 수 있는 오브젝트로 판단해요.
3. 닿을 수 있는 오브젝트가 아닌 **닿을 수 없는 오브젝트**에 대해 가비지 콜렉션을 수행해요.

이 알고리즘은 Reference counting 알고리즘보다 효율적인데,
Reference counting이 판단하는 **참조되지 않는 오브젝트**는 모두 Mark and sweep이 판단하는 **닿을 수 없는 오브젝트**이지만
**닿을 수 없는 오브젝트**가 모두 **참조되지 않는 오브젝트**는 아니기 때문이에요.

위에서 설명했던 순환 참조로 풀어서 설명하자면 다음과 같아요.

```diff
function foo() {
  var a = {};
  var b = {};

  a.bar = b;
  b.baz = a;

  return 'clear';
}

-// a와 b는 Reference counting 알고리즘에서 참조되는 오브젝트
+// 하지만 Mark and sweep 알고리즘에서 닿을 수 없는 오브젝트
```

## 이게 끝?

> 서론에서 언급한 MDN 문서를 읽으신 분들은 여기부터 읽어보시면 돼요.

많은 분들이 어떤 알고리즘을 사용하는지는 알게 되었으나, 수박의 겉을 핥은 수준이라고 생각되어 더욱 자세히 알아보고 싶으실 거 같아요.

저 또한 더욱 궁금함이 생겨 가장 대중적으로 사용되고 있는 자바스크립트 엔진 `V8`은 어떻게 가비지 콜렉션을 하고 있는지 검색해 보았어요.

제가 검색해 알게 되고 공부한 내용을 공유드릴게요.

## 메모리 구조

우선 "어떻게 메모리를 해제하나" 알기 위해서는 "어떤 메모리가 있나"를 알아야 될 것 같아요.

![v8메모리구조](https://user-images.githubusercontent.com/26461307/186716665-01f8d21b-df60-4522-b159-c6e7ae6a9d9c.png)

<small>
출처 : https://deepu.tech/memory-management-in-v8/
</small>

가장 크게 구분을 하자면 `stack`과 `heap`으로 나뉠 수 있어요.

### Stack

흔히 `호출 스택`으로 불리는 stack 형태의 메모리로써, 정적 값을 저장하며 기본적으로 프로그램 상에서 어디에 있는지를 기록해요.

만약 함수를 실행한다면, 해당 함수를 호출 스택의 최상단에 위치하고 함수가 종료될 때 (반환할 때) 해당 함수를 호출 스택에서 제거해요.

이에 대한 설명은 [캡틴판교님께서 그림과 함께 설명해 주신 아티클](https://joshua1988.github.io/web-development/translation/javascript/how-js-works-inside-engine/)을 참고해 보시면 좋을 거 같아요.

추가적으로 정적인 변수의 경우도 호출 스택에 저장되는데, 다음 예시를 보시면 이해가 빠르실 거예요.

```js
const a = 123;
let b = 'string';

const c = [];

// 호출 스택
a -> [메모리 주소: aaaa, 값: 123]
b -> [메모리 주소: bbbb, 값: 'string']
c -> [메모리 주소: cccc, 값: zzzz]

// 힙
[메모리 주소: zzzz, 값: []]
```

즉 숫자와 문자열 같은 정적 값의 경우 호출 스택의 순서대로 추가되고, **객체 값은 힙 메모리에 저장되며 힙 메모리의 주소를 스택에 푸시**되는 것을 알 수 있어요.

이것이 일반적으로 스택과 힙이 작업을 나누는 방식이라고 하며, 더욱 자세히 알고 싶으신 분들은 다음 자료를 확인해 보시면 좋을 거 같아요. [V8 Memory usage](https://speakerdeck.com/deepu105/v8-memory-usage-stack-and-heap)

### Heap

호출 스택의 경우 메모리의 해제가 반환과 함께 이루어지기 때문에 일반적으로 가비지 콜렉터가 필요하지 않아요.

하지만 힙의 경우 동적 데이터를 저장하고, 데이터를 서로 참조할 수 있기 때문에 가비지 콜렉터가 필요하고, 동작하는 방식이 위 MDN 문서에서 알 수 있었던 Mark and sweep 알고리즘이에요.

이제 어떤 메모리에 가비지 콜렉터가 필요한지 알게 되었고, 언제 더욱 자세히 어떻게 가비지 콜렉터가 동작하는지 알아볼 수 있게 되었어요.

## V8의 가비지 콜렉터

![v8-orinoco](https://user-images.githubusercontent.com/26461307/186722466-e0c04b55-1064-4028-a0e9-ec131d8ddf06.png)

V8은 `Orinoco`라는 이름의 가비지 콜렉터를 사용하고, `major` 가비지 콜렉터와 `minor` 가비지 콜렉터로 나뉘어 있어요.

## Major 가비지 콜렉터

V8의 Major 가비지 콜렉터는 위에서 설명한 Mark and sweep 알고리즘으로 동작하며, **모든 오브젝트**의 참조를 따라가며 표시해요.

이때 Mark and sweep 알고리즘의 동작을 `마킹 (Mark)`, `스위핑 (Sweep)`, `적용 (Compact+Update)`으로 나누었을 때 모든 동작을 메인 스레드에서 동작하게 되면 상당히 오랜 기간 동안 가비지 콜렉팅에 시간이 소요되어 다른 동작이 상당 시간 실행되지 않을 수도 있어요.

![v8 major GC main thread](https://v8.dev/_img/trash-talk/01.svg)

<small>
출처 : https://v8.dev/blog/trash-talk
</small>

이렇게 싱글 스레드 언어인 자바스크립트에서, 가비지 콜렉션을 위해 메인 스레드를 독점하지 않기 위해 `Orinoco`는 3가지 방법을 가지고 있어요.

이는 `병렬 (Parallel)`, `증분 (Incremental)`, `동시성 (Concurrent)`이며 자세한 설명은 [다음 링크](https://v8.dev/blog/trash-talk#orinoco)에서 확인하실 수 있고, 여기에서는 이중 사용하는 방법에 대해서만 다뤄볼게요.

## 그래서 Major 가비지 콜렉터는

Major 가비지 콜렉터는 힙이 동적으로 계산된 제한에 가까워지면 시작되면 위에서 언급한 3가지 방법 중 동시성을 이용해 `마킹`하는 것으로 시작해요.

`마킹`은 메인 스레드가 다른 일을 처리하는 동안 전적으로 백그라운드에서 발생하고, `마킹`이 끝나거나 동적 할당 제한에 도달할 시 메인 스레드에서 메모리를 해제(`적용`)하고, 이때 메인 스레드의 작업이 일시 중지돼요.

자세히는 메모리 해제만을 하는 것이 아닌, 다시 스캔하여 오브젝트를 확인도 하며 동시에 병렬적으로 `스위핑` 한다고 해요.

아래 이미지를 함께 보시면 이해에 도움이 되실 거 같아요.

![v8 major gc](https://v8.dev/_img/trash-talk/09.svg)

<small>
출처 : https://v8.dev/blog/trash-talk
</small>

## Minor 가비지 콜렉터

위의 메모리 구조 이미지를 다시 보면, 단순히 이름만 보고서는 유추가 힘든 부분이 있을 거에요.

![v8메모리구조](https://user-images.githubusercontent.com/26461307/186716665-01f8d21b-df60-4522-b159-c6e7ae6a9d9c.png)

설명드리고자 한 부분은 `New space(Young generation)`과 `Old space(Old generation)`이예요.

이는 가비지 콜렉션의 `세대적 가설`을 적용하기 위해 힙 메모리의 영역을 분리해둔 것이에요.

## 세대적 가설

세대적 가설이란 V8, 자바스크립트뿐만 아니라 대부분의 고수준 언어에서 적용되는 개념으로써,

**해제될 메모리의 대부분은 할당된 지 얼마 되지 않은 메모리인 것을 의미해요.**

V8에서는 이 가설을 적용하기 위해 설계되었으며, 가비지 콜렉션에서 살아남은 오브젝트를 복사해 `Old space(Old generation)`로 이동하도록 동작하고 있어요.

> 객체를 복사하는 것은 비용이 많이 드는 것을 사실이나, 세대적 가설에 따르면 가비지 콜렉션에서 살아남는 객체는 극히 일부에 불과하다고 해요.

## 그래서 Minor 가비지 콜렉터는

Minor 가비지 콜렉터(Scavenger라고도 표현)는 세대적 가설을 기반으로 `New space(Young generation)` 영역에서만 가비지 콜렉션을 실행해요.

이때도 Mark and sweep 알고리즘을 사용하며, 살아남은 오브젝트들을 복사하기 위해 메모리를 `To-Space`, `From-Space`라는 이름으로 절반씩 나누어 사용하는데요. 절반으로 나눈 이유는 최악의 경우 모든 객체를 복사해야 하기 때문이에요.

살아남은 오브젝트를 `To-Space`로 옮긴 후 `From-Space`를 비우고 역할을 반전시켜 사용해요.

> 해제된 메모리로 남겨진 간격을 제거하기 위해 To-Space로 옮겨지는 오브젝트들은 연속적인 메모리에 이동해요.

이후 두 번째 가비지 콜렉션에서 살아남은 오브젝트들을 `Old space(Old generation)`로 이동시키고, 마지막으로 이동 전의 오브젝트를 참조하는 포인터를 이동된 새 메모리 주소를 가리키도록 업데이트하며 Minor 가비지 콜렉터가 동작해요.

> Minor 가비지 콜렉터의 `마킹`, `비우기`, `포인터 업데이트`는 개별 단계가 아니라 [인터리브](https://ko.wikipedia.org/wiki/%EB%A9%94%EB%AA%A8%EB%A6%AC_%EC%9D%B8%ED%84%B0%EB%A6%AC%EB%B9%99) 방식으로 동작해요.

### 현실 세계의 Minor 가비지 콜렉터

Minor 가비지 콜렉터는 `Orinoco`의 `병렬` 기능을 통해 작업을 분산해요.

병렬적으로 동작하기 때문에 다른 스레드가 동일한 오브젝트를 발견하고 이동을 시도했을 수도 있는데요.

이는 이동의 성공 여부와 상관없이 포인터를 업데이트하고, 다른 스레드가 포인터를 찾을 때 업데이트할 수 있도록 전달 포인터를 남기며 살아남은 오브젝트의 빠른 할당을 위해 Minor 가비지 콜렉터는 TLAB(Thread Local Allocation Buffers)를 사용해요.

![v8 minor GC](https://v8.dev/_img/trash-talk/08.svg)

<small>
출처 : https://v8.dev/blog/trash-talk
</small>

## Idle time 가비지 콜렉션

가비지 콜렉터를 직접 호출할 수 없지만, V8의 경우 사용자가 가비지 콜렉션을 트리거 할 수 있는 데, 이것이 `Idle time(여유 시간) 가비지 콜렉션`이예요.

Idle time 가비지 콜렉션은 여유 시간에 가비지 콜렉션을 할 수 있도록 하는 것인데,

예로 Chrome의 경우 애니메이션의 각 프레임을 렌더링 하는 중에 작업이 일찍 완료되면 가비지 콜렉션을 하는 형식이에요.

![idle time GC](https://v8.dev/_img/trash-talk/10.svg)

<small>
출처 : https://v8.dev/blog/trash-talk
</small>

> Idle time 가비지 콜렉션을 통해 Gmail의 경우 힙 메모리를 45%까지 줄일 수 있었다고 해요.

## 현실 세계에 적용하기

자바스크립트 개발의 대부분이 GC에 대해 생각할 필요가 없지만, 오늘 소개한 내용을 기반으로 메모리 사용량에 유리한 패턴을 생각하는 데 도움이 될 수 있는데요.

주로 참고한 아티클의 작성자분께서는 V8 minor 가비지 콜렉션을 생각하여 상대적으로 비용이 적은, 수명이 짧은 오브젝트를 사용하도록 개발을 하는 방법으로 내부 구현을 이용해 메모리 비용을 절약하는 방식을 적용할 수 있다고 하였으며 이는 많은 고수준 언어에서 통하는 방법이라고 기술하였습니다.

## 마치며

MDN에서 소개하고 있는 자바스크립트의 일반적인 가비지 콜렉션 알고리즘부터, V8이 어떻게 가비지 콜렉션을 하고 있는지 알아보았는데요.

이를 설명드리는 과정에서 제 부족한 이해도와 함께 영어 독해 실력이 좋지 않아 이질감이 많이 드실까 걱정입니다. 부디 양해 부탁드리며 잘못된 부분이 있을 시 댓글 부탁드릴게요.

추가적으로 많은 부분 `V8`의 블로그를 참고했으니, 더욱 자세히 알고 싶으신 분들은 아래 참고 링크 확인을 부탁드리겠습니다. 감사합니다.

## 참고

- [v8 trash talk](https://v8.dev/blog/trash-talk#orinoco)
- [Visualizing memory management in V8 Engine](https://deepu.tech/memory-management-in-v8/)
- [Memory management in V8, garbage collection and improvements](https://dev.to/jennieji/memory-management-in-v8-garbage-collection-and-improvements-18e6)
