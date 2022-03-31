# Comet-land

[![Total alerts](https://img.shields.io/lgtm/alerts/g/hyesungoh/comet-land.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyesungoh/comet-land/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/hyesungoh/comet-land.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hyesungoh/comet-land/context:javascript)

![comet-land-blog](https://user-images.githubusercontent.com/26461307/159371599-95b2acd5-e5eb-482c-9ead-d8f601f034b5.png)

### [BLOG DEMO](https://comet-land-blog.vercel.app/)

![comet-land-resume](https://user-images.githubusercontent.com/26461307/160653172-c56a3b64-dfa9-4708-bf95-fca2fff47964.png)

### [RESUME DEMO](https://comet-land-resume.vercel.app/)

turborepo를 사용한 블로그와 이력서 템플릿입니다.

## 블로그 기능

![postGif](https://user-images.githubusercontent.com/26461307/159372336-e42c1a9c-9915-4d05-9e51-4882d681dc80.gif)

- 👔 강조 줄, 줄 수 기능이 있는 코드 하이라이트
- 🎨 [NextUI](https://nextui.org/)를 사용한 디자인
- 🍽 목차 보기
- 🎩 다크 모드

![kbarGif](https://user-images.githubusercontent.com/26461307/159372344-d628b817-d7f5-4322-813e-3468a62e79d6.gif)

- ⌨️ [KBar](https://kbar.vercel.app/)를 이용한 검색
- 🔨 수정 가능
- 🔊 [Utterances](https://utteranc.es/) 댓글
- 🔭 Google Analytics
- 🔥 Hotjar

## 이력서 기능

- 🎨 [NextUI](https://nextui.org/)를 사용한 디자인
- 🎩 다크 모드
- ⌨️ [KBar](https://kbar.vercel.app/)를 이용한 연락 방법 확인
- 🔨 수정 가능
- 🔭 Google Analytics
- 🔥 Hotjar

## 시작하는 방법

1. 해당 레포지토리를 Fork 혹은 clone 해주세요

2. dependencies를 설치해주세요

```bash
yarn
```

2. 터보 시작 ~~!

```bash
yarn turbo run dev
# or just
yarn dev
```

4. 이제 블로그를 `localhost:3000` 포트에서, 이력서를 `localhost:3001` 포트에서 확인할 수 있어요

## 수정하는 방법

`packages/core/constants` 디렉토리를 확인해주세요.

그 후 해당 디렉토리의 변수들을 수정하는 방법으로 간단히 수정할 수 있습니다.

- Analytics directory
  - GA ID
  - Hotjar ID
- Colors directory
  - color schema
- General directory
- SocialMedia directory
  - github
  - instagram
  - facebook
  - linkedin
  - twitter

그리고 `apps/blog/_config/index.json`와 `apps/resume/_config/index.json` 파일을 확인해주세요.

각 파일들은 각 앱의 설정 값들이 위치해있습니다.

## 사용하는 방법

다음 게시물들을 확인해주세요.

- [블로그 글 게시하는 방법](https://github.com/hyesungoh/hyesungoh-land/tree/main/_docs/ko-blog.md)
- [이력서 수정하는 방법](https://github.com/hyesungoh/hyesungoh-land/tree/main/_docs/ko-resume.md)

## Vercel을 이용해 배포하는 방법

이 프로젝트는 `turborepo`를 사용하였습니다.

그렇기 때문에 [vercel guide](https://vercel.com/docs/concepts/git/monorepos#turborepo)를 보고 쉽게 배포할 수 있습니다 :D

- 블로그 빌드 커맨드

```bash
cd ../.. && npx turbo run build --scope=blog --include-dependencies --no-deps
```

- 이력서 빌드 커맨드

```bash
cd ../.. && npx turbo run build --scope=resume --include-dependencies --no-deps
```

## 추가 패키지 설치하는 방법

- scope packages

```bash
cd where-you-want
yarn add package-name
```

- global packages

```bash
yarn add package-name -W
```

- global dev packages

```bash
yarn add package-name -DW
```

## Trouble shootings

[위키](https://github.com/hyesungoh/comet-land/wiki/Trouble-Shooting)를 참고해주세요. 도움이 될 수도 있습니다..!

## 라이센스

MIT
