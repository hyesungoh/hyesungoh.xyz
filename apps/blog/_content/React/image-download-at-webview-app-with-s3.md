---
title: 'Webview app에서 이미지 저장 기능 개발기 w/ AWS s3'
subtitle: '웹뷰 앱에서 이미지 저장 기능을 개발하며 겪은 과정을 공유합니다.'
date: 2022-07-24 00:02:00
category: 'React'
---

![webview app에서 이미지 저장 기능 개발기](https://user-images.githubusercontent.com/26461307/182628549-0f261753-7f94-480b-a9e1-0d0b2f3135d3.png)

안녕하세요.

Webview 기반의 App 서비스에서 이미지 저장 기능을 개발하며 겪었던 과정들을 공유해, 비슷한 문제로 고생하시고 계시는 분들에게 도움이 되고자 개발기를 적어봅니다.

## 개발하게된 배경

['디프만'](https://www.depromeet.com/) 활동에서 개발, 운영하고 있는 ['영감탱'](https://www.notion.so/c363eee70970491f84d7d1f47c22e992) 서비스에 제목의 기능을 개발하게 되었는데요.

기능 기획의 발단은 다음 사진에서 시작하게 되었어요.

![hotjar 컨텐츠 보기 히트맵](https://user-images.githubusercontent.com/26461307/181039126-0151cbd5-d137-424a-bf4b-b9f131bccbfa.png)

recording 기능을 이용한 사용자 행동 파악 및 heat map을 이유로 부착하고 있던 hotjar에서 위 이미지와 같은 지표를 얻게 된 것인데요.

여러 가지 영감을 저장하고 보여주는 서비스이다 보니, 다른 서비스에서 제공하고 있는 **이미지 클릭 시 전체보기가 되며, 저장이 가능한** 행동을 사용자가 예상하고 있는 것으로 파악했어요.

이렇게 작은 근거로 시작한 가설을 배경으로 해당 기능을 개발하기로 하였고 제가 맡게 되었어요.

## 첫 번째 접근

'영감탱'은 휴대폰 애플리케이션으로써, Next.js로 구성된 Web 애플리케이션을 React-native webview로 서빙하고 있어요.

Webview 프로젝트는 이전에 간단하게 환경 구성만 해본 경험이 전부여서, 첫 번째 접근은 매우 간단하게 생각하고 말았어요.

처음으로 생각한 방법은 <strong>"웹에서 저장이 되면 알아서 되려나?"</strong> 인데요.

큰 리소스가 소모되진 않을 것으로 판단해, 먼저 개발해 본 후 직접 확인을 해보자고 생각했어요.

### 이미지 다운로드 at Web

다운로드해야 될 이미지는 `AWS S3`의 URL로 제공되고 있었어요. 이를 다운로드하기 위해 S3의 cors 세팅을 해준 후 다음과 같은 순서로 적용해 나갔어요.

1. S3 URL에 `fetch`
2. fetch된 response(이미지)를 `blob화`
3. blob화된 이미지를 `URL.createObjectURL`을 이용해 참조 URL을 만든 후
4. `createElement`로 생성한 `a` 태그를 `download` 옵션과 함께 클릭
5. 저장 완료

이전에 비슷하게 구현한 경험이 있어서, 빠르게 구현할 수 있었지만 문제는 어김없이 찾아왔어요.

![첫 번째 구현 에러](https://user-images.githubusercontent.com/26461307/181049113-abd68780-826a-4b65-8182-565dec9c7212.png)

문제는 앱 내에서 저장하기 버튼을 눌렀을 때 동작하지 않는 것이었어요.

방향을 잃어 팀원분들에게 도움을 요청했었는데, CORS 에러가 뜬다는 답변을 받게 되었어요.

분명히 `AWS S3`의 CORS 설정을 하였고, 로컬에서 CORS 에러가 뜨지 않아 의아했는데 문제는 **브라우저**에 있었어요.

## AWS S3 CORS

![AWS S3 CORS 정책](https://user-images.githubusercontent.com/26461307/181049848-be850090-e2dc-4a17-ad9a-43e9bf031c7d.png)

<small>출처: [AWS S3 사용 설명서](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/cors.html)</small>

AWS S3의 경우 요청 헤더에 `Origin`이 포함되어 있어야, 응답 헤더에 `Access-Control-Allow-Origin`을 담아 응답을 해주는데,

제가 사용하는 Firefox 브라우저는 `Origin`이 요청 헤더에 담기나, 다른 브라우저(Chrome, Safari)의 경우 Origin 담기지 않아 발생한 이슈였어요.

## HTTP Origin header

확인해 본 결과 Chrome에서 `Origin`이 요청 헤더에 포함되지 않은 이유는 다음과 같아요.

```html
<img src="저장할_이미지_URL" />
```

우선 사용자는 이미 위와 같은 `img` 태그에서 저장할 이미지를 요청한 경험이 있어요.

![이미지 요청 시 no-cors](https://user-images.githubusercontent.com/26461307/181074343-e11a21f1-de16-4a2a-8f32-ef7793d7b21d.png)

<small>출처: [When do browsers send the Origin header - stackoverflow](https://stackoverflow.com/questions/42239643/when-do-browsers-send-the-origin-header-when-do-browsers-set-the-origin-to-null)</small>

![mdn img crossorigin](https://user-images.githubusercontent.com/26461307/181082288-92c73ccd-9f78-4dc9-82b7-94f878b9f5d2.png)

<small>출처: [MDN HTML img](https://developer.mozilla.org/ko/docs/Web/HTML/Element/img#attr-crossorigin)</small>

이때 이미지, 스타일시트와 같은 미디어 요소들은 `no-cors (anonymous)` 모드로 동작하고, no-cors로 요청한 값을 `Cache-Control`에 캐싱해요.

> no-cors 모드에서는 Accept, Accept-Language, Content-Language 등 제한된 헤더만 포함될 수 있으며, 자바스크립트가 결과 응답에 접근할 수 없는 특징을 가지고 있어요. 자세한 정보는 [다음 MDN 링크](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode#value)를 확인하시면 좋을 것 같아요.
>
> 언제 Origin이 서빙되는지는 [다음 mozilla wiki](https://wiki.mozilla.org/Security/Origin)에서 확인하실 수 있어요.

그 후에 사용자가 `저장 버튼`을 누르게 되면 CORS 요청이 들어가게 되는데, **응답 값은 캐싱된 것에서 오기 때문에** CORS 확인에 실패하게 돼요.

![왜 Firefox는 성공했냐](https://user-images.githubusercontent.com/26461307/181085291-73ba974b-cc44-4725-a03d-159e709e17ea.png)

<small>출처: [Caching effect on CORS stackoverflow](https://stackoverflow.com/questions/44800431/caching-effect-on-cors-no-access-control-allow-origin-header-is-present-on-th)</small>

그렇다면 왜 firefox는 요청 헤더에 Origin이 담겼을까요?

이를 확인하기 위해 여러 방면으로 검색을 해보았으나, 관련된 답글은 위 스택오버플로우 게시물 밖에 찾을 수 없었어요.

한 답변에서 크롬은 자격 증명 모드를 캐싱 키의 일부로 사용하고 있다고 해요. 그렇기 때문에 자격 증명이 없는 모드 (제 상황을 예로 들면 저장 버튼을 눌렀을 때) 자격 증명과 함께 보낸 요청과 캐싱이 적중하지 않아야 동작하는 것으로 파악을 했어요.

하지만 Firefox는 Chrome처럼 동작하지 않다고 기술되어 있으니, 유추해보기론 자격 증명 모드를 캐싱 키의 일부로 사용하지 않는 다른 캐싱 로직이 있거나, 자격 증명과 비자격 증명을 따로 구분해 캐싱하는 등의 방법으로 구현되어 있는 것 같아요.

> 왜 Firefox는 동작했는지 알고 계시는 분은 댓글 혹은 이메일 부탁드립니다.

### 해결 방법

오래 돌아온 것에 비해 해결 방법은 매우 간단했어요.

문제는 캐싱에 있다는 것을 파악했으니, fetch 시 부분적으로 요청을 보내도록 `no-cache` 옵션을 사용해 해결할 수 있었어요.

```diff
- fetch('URL');
+ fetch('URL', {cache: 'no-cache'});
```

![mdn request cache](https://user-images.githubusercontent.com/26461307/181088652-6f180dd1-5b9e-4deb-9829-123fd5ec0361.png)

<small>출처: [mdn request cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)</small>

`cache: default`의 경우 `fresh`한 상태라면 캐싱된 값을 반환하지만, `no-cache`의 경우 fresh한 상태라도 조건부 요청을 보내기 때문에 문제 해결을 위한 최소 조건을 충족한다고 생각했고,

`cache: no-store`의 경우 캐싱된 값을 확인하지 않고 모든 정보를 요청하기 때문에 `no-cache`에 비해 송수신되는 데이터의 양이 많아 더욱 빠른 사용자 경험을 제공하는 데에 유리한 것은 `no-cache` 옵션이라 생각해 적용했어요.

```tsx
async function downloadImage(href: string) {
  const element = document.createElement('a');
  const imageResponse = await fetch(href, { cache: 'no-cache' });
  const imageBlob = await imageResponse.blob();
  const imageObjectUrl = window.URL.createObjectURL(imageBlob);
  element.href = imageObjectUrl;

  element.download = getImageNameAndExtension({ href });

  element.click();

  window.URL.revokeObjectURL(imageObjectUrl);
}
```

위 과정을 거쳐 작성하게된 코드는 위와 같아요.

![finish_it](https://user-images.githubusercontent.com/26461307/181089763-8f156657-e080-43bf-8e72-dfb90ffc3629.jpeg)

웹에서는 저장이 잘되어 부푼 마음으로 시뮬레이터로 앱 환경을 확인해 보니 저장이 되고 있지 않았어요.

웹뷰 브라우저에서 저장이 되는 것이 _알아서_ 카메라롤(갤러리)에 저장이 될 생각을 하다니,,,

### 나만 이런 접근을 한건 아니구나

웹 애플리케이션에서 작업한 사항이 아쉬움과 동시에 다른 방법이 떠오르지 않아, 여러 가지 방법을 물색하던 중에 React-native-webview repo에서 Closed 됐지만 제 상황의 해결책같이 보이는 PR을 찾을 수 있었어요.

![onBlobFileDownload](https://user-images.githubusercontent.com/26461307/181093258-0dc2731e-f385-40f5-a44f-97224985a306.png)

<small>출처: [react-native-webview#1817](https://github.com/react-native-webview/react-native-webview/pull/1817)</small>

바로 `onBlobFileDownload`라는 이름의 새로운 api를 추가하는 PR 이였는데요.

변경이 된 코드를 읽어보지 못하는 상태라 나눴던 코멘트만 읽어보니 인터페이스 그리고 지원하는 확장자 등의 기능이 부족해 merge되지 않은 것으로 보였어요.

정확히 fit한 해결 방법은 찾을 수 없었지만, 코멘트 중에 키워드를 찾을 수 있었는데요.

그것은 React-native-webview의 `onFileDownload` 인터페이스였어요.

![react-native-webview onFileDownload](https://user-images.githubusercontent.com/26461307/181095030-76361900-3545-451f-80bb-b45c700ec1f0.png)

파일이 저장될 때 트리거되는 callback을 이용해 저장되는 객체를 카메라롤에 저장되도록만 하면 될 것 같아 빠르게 API를 찾아보았지만, `iOS-only` 기능이었어요.

'영감탱'의 경우 iOS, AOS 두 플랫폼으로 배포되고 있기 때문에 해결 방법이라는 생각은 들지 않았지만, <strong>'트리거된다'</strong>라는 키워드에서 새로운 방법을 생각해낼 수 있게 되었어요.

## 두 번째 접근

두 번째 구현 방법은 앱 내에서 `AWS S3` URL로 접근 시 이동하는 것이 아닌, 카메라롤에 해당 URL의 이미지를 저장하는 로직이 **트리거**되게 개발하는 것이에요.

큼지막한 구현 방법은 다음과 같아요.

### Web에서 userAgent 확인해서 로직 분리

```tsx
export function imageDownload({ href }: Props) {
  // getMobileDetect는
  // location.userAgent와 정규 표현식을 이용해 값을 반환하는 유틸이예요.
  const { isMobile } = getMobileDetect(navigator.userAgent);

  if (isMobile()) {
    downloadImageWhenMobile({ href });
    return;
  }

  downloadImageWhenNotMobile({ href });
}

function downloadImageWhenMobile({ href }: Props) {
  const element = document.createElement('a');
  element.href = href;
  element.click();
}

async function downloadImageWhenNotMobile({ href }: Props) {
  // 첫 번째 접근에서 구현했던 코드
}
```

userAgent를 확인해 Web 환경에서는 첫 번째 접근으로 개발했던 유틸이 실행되도록 하고, 모바일 환경일 때는 `a` 태그의 src attr에 `AWS S3` url을 직접적으로 사용하도록 개발했어요.

### Webview onNavigationStateChange

```tsx
const handleNavigate = (event: WebViewNavigation) => {
  if (event.url.startsWith(AWS_S3_IMG_BUCKET_URI)) {
    imageDownload(event);
    return false;
  }

  ...
};

<Webview source={{ uri }} onNavigationStateChange={handleNavigate} />;
```

트리거가 되는 행동이 `AWS S3 URL`을 방문하는 것이니, navigation 상태가 변경될 때 트리거되는 `onNavigationStateChange`의 callback에 단순히 `AWS S3`의 URL로 시작하는지 확인하는 조건문을 넣어 이미지 저장 로직이 실행되도록 했어요.

### iOS 이미지 저장

```tsx
import Cameraroll from '@react-native-community/cameraroll';

export async function imageDownload(event: WebViewNavigation) {
  Cameraroll.save(event.url);
}
```

iOS의 이미지 저장 로직의 경우 `@react-native-community/cameraroll`을 이용해 직접적으로 url을 카메라롤에 저장해 iOS 환경에서 이미지를 저장할 수 있었어요.

### AOS 이미지 저장

![react native cameraroll save spec](https://user-images.githubusercontent.com/26461307/181209640-28808c4b-c51c-412c-9e6f-8ea341d8babf.png)

AOS의 경우 `Cameraroll` 스펙을 읽어보니 로컬 이미지 혹은 비디오 URI 일 때만 저장이 된다고 기술되어 있었어요.

> iOS의경우 모든 이미지 URI가 가능하다고 기술되어 있어, 위와 같이 작성해도 동작했던 것이에요.

이를 해결하기 위해 위의 웹 애플리케이션에서 동작했던 것과 비슷하게 구현하면 될 것이라 판단하였고, 찾아보니 `rn-fetch-blob`이라는 라이브러리를 찾을 수 있었어요.

`rn-fetch-blob`은 이를 간단하게 구현하는 데에 더해 AOS에서 저장 시 OS 단의 progress bar, notification을 보여주는 `다운로드 매니저`, 이미지 응답을 문자열로 변환하는 과정을 거치지 않고 직접 저장하는 기능을 제공하고 있어 fit한 해결 방법을 제공하는 라이브러리라고 생각했어요.

![rn-fetch-blob download graph](https://user-images.githubusercontent.com/26461307/181214075-7a2ee0e6-33dc-472d-b4f7-9c59d7207b2d.png)

rn-fetch-blob의 가장 최근의 업데이트가 3년 전이라 도입하는 것이 옳은 선택일지 고민이 되었어요.

하지만 react-native의 설치 지표와 비교를 해보니 많은 수치를 보여주면서, 사용하는 곳이 한정적이라 추후에 걷어낼 일이 있을 때 소모되는 리소스보다 현재 빠르게 기능을 개발하는 것이 리소스가 더욱 적게 소모된다고 판단하여 적용하기로 판단했어요.

그렇게 rn-fetch-blob을 사용하면서, iOS와 AOS 환경 모두 이미지를 다운로드할 수 있도록 개발한 유틸은 다음과 같은 모습이예요.

```tsx {22-29}
import Cameraroll from '@react-native-community/cameraroll';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

async function hasAndroidPermission() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
}

export async function imageDownload(event: WebViewNavigation) {
  if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
    return;
  }

  if (Platform.OS === 'android') {
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: { useDownloadManager: true, notification: true },
    }).fetch('GET', event.url);

    return;
  }

  Cameraroll.save(event.url);
}
```

AOS의 권한에 대한 확인과 함께 이미지 저장 로직을 수행하였고, 결과는 성공적이었어요!

## 웹에서 저장 상태 통신

이미지 저장은 원활히 동작하지만, 뭔가 사용자 경험이 좋지 않다고 생각이 들었어요.

그 이유는 저장이 성공했는지, 실패했는지 결과를 시각적 알려주지 않고 있기 때문이었어요.

Web 애플리케이션에서 사용하고 있는 Toast 메세지를 띄우면 서비스적으로 통일감 있게 알려줄 수 있다고 판단하였고, 이를 위해서는 App에서 Web으로 저장 상태에 대한 통신이 이루어져야 했어요.

### postMessage

구현하기 앞서 구현체의 통일성을 높이기 위해 기존 프로젝트에 사용하고 있던 `react-native-webview`의 `postMessage` 구현체를 확인해 보았어요.

```tsx
webViewRef.current.postMessage(
  JSON.stringify({
    type: SOME_CONSTANTS_TYPE,
    data: someData,
    otherData: someMoreData,
  })
);
```

'디프만'이라는 활동 기간이 정해져있는, 빠르게 기능을 개발했어야 했던 상황이라 그런지 사용하는 곳마다 개발자들이 자의적으로 `type`과 `data`가 포함되는 것을 인지하면서 구현이 되고 있었어요.

이는 버스 팩터도 높일뿐더러, 안전하게 개발할 수 있는 환경이 아니라고 생각이 되어 리팩토링이 필요하다고 생각이 들었어요.

```tsx
import { WEBVIEW_MESSAGE_TYPE } from '~/constants/common';

type WebviewMessageTypeKey = keyof typeof WEBVIEW_MESSAGE_TYPE;

interface PostMessageObjectInterface {
  type: typeof WEBVIEW_MESSAGE_TYPE[WebviewMessageTypeKey];
  data: unknown;
  [key: string]: unknown;
}

export function getStringPostMessageObject(object: PostMessageObjectInterface) {
  return JSON.stringify(object);
}

// 사용하는 곳에서는
webViewRef.current.postMessage(
  getStringPostMessageObject({
    type: WEBVIEW_MESSAGE_TYPE.SOME_CONSTANTS_TYPE,
    data: someData,
    otherData: someMoreData,
  })
);
```

이를 위와 같은 구현체를 만들어 개발자가 직접적으로 인지해야 하는 것을 1개로 낮춰보았어요.

개발자가 알아야 하는 것은 `postMessage`를 사용할 때 위 `getStringPostMessageObject`를 사용해야 한다는 것이며, 기존 인터페이스가 개발자들의 머리 혹은 Web 애플리케이션에 정의가 되어있었다면 이를 직접적으로 정의해 매번 찾아볼 일이 없도록 했어요.

```tsx
Cameraroll.save(event.url)
  .then(() => {
    const stringMessageObject = getStringPostMessageObject({
      type: WEBVIEW_MESSAGE_TYPE.SEND_TOAST_MESSAGE,
      data: SUCCESS_IMAGE_DOWNLOAD_MESSAGE,
    });
    webViewRef.current?.postMessage(stringMessageObject);
  })
  .catch(() => {
    const stringMessageObject = getStringPostMessageObject({
      type: WEBVIEW_MESSAGE_TYPE.SEND_TOAST_MESSAGE,
      data: FAILED_IMAGE_DOWNLOAD_MESSAGE,
    });
    webViewRef.current?.postMessage(stringMessageObject);
  });
```

이를 적용해 Web으로 송신하는 것을 포함한 이미지 저장 유틸은 위와 같이 `then`, `catch`를 이용해 간단히 적용할 수 있었어요.

### 웹에서 수신

Web 애플리케이션에서 수신에 대한 부분은 `useAppMessage`라는 hook으로 유틸화가 되어 있었어요.

이는 `handler`를 주입받아 Listening 시작 혹은 중지를 하는 동작을 보이고 있었는데요.

```tsx
export interface AppMessageData {
  action: string;
  data: any;
}

export interface AppMessageArgs {
  handler: (type: string, data?: any) => void;
}

export function useAppMessage({ handler }: AppMessageArgs) {
  const listener = useCallback(
    ({ data: rawData }: MessageEvent) => {
      if (handler) {
        const { type, data } = JSON.parse(rawData) as AppMessageData;
        handler(type, data);
      }
    },
    [handler]
  );

  // ...
}
```

그중 type과 data 외의 인터페이스를 받을 수 있도록 확장이 필요해 보였고, 내가 Listening 하고자 하는 type인지 확인하는 로직까지 추상화할 수 있을 것이라 생각했어요.

```tsx {10, 20-21}
type WebviewMessageTypeKey = keyof typeof WEBVIEW_MESSAGE_TYPE;

export interface AppMessageData {
  type: typeof WEBVIEW_MESSAGE_TYPE[WebviewMessageTypeKey];
  data: unknown;
  [key: string]: unknown;
}

export interface AppMessageArgs {
  targetType: typeof WEBVIEW_MESSAGE_TYPE[WebviewMessageTypeKey];
  handler: ({ type, data, ...rest }: AppMessageData) => void;
}

export function useAppMessage({ targetType, handler }: AppMessageArgs) {
  const listener = useCallback(
    ({ data: rawData }: MessageEvent) => {
      if (handler) {
        const { type, data, ...rest } = JSON.parse(rawData) as AppMessageData;

        // NOTE: 목표로하는 타입의 postMessage가 아닐 시 반환
        if (targetType !== type) return;
        handler({ type, data, rest });
      }
    },
    [handler, targetType]
  );

  // ...
}
```

위는 적용한 결과물로써, App에서 적용한 것과 동일한 인터페이스를 사용하면서 Listening 하고자 하는 type인 `targetType` 인터페이스를 추가해 `handler`에서 매번 type을 확인하지 않아도 되도록 개발했어요.

```tsx
useAppMessage({
  targetType = 'SOME_CONSTANTS_TYPE',
  handler = ({ data }) => {
    fireToast({ content: data });
  },
});
```

위처럼 리팩토링한 `useAppMessage`를 사용해 저장 상태에 대한 값을 Web에서 Toast 메세지로 보여줄 수 있도록 적용을 마쳤어요.

> 사실 '영감탱' 프로젝트에서는 `AppMessageListener`라는 컴포넌트로 `useAppMessage` hook이 한 번 더 wrapping이 되어있긴 하나, Life cycle에 대한 접근만 하고 있기 때문에 설명을 드리지 않아도 충분히 이해하실 것이라 생각해요.

## 결과물

<div align="center">

<img src="https://user-images.githubusercontent.com/26461307/181241903-2ffa159c-db36-4790-b6ed-b3f04f298187.gif" alt="" width="50%" />

</div>

위 Gif를 통해 성공적으로 이미지 저장이 완료된 후 Toast 메세지가 발송되고, 휴대폰 카메라롤에 저장이 되는 모습을 확인하실 수 있어요.

## 마치며

대단한 기능은 아니지만, HTTP와 fetch 스펙에 대해 더 자세히 알 수 있었고 React-native 환경에서 postMessage를 이용해 Web과 App의 통신을 처음으로 개발해 볼 수 있었던 점에서 재밌었던 경험이라고 생각해요.

다만, 글 재주가 없어 읽으시는 분들에게 피로감을 드렸을까 걱정이네요.

디프만 활동은 끝났지만, 과정 이후에도 열심히 업데이트, 운영해나가고 있으니 영감을 기록하는 것에 관심이 있으신 분들은 아래 영감탱 소개 링크 방문을 부탁드리며 글을 맞춰보겠습니다.

긴 글 읽어주셔서 감사합니다.

![Thunbnail](https://user-images.githubusercontent.com/26461307/181249281-c8f51502-3dce-4d72-a362-3a813f2831c2.png)

- [영감탱 서비스 소개](https://gifted-puffin-352.notion.site/c363eee70970491f84d7d1f47c22e992)
- [본 글에서 소개했던 내용 PR - Web](https://github.com/depromeet/ygtang-client/pull/474)
- [본 글에서 소개했던 내용 PR - App](https://github.com/depromeet/ygtang-app/pull/119)
- [영감탱 behance](https://www.behance.net/gallery/147207859/TANG-Inspiration-Archiving-App)
