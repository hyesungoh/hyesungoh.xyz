---
title: '[Like Amazing Lion] Refactoring Log'
date: 2021-02-13 00:24:00
category: 'Project'
draft: false
---

## Like Amazing Lion 프로젝트 리팩토링

- 교외 동아리 멋쟁이사자처럼의 홍보용 이벤트 웹
- Firebase와 React + TypeScript를 사용한 CSR 웹
- [Github](https://github.com/hyesungoh/Like_Amazing_Lion)

## Log

- Directory Structure

  - 공식 문서를 참고하여 너무 오래 고민하지 않으며 기존 형태를 유지하면서 더욱 가독성이 보기 좋게 나누도록
  - Router Directory 생성
  - App.tsx src 폴더에 위치
  - ##### 추후 진행할 프로젝트에서는 Container-Presenter 패턴, Atomic 패턴을 이용해 볼 예정

- Router안의 Transition Group을 이용한 Transition Router 부분을 새로운 컴포넌트를 만들어 분리

- Loading component의 timeout 시간을 변수로 빼어 수정, 확장, 가독성 부분에서 유리하도록 수정

```ts
// before
setTimeout(() => {
  setIsLoading(true)
}, 1500)

// after
const LOADING_TIME: number = 1500
setTimeout(() => {
  setIsLoading(true)
}, LOADING_TIME)
```

- assets Directory를 만들어 Theme.ts와 images 폴더를 위치

- Nav의 오른쪽 요소들을 NavElement component로 빼둠

```ts
export interface NavInterface {
  user: firebase.default.User | null
}
```

- AuthForm component의 signUp, signIn을 함수로 빼어 더욱 간결하게 작성

```ts
// before
const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  try {
    if (isSignUp) {
      await authService.createUserWithEmailAndPassword(email, password)
    } else {
      await authService.signInWithEmailAndPassword(email, password)
    }
  } catch (error) {
    const { message } = error
    setErrorMsg(message)
  }
}

// after
const signUp = () => authService.createUserWithEmailAndPassword(email, password)

const signIn = () => authService.signInWithEmailAndPassword(email, password)

const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  try {
    await (isSignUp ? signUp() : signIn())
  } catch (error) {
    const { message } = error
    setErrorMsg(message)
  }
}
```

- 가독성을 위해 Waiting component의 다른 서비스 url 주소를 변수로 빼둠
- target 속성과 rel 속성을 추가적으로 부여. target을 blank로 한 후 rel 속성을 noreferrer로 하지 않을 시 보안의 위협이 있다함

```tsx
// before
;<a href="someurl.com">
  <Button color="primary">맛집 보기</Button>
</a>

// after
const LIKELION_FOOD_URL = 'someurl.com'
;<a target="_blank" rel="noreferrer" href={LIKELION_FOOD_URL}>
  <Button color="primary">맛집 보기</Button>
</a>
```

- QuizSlider의 classList 추가 부분을 반복적으로 작성하는 부분이 적게 변환

```tsx
// before
if (currentQuizNum === 0) {
  leftButton.current.classList.add('slider__hide')
} else if (currentQuizNum === maxQuizNum) {
  rightButton.current.classList.add('slider__hide')
}

// after
let modifingButton: React.MutableRefObject<any> | null = null
if (currentQuizNum === 0) {
  modifingButton = leftButton
} else if (currentQuizNum === maxQuizNum) {
  modifingButton = rightButton
}
modifingButton?.current.classList.add('slider__hide')
```

- QuizProgress의 classList를 저장하는 배열을 기존 빈 배열을 선언 후 추가하는 방법에서 모두 들어가는 class명을 넣은 상태에서 조건에 따라 추가하는 방식으로 수정

```tsx
// before
const tempProgress: string[] = []
for (let i = 0; i <= maxQuizNum; i++) {
  const tempElement = `progress__element ${i === currentQuizNum &&
    'progress__selected'}`
  tempProgress.push(tempElement)
}

// after
const tempProgress: string[] = Array(maxQuizNum + 1).fill('progress__element')
for (let i = 0; i <= maxQuizNum; i++) {
  if (i === currentQuizNum) {
    tempProgress[i] += ' progress__selected'
  }
}
```

- 유지보수와 가독성을 위해 QuizProgress의 Class명을 변수로 선언

```tsx
// before
const tempProgress: string[] = Array(maxQuizNum + 1).fill("progress__element");
for (let i = 0; i <= maxQuizNum; i++) {
    if (i === currentQuizNum) {
        tempProgress[i] += " progress__selected";
    }
}

// after
const PROGRESS_CN: string = "progress__element";
const SELECTED_PROGRESS_CN: string = " progress__selected";

...
const tempProgress: string[] = Array(maxQuizNum + 1).fill(PROGRESS_CN);

for (let i = 0; i <= maxQuizNum; i++) {
    if (i === currentQuizNum) {
        tempProgress[i] += SELECTED_PROGRESS_CN;
    }
}
```

- components의 각 폴더에 있는 config 파일들을 configs 폴더에 위치

- 각 파일들에 있었던 interface들을 types/Types.ts 파일에 위치

## 느낀 점

- TypeScript의 Interface를 남용하진 않나 생각됨, Generics와 같은 추가적인 개념을 익혀야될 필요를 느낌
- React.memo 등 최적화를 위한 방법을 더욱 공부해야될 것을 느낌
- CSS, SCSS 등 스타일에 대한 Directory Structure 개념이 잡히지 않았다고 생각됨
- 스타일에 대하여 우겨넣기 식으로 하지 않는 지 고민되어 CSS 또한 더 공부 해야될 것을 느낌

## 배운 점

- CSR 웹의 가능성을 알게 됨
- Firebase를 사용하여 Query, Authentication, DB등의 사용 방법을 알게 됨
- Material UI를 사용 및 커스텀 할 수 있게 됨 (아직은 많이 부족하지만)
- React-Transition-Group을 더욱 다채롭게 사용할 수 있게 됨
