---
title: 'axios와 fetch의 차이점'
date: 2021-02-09 20:24:00
category: 'JavaScript'
draft: false
---

## AJAX ?

###### Asynchronous Javascript And Xml

비동기적으로 클라이언트와 서버간 XML 데이터를 주고받는 기술

## XML ?

###### eXtensible Markup Language

HTML과 같은 마크업 언어, HTML은 데이터를 *표현*하는 데, XML은 데이터를 *전달*하는 데 초점이 맞춰짐

## Axios와 Fetch의 차이점

- #### Axios

  - HTTP 통신을 위한 JavaScript 라이브러리
  - 구형 브라우저를 지원
  - JSON 데이터의 자동 변환이 가능
  - node.JS에서 사용 가능
  - request aborting 가능
  - reponse timeout을 쉽게 설정 가능
  - catch 시, then을 실행하지 않고 에러 로그를 보여줌
  - CSRF 보호 기능이 내장
  - upload progress 지원

- #### Fetch
  - JavaScript 내장 라이브러리
  - 네트워크 에러 발생 시 기다려야함
    지원하지 않는 브라우저가 있음

## 왜 Axios가 인기가 많을까?

Fetch를 이용하여 Axios와 동일한 기능을 구현할 수는 있으나, Axios를 사용하여 해당 시간을 아껴 다른 곳에 투자하는 게 이득이라 생각된다.

> 참고 : [Ajax](https://dream-frontend.tistory.com/382), [axios](https://wonit.tistory.com/304), [XML](https://helloworld-88.tistory.com/67)
