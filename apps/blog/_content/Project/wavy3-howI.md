---
title: '[WAVY] 3. 나는 어떻게 만들까?'
subtitle: '프론트엔드 개발자로써, 어떻게 개발할지에 대한 고민과 과정을 공유합니다.'
date: 2022-01-10 00:02:00
category: 'Project'
draft: false
---

![wavy_full_logo](https://user-images.githubusercontent.com/26461307/148641874-cdb4f826-a5da-43d6-a5fd-3e879dcaa2f4.png)

지난 회고에서는 어떻게 협업할 것인지에 대해 기술하였습니다.

이번에는 웹 프론트엔드 개발을 혼자 담당한 제가 개발적으로 어떻게 접근하였는 지 기술해보겠습니다.

## React, not Next.js

다양한 서비스에서 SSR을 통한 SEO, 지원되는 기능(image optimization, router)등을 이유로 Next.js 프레임워크를 사용하는 것은 알고 있었습니다.

하지만 저는 Wavy 프로젝트를 개발하며 Next.js를 사용하지 않았으며 이유는 다음과 같습니다.

- 부족한 이해도
- 촉박한 개발 기간
- 새로운 기능 및 라이브러리의 우선 순위
- SEO 필요성 결여

검증을 위해 프로토타이핑에 시간을 투자하게 되었고, 이 때문에 큰 규모의 어플리케이션을 Next.js를 배우며 개발하기에 시간상 적합하지 않다고 판단되었습니다.

> 지금은 Next.js 환경을 열심히 공부하고 있습니다 ..

또한 Suspense, Recoil, Framer-motion과 같은 이전에 사용해보지 못한 기능 및 라이브러리가 Next.js보다 우선순위가 높았습니다.

마지막으로 저희는 프로젝트를 개발하며 많은 사용자가 있으면 당연히 좋겠지만, 목표는 일단 개발의 재미와 함께 무사히 소프트웨어 마에스트로 과정을 수료하는 것이였기 때문에 SEO를 고려하지 않아도 된다고 판단되었습니다. 이러한 이유들로 하여금 최종적으로 Next.js가 아닌 CRA를 기반으로 한 React 프로젝트로써 개발하게 되었습니다.

## Global State Management

결론부터 기술하자면 Redux가 아닌 **Recoil**을 도입, 사용하였습니다.

![reduxvsrecoil](https://user-images.githubusercontent.com/26461307/148733126-21175898-1ea3-44fd-8b07-1ca788f7347a.png)

사용 유저와 서비스의 차이도 엄청나고 정식 1.0대 릴리즈도 아니지만 다음과 같은 이유에서 Recoil을 도입하였습니다.

- Actions, Reducer 등의 부재를 통해 짧아지는 코드로 인해 읽기 쉬워진다
- Hook과 같은 형태로써 사용하고 배우기 쉽다
- redux-thunk, redux-saga의 부족한 이해도 및 SWR
- Facebook 개발

수정이 필요하거나, 추가적인 전역 상태가 필요할 때 상대적으로 작성할 코드의 양에 이점이 있으며,
사용하는 방법도 Hook과 같은 형태로써 간단하고 직관적으로 사용할 수 있는 점이 상당한 장점이라고 생각되었습니다.

추가적으로 Facebook이 개발한 React와 Recoil 인만큼, 앞으로 지향하는 방향과 호환성 측면에서 상당 부분 일치할 것이라고 판단되어 배우는 데 투자해도 아깝지 않을 것이라 생각되었습니다.

이러한 이유에 더불어 아래 기술할 SWR에 대한 부분, Redux 비동기 라이브러리에 대한 이해도 부족을 이유로 Redux가 아닌 Recoil을 전역 상태 관리 라이브러리로 선택하게 되었습니다.

## Data fetching

내장된 캐시를 통해 요청 중복 제거, 자동화된 재검증, 간단한 Mutation 등을 이유로 Data fetching 라이브러리를 도입할 계획이였습니다.

> 가장 큰 이유로써 저희 서비스는 "BTS", "블랙핑크" 등의 태그 별로 나누어져 Infinity Scroll이 적용되는 기획이였습니다. 이는 다른 태그 방문 후 재방문이 일어날 확률이 매우 높다고 가설을 세웠고, 이에 대한 사용자 경험을 최적화하기 위함입니다.

결론적으로 Wavy에 도입한 것은 React-query가 아닌 **SWR** 이였습니다.

기존에 React-query를 간단하게나마 사용한 경험이 있지만, SWR을 도입한 이유는 Vercel 때문이였습니다.

[Tanner Linsley](https://github.com/tannerlinsley)의 오픈 소스 프로젝트인 React-query와 Next.js에 더불어 turborepo, vercel, svelte의 rich haris 영입 등 엄청난 영향력을 끼치고 있는 vercel의 SWR을 단순히 비교하였을 때

저는 SWR이 더욱 배우고 사용해볼 가치가 있다고 판단되어 사용하였습니다.

> 또한 React-query의 경우 key 값을 별도로 지정해야되는 것에 비해 SWR의 경우 API endpoint를 key 값으로 사용하는 점이 global하게 mutate가 일어나지 않는 저희 환경에서는 보다 개발 리소스를 줄이는 방법이라 생각하였습니다.

## Styling

CSS in JS 라이브러리는 Emotion과 Styled-components를 고민하였습니다.

결론적으로는 **Styled-components**를 사용하였으며, 이유로는 Emotion과 달리 다양하게 사용해보았기 때문이 가장 컷습니다.

Next.js와 같이 촉박한 개발기간에서 다른 새로 도입하는 라이브러리에 비해 우선순위가 밀렸다고 표현할 수 있을 것 같습니다.

---

저는 Wavy가 매우 Interactive한, 화려한 서비스가 되었으면 좋겠다고 생각되었습니다.

이를 위해서는 애니메이션이 필수라고 생각되었고 주의깊게 보고 있었던 **Framer-motion**을 도입하는 계기가 되었습니다.

내부 디자이너가 없는 환경이며, 아웃소싱을 통해 구한 디자이너분은 Figma를 통해 결과물만을 전달받는 상황이라 전적으로 제 느낌과 감으로 애니메이션을 넣어야하는 상황이여서 Framer는 사용하지 않고 라이브러리로써만 사용하였습니다.

전에 사용한 경험이 있는 react-transition-group 라이브러리에 비해 사용법이 매우 간단하고 Styled-components와도 호환성이 좋아 매우 좋았던 경험이라고 생각됩니다.

![dance](https://user-images.githubusercontent.com/26461307/140171096-c2b7442c-262b-4f74-9350-2e733fee3de9.gif)

다양한 곳에서 사용되었지만, 특히 Notification에서 사용하였던 방법이 기억에 남습니다.

컴포넌트 NotificationWrapper에서 전역으로 선언된 notifications를 리스트 렌더링하며, 각 객체들은 framer-motion의 layout 기능을 이용해 자연스럽게 추가, 삭제되는 모습이 만족스러웠습니다.

추가와 삭제에 해당하는 로직도 useNotification hook에 위임하여 개발해, 다음에도 사용하고 싶은 구조라고 생각합니다.

> 해당 코드는 [다음 링크](https://github.com/hyesungoh/WavyFrontend/blob/master/src/components/Common/Notification/NotificationWrapper.tsx)에서 확인할 수 있습니다.

## Deploy

전에 하였던 프로젝트들은 github pages, netlify, heroku 등 무료 플랜을 주로 사용하였습니다.

하지만 프로젝트 지원비와 함께 AWS 계정 발급을 해주는 소프트웨어 마에스트로 과정에 힘입어 Wavy는 **AWS S3**를 통한 정적 호스팅과 **CloudFront**를 사용해 CDN에 태우는 경험을 하였습니다.

추가적으로 배포 자동화를 **Github actions**를 구성하여 진행하였습니다.

![스크린샷 2022-01-10 오후 8 42 14](https://user-images.githubusercontent.com/26461307/148760528-09d82ed5-bba4-409b-8fd9-63527fd8e517.png)

> Github marketplace에 등록해두었지만, 단순히 제 코드를 적어둔 것이라 오픈소스화는 대대적인 개편이 필요한 상태입니다 ..

Production 배포에 더해, Gitlab flow에서 말하는 `pre-production` 브랜치 역할의, test 브랜치 또한 같은 환경으로 배포 및 자동화 개발을 하여 팀원들의 QA가 통과된 후에 병합할 수 있는 환경을 구성하였습니다.

소프트웨어 마에스트로 과정 전에는 배포의 이중화는 생각치도 못하였지만, 멘토님의 조언에 따라 구성을 해보니 확실히 하는 게 좋은 환경이라고 생각되었습니다.

이유는 이미 배포 자동화가 되었으면 들이는 리소스가 매우 적으며, 개발자가 생각치 못한 에러를 QA팀 혹은 팀원들이 검수하여 서비스에 적용한다는 것이 위험도를 많이 낮추는 과정이라고 생각되었기 때문입니다.

이에 더불어 Unit, E2E 테스트와 같은 테스트 코드가 더해진다면 더욱 위험도를 낮출 수 있었겠지만 테스트 코드에 대한 이해도 부족과 적용하기에 촉박하였기 때문에 Wavy에는 테스트 코드를 작성하지 못하였습니다.

> 여담으로 현재 진행하는 사이드 프로젝트에서는 Cypress를 통한 E2E 테스트를 진행중인데 상당히 개발자 경험이 좋아, 앞으로 진행할 프로젝트에는 추가할 것 같습니다.

## Monitoring

이전에는 경험했던 모니터링 도구는 google search console이 유일했습니다.

과정 후반부에 멘토님께서 Sentry라는 도구를 알려주셨으며, 기간이 매우 부족해도 Google Analytics만은 부착하라는 조언을 해주셨습니다.

![96명-6일새벽](https://user-images.githubusercontent.com/26461307/148762841-2fe5a9c7-d4fc-4995-abc3-07f745c91885.png)

이를 적극 반영하여 사용자 모니터링을 위해 Google Analytics를 react-ga 라이브러리를 사용하여 간단히 부착할 수 있었고

pageview에 대한 로직을 [hook](https://github.com/hyesungoh/WavyFrontend/blob/master/src/hooks/Common/useGa.ts)에 위임, event에 대한 로직을 각각 로직들에 부착하여 지표를 얻을 수 있었습니다.

> 지인과 교내 오픈 카카오톡을 통해 홍보하여 제 기준 매우 많은 사용자가 접속하여 신기했던 경험이였습니다.

![sentry](https://user-images.githubusercontent.com/26461307/148763449-6baaaf41-45b6-4b0c-b4eb-c21c181f159b.png)

에러 모니터링을 위한 도구인 Sentry도 공식문서를 참고하여 부착할 수 있었습니다.

처음으로 사용해본 도구여서 100% 활용 했다고 말씀은 못드리겠지만, 어떤 환경에서 어떤 오류에 쳐했는 지 알려주는 기능은 서비스 운영에 매우 큰 도움을 주었습니다.

가장 많이 오류 알림이 뜬 부분은 비동기적으로 호출한 데이터의 상태에 대한 것이였습니다. Loading 핸들링을 하였지만, 부족했던 부분들을 많이 찾을 수 있었고 이를 더욱 깔끔한 방향으로 핸들링하기 위해 **Suspense**를 도입하였습니다.

Suspense와 함께 ErrorBoundary를 도입하여 에러와 로딩에 대한 핸들링을 위임하였던 경험을 쌓을 수 있었으며 [해당 게시물](https://jbee.io/react/error-declarative-handling-1/)을 많이 참고하여 개발하였습니다.

## 기억에 남는 구현 - 웹캠 녹화

![녹화](https://user-images.githubusercontent.com/26461307/140171317-597d9b01-03ba-4c4d-90b1-7a45f9b37669.gif)

앞써 게시했던 포스팅에서 사용자의 춤을 실시간으로 분석하는 것이 아닌, 서버에서 분석하는 방향으로 비즈니스 로직을 수정하였다고 기술했었습니다.

이를 위해 사용자 웹캠 영상을 녹화 후, 다 췄을 때 서버에 송신하는 과정이 필요했습니다.

추가적으로 사용자가 보고 따라추는 유투브 영상이 버퍼링에 걸리게 될 시, 녹화를 일시중지 후 버퍼링이 끝날 때 재개하는 로직 또한 필요하였습니다.

---

`MediaRecorder` 객체와 함께 react-webcam 라이브러리의 webcam.stream 객체를 사용하여 녹화를 구현하였고 녹화 시작, 중지, 재개, 중단등의 로직을 hook에 위임하여 개발하였습니다.

> 해당 코드는 [다음 링크](https://github.com/hyesungoh/WavyFrontend/blob/master/src/hooks/Dance/useCapture.ts)에서 확인할 수 있습니다.

다음 포스팅에 기술할 저작권 이슈때문에 Youtube 영상을 Embed하는 방식으로 영상을 배치하였고 이를 위해 **React-player** 라이브러리를 사용했습니다.

다행히도, React-player 라이브러리에는 버퍼링과 버퍼링 종료에 대한 핸들링을 할 수 있는 메소드가 존재하였고 이를 위 hook에서 구현한 메소드를 적재적소에 사용하여 구현할 수 있었습니다.

> firefox 브라우저는 mp4 녹화를 지원하지만, chrome 브라우저는 webm 형태로만 지원하여 webm 형태로 송신 후 서버단에서 인공지능 모델에 넣기 위해 ffmpeg을 이용해 mp4 형태로 변환했던 이슈도 기억에 남습니다.

## 기억에 남는 구현 - 동영상 컨트롤러

![분석](https://user-images.githubusercontent.com/26461307/140172018-1a760c56-bef8-442d-bc47-47b2e2c408c2.gif)

서비스의 `분석하기` 화면에서는 Youtube embed 영상과 녹화된 사용자 영상을 한 개의 컨트롤러로 동작할 수 있어야 했습니다.

`연습하기` 화면에서는 1가지의 동영상만을 조작하는 환경이였는데, 한 페이지 덕분에 한 개의 컴포넌트를 추가적으로 만드는 것보다 재사용할 수 있는 방향으로 개발하고 싶었습니다.

이를 위해 Recoil atom을 **callback ref** 형태로 사용하였습니다.

> [callback ref에 대한 본인의 게시물 링크](https://www.hyesungoh.xyz/usisngIntersectionObserverMyWay/#%ED%95%B4%EA%B2%B0-%EB%B0%A9%EB%B2%95)

덕분에 하나의 컨트롤러에서 callback ref 값에 따라 조작을 할 수 있었습니다.

---

추가적으로 동영상 컨트롤러 드래그 기능을 구현하는 것이였습니다.

시점 이동의 경우 사이즈 화면과 동영상 총 길이, 클릭된 x 좌표를 통해 간단히 구현할 수 있었지만, 드래그는 다른 문제였습니다.

일단 드래그 이벤트가 호출될 시 매번 계산과 시점 이동을 하게 될 시, 브라우저 리소스와 Youtube 영상에 대한 네트워크 리소스가 많이 드는 것을 확인할 수 있었습니다.

이를 최적화하기 위해 throttle을 사용해 연산과 동작의 횟수를 줄이고, mouse up과 down에 대한 상태를 state로써 관리하여 이벤트 버블링때문에 발생하는 필요하지 않는 연산을 방지하였습니다.

> 해당 코드는 [다음 링크](https://github.com/hyesungoh/WavyFrontend/blob/master/src/components/Common/Dance/Controller/ControllerProgressbar.tsx)에서 확인할 수 있습니다.

## 마치며

제가 진행했던 프로젝트 중에 가장 규모가 큰 프로젝트여서 더욱 기억에 남는 것이 많지만 이미 너무 나열한 느낌이 날까 걱정입니다.

다양한 새로운 경험들과 많은 문제들을 해결해나가며 배운 것 또한 가장 많은 프로젝트라고 말씀드릴 수 있을 것 같은데요.

현실적인 문제 많이 부딪혀 _(머신러닝 인스턴스 비용 ...)_ 운영은 더이상 하지 못하게 되었지만, 앞으로 많이 배우고 많은 사용자들을 만족시킬 수 있는 서비스를 개발해보고 싶다는 생각이 들게 해주었던 고마운 프로젝트라고 생각됩니다.

이번 글은 여기서 마무리하며 마지막으로 겪었던 이슈들을 소개시켜드리고 프로젝트 회고를 끝마칠까 합니다.

긴 글 읽어주셔서 감사합니다.
