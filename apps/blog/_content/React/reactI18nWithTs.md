---
title: 'i18next를 사용해 React 다국어 지원하게 만들기 w/ TypeScript'
subtitle: 'Type Safe하게 다국어 지원 서비스를 개발한 경험을 공유합니다.'
date: 2022-01-21 20:24:00
category: 'React'
draft: false
---

![i18next](https://user-images.githubusercontent.com/26461307/148644476-0b439a11-f709-468c-b7cc-92ba4cde0c19.png)

[React 공식문서](https://ko.reactjs.org/languages)나 [Apple](https://www.apple.com/choose-country-region/) 등의 다양한 웹 서비스에서 다국어를 지원하고 있습니다.

React 환경에서 다국어를 지원하는 서비스를 개발하며, TypeScript로 TypeSafe하게 개발하고자 노력한 경험을 공유하고자 합니다.

## 설치

```bash
yarn add i18next react-18next
# or npm install
```

React 생태계에서 다국어를 지원을 위한 라이브러리는 크게 `react-i18next`와, `react-intl`로 나누어지는 것으로 확인하였습니다.

![스크린샷 2022-01-21 오후 6 25 54](https://user-images.githubusercontent.com/26461307/150501899-0296e1e6-6024-4405-a9a4-059c3f8222a1.png)

위 이미지에서 확인할 수 있듯이 저는 둘 중 사용자가 더욱 많으며, 번들 사이즈가 작은 **react-i18next**를 선택하여 개발하였습니다.

## 기본 적용

저는 다국어를 위한 처리를 **i18n** 디렉토리를 만들어 관리하였습니다.

```bash
src
├── components
├── hooks
├── i18n
│   ├── index.ts
│   ├── react-i18next.d.ts
│   └── translation
│       ├── en-US.json
│       ├── es-ES.json
│       └── ko-KR.json
# ...
```

우선 `i18n/index.ts`에는 다음과 같이 개발하였습니다.

```tsx
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko_KR from 'i18n/translation/ko-KR.json';
import en_US from 'i18n/translation/en-US.json';
import es_ES from 'i18n/translation/es-ES.json';

const resources = {
  'en-US': {
    translation: en_US,
  },
  'ko-KR': {
    translation: ko_KR,
  },
  'es-ES': {
    translation: es_ES,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US', // 기본 언어
  fallbackLng: 'en-US', // fallback 언어
});

export default i18n;
```

디렉토리에서도 확인하셨듯이 `i18n/translation` 폴더에서는 각기 다른 텍스트들이 다음과 같은 형태로 작성되어 있는 파일입니다.

```json
// src/i18n/translation/en-US.json
{
  "main-header-title": "TITLE",
  "main-header-dsc": "hello world"
  // ...
}
```

```json
// src/i18n/translation/ko-KR.json
{
  "main-header-title": "타이틀",
  "main-header-dsc": "안녕 세계"
  // ...
}
```

이렇게 i18n을 작성하신 후, 최상위 컴포넌트에 Provider 적용을 하면 기본 적용은 끝나게 됩니다.

```tsx
// src/index.tsx
import ReactDOM from 'react-dom';

import { I18nextProvider } from 'react-i18next';
import i18n from 'i18n';

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <SomeComponent>
  </I18nextProvider>,
  document.getElementById('root')
);
```

## 기본 사용

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();

  return <p>{t('main-header-title')}</p>;
}
```

위와 같이 react-i18next의 `useTranslation` hook을 이용해 간단히 현재 언어의 텍스트를 렌더링 할 수 있습니다.

### 언어 변경

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();

  function onClickEng() {
    i18n.changeLanguage('en-US');
  }

  return (
    <div>
      <p>{t('main-header-title')}</p>
      <button onClick={onClickEng}>set eng</button>
    </div>
  );
}
```

언어 변경 또한 useTranslation hook을 이용하여 간단하게 구현할 수 있습니다.

제세한 내용은 [공식문서](https://react.i18next.com/)에 정리되어 있으니 확인하시면 좋을 것 같습니다.

## TypeSafe하게 사용하기

```tsx
<p>{t('main-header-title')}</p>
```

많은 텍스트들을 json 파일에 기록하여 사용할 때, 하나씩 key 값을 확인해가며 개발하기에는 생산성과 안정성이 떨어진다고 판단하였습니다.

```ts
// src/i18n/react-i18next.d.ts
import 'react-i18next';
import enUS from 'i18n/translation/en-US.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: typeof enUS;
  }
}
```

그렇기 때문에 react-18next module을 json 파일의 type을 이용해 declare 하였습니다.

![auto](https://user-images.githubusercontent.com/26461307/150509554-d5d673a2-cd23-47cf-9d9a-9a27f194a407.png)

이를 통해 자동 완성 기능과 함께

![error](https://user-images.githubusercontent.com/26461307/150509568-13daac12-3211-43fd-9dd8-6b383a44dd4f.png)

작성하지 않은 key를 사용하였을 때 error를 뱉는 모습을 확인할 수 있었습니다.

## 마치며

TypeScript 환경에서 작성된 한글 게시물이 많이 없어 도움이 되었으면 하는 마음에 게시물로 작성해보았습니다.

추가적으로 [브라우저의 언어를 감지](https://github.com/i18next/i18next-browser-languageDetector)하여 적용, [로컬 스토리지를 이용해 캐싱](https://github.com/i18next/i18next-localStorage-cache)하는 플러그인 등 다양한 도구들이 있으니 확인 후 적용하시면 보다 좋은 경험을 하실 것이라고 생각됩니다.

부족한 게시물 읽어주셔서 감사드리며 부족한 사항이 있을 시 댓글 부탁드리겠습니다.

## 참고

- [공식문서 typescript 섹션](https://react.i18next.com/latest/typescript)
- [Strong typed I18N in react](https://medium.com/geekculture/strong-typed-i18n-in-react-c43281de720c)
