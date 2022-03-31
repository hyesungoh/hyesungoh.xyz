---
title: '리액트에서 여러 개 한 번에 import하기 with TypeScript '
date: 2021-12-19 20:24:00
category: 'React'
draft: false
---

리액트 환경에서 프로젝트를 진행하며 특정 디렉토리에 상당히 많은 파일 (ex 이미지)을 `Import`해야 하는 상황이 있었습니다.

## 1차원적 접근

```tsx
// assets/images/index.ts
import img1 from 'assets/images/img_001.jpg';
import img2 from 'assets/images/img_002.jpg';
import img3 from 'assets/images/img_003.jpg';
import img4 from 'assets/images/img_004.jpg';
// ...

export const images = { img1, img2, img3, img4, ...};
```

1차원적으로 해당 파일이 존재하는 디렉토리에 `index.ts`를 생성 후 위와 같이 작성할 수 있을 것 같습니다.

import해야하는 파일의 수가 엄청 많지 않은 환경에서는 충분히 사용할 만한 방법이라고 생각되지만,

제 환경은 최소 300장의 이미지를 import해야 했기 때문에 위 방법은 적절하지 못하다고 생각하였습니다.

## require.context

해결 방법을 찾던 중 [해당 게시물](https://stackoverflow.com/questions/44607396/importing-multiple-files-in-react)의 아래 코드가 적합하다고 생각되었습니다.

```jsx
function importAll(r) {
  let images = {};
  r.keys().map(item => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images = importAll(require.context('./images', false, '/.png/'));

<img src={images['0.png']} />;
```

여기서 사용하는 `require.context`는 디렉토리로부터 정규표현식에 해당하는 모든 모듈을 불러올 수 있는 webpack 컴파일러의 기능입니다.

동작 방법은 해당하는 모든 모듈 요청을 동적 목록으로 변환하고 이를 빌드 dependency로 추가하여 런타임에 요구할 수 있도록 한다고 합니다.

자세한 설명은 [해당 stackoverflow](https://stackoverflow.com/questions/54059179/what-is-require-context) 게시물을 참고하시면 좋을 것 같습니다.

## TypeScript

제가 원하는 해결 방법과 적합하였지만,

TypeScript 환경에서 require의 `context`를 인식하지 못하는 이슈가 있었습니다.

```tsx
require.context(); // Property 'context' does not exist
```

#### 해결 방법

해결 방법은 다음과 같습니다.

```bash
npm i @types/webpack-env @types/node -D # or
yarn add @types/webpack-env @types/node -D
```

`@types/webpack-env`는 webpack에 대한 type 정의가 포함된 [패키지](https://www.npmjs.com/package/@types/webpack-env)이며,

`@types/node`는 Node.js에 대한 type 정의가 포함된 [패키지](https://www.npmjs.com/package/@types/node)입니다.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["node", "webpack-env"] // 해당 부분 추가
  }
  // ...
}
```

해당 패키지들을 tsconfig에 추가하여 해결할 수 있습니다.

Type을 추가하여 제가 사용한 방법은 다음과 같습니다.

```ts
// assets/images/index.ts
function importAll(r: __WebpackModuleApi.RequireContext) {
  let images: { [id: string]: string } = {};

  r.keys().forEach(item => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

export const images = importAll(
  require.context('assets/video', false, /\.JPG/)
);
```

사용하는 컴포넌트에서는 간단히 다음과 같이 접근 할 수 있습니다.

```tsx
// 사용하는 곳.tsx
import { images } from 'assets/images';

function SomeComponent() {
  const foo: number = 123;
  return <img src={images[`img_${foo}.JPG`]} />;
}
```

## 마치며

해당 해결 방법이 최고의 방법이라고는 장담하지 못하지만, 한글로 작성된 해결 방법이 많이 없어 공유해봅니다.

피드백과 잘못된 점 발견 시 댓글 남겨주시기 부탁드리겠습니다. 감사합니다.

## 참고

- [Importing multiple files in react](https://stackoverflow.com/questions/44607396/importing-multiple-files-in-react)
- [What is `require.context`?](https://stackoverflow.com/questions/54059179/what-is-require-context)
- [타입스크립트 프로젝트에서 require.context 사용하기](https://webcache.googleusercontent.com/search?q=cache:Z4xxAh2EK6EJ:https://merrily-code.tistory.com/138+&cd=1&hl=ko&ct=clnk&gl=kr&client=firefox-b-d)
- [npm @types/webpack-env](https://www.npmjs.com/package/@types/webpack-env)
- [npm @types/node](https://www.npmjs.com/package/@types/node)
