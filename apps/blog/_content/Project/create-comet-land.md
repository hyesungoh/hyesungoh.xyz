---
title: '[create-comet-land] 첫 NPM 패키지 개발기'
subtitle: 'Comet-land 프로젝트 생성을 위한 CLI 앱을 ink와 함께 개발했던 경험을 공유합니다.'
date: 2022-07-04 00:02:00
category: 'Project'
---

![첫 NPM 패키지 개발기](https://user-images.githubusercontent.com/26461307/182628694-58821332-6bfe-4541-8612-8e1f2bec7a71.png)

![create-comet-land gif](https://user-images.githubusercontent.com/26461307/174654540-4f2ab425-8d94-40b0-aa0d-89ddd026c1f9.gif)

블로그와 이력서 템플릿인 [Comet-land](https://github.com/hyesungoh/comet-land)를 가장 쉽게 시작할 수 있는 CLI 앱인 [create-comet-land](https://github.com/hyesungoh/create-comet-land)를 개발하며 겪은 과정을 공유합니다.

## 개발하게된 이유

프론트엔드 어플리케이션을 개발해보신 많은 분들이 react 앱을 개발하기 위해 `create-react-app`을, Next.js 앱을 위해 `create-next-app`을, 그리고 gatsby 진형의 블로그를 시작하기 위해 gatsby CLI 도구를 이용해보셨을 거라 생각합니다.

제가 개발한 comet-land 또한 전용 CLI 도구를 통해 쉽고 간편하게 시작할 수 있는 환경을 구성하고 싶었습니다.

무엇보다 만드는 건 쉽지만, 다른 사람들이 사용하게 만드는 것이 훨씬 어렵다는 것을 깨달았기 때문에 새로운 사용자에 대한 진입장벽을 최대한 낮추고 싶었습니다.

> Rust 코어팀의 Steve Klabnik의 "프로그래밍 언어를 만드는 건 쉽지만 사람들이 그 언어를 쓰게 만드는 건 훨씬, 훨씬 어렵다"[^1]는 말이 실감되었습니다.

[^1]: [해당 발표](https://www.youtube.com/watch?v=dJAEWhR83Ug)에서 알게 되었으며 [원문 링크](https://steveklabnik.com/writing/the-language-strangeness-budget)는 다음과 같습니다.

## 무슨 도구를 이용할까

CLI 어플리케이션은 [Python을 이용해 백준 자동 채점 프로그램](https://github.com/hyesungoh/BOJ_grading_automation) 등, 저 자신만을 위해서는 개발해보았지만 다른 사용자를 위해 개발해본 적은 처음이였습니다.

그렇기 때문에 도구를 선택하는 데에도 많은 고민이 있었는데요.
새로 배워보고 싶은 Rust나 Golang으로 개발할까도 고민하였고, 익숙한 Python이나 Nodejs로 빠르게 개발할까도 고민하였습니다.

많은 고민을 한 결과 React 기반의 CLI 어플리케이션 빌드 도구인 `Ink`를 사용하기로 마음을 먹었고 이유는 다음과 같습니다.

1. 동적이고 아름다운 CLI 어플리케이션이 되길 바랬습니다.
2. 유지보수가 용이하길 바랬습니다.
3. Comet-land와 비슷한 스펙을 가져가 형제 프로젝트간 통일감을 구성하고 싶었습니다.

물론 다른 언어 그리고 도구들을 선택해도 유지보수에 용이하게 구성할 수 있으며 아름답게 보일 수도 있겠지만, 가장 빠르고 쉽게 그리고 아름답게 개발하는데 최적의 도구라 생각하여 선택하게 되었습니다.

![ink spinner](https://github.com/vadimdemedes/ink-spinner/raw/master/media/demo.gif)

_출처 : https://github.com/vadimdemedes/ink-spinner_

그 이유 중 하나인 프로젝트가 하나 있는데, `ink-spinner`란 프로젝트로 위와 같은 로딩 스피너를 단순히 한 개의 리액트 컴포넌트를 사용하면 구현할 수 있는 것에 매료되었습니다.

## 어떻게 개발할까

리액트에 관한 경험은 있었지만, Ink에 대한 경험은 전무하였기 때문에 [해당 Repo](https://github.com/hyesungoh/learningWhatIWant/tree/master/Ink)에서 기본적인 사용 방법을 익힌 후

[`create-ink-app`](https://github.com/vadimdemedes/create-ink-app)을 이용해 타입스크립트 기반으로 프로젝트를 생성하고 타당한 이유가 존재하는 의존성만을 남겨 프로젝트를 스캐폴딩하였습니다.

> 제거한 의존성으로 linter 도구인 'xo', Nodejs test를 위한 'ava', Test에서 색상 확인을 위해 사용되는 'chalk'가 있습니다. 제거 후 eslint와 prettier를 사용해 lint 환경을 구성하였으며 간단한 CLI 어플리케이션이기 때문에 테스트 코드가 필요하지 않을 것이라 판단하였습니다.

프로젝트 스캐폴딩과 출력에 대한 부분은 어렵지 않아, 쉽게 구현할 수 있었지만 가장 고민이 되는 구현부가 2가지 존재하였습니다.

### Comet-land 생성

첫 번째로 `Comet-land` 프로젝트를 어떻게 생성할 지 였습니다.

프로젝트 스캐폴딩에 사용하였던 `create-ink-app`의 경우, 보일러 플레이트가 프로젝트 안에 존재해 해당 디렉토리를 복사하는 형식으로 구현되어 있었으나 `Comet-land`의 경우 2개의 어플리케이션을 다루는 하나의 프로젝트라 파일이 많이 존재하고, 앞으로 수정될 부분이 많을 것이라 예상하였기 지속적으로 최신화를 해줘야하기 때문에 적합한 방법이라고 생각되진 않았습니다.

> `create-comet-land`를 모노레포 안에 작성하면 적합할 수 있는 방법이라고 생각되었으나, 이 프로젝트 또한 하나의 오픈소스로써 유지되길 바래 1개의 프로젝트 규모가 커지는 것보다 분리하는 것이 많은 관심과 기여자를 모집할 수 있는 방법이라 생각하였습니다.

고민한 결과, **많은 파일을 빠르게 내려받을 수 있고**, **지속적으로 최신화가 보장**되는 방법인 `git clone`을 활용하기로 하였습니다.

조사한 결과 `shelljs`를 이용해 git 설치 유무를 확인하고 커맨드를 실행할 수 있는 것으로 파악하여 아래와 같은 모습으로 개발할 수 있었습니다.

```tsx
import shell from 'shelljs';

// git 설치 확인
if (shell.which('git')) {
}

// git clone
shell.exec(`git clone ${REPO_URL}`, { silent: true }, () => {
  setIsLoading(false);
});
```

_전체 코드는 [다음 링크](https://github.com/hyesungoh/create-comet-land/tree/main/source)에서 확인하실 수 있습니다._

### 설정 파일 수정

마지막으로 고민되는 부분은 clone 이후 `설정 파일을 어떻게 수정`할 지 였습니다.

사용자에게 블로그 이름, 사용자 이름과 같은 정보를 입력받은 후 프로젝트에 적용하는 방법이 직접 설정 파일을 찾아 수정하는 것에 비해 더욱 편하게 프로젝트를 시작할 수 있을 것이라 판단하여 꼭 구현하고자 했습니다.

또한 이 구현부가 앞으로 유지보수가 가장 많이될 부분이라 생각해, 최대한 확인하고 수정하기 쉽게 구현하고자 했습니다.

고민한 결과, `질문`, `수정되어야 하는 파일 디렉토리`, `수정되어야 하는 파일의 줄` 등으로 이루어져 있는 오브젝트 배열을 이용해 구현하였고 이를 통해 `수정되어야 하는 부분들`과 `수정을 구현하는 부분`이 `분리`되어 유지보수가 쉬운 구조가 되었다고 생각합니다.

```tsx
import fs from 'fs';
import TextInput from 'ink-text-input';

...
const configurations: IConfiguration[] = [
  {
    question: 'What is your name?',
    description: 'it will be display at footer',
    directory: '/packages/core/constants/General/index.ts',
    line: 4,
    callback: (value: string) => {
      return `export const authorName = '${value}';`;
    },
  },
  {
    question: 'What is your blog name?',
    description: 'it will be display at blog header',
    directory: '/apps/blog/_config/index.json',
    line: 2,
    callback: (value: string) => {
      return `  "blogName": "${value}",`;
    },
  },
  ...
];

export default function Configuration() {
  ...

  function getReplacedFile(value: string, filePath: string) {
    const { line, callback } = configurations[index];
    const beforeFile = fs.readFileSync(filePath, 'utf-8').split('\n');
    beforeFile[line - 1] = callback(value);
    const replacedFile = beforeFile.join('\n');
    return replacedFile;
  }

  function replaceFile(value: string) {
    const { directory } = configurations[index];
    const filePath = `${DIRNAME}${directory}`;
    const replacedFile = getReplacedFile(value, filePath);

    fs.writeFileSync(filePath, replacedFile, { encoding: 'utf-8' });
  }

  function onSubmit(value: string) {
    replaceFile(value);
    clearEachValue();
    setIndex(prev => prev + 1);
  }

...
return (
  <TextInput value={eachValue} onChange={setEachValue} onSubmit={onSubmit} />
)

}
```

_전체 코드는 [다음 링크](https://github.com/hyesungoh/create-comet-land/blob/639acce08f8ddc762b3167582fa879450f248111/source/4_Configuration.tsx)에서 확인하실 수 있습니다._

## v1.0.x 배포 그리고 자동화

![스크린샷 2022-07-04 오후 10 12 18](https://user-images.githubusercontent.com/26461307/177161947-852ec9ee-b24d-4e25-b348-1c094b4563f4.png)

이렇게 고민이 되었던 부분들을 구현한 후에 NPM에 배포하였는데요.

이전에 만들어두었던 NPM 계정이 있어 배포는 어렵지 않았습니다.

![스크린샷 2022-07-04 오후 10 15 13](https://user-images.githubusercontent.com/26461307/177162445-472b43e4-fea1-4f63-8c90-651e1c8e2e20.png)

이렇게 첫 번째 NPM 패키지를 배포하고나니 깃허브에 항상 비어있었던 `Packages` 부분을 채울 수 있지 않을까? 생각하게 되었고, 이를 검색하다보니 자연스럽게 `Github actions` 공식 문서로 향해있었습니다.

공식 문서를 조금 읽어보니, github에 새로운 release로 trigger되어 배포되는 것도 구축할 수 있는 것을 알게 되었습니다.

이는 앞으로 프로젝트를 유지하는데에 굉장히 편한 기능이 될 것이라 생각됨과 동시에 어려워보이지 않아 금방 구현할 수 있었습니다.

```yml
name: Publish Package to npmjs
on:
  release:
    types: [created]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Github packages

저는 이전까지는 github packages가 단순히 NPM, RubyGems 등의 패키지 매니저에 배포하게 되면 적용되는 뱃지 정도로 알고 있었습니다.

하지만 github actions을 통해 배포해보아도 적용되지 않아 알아보니, 깃허브 repo와 매칭이 되어야하고 이는 사용자 혹은 org의 이름이 앞에 붙어야 되는 것을 알게 되었습니다.

> 이를 CD 환경에서 테스트하느라 오랜 시간을 들여 알게 되었습니다 ...

![스크린샷 2022-07-04 오후 10 37 10](https://user-images.githubusercontent.com/26461307/177166166-f56c01b0-bce9-4dbd-956c-a57a4391823e.png)

결국에 github packages로도 성공적으로 배포 할 수 있었지만, 사용자가 입력하기에 `npx @hyesungoh/create-comet-land`는 `npx create-comet-land`보다 상대적으로 거부감이 들 것 같아 NPM만을 이용해 배포하는 방법으로 회귀하였습니다.

## v1.1.x, 빌드 환경 설정

이전 `v1.0.x`에서는 오직 타입스크립트 컴파일러만을 이용해 빌드되고 있었습니다.

그렇기 때문에 각각 컴파일되는 파일들을 `package.json`의 `files`에 작성해야 어플리케이션이 원활히 실행됐었습니다.

```json
"files": [
  "dist/cli.js",
  "dist/App.js",
  "dist/1_Check_Github.js",
  "dist/2_Clone_Project.js",
  "dist/3_Configuration.js",
  "dist/4_More_Information.js"
],
```

이는 유지보수에 굉장히 안좋은 영향을 끼칠 수 밖에 없다고 판단하여 번들링을 하기로 마음을 먹게 되었습니다.

번들러로써 사용해본 경험이 있는 `webpack`과 zero configuration을 자랑하는 `parcel`가 고민되었지만 아래 지표를 참고하여 조금 보수적으로 `webpack`을 선택하였습니다.

![스크린샷 2022-07-04 오후 10 46 42](https://user-images.githubusercontent.com/26461307/177167794-afbb16f9-b993-4e70-ba3f-8201967492a9.png)

> parcel의 경우 도입하게되면 굉장히 편하게 사용할 수 있을 것 같다고 판단하였으나, 조금 더 표준이 되는 기술에 익숙해지는 것이 제 자신에게 투자하는 효용성이 더 높지 않을까 생각한 이유가 제일 클 것 같습니다.

## 그러나...

Webpack을 이용해 빌드 환경을 설정한 후에 배포해보니 아래 이미지와 같은 오류가 반겨줬습니다.

![스크린샷 2022-07-04 오후 8 38 35](https://user-images.githubusercontent.com/26461307/177170028-21556e75-bfed-4400-93c3-67d0d176f823.png)

```bash
line 1: syntax error near unexpected token 'function'
line 1: '/******/' ...
```

이전에 타입스크립트 컴파일된 결과물은 실행이 잘되었기 때문에, 당연히 webpack의 설정 문제인 줄 알았습니다.

그렇기 때문에 [빌드 결과물에 ES 기능 제한하는 방법](https://webpack.kr/configuration/output/#outputenvironment)부터 [의존성 포함하지 않는 방법](https://github.com/hyesungoh/learningWhatIWant/issues/10)등 다양하게 발굴해보았지만 모두 실패하곤 했습니다.

Webpack 설정에는 문제가 없다고 생각한 후 이전 타입스크립트가 컴파일된 결과물과 비교를 해보는 방법으로 문제를 찾아보고자 하였고 [다음과 같은 줄](https://github.com/hyesungoh/create-comet-land/blob/094df40223bb9fbf55ef540f04e4c5ea06ff2521/dist/cli.js#L1)을 확인할 수 있었습니다.

```js
#!/usr/bin/env node
```

이를 검색해보니 [NPM 공식 문서](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin)로 연결되었으며, 공식 문서에는 다음과 같이 설명하고 있었습니다.

```text
Please make sure that your file(s) referenced in bin starts with #!/usr/bin/env node,
otherwise the scripts are started without the node executable!
```

package.json의 `bin`이 참조하는 파일은 문제가 되었던 저 구문으로 시작해야 노드 실행환경으로 실행된다고 기술되어 있었습니다.

Webpack을 적용하며 output 파일을 `bin`에 설정하긴 했으나, 공식 문서를 유심히 확인하지 않은 잘못으로 많은 시간을 들여 배울 수 있었던 경험이였습니다.

> 지금 생각해보니 로컬에서 직접 `node` 명령어를 이용해 빌드된 파일을 실행할 땐 됐었는데, 배포된 패키지만 안된다는 것으로 파악을 할 수 있었을 거 같네요. ㅠ

```js
const webpack = require('webpack');

module.exports = {
  ...
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
  ...
};

```

빌드되는 파일의 최상단에 구문을 추가하는 방법은 간단히 Webpack의 `BannerPlugin`을 이용해 적용할 수 있었고, 이를 적용하니 원활히 동작하였습니다.

## 마치며

처음으로 패키지 매니저에 배포를 해보며 github actions을 조금 더 다채롭게 사용해보고, Webpack, Nodejs 환경 그리고 게시물에 언급하진 않았지만 tsconfig와 살짝 더 친해질 수 있었던 경험이였던 것 같습니다.

공식 문서의 다양한 API들은 확실히 알면 도움이 되는 것을 알고 있었지만, 유심히 읽지 않았던 제 자신을 반성하게 해줄 수 있었던 경험까지 얻을 수 있었어서 더욱 보람찬 개발 기간으로 느껴집니다.

앞으로는 사용자 인터뷰를 통해 추가적으로 CLI에서 설정했으면 좋을 부분, Comet-land에서 더욱 설정을 쉽게할 수 있는 방법등을 찾아 업데이트하는 방식으로 해당 프로젝트를 운영할 것 같습니다.

두서없는 글 읽어주셔서 감사드리며, 프로젝트에 관심이 생기셨으면 아래 링크 확인 부탁드리겠습니다. 감사합니다.

- [Comet-land 깃허브](https://github.com/hyesungoh/comet-land)
- [create-comet-land 깃허브](https://github.com/hyesungoh/create-comet-land)
- [Comet-land 블로그 데모](https://comet-land-blog.vercel.app/)
- [Comet-land 이력서 데모](https://comet-land-resume.vercel.app/)
