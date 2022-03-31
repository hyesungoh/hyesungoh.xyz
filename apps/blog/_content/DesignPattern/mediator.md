---
title: 'Mediator pattern with TypeScript'
date: 2021-10-20 22:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## Mediator 패턴이란 ?

`Mediator`는 중개인, 조정자를 의미합니다.

100명의 회원이 함께 프로젝트를 하고 있을 때, 모든 회원이 각 회원들에게 서로 지시를 내리는 상황은 매우 혼란스럽니다.

하지만, 1명의 `중개인`가 등장하여 이 중개인에게만 보고를 하고, 중개자인이 회원에게 지시를 내릴 수 있게 되었다면 상황은 훨씬 간결해질 것입니다.

이처럼 모든 요소들이 각 요소들에게 영향을 끼치는 것이 아닌, 다른 요소에 영향을 미칠 일이 발생할 시 `중개인`에게 알리고 중개인은 대국적인 판단을 통해 각 회원에게 지시를 내리는 것이 `Mediator` 패턴의 성격입니다.

## 예제 프로그램

예제 프로그램은 이름과 패스워드를 입력하는 로그인 Form 입니다.

하지만 단순히 입력을 하는 것이 아닌 아래의 조건이 있는, 조금 복잡한 Form 입니다.

- 게스트 로그인, 사용자 로그인인지 선택
- 게스트 로그인일 시 사용자 명과 패스워드를 무효상태화
- 사용자 로그인일 시 사용자 명은 유효상태화
- 사용자 명에 입력될 시 패스워드 유효상태화
- 사용자 명과 패스워드에 한 문자라도 입력될 시, OK 버튼은 유효상태화 하지만 둘 중 하나라도 입력되지 않을 시 무효상태화

위 상황에서 다른 요소에 대한 설정을 각 클래스에 기술할 시 프로그램을 확장하는 것도, 디버그를 하는 것도 어렵게 됩니다.

이처럼 **다수의 요소(객체) 사이를 조정해야 할 경우 Mediator 패턴**을 이용합니다.

각각의 요소 상호간에 통신을 하는 것이 아닌, **중개인과만 통신을 하고, 표시 컨트롤 로직은 중개인** 안에만 기술합니다.

| 이름               | 해설                                                         |
| ------------------ | ------------------------------------------------------------ |
| Mediator           | 중개인의 인터페이스를 결정하는 인터페이스                    |
| Colleague          | 회원의 인터페이스를 결정하는 인터페이스                      |
| ColleagueButton    | Colleague 인터페이스를 구현, 버튼을 나타내는 클래스          |
| ColleagueTextField | Colleague 인터페이스를 구현, 텍스트 입력을 실행하는 클래스   |
| ColleagueCheckbox  | Colleague 인터페이스를 구현, 체크박스 버튼을 나타내는 클래스 |
| LoginFrame         | Mediator 인터페이스를 구현, 로그인 Form을 나타내는 클래스    |
| Main               | 동작 테스트용 클래스                                         |

### Mediator 인터페이스

```ts
export interface Mediator {
  createCollegues: () => void;
  colleagueChanged: () => void;
}
```

Mediator 인터페이스는 `중개인`을 표현하는 인터페이스입니다.

createCollegues 메소드는 Mediator가 관리하는 회원을 생성, colleagueChanged 메소드는 각 회원인 `Colleague`들에서 호출되는 메소드이며 이는 중개인에 대한 `상담`에 해당합니다.

### Colleague 인터페이스

```ts
export interface Colleague {
  setMediator: (mediator: Mediator) => void;
  setColleagueEnabled: (enabled: boolean) => void;
}
```

Colleague 인터페이스는 중개인에게 상담을 의뢰하는 회원을 나타내는 인터페이스입니다.

setMediator 메소드는 중개인을 기억하는 메소드이며 이 메소드의 인수로 전달된 인스턴스는 나중에 `상담`이 필요해질 때 사용합니다.

setColleagueEnabled 메소드는 중개인이 내리는 `지시`에 해당합니다. 인수 enabled가 true일 시 유효상태로 하며, false일 시 무효상태로 합니다.

> Mediator, Colleague 인터페이스에게 어떤 메소드를 가지게 할지는 작성할 어플리케이션에 따라 다릅니다.

### ColleagueButton 클래스

```ts
export class ColleagueButton implements Colleague {
  public element: HTMLButtonElement;
  private mediator: Mediator;

  constructor(caption: string) {
    this.element = document.createElement('input');
    this.element.value = caption;
    this.element.type = 'button';
    document.body.appendChild(this.element);
  }

  setMediator = (mediator: Mediator) => {
    this.mediator = mediator;
  };

  setColleagueEnabled = (enabled: boolean) => {
    this.element.disabled = !enabled;
  };
}
```

_책의 예제는 java.awt를 이용하지만 필자는 HTML Form을 이용하였습니다_

`Colleague` 인터페이스를 구현하며, `Mediator`와 협조할 Button을 뜻하는 클래스입니다.

`mediator` 필드에는 `setMediator` 메소드에서 전달되는 Mediator 오브젝트를 저장합니다.

`setColleagueEnabled` 메소드는 해당 element의 disabled(유효, 무효상태)를 설정합니다.

### ColleagueTextField 클래스

```ts
export class ColleagueTextField implements Colleague {
  public element: HTMLInputElement;
  private mediator: Mediator;

  constructor(label: string) {
    const inputLable = document.createElement('label');
    inputLable.innerHTML = label;
    document.body.appendChild(inputLable);

    this.element = document.createElement('input');
    this.element.type = 'text';
    this.element.addEventListener('change', this.textValueChanged);
    document.body.appendChild(this.element);
  }

  setMediator = (mediator: Mediator) => {
    this.mediator = mediator;
  };

  setColleagueEnabled = (enabled: boolean) => {
    this.element.disabled = !enabled;
    this.element.style.backgroundColor = enabled ? 'white' : 'lightgray';
  };

  textValueChanged = () => {
    this.mediator.colleagueChanged();
  };
}
```

`Colleague` 인터페이스를 구현하며, `Mediator`와 협조할 TextField를 뜻하는 클래스입니다.

위 ColleagueButton 클래스와 마찬가지로 `setMediator`, `setColleagueEnabled`를 작성하였으며 추가적으로 해당 `element`의 배경색에 대한 접근 또한 하고 있습니다.

생성자에서 `eventListener`를 부착하여 요소가 변경될 시 `mediator`에게 상담을 요구하는 `colleagueChanged`를 실행합니다.

### ColleagueCheckbox 클래스

```ts
export class ColleagueCheckbox implements Colleague {
  public element: HTMLInputElement;
  private mediator: Mediator;

  constructor(label: string, name: string, state: boolean) {
    const inputLabel = document.createElement('label');
    inputLabel.innerHTML = label;
    document.body.appendChild(inputLabel);

    this.element = document.createElement('input');
    this.element.type = 'radio';
    this.element.name = name;
    this.element.checked = state;
    this.element.addEventListener('change', this.itemStateChanged);
    document.body.appendChild(this.element);
  }

  setMediator = (mediator: Mediator) => {
    this.mediator = mediator;
  };

  setColleagueEnabled = (enabled: boolean) => {
    this.element.disabled = !enabled;
  };

  itemStateChanged = () => {
    this.mediator.colleagueChanged();
  };
}
```

`Colleague` 인터페이스를 구현하며, `Mediator`와 협조할 checkbox를 뜻하는 클래스입니다.

위 ColleagueTextField 클래스와 마찬가지로 `setMediator`, `setColleagueEnabled`, 상담을 요청하는 `colleagueChanged`를 구현, 사용하고 있습니다.

### LoginFrame 클래스

```ts
export class LoginFrame implements Mediator {
  private checkGuest: ColleagueCheckbox;
  private checkLogin: ColleagueCheckbox;
  private textUser: ColleagueTextField;
  private textPass: ColleagueTextField;
  private buttonOk: ColleagueButton;
  private buttonCancel: ColleagueButton;

  constructor() {
    this.createCollegues();
    this.colleagueChanged();
  }

  createCollegues = () => {
    const checkboxGroup = 'loginType';
    this.checkGuest = new ColleagueCheckbox('Guest', checkboxGroup, true);
    this.checkLogin = new ColleagueCheckbox('Login', checkboxGroup, false);

    this.textUser = new ColleagueTextField('ID');
    this.textPass = new ColleagueTextField('PW');

    this.buttonOk = new ColleagueButton('OK');
    this.buttonCancel = new ColleagueButton('CANCEL');

    // mediator 세팅
    this.checkGuest.setMediator(this);
    this.checkLogin.setMediator(this);
    this.textUser.setMediator(this);
    this.textPass.setMediator(this);
    this.buttonOk.setMediator(this);
    this.buttonCancel.setMediator(this);
  };

  colleagueChanged = () => {
    if (this.checkGuest.element.checked) {
      this.textUser.setColleagueEnabled(false);
      this.textPass.setColleagueEnabled(false);
      this.buttonOk.setColleagueEnabled(true);
    } else {
      this.textUser.setColleagueEnabled(true);
      this.userpassChanged();
    }
  };

  userpassChanged = () => {
    if (this.textUser.element.value.length > 0) {
      this.textPass.setColleagueEnabled(true);
      if (this.textPass.element.value.length > 0) {
        this.buttonOk.setColleagueEnabled(true);
      } else {
        this.buttonOk.setColleagueEnabled(false);
      }
    } else {
      this.textPass.setColleagueEnabled(false);
      this.buttonOk.setColleagueEnabled(false);
    }
  };
}
```

`Mediator` 인터페이스를 구현하는 클래스입니다.

`createColleague` 메소드에서 Form에 필요한 Colleague를 생성하고 그것을 필드에 저장합니다.

그 후, `setMediator`를 호출하여 해당 인스턴스가 중개인인 것을 알려줍니다.

`colleagueChanged` 메소드에서는 각 colleague들의 유효상태, 무효상태를 설정하는 처리를 행하고 있습니다.

지금까지 작성했던 colleague 클래스들은 자신을 유효, 무효상태화하는 메소드는 있었지만, 어떤 경우에 유효, 무효상태화 할지에 대한 로직은 써있지 않았습니다.

즉, 모든 Colleague들의 상담이 `colleagueChanged` 메소드로 집결합니다.

`userpassChanged` 메소드는 `colleagueChanged`에서 사용하며, textUser, textPass 필드의 변경을 담당합니다.

### Main 클래스

```ts
import { LoginFrame } from './LoginFrame';

class Main {
  public main = () => {
    new LoginFrame();
  };
}

const m = new Main();
m.main();
```

`LoginFrame` 인스턴스를 생성하는 `Main` 클래스입니다.

### 실행 결과

<iframe src="https://codesandbox.io/embed/mediator-pattern-with-ts-cj8zx?autoresize=1&fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="mediator pattern with ts"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

_단순히 body에 요소들을 추가하고, Styling을 하지않아 깔끔하게 보이지는 않습니다_

## Mediator 패턴의 구성요소

- **Mediator**

  Colleague 역할과 통신을 통해 조정을 실행하기 위한 인터페이스를 결정합니다. 예제 프로그램에서는 `Mediator` 인터페이스가 담당하였습니다.

- **ConcreteMediator**

  Mediator 역할의 인터페이스를 구현해서 실제의 조정을 실행합니다. 예제 프로그램에서는 `LoginFrame` 클래스가 담당하였습니다.

- **Colleague**

  Mediator 역할과 통신을 실행할 인터페이스를 결정합니다. 예제 프로그램에서는 `Colleague` 인터페이스가 담당하였습니다.

- **ConcreteColleague**

  Colleague 역할의 인터페이스를 구현하는 역할입니다. 예제 프로그램에서는 `ColleagueButton`, `ColleagueTextField`, `ColleagueCheckbox` 클래스가 담당하였습니다.

## Class diagram

<div align="center">

![mediator-diagram](https://upload.wikimedia.org/wikipedia/commons/e/e4/Mediator_design_pattern.png)

</div>

## 분산이 화를 부를 때

예제 프로그램 `LoginFrame`의 `colleagueChanged` 메소드는 다소 복잡합니다.

사양이 변경되면 결국 버그가 발생하지 않을까 생각되지만 그것은 문제가 되지 않습니다.

왜냐하면 colleagueChanged 메소드에 버그가 발생해도 **표시 유효, 무효에 관한 로직은 여기 외에는 존재하지 않기 떄문에** 해당 메소드만 디버그하면 되기 때문입니다.

객체 지향에서는 한 곳에 집중되는 것을 피해서 처리를 분산시키는 겨웅가 많습니다. 하지만 예제 프로그램과 같은 경우에는 처리를 각 클래스에 분산시키는 것은 현명하지 못합니다.

각 클래스에 분산시킬 것은 분산시키고, 집중시킬 것은 집중시키지 않으면 클래스의 분산이 오히려 화를 부르게 됩니다.

## 재이용할 수 있는 것

`ConcreteColleague` 역할은 재이용하기 쉽지만 `ConcreteMediator` 역할은 재이용하기 어렵습니다.

예를 들어, 로그인 form과는 다르게 별도의 form을 만들 때 `ConcreteColleague` 역할들은 재이용이 가능합니다.

왜냐하면 ConcreteColleague 역할 안에는 **특정한 form에 의존하는 코드가 없기 때문**입니다.

코드 중 의존성이 높은 부분은 `ConcreteMediator` 클래스 안에 갇혀 있습니다. 어플리케이션에 대한 의존도가 높다는 것은 재이용성이 낮다는 것을 의미하므로 당연스럽게 ConcreteMediator는 재이용이 어려운 것입니다.

## 그래서 왜 써야하나 ?

만약 2개의 인스턴스가 서로 통신한다고 가정할 때, 통신 경로는 2가지가 됩니다.

그렇다면 10개의 인스턴스가 서로 통신한다면 경로는 몇가지가 될까요 ?

무려 90가지의 통신 경로를 갖게 됩니다.

하지만 `Mediator` 패턴을 이용할 시, 각 인스턴스는 ConcreteMediator와만 오고가는 통신을 하게되므로 20가지의 통신경로로 줄게 됩니다.

이에 더불어 통신을 통한 로직을 ConcreteMediator에 위임하기 때문에 디버깅이 쉬워집니다.

이처럼 같은 입장의 인스턴스가 많이 존재할 때 그것들을 서로 통신시키면 프로그램은 복잡해져만 가며, 이를 해소하기 위해 `Mediator` 패턴을 사용한다고 생각합니다.

> 다대다의 관계를 다대 "1"의 관계로 줄였다

## OCP 관점

만약 `ConcreteColleague`를 추가해야되는 상황이 왔을 때, `ConcreteMediator` 혹은 `Mediator`까지 수정을 해야할 수 있다.

이는 **확장엔 열려있으며, 변경에는 닫혀**있어야하는 객체지향의 원칙, OCP에 위반되지 않을까 ?

이에 대한 멘토님의 대답은 `아니다`였다. 물론 수정을 해야겠지만, 해당 패턴을 사용하지 않고 추가해야하는 상황은 더욱 크고 복잡한 수정을 요구하기 때문이다.

## 관련 패턴

- Facade

  Mediator는 Colleague 역할의 중개자로써 주고받기를 수행합니다. Facade 패턴에서는 Facade 역할이 일방적으로 다른 역할을 이용해 높은 레벨의 인터페이스를 만들었습니다. 이처럼 **Mediator는 쌍방향, Facade는 단방향**이라고 할 수 있습니다.

- Observer

  Mediator와 Colleague 역할의 통신은 Observer 패턴을 사용해서 실행되는 경우가 있습니다.

_이미지 출처 : https://ko.wikipedia.org/_
