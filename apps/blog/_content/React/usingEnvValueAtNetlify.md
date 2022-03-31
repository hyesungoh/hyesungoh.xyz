---
title: 'React에서 Netlify Environment Variables (환경 변수) 사용하는 방법'
date: 2021-04-28 20:24:00
category: 'React'
draft: false
---

Firebase를 이용한 CRA 앱을 Netlify를 통해 배포했으나,
배포 환경에서 dotenv와 gitignore를 사용한 config 파일을 이용한 환경변수가 undefined로
작성되어 Firebase instance 생성이 안되는 오류에 봉착하였습니다.

해당 오류를 고치며 배운 Netlify의 환경 변수를 사용하는 법을 공유해봅니다.

## 1. Netlify 환경변수 생성

![스크린샷 2021-04-28 오후 9 33 58](https://user-images.githubusercontent.com/26461307/116404569-bbc1ba00-a869-11eb-90c7-47e44cde5798.png)

Netlify Site settings > Build & deploy > Environment의 **Environment variables**를 생성해줍니다.

## 2. scripts/create-env.js 생성

Root 디렉토리에 scripts 폴더, create-env.js 파일을 생성합니다.

```js
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

fs.writeFileSync(
  './.env',
  `REACT_APP_APIKEY=${process.env.REACT_APP_APIKEY}
REACT_APP_SOMETHINGYOUWANT=${process.env.REACT_APP_SOMETHINGYOUWANT}
SOMETHING_YOU_WANT=${process.env.SOMETHING_YOU_WANT}
...`
);
```

그 후 해당 파일을 위와 같이 작성합니다.

Netlify에서 생성한 환경 변수와 이름이 동일해야 합니다.

## 3. build command 추가

Netlify에서 build 시에 위에서 작성한 스크립트를 먼저 실행하여야 합니다.

이는 여러가지 방법으로 접근할 수 있습니다.

1. Netlify build command 설정

```terminal
node ./scripts/create-env.js && npm run build
```

2. Root 디렉토리에 netlify.toml 파일 배치

```toml
[build]
  command = "node ./scripts/create-env.js && npm run build"
  publish = "build"

[context.production.environment]
  TOML_ENV_VAR = "From netlify.toml"
  REACT_APP_TOML_ENV_VAR = "From netlify.toml (REACT_APP_)"
```

3. package.json의 prebuild 작성

```json
...
"scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "prebuild": "node ./scripts/create-env.js",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
    },
...
```

## 4. React에서 사용

dotenv와 같은 방법으로 사용하면 됩니다.

```ts
process.env.REACT_APP_APIKEY
process.env.SOMETHING_YOU_WANT
```

빌드 시에 netlify에 작성된 환경 변수를 사용하여 .env 파일이 작성되고, 해당 파일에 작성된 내용을 사용하는 것이기 때문에 로컬에서의 사용은 아래와 같은 방법으로 하였습니다.

```ts
// for local
import { firebaseConfig } from 'config/config'

// for deploy
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_APIKEY,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID,
// }
```
