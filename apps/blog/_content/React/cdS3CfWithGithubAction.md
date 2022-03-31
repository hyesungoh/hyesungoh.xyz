---
title: 'React AWS S3, Cloudfront 배포자동화 w/ github actions'
date: 2021-10-02 20:24:00
category: 'React'
draft: false
---

React (CRA) 프로젝트를 AWS S3에 배포하고 Cloudfront를 이용해 CDN에 올려두었습니다.

개발자가 특정 상황에 `package.json`에 스크립트를 작성하여 배포할 수도 있지만,

`Netlify`를 통해 맛본 배포자동화의 맛을 잊지 못해 `Github Actions`을 이용하여 배포자동화 환경을 구성한 결과물을 공유하고자 합니다.

## 결과물

```yml
# .github/workflows/깃헙액션이름.yml

name: deploy-on-s3

on:
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-18.04
    env:
      AWS_S3_BUCKET_NAME: wavy-client
      AWS_CF_DISTRIBUTION_ID: E21LSR6NXBZR13
      AWS_REGION: ap-northeast-2

    steps:
      - name: Checkout master # branch checkout
        uses: actions/checkout@master

      - name: Cache node modules # node modules 캐싱
        uses: actions/cache@v1
        with:
          path: node_modules
          key: ${{ runner.OS }}-build-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.OS }}-build-
            ${{ runner.OS }}-

      - name: Generate environment variables # 환경변수 설정
        run: |
          echo "REACT_APP_API_URL=$REACT_APP_API_URL" >> .env.production
          echo "REACT_APP_GA_TRACKING_ID=$REACT_APP_GA_TRACKING_ID" >> .env.production
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
          REACT_APP_GA_TRACKING_ID: ${{ secrets.REACT_APP_GA_TRACKING_ID }}

      - name: Install Dependencies # dependency 설치
        run: npm install

      - name: Build Application # build
        run: npm run build

      - name: Configure AWS credentials # AWS 계정 설정
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3 # s3 배포
        run: |
          aws s3 cp \
            --recursive \
            --region ${{ env.AWS_REGION }} \
            build s3://${{ env.AWS_S3_BUCKET_NAME }}

      - name: CloudFront Invalidate # Cloud cache invalidate
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.AWS_CF_DISTRIBUTION_ID }} \
            --paths "/*"
```

## Github Action Trigger

```yml
on:
  push:
    branches:
      - master # master branch에 push 됐을 때 트리거
```

`master branch`에 `push`가 일어났을 때 Trigger를 설정하는 부분입니다.

`push` 외, `pull request`, `schedule` 등의 방법이 있습니다.

외의 방법은 [해당 문서](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows)를 참고하면 좋을 것 같습니다.

## 환경 구성

```yml
jobs:
  deploy:
    runs-on: ubuntu-18.04
    env:
      AWS_S3_BUCKET_NAME: 본인S3버킷이름
      AWS_CF_DISTRIBUTION_ID: 본인CloudfrontID
      AWS_REGION: 본인S3리전이름
```

실행 환경과 환경 변수 설정에 대한 부분입니다.

환경 변수의 경우 하단에 `${{ env.foo }}`와 같이 사용 가능하여 구성해 두었습니다.

## Checkout, Cashing

```yml
steps:
  - name: Checkout master # branch checkout
    uses: actions/checkout@master

  - name: Cache node modules # node modules 캐싱
    uses: actions/cache@v1
    with:
      path: node_modules
      key: ${{ runner.OS }}-build-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.OS }}-build-
        ${{ runner.OS }}-
```

`steps`는 순차적으로 이루어지는 task들 입니다.

> jobs.<job_id>.steps 의 형태로 이루어지며, 저는 위 환경 구성 부분에서 deploy라는 이름을 사용하였습니다.

1. master 브랜치로 이동
2. node modules 캐싱
3. dependency 설치
4. React build

위 순서대로 실행되도록 작성한 것 입니다.

`node modules 캐싱`의 경우 dependency들이 많을수록 설치에 걸리는 시간을 단축시켜주는 이유로 적용하였습니다.

reference로는 [Github Actions의 cache repo](https://github.com/actions/cache)를 참고하시면 좋을 것 같습니다.

## Env

저는 유출되면 안되는 것들을 `.env` 파일을 이용해 관리하곤 합니다.

당연히 gitignore를 활용해 github에는 올려두지 않아, 해당 파일의 내용을 사용하기 위해서는 `배포 단계에서 생성`이 필요합니다.

```yml
- name: Generate environment variables # 환경변수 설정
  run: |
    echo "REACT_APP_API_URL=$REACT_APP_API_URL" >> .env.production
    echo "REACT_APP_GA_TRACKING_ID=$REACT_APP_GA_TRACKING_ID" >> .env.production
  env:
    REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
    REACT_APP_GA_TRACKING_ID: ${{ secrets.REACT_APP_GA_TRACKING_ID }}
```

`echo` 명령을 사용하여 새로운 파일을 생성, 추가합니다.

이 때 .env에 작성된 내용을 `github secrets`을 이용해 관리합니다.

github secrets에 관한 내용은 아래에서 자세히 다루도록 하겠습니다.

## Install, Build

그 다음으로 필요한 패키지 설치, build를 진행합니다.

```yml
- name: Install Dependencies # dependency 설치
  run: npm install

- name: Build Application # build
  run: npm run build
```

## AWS 계정 설정

```yml
- name: Configure AWS credentials # AWS 계정 설정
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```

위 문단의 4개의 step 중, 위 2개는 `uses` 키워드를 보실 수 있습니다.

해당 구문은 이미 작성된 `action`을 본인이 작성한 job에 추가하는 것입니다.

AWS 계정 설정 또한 `aws-actions/configure-aws-credentials@v1` action을 이용합니다.

## S3 배포

```yml
- name: Deploy to S3 # s3 배포
  run: |
    aws s3 cp \
      --recursive \
      --region ${{ env.AWS_REGION }} \
      build s3://${{ env.AWS_S3_BUCKET_NAME }}
```

본인이 미리 생성한 `S3 bucket`에 배포하는 동작입니다.

`aws` 커맨드를 미리 작성해둔 환경 변수를 활용하여 작성하였습니다.

## Cloudfront cache Invalidation

```yml
- name: CloudFront Invalidate # Cloud cache invalidate
  run: |
    aws cloudfront create-invalidation \
      --distribution-id ${{ env.AWS_CF_DISTRIBUTION_ID }} \
      --paths "/*"
```

S3에 배포된 파일이 업데이트 되었으니, CDN에 퍼져있는 파일들을 새로고침하기 위해 제거처리하는 동작입니다.

마찬가지로 환경 변수, aws 커맨드를 이용합니다.

## Github Secrets 설정

![Github Secrets 설정](https://user-images.githubusercontent.com/26461307/135655395-052f934d-fb52-453b-bae0-472650b6c501.png)

위에서 사용한 `${{ secrets.~~~ }}`의 경우 github repo에서 설정을 통해 추가 가능합니다.

repo의 settings 탭을 누른 후,

사진의 왼쪽 하단 `Secrets` 클릭 후 새로운 `repository secret`을 생성해주시면 됩니다.

위 예제에서의 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`와 `.env`에서 사용한 값들을 적어주었습니다.

> AWS 값들의 IAM은 S3, Cloudfront에 대한 권한이 있어야 합니다.

## 적용 모습

![result](https://user-images.githubusercontent.com/26461307/135655404-14d8f75a-d93c-4d68-acb6-2a987b4eea3d.png)

Master branch에 push 후 자동적으로 S3 배포, Cloudfront invalidate까지 수행된 모습입니다.

## 마치며

여러 문서, 블로그 등을 참고하여 최대한 가독성이 좋게 나타내고자 추합한 결과물입니다.

많은 분들에게 도움이 되길 바라며, 마지막으로 참고한 블로그 게시물들과 함께 제가 배포할 때 상당한 도움이 된 벨로퍼트님의 AWS S3, Cloudfront 배포 게시글까지 첨부하겠습니다. 감사합니다.

> https://react-etc.vlpt.us/08.deploy-s3.html

> https://medium.com/@schmidphilipp1995/set-up-a-ci-cd-pipeline-for-your-webapp-on-aws-with-github-actions-within-5-minutes-810b10749833

> https://sustainable-dev.tistory.com/160

> https://velog.io/@loakick/Github-Action-AWS-S3%EC%97%90-React-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0
