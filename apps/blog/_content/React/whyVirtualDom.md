---
title: '왜 Virtual DOM 인가?'
date: 2021-12-02 20:24:00
category: 'React'
draft: false
---

다양한 게시물에서 React, Virtual DOM의 장점을 성능적인 면만 기술하고 있습니다.

하지만 이는 절대적인 장점이 되지 않는다는 생각을 공유하고자 포스트를 남겨봅니다.

## Virtual DOM ?

Virtual DOM은 [React 공식문서](https://ko.reactjs.org/docs/faq-internals.html)에서 다음과 같이 기술되어 있습니다.

> Virtual DOM (VDOM)은 UI의 이상적인 또는 “가상”적인 표현을 메모리에 저장하고 ReactDOM과 같은 라이브러리에 의해 “실제” DOM과 동기화하는 프로그래밍 개념입니다. 이 과정을 재조정이라고 합니다.

많은 블로그에서 Real DOM을 다시 렌더링하는 것에 자원 소모가 많아, Virtual DOM을 이용해 비교를 한 후 다른 부분만 렌더링하는 것이 성능적인 이점이 있다고 기술되어 있습니다.

하지만 이는 "일반적"인이 제외된 표현입니다.

## Virtual DOM vs Real DOM

위에서 Real DOM을 다시 렌더링하는 것은 자원 소모가 많다고 기술하였습니다. 이를 풀어서 설명하자면 각 조작이 레이아웃의 변화, 트리의 변화 그리고 렌더링을 일으킨다는 것 입니다.

예를 들어 100개의 노드를 수정하였을 시, 100번의 레이아웃 계산과 100번의 리렌더링이 이루어지는 문제가 있는 것 입니다.

Virtual DOM은 이를 "더블 버퍼링"처럼 묶어서 최종적인 변화를 Real DOM에 적용시키는 방법입니다.

중요한 점은 이는 Virtual DOM을 사용하지 않아도 가능하다는 것 입니다. 오히려 이런 최적화 작업을 "잘" 손수했을 때 더욱 빠르다고 합니다.

## 그럼 왜 Virtual DOM ?

위에서 언급했듯이 Real DOM의 조작을 "잘"하면 Virtual DOM보다 더욱 빠른 성능을 보여줄 수 있습니다.

하지만 해당 과정을 하나하나 작업하지 않고 Vitual DOM을 통해 **자동화**, **추상화**하여,

**일반적**으로 빠른 성능과 함께 위 React 공식문서에서 말하고 있는 **선언적 API**를 가능하게 하는 것, **상태 중심 UI 개발**을 상태 전환에 대해 생각하지 않고 개발할 수 있는 것이 Virtual DOM의 핵심입니다.

> 여기서 말하는 선언적 API란 DOM 관리를 Virtual DOM에 위임하여, 컴포넌트가 DOM을 조작할 때 다른 컴포넌트의 DOM 조작 상태를 공유할 필요가 없다는 것입니다.

![rethinking-best-practices](https://user-images.githubusercontent.com/26461307/144367105-fc519840-ab4b-4f55-bd16-f4506a39068f.jpg)

##### _2013 JSConfEU 세미나의 Pete Hunt_

이에 대해 증빙하듯 2013년 React Core팀의 Pete Hunt는 다음과 같은 말을 하였습니다.

> React is not magic. Just like you can drop into assembler with C and beat the C compiler, you can drop into raw DOM operations and DOM API calls and beat React if you wanted to. However, using C or Java or JavaScript is an order of magnitude performance improvement because you don't have to worry...about the specifics of the platform. With React you can build applications without even thinking about performance and the default state is fast.

간단히 번역하자면, "어셈블리어를 이용해 C 컴파일러보다 좋은 성능으로 개발할 수 있는 것처럼 원시 DOM _(해당 포스트에서 말하는 Real DOM)_ 작업을 직접하여 React보다 빠른 성능을 낼 수 있습니다. 하지만 어셈블리어가 아닌 C, Java, JS를 사용하면 생산성이 크게 늘어나듯이 React를 사용하면 성능에 대해 덜 생각하고 애플리케이션을 개발 할 수 있으며 이는 일반적으로 빠릅니다." 라고 하였습니다.

## 일반적으로 빠르다 ?

![domBenchmark](https://user-images.githubusercontent.com/26461307/144362526-d0ae11ba-d719-4b84-a7f1-dfea32b1afa9.png)

[핀란드 Åbo Akademi University의 논문](https://www.doria.fi/bitstream/handle/10024/177433/levlin_mattias.pdf?sequence=2&isAllowed=y)에서는 각 프레임워크에서 DOM 조작에 대한 벤치마크가 기술되어 있습니다.

해당 논문의 결과에서 확인할 수 있듯이 일반적인 상황에서 React와 Vue가 사용하는 Vitual DOM이 준수한 성능을 보여주고 있는 것을 확인할 수 있습니다.

하지만 Change Detector를 사용하는 Angular, 컴파일을 통해 외과적으로 업데이트하는 Svelte가 더욱 빠른 경우도 있으며 이는 절대적으로 빠르지 않다에 대한 증빙입니다.

## Svelte

Svelte의 창시자 Rich Harris는 Vitrual DOM은 빠르다는 미신을 없애자는 글을 게시하였습니다.

[해당 게시물](https://svelte.dev/blog/virtual-dom-is-pure-overhead)에서는 React의 Virtual DOM이 무엇이며, 몇가지 느려질 수 있는 상황이 기술되어 있습니다.

```jsx
function MoreRealisticComponent(props) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <p>Selected {selected ? selected.name : 'nothing'}</p>

      <ul>
        {props.items.map(item => (
          <li>
            <button onClick={() => setSelected(item)}>{item.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

그 중 하나 예를 들자면, 위 코드에서는 props의 items를 이용해 li 요소를 렌더링하고 있습니다. 하지만 이 때 state가 변경되면 props.items가 변경되지 않았음에도 li 요소가 생성되게 됩니다.

이를 최적화할 순 있지만, 이미 충분히 빨라 낙관하게 되고 불필요한 작업을 기본적으로 할 경우 병목 현상이 일어나게 된다고 기술되어 있습니다.

하지만 Svelte는 이런 상황에 대해 명시적으로 설계되었으며, Vitual DOM이 제공하는 선언적이고 상태 중심 UI 개발을 Virtual DOM을 사용하지 않는 Svelte에서 유사하게 경함할 수 있다고 말하고 있습니다.

## 마치며

Virtual DOM은 무조건적으로 좋은 것은 아니지만, 대체적으로 좋은 성능을 보여주고 선언적이고 상태 중심 UI 개발이 가능해짐으로 이는 충분히 사용할만한 가치가 있는 방법임에 틀림 없습니다.

Svelte는 Virtual DOM을 사용하지 않고 유사한 성능, 개발 생산성을 보여줌과 동시에 21년 12월 11일 Rich Harris가 Next.js, SWR을 개발한 Vercel에 합류하며 앞으로의 행보가 기대되는 상황입니다.

> 개인적으로 Svelte의 개발자 경험이 매우 좋았어서, 앞으로 생태계가 더욱 커졌으면 하는 바램이 있습니다.

부족한 글 읽어주셔서 감사드리며, 피드백 부탁드리겠습니다. 감사합니다.

## 참고

- [React - Virtual DOM](https://ko.reactjs.org/docs/faq-internals.html)

- [The one thing that no one properly explains about React — Why Virtual DOM](https://hashnode.com/post/the-one-thing-that-no-one-properly-explains-about-react-why-virtual-dom-cisczhfj41bmssp53mvfwmgrq)

- [위 아티클 번역](https://velopert.com/3236)

- [DOM benchmark comparison of the front-end
  JavaScript frameworks React, Angular, Vue,
  and Svelte - Åbo Akademi University](https://www.doria.fi/bitstream/handle/10024/177433/levlin_mattias.pdf?sequence=2&isAllowed=y)

- [Vitual DOM is pure overhead - Rich Harris](https://svelte.dev/blog/virtual-dom-is-pure-overhead)

- [Vercel welcomes Rich Harris, creator of Svelte ](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte)
