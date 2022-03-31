---
title: 'React Typescript, Cannot find name MediaRecorder'
date: 2021-08-01 20:24:00
category: 'React'
draft: false
---

![errorImg](https://user-images.githubusercontent.com/25426534/67540808-660ecd80-f719-11e9-9602-075dea090e58.png)

> Cannot find name 'MediaRecorder'.

React, TypeScript 환경에서 녹화를 위해 `MediaRecorder` api를 사용하려 했으나 위 오류에 봉착

## 문제

사용중인 컴파일러가 `MediaRecorder` 오브젝트를 알지 못해서 생긴 오류라고 한다.

## 해결 방법

```bash
npm i @types/dom-mediacapture-record
# or yarn add
```

이 외에 tsconfig에서 해결하는 방법, declare하는 방법이 있다고 한다.

## 참고

https://stackoverflow.com/questions/40051818/how-can-i-use-a-mediarecorder-object-in-an-angular2-application
