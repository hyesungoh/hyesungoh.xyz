---
title: 'Next.js CI 단계에서 번들 사이즈 확인하기'
subtitle: 'Github actions를 이용해 PR 코멘트와 이슈에서 route 별 번들 사이즈를 확인하는 법을 공유합니다.'
date: 2022-10-02 20:24:00
category: 'React'
---

![Next.js CI 단계에서 번들 사이즈 확인하기](https://user-images.githubusercontent.com/26461307/193455442-df639e3e-9153-4513-80c7-80743d1a7811.png)

Next.js 환경에서 각 Route 별 번들 사이즈를 Github PR 코멘트, 이슈에서 확인할 수 있는 방법을 공유합니다.

## 번들 사이즈란?

우리가 만든 서비스의 번들 사이즈를 확인하기 전에, 번들 사이즈는 무엇일까요?

우리가 만든 서비스가 더욱 빠르고, 원활하게 사용자가 사용할 수 있게 하기 위한 지표 중 하나로써 `자바스크립트 코드의 크기`를 뜻해요.

> 즉 코드의 크기(용량)가 작을수록 사용자가 다운로드받아야 할 용량이 줄어들어 빠르게 실행될 수 있는 것이에요.

물론 성능을 논할 때 번들 사이즈 외에도 중요한 것은 많이 있어요. 관련해 더욱 알아보고 싶으신 분들은 [yceffort님의 글](https://yceffort.kr/2021/02/javascript-performance-bundle-size)을 추천해 드려요.

## 번들 사이즈를 확인하는 방법

Webpack을 사용하는 환경에서는 [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)를 사용해 번들 사이즈를 확인할 수 있어요.

그리고 Next.js 환경에서는 webpack-bundle-analyzer를 이용한 [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)를 사용해 번들 사이즈를 확인할 수 있어요.

![bundle analyzer](https://cloud.githubusercontent.com/assets/302213/20628702/93f72404-b338-11e6-92d4-9a365550a701.gif)

<small> 출처 : https://github.com/josselinbuils/next-bundle-analyzer </small>

위 방법을 이용해 모든 청크들을 어떤 모듈들로 구성되어 있는지 확인할 수 있어요.

자세히 보기 위해서는 좋은 방법이지만, 따로 커맨드로 실행해서 브라우저에서 확인해야 한다는 점이 번거로울 수도 있다고 생각되었어요.

## CI 단계에서 확인하기

이런 번거로움을 Pull request 시에 번들 사이즈가 얼마나 달라졌으며, 현재 main 브랜치의 번들 사이즈가 얼마인지 Github의 Issue로 보여주는 방법으로 덜어주는 Github actions 도구가 있는데요.

이름은 [actions-next-bundle-analyzer](https://github.com/transferwise/actions-next-bundle-analyzer)에요.

Next.js 환경의 build 결과물을 통해 `next-bundle-analyzer`를 사용해 계산한 값을 아래와 같이 보여줘요.

#### Pull request에서

![actions-next-bundle-analyzer PR](https://user-images.githubusercontent.com/614392/123790589-69872e80-d8d6-11eb-9dec-0686e0bba760.png)

#### Issue에서 (base branch 값)

![actions-next-bundle-analyzer Issue](https://user-images.githubusercontent.com/52004409/156007377-3e6bbb4c-f721-4b42-a363-4559b2ea55df.png)

## 적용하는 방법

Github actions를 이용해 간단히 적용할 수 있고, 방법은 아래와 같아요.

```yml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    brances:
      - main
      - something

jobs:
  run-bundle-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Install dependencies
        run: yarn

      - name: Build
        run: yarn build

      - name: Analyze bundle sizes
        uses: transferwise/actions-next-bundle-analyzer@master
        with:
          workflow-id: CI.yml
          base-branch: main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

dependency 파일들과 build 결과물을 캐싱하여 다른 job 들의 속도를 높일 수 있겠지만, 가장 간단한 형태는 위의 모습이 될 거 같아요.

기본적인 작성 방법은 [Github의 공식 문서](https://docs.github.com/en/actions)를 확인해 주시는 것이 더욱 정확할 것이라 생각해, `actions-next-bundle-analyzer` 작성 부분을 설명드리며 글을 마쳐보려 해요.

```yml {4}
- name: Analyze bundle sizes
  uses: transferwise/actions-next-bundle-analyzer@master
  with:
    workflow-id: CI.yml
    base-branch: main
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

작성하는 workflow의 파일명을 작성해 주시면 돼요.

```yml {5}
- name: Analyze bundle sizes
  uses: transferwise/actions-next-bundle-analyzer@master
  with:
    workflow-id: CI.yml
    base-branch: main
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

optional 값으로써, base branch 이름을 적어주시면 돼요. default 값은 master예요.

```yml {6-7}
- name: Analyze bundle sizes
  uses: transferwise/actions-next-bundle-analyzer@master
  with:
    workflow-id: CI.yml
    base-branch: main
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Github PR에 코멘트를 남기고, Issue를 생성하기 위한 Token을 전달하는 과정으로 따로 `Github Secrets`에 값을 작성해 주시지 않아도 돼요.

추가적으로 사용하지 않은 옵션이 하나 더 있는데요.

```yml {6}
- name: Analyze bundle sizes
  uses: transferwise/actions-next-bundle-analyzer@master
  with:
    workflow-id: CI.yml
    base-branch: main
    working-directory: /packages/something
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

빌드 결과물을 찾을 위치를 지정하는 옵션이에요. 기본값은 `cwd`로써 모노레포와 같은 환경에서 사용할 수 있을 것 같은 옵션이에요.

## 마치며

위 도구를 적용해 Route 별 번들 사이즈를 간편하게 확인할 수 있었고, Dynamic import를 한 부분도 따로 알려주어 추가적인 인사이트를 얻을 수 있게 되었어요.

![적용 결과물](https://user-images.githubusercontent.com/26461307/193453180-9734e05d-d7ba-4236-9ad3-4b19c7c8e245.png)

번들 사이즈가 지나치게 큰 Route는 없는지 간단하게 확인 후 `bundle-analyzer`를 이용해 자세히 확인하는 방법 등을 통해 번들 사이즈 다이어트에 다들 성공하시기 바라는 마음으로 글을 맞춰보도록 할게요.

읽어주셔서 감사합니다.

> 저는 [kooku](https://github.com/kooku0) 님의 적용 사례를 보고 해당 도구를 알게 되었어요. 많은 인사이트를 주신 kooku 님에게 감사 인사드려요!

## 부록, 라이브러리 번들 사이즈 확인하기

번들 사이즈에 많은 영향을 끼치는 것이 라이브러리의 크기인데요.

![bundlephobia](https://user-images.githubusercontent.com/26461307/193454231-0cc9f673-9c4a-43c9-917a-6db7f0cec140.png)

[bundlephobia](https://bundlephobia.com/)에서 라이브러리 이름과 버전에 따른 번들 사이즈를 확인할 수 있으니 라이브러리 선택의 지표 중 하나로 사용하실 수 있어요.