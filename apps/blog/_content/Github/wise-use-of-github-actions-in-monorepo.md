---
title: "모노레포에서 Github Actions 현명하게 사용하기"
subtitle: '병렬 실행, 라벨링 자동화 그리고 변경이 일어난 부분만 실행하기'
date: 2023-08-02 17:50:00
category: 'Github'
---

![모노레포에서 Github Actions 현명하게 사용하기](https://github.com/hyesungoh/hyesungoh.xyz/assets/26461307/b03d2d75-74a0-4576-b4b4-cfd4d32f898a)

현재 근무하고 있는 'F Lab'에서는 프론트엔드 프로젝트들을 모노레포로 관리하고 있습니다.

기존 Github Actions으로 적용되어 있던 CI를 개발자 관점과 비즈니스 관점으로 개선한 경험과 함께 방법을 공유하고자 합니다.

## Github Actions?

본문은 Github Actions를 이미 다루어본 경험이 있는 분들이 대상입니다.

그렇기에 자세한 설명은 생략하고, 아직 경험이 없으신 분들을 위해 Github의 문서에서 발췌한 설명과 [링크](https://docs.github.com/ko/actions)를 첨부해 두겠습니다.

> GitHub Actions를 사용하여 리포지토리에서 바로 소프트웨어 개발 워크플로를 자동화, 사용자 지정 및 실행합니다. CI/CD를 포함하여 원하는 작업을 수행하기 위한 작업을 검색, 생성 및 공유하고 완전히 사용자 정의된 워크플로에서 작업을 결합할 수 있습니다.

## As Is - 직렬

저희의 모노레포 안에는 5개의 프로젝트가 존재했습니다.

각 프로젝트의 의존 관계가 존재하긴 했지만, 빌드에 대한 의존은 존재하지 않았습니다.

이런 프로젝트 의존 관계와 다르게 CI는 직렬적으로 실행되고 있었어요.

```yml
# .github/workflows/ci.yml
- name: Build A

- name: Build B

- name: Build C

- name: Build D

- name: Build E
```

직렬적으로 실행함에 있어서 시간이 오래 소모된다는 단점과 함께

각 프로젝트마다 실행되어야 하는 Step들(lint, test 등)이 한 파일에 작성되어 개발자의 시인성을 해치는 문제점을 가지고 있었습니다.

> 단순히 반복되는 부분들이라면 [Reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)로 해결할 수도 있습니다.

## To Be - 병렬

CI 실행 시간과 시인성을 높이기 위해 각 프로젝트별로 yml 파일을 분리했습니다.

```yml
# .github/workflows/ci-a.yml
- name: Build A

# .github/workflows/ci-b.yml
- name: Build B

# .github/workflows/ci-c.yml
- name: Build C

# .github/workflows/ci-d.yml
- name: Build D

# .github/workflows/ci-e.yml
- name: Build E
```

이를 통해 기존 CI 실행 시간의 `절반` 수준으로 시간을 단축할 수 있었고, 

각 프로젝트에서 사용하는, 관심사가 같은 Step들이 모이게 되어 작성하는 개발자의 시인성을 높일 수 있었다고 생각합니다.

<br />

분리 이후 각 프로젝트에서 반복적으로 등장하는 Step들이 생겼지만

저희는 위에서 언급한 Reusable workflow를 이용해 해결하지 않았습니다.

반복되는 Step들의 코드 라인이 크지 않았고, 몇 단어만 개별화하면 되었기에 그 대신 `env` 를 이용해 각 프로젝트마다 바뀌는 command prefix, build path 등을 선언해 [WET](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself#WET)하게 대응했습니다.

> AHA하게 대응했다고 말하고 싶지만, 아직 개선 이후 큰 변화가 필요하진 않았어서 덕을 볼지 피를 볼지는 아직 미지수입니다. 😅

## As Is - 변경 지점에 무심

기존 직렬적으로 실행되던 CI도 그렇고, 위에서 개선한 병렬적으로 실행되는 CI도 마찬가지로 변경 지점에 무심하게 전부 실행됩니다.

```diff
프로젝트 A 변경 (의존 관계 없음)

+프로젝트 A CI 실행
-프로젝트 B CI 실행
-프로젝트 C CI 실행
-프로젝트 D CI 실행
-프로젝트 E CI 실행
```

모든 프로젝트의 CI 실행 시간이 비슷하다면, 개발자가 느끼는 시간에서는 단점을 느껴지지 않지만

금전(비즈니스)적으로 생각을 해봤을 때는 단점이 생깁니다.

![Github actions billing](https://github.com/hyesungoh/hyesungoh.xyz/assets/26461307/1ce9cda7-70cb-43f8-b19f-ad425301b7a0)

Github actions를 실행 시간에 따라 요금을 청구하기 때문입니다.

예를 들어 각 CI가 모두 3분씩 소모된다면, 위의 경우에서는 실행 환경에 따라 최소 0.096USD, 최대 3.84USD의 눈먼 금액이 지출됩니다.

## To Be - 변경이 일어난 부분만 실행

이를 해결하기 위해 저희는 [dorny/paths-filter](https://github.com/dorny/paths-filter) Github Action을 사용했습니다.

직관적으로 필터를 설정할 수 있고, 의존 관계를 나타내는 데에 쉬운 작성 방법을 제공한다고 판단해 사용하게 되었고 사용 방법은 다음과 같습니다.

```yml {12-18, 26-27} showLineNumbers
# 의존 관계가 없는 프로젝트
# .github/workflows/ci-a.yml

jobs:
  job_compute_diff:
    name: Compute file diff
    runs-on: ubuntu-latest
    steps:
      - name: Checkout current commit (${{ github.sha }})
        uses: actions/checkout@v3

      - name: Compute diff
        uses: dorny/paths-filter@v2
        id: compute_diff
        with:
          filters: |
            files:
              - 'packages/A/**'

    outputs:
      files: ${{ steps.compute_diff.outputs.files }}

  job_build:
    name: Build A
    runs-on: ubuntu-latest
    needs: [job_compute_diff]
    if: ${{ needs.job_compute_diff.outputs.files == 'true' }}
    steps:
      - name: ...
```

```yml {12-21, 29-30} showLineNumbers
# 의존 관계가 있는 프로젝트
# .github/workflows/ci-b.yml

jobs:
  job_compute_diff:
    name: Compute file diff
    runs-on: ubuntu-latest
    steps:
      - name: Checkout current commit (${{ github.sha }})
        uses: actions/checkout@v3

      - name: Compute diff
        uses: dorny/paths-filter@v2
        id: compute_diff
        with:
          # A, B, C 프로젝트에 변경이 일어날 때 B의 CI를 실행하기 위함
          filters: |
            files:
              - 'packages/A/**'
              - 'packages/B/**'
              - 'packages/C/**'

    outputs:
      files: ${{ steps.compute_diff.outputs.files }}

  job_build:
    name: Build A
    runs-on: ubuntu-latest
    needs: [job_compute_diff]
    if: ${{ needs.job_compute_diff.outputs.files == 'true' }}
    steps:
      - name: ...
```

이처럼 프로젝트별로 확인이 필요할 때만 CI가 실행되도록 구성하였고, 덕분에 개발자의 시간과 필요 없이 소모되는 금액을 줄일 수 있었습니다.

### 더 줄이려면?

본문의 주제와 벗어난 경험인 것 같아 깊게 다루진 않지만, 

CI가 트리거되는 type과 draft와 같은 상태를 확인해 정말 필요할 때만 자원을 사용하도록 구성할 수 있습니다.

* [on.<event_name>.types](https://docs.github.com/ko/github-ae@latest/actions/using-workflows/workflow-syntax-for-github-actions#onevent_nametypes)
* [Don't run actions on draft pull requests](https://github.com/orgs/community/discussions/25722)

## As Is - 라벨링

작성한 Pull Request가 모노레포의 어느 프로젝트를 변경한 것인지 직관적으로 나타내기 위해서 [actions/labeler](https://github.com/actions/labeler)를 이용해 다음과 같이 구성하고 있었습니다.

```yml
'area: A':
  - packages/A/**

'area: B':
  - packages/B/**

# ...
```

어느 프로젝트가 변경이 일어났는지 확인하는 용도로는 충분했지만, 

변경의 크기, 브랜치, PR의 제목 등에 따른 라벨링은 기능을 제공하고 있지 않습니다.

## To Be - 더욱 많은 정보를 라벨로 제공

actions/labeler와 다르게 위에서 언급한 기능을 포함하고 사용 방법이 비슷한 [srvaroa/labeler](https://github.com/srvaroa/labeler)를 사용해 더욱 많은 정보를 라벨링되도록 구성할 수 있었습니다.

### Title

저희는 PR의 제목에 P1 ~ P3를 접두어로 사용해 해당 PR의 우선순위를 나타내고 있습니다.

이를 더욱 시각적으로 나타내기 위해 라벨링을 다음과 같이 적용할 수 있었습니다.

```yml
  - label: 'P1 🔥'
    title: '^P1:.*'

  - label: 'P2'
    title: '^P2:.*'

  - label: 'P3'
    title: '^P3:.*'
```

### Diff

개발자가 PR을 보기 전에는 PR의 크기를 가늠할 수 없는데, 이는 리뷰에 대한 개발자의 부담을 늘린다고 생각했습니다.

변경이 작은 PR에 한해서 리뷰에 소모되는 부담을 줄이고 변경의 크기를 미리 계산해서 일과에 소모되는 컨텍스트 스위칭 비용을 줄이기 위해 PR의 Diff에 따른 라벨링도 다음과 같이 할 수 있었습니다.

```yml
  - label: "diff: XS"
    size:
        below: 50

  - label: "diff: S"
    size:
        above: 50
        below: 150

  - label: "diff: M"
    size:
        above: 150
        below: 250

  - label: "diff: L"
    size:
        above: 250
        below: 500

  - label: "diff: XL"
    size:
        above: 500
```

## 마치며

본문에서 다루었던 경험들을 통해 개발자의 비용을 줄이는 것과 함께 금전적인 비용까지 줄여볼 수 있었습니다.

금전적인 비용은 제 월급에서 빠져나가진 않아 깊게 체감되진 않지만 (농담) 개발자의 부담감을 줄이고 능률을 올렸다고는 체감하고 있습니다.

제 경험을 재료 삼아 더욱 개선된 환경에서 필요한 곳에만 비용을 집중해 재밌게 개발하는 분들이 많아지길 바라는 마음에 글을 마칩니다. 감사합니다.

## 부록 - 알아두면 좋을 것 같은 방법들

모노레포 환경에 한정되어 있진 않아 본문에서 다루진 않았지만, 공유하고 싶은 Github Actions 방법 혹은 문법이 몇 가지 존재합니다.

의존성 캐싱, 빌드 캐싱, Job needs 등 매우 간단하지만 효과가 뛰어난 것들인데요.

[오픈소스로 개발하고 있는 사이드 프로젝트](https://github.com/depromeet/na-lab-client/blob/main/.github/workflows/ci.yml)에서 몇 가지 적용하고 있어 궁금하시다면 참고가 될만할 것 같아 공유드립니다.
