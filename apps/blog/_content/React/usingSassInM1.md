---
title: 'M1 Mac node-sass 오류'
date: 2021-06-22 20:24:00
category: 'React'
draft: false
---

> TypeError: Node Sass does not yet support your current environment: OSX Unsupported architecture (arm64) with Unsupported runtime (93)

## 문제

M1 Mac에서는 node-sass 보다 `Dart sass`를 사용하는 것을 권장한다고 합니다

## 해결 방법

```bash
npm i sass --save-dev
# or
yarn add sass -D
```
