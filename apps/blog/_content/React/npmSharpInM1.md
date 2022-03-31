---
title: 'M1 Mac sharp 설치 오류'
date: 2021-07-18 20:24:00
category: 'React'
draft: false
---

> 블로그 테마에서 `Sharp` 라이브러리가 설치되지 않는 오류에 봉착

## 문제

arm64 아키텍처에서 `Sharp` 라이브러리가 컴파일되지 않는다고 합니다.

[이슈](https://github.com/lovell/sharp/issues/2460)

## 해결 방법

```bash
brew install vips # 시간이 꽤 걸립니다
npm i --unsafe-perm
```
