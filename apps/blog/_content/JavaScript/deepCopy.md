---
title: 'Javascript의 Deep한 깊은 복사'
date: 2021-10-23 20:24:00
category: 'JavaScript'
draft: false
---

```js
const foo = { name: 'foo', info: { job: 'student' } };
const bar = { ...foo };

bar.info.job = 'programmer';

console.log(foo.info.job);
console.log(bar.info.job);
```

다음 출력 결과는 무엇일까 ?

```js
programmer; // student 일 줄 알으셨나요 ?
programmer;
```

`student`일 줄 알으셨던 분은 아래 글을 읽으시면 도움이 될 것 같습니다.

## 얕은 복사, 깊은 복사 ?

얕은 복사는 객체를 직접 대입 해, `둘 다 같은 데이터`의 주소를 가지도록 복사하는 것입니다.

```js
const obj1 = { age: 1 };
const obj2 = obj1;
obj2.age = 2;

console.log(obj1.age); // 2
```

위 예제처럼 `obj2`의 값을 바꾸었는데, `obj1`의 값도 바뀐 것을 확인할 수 있습니다.

---

`깊은` 복사는 얕은 복사와 반대로, 해당 데이터 주소의 데이터만 복사해서 사용하는 것을 뜻합니다.

```js
const obj1 = { age: 1 };
const obj2 = { ...obj1 }; // spread
const obj3 = Object.assign({}, obj1); // assign
obj2.age = 2;
obj3.age = 3;

console.log(obj1.age); //1
```

일반적으로 객체(오브젝트)에 대한 깊은 복사는 `...` spread 연산자, `assign` 메소드를 이용합니다.

**하지만 이는 `1 Depth`의 요소에 한해서 깊은 복사가 이루어집니다.**

```js
const obj1 = {
  depth1: {
    depth2Name: 'name',
    depth2: {},
  },
};
```

예를 들어 다음과 같은 오브젝트는 depth1의 값은 깊은 복사가 되지만,

depth2Name, depth2의 경우 얕은 복사가 되어 `맨 위`의 실행 결과를 초래하는 것입니다.

## 깊이있는 객체를 깊은 복사하는 법

1. cloneDeep

가장 쉬운 방법은 `lodash`의 `cloneDeep`을 사용하는 것입니다.

```js
import { cloneDeep } from 'lodash';

const obj2 = cloneDeep(obj1);
```

2. JSON

오픈 소스에 의존하지 않으면서 가장 쉬운 방법은 `JSON`을 활용하는 방법입니다.

```js
const obj2 = JSON.parse(JSON.stringify(obj1));
```

하지만 함수, Date 객체, Regex등 유실되는 데이터가 있을 수 있으며,

속도가 느리다는 단점이 존재합니다.

3. 재귀적으로 탐색하여 생성

오픈 소스에 의존하지 않으면서, 퍼포먼스적인 문제를 해결하고자하면

직접 객체의 요소들을 1차원 값처럼 여길 수 있도록 재귀적으로 복사하는 방법이 있습니다.

## 마치며

```js
[{ foo: { bar: {} } }, { foo: { bar: {} } }, ...];
```

저는 웹을 개발하며 1 depth 이상의 깊은 복사는 구현해본 경험이 없어 spread 연산자를 이용해 시도를 하였으나, 정상적으로 동작하지 않아 찾아본 결과를 추합하여 저와 같은 문제를 겪는 분들에게 도움을 드리고자 정리 해보았습니다.

제 상황은 ML 파이프라인을 거친 데이터를 시각화하기전, 전처리 과정을 거쳐야하는 상황이였으며 기존 throttle, debounce 기능을 위해 lodash를 사용했어서, cloneDeep을 이용하여 해결하였습니다.

이 글을 보시는 분들은 각자의 환경에 적합한 방법으로 현명히 해결하시길 바라겠습니다. 감사합니다.
