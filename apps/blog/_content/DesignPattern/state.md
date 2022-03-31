---
title: 'State pattern with TypeScript'
date: 2021-10-27 22:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## State 패턴이란 ?

`state`는 상태를 의미합니다.

state 패턴이란 사물이나 모양이나 형편등의 `상태`를 클래스로 나타내는 패턴입니다.

## 예제 프로그램

예제 프로그램은 금고경비 시스템이며 아래의 조건이 있습니다.

- 1초에 1시간이 흐름
- 금고사용 버튼, 비상벨, 일반통화용 버튼이 존재
- 주간은 09:00 ~ 16;59, 야간은 17:00 ~ 08:59
- 주간에 금고를 사용하면 사용기록이 남는다
- 야간에 금고를 사용하면 비상사태로 통보된다
- 비상벨은 언제든 사용할 수 있다
- 주간에 일반 통화는 경비센터가 호출된다
- 야간에 일반 통화는 자동응답기가 호출된다

### State 패턴 없어도 될 거 같은데 ?

```ts
금고사용메소드 = () => {
    if (주간) {
        사용기록
    } else {
        비상상태 통보
    }
}
비상벨사용메소드 = () => {
    비상상태 통보
}
일반통화사용메소드 = () => {
    if (주간) {
        경비센터 호출
    } else {
        자동응답기 호출
    }
}
```

물론 위의 방법이 결코 틀린 방법은 아닙니다. 하지만 State 패턴은 이와 같은 일을 전혀 다른 관점에서 생각하고 있습니다.

```ts
주간상태클래스 {
    금고사용메소드 = () => {
        사용기록
    }
    비상벨사용메소드 = () => {
        비상상태 통보
    }
    일반통화사용메소드 = () => {
        경비센터 호출
    }
}

야간상태클래스 {
    금고사용메소드 = () => {
        비상상태 통보
    }
    비상벨사용메소드 = () => {
        비상상태 통보
    }
    일반통화사용메소드 = () => {
        자동응답기 호출
    }
}
```

위 *(State 패턴을 사용하지 않는 방법)*에서는 주간과 야간의 상태가 각 메소드 안, if문에 등장하고 각 메소드 안에서 현재의 상태를 조사하고 있습니다.

하지만 아래 *(State 패턴을 사용하는 방법)*에서는 주간과 야간의 **상태를 클래스로 표현**하고 있습니다. 상태를 클래스로 표현하기 때문에 메소드에서는 **상태 검사를 위한 if문이 등장하지 않습니다.**

위에서는 상태가 메소드 안에, 아래에서는 클래스로, 메소드 안에 있던 `상태`를 외부로 표현한 모습을 염두에 두고 아래 예저 프로그램을 살펴보면 좋을 것 같습니다.

| 이름       | 해설                                                           |
| ---------- | -------------------------------------------------------------- |
| State      | 금고의 상태를 나타내는 인터페이스                              |
| DayState   | State를 구현, 주간의 상태를 나타내는 클래스                    |
| NightState | State를 구현, 야간의 상태를 나타내는 클래스                    |
| Context    | 금고의 상태변환을 관리하고 경비센터와 연락을 취하는 인터페이스 |
| SafeFrame  | Context를 구현, 사용자 인터페이스를 구현                       |
| Main       | 동작 테스트용 클래스                                           |

### State 인터페이스

```ts
export interface State {
  doClock: (context: Context, hour: number) => void;
  doUse: (context: Context) => void;
  doAlarm: (context: Context) => void;
  doPhone: (context: Context) => void;
}
```

시간이 설정되었을 때, 금고가 사용되었을 때, 비상벨이 눌렸을 때, 일반통화를 할 때의 상황에 대응해서 호출되는 인터페이스를 규정하고 있습니다.

여기에서 규정되어 있는 메소드는 모두 상태에 대응해서 처리가 변하게 됩니다. 즉, State 인터페이스는 **상태의존 메소드의 집합**입니다.

인수로 전달되고 있는 Context는 상태의 관리를 수행하고 있는 인터페이스 입니다.

### DayState 클래스

```ts
export class DayState implements State {
  private static singleton: DayState = new DayState();
  private constructor() {}
  static getInstance() {
    return this.singleton;
  }

  doClock = (context: Context, hour: number) => {
    if (hour < 9 || 17 <= hour) {
      context.changeState(NightState.getInstance());
    }
  };

  doUse = (context: Context) => {
    context.recordLog('금고사용(주간)');
  };

  doAlarm = (context: Context) => {
    context.callSecurityCenter('비상벨(주간)');
  };

  doPhone = (context: Context) => {
    context.callSecurityCenter('일반통화(주간)');
  };

  toString = (): string => {
    return '[주간]';
  };
}
```

DayState 클래스는 주간의 상태를 나타내는 클래스 입니다.

상태를 나타내는 클래스는 한 개씩 인스턴스를 만듭니다. 그 이유는, 상태가 변화할 때마다 새로운 인스턴스를 만들게 되면, 메모리와 시간이 낭비되기 때문이며 따라서 `Singleton` 패턴을 사용하고 있습니다.

`doClock` 메소드는 시간을 설정하는 메소드이며, 인수로 제공된 시간이 야간이면 야간의 상태로 시스템을 이행하며 이 때, 상태의 변화가 일어납니다.

`doUse`, `doAlarm`, `doPhone`은 각각 금고 사용, 비상벨, 일반 통화에 대응한 메소드입니다. Context의 메소드를 호출해서 필요한 일을 수행할 뿐입니다.

### NightState 클래스

```ts
export class NightState implements State {
  private static singleton: NightState = new NightState();
  private constructor() {}
  static getInstance() {
    return this.singleton;
  }

  doClock = (context: Context, hour: number) => {
    if (9 <= hour && hour < 17) {
      context.changeState(DayState.getInstance());
    }
  };

  doUse = (context: Context) => {
    context.recordLog('!!비상!! 야간금고 사용');
  };

  doAlarm = (context: Context) => {
    context.callSecurityCenter('비상벨(야간)');
  };

  doPhone = (context: Context) => {
    context.callSecurityCenter('야간통화 녹음');
  };

  toString = (): string => {
    return '[야간]';
  };
}
```

NightState 클래스는 야간의 상태를 나타내는 클래스 입니다.

Singleton 패턴, 메소드등 구성은 DayState와 같습니다.

### Context 인터페이스

```ts
export interface Context {
  setClock: (hour: number) => void;
  changeState: (state: State) => void;
  callSecurityCenter: (msg: string) => void;
  recordLog: (msg: string) => void;
}
```

Context 인터페이스는 상태를 관리하거나 경비센터의 호출을 수행합니다.

실제로 무슨 일을 하는지는 Context를 구현하는 SafeFrame에서 확인할 수 있습니다.

### SafeFrame 클래스

```ts
export class SafeFrame implements Context {
  private textClock: HTMLSpanElement;
  private textArea: HTMLTextAreaElement;
  private buttonUse: HTMLButtonElement;
  private buttonAlarm: HTMLButtonElement;
  private buttonPhone: HTMLButtonElement;

  // 현재 상태
  private state: State = DayState.getInstance();

  constructor() {
    // textClock 생성 및 배치
    this.textClock = document.createElement('span');
    document.body.appendChild(this.textClock);

    // textArea 생성 및 배치
    this.textArea = document.createElement('textarea');
    this.textArea.rows = 100;
    document.body.appendChild(this.textArea);

    // 버튼들 생성 및 배치
    this.buttonUse = document.createElement('button');
    this.buttonUse.innerHTML = 'USE';
    document.body.appendChild(this.buttonUse);

    this.buttonAlarm = document.createElement('button');
    this.buttonAlarm.innerHTML = 'ALARM';
    document.body.appendChild(this.buttonAlarm);

    this.buttonPhone = document.createElement('button');
    this.buttonPhone.innerHTML = 'PHONE';
    document.body.appendChild(this.buttonPhone);

    // Listener 부착
    this.buttonUse.addEventListener('click', this.onClickButton);
    this.buttonAlarm.addEventListener('click', this.onClickButton);
    this.buttonPhone.addEventListener('click', this.onClickButton);
  }

  onClickButton = (e: MouseEvent) => {
    const { innerHTML } = e.target as HTMLButtonElement;

    if (innerHTML === 'USE') {
      this.state.doUse(this);
    } else if (innerHTML === 'ALARM') {
      this.state.doAlarm(this);
    } else if (innerHTML === 'PHONE') {
      this.state.doPhone(this);
    }
  };

  setClock = (hour: number) => {
    this.textClock.innerHTML = `${hour > 9 ? hour : `0${hour}`}:00`;
    this.state.doClock(this, hour);
  };

  changeState = (state: State) => {
    this.recordLog(`${this.state}에서 ${state}로 상태가 변화했습니다.`);
    this.state = state;
  };

  callSecurityCenter = (msg: string) => {
    this.textArea.value += `call! ${msg}\n`;
  };

  recordLog = (msg: string) => {
    this.textArea.value += `${msg}\n`;
  };
}
```

SafeFrame 클래스는 Context 인터페이스를 구현하고 있으며, 프로그램에서 사용될 DOM 요소들을 클래스 생성자에서 생성하고 있습니다.

`onClickButton` 메소드는 해당 버튼이 눌렸을 때 실행되며 안의 if문은 '버튼의 종류'에 대응하는 것이지 '현재의 상태'에 대응하는 것이 아니니 "State 패턴에서는 if문을 사용하지 않는다고 했는데?"라는 오해를 하지 않으셔도 됩니다.

`setClock` 메소드는 시간을 나타내기 위해 'textClock'의 값을 바꿔주며, 현재 상태의 `doClock` 메소드를 통해 상태에 따른 처리를 수행합니다. 이 때 상태의 전환이 일어나게 되는데, 이 때 `changeState` 메소드의 `this.state = state` 구문에서 실행됩니다.

이는 **현재의 상태를 나타내고 있는 필드에 상태를 나타내는 클래스의 인스턴스를 대입하는 것이 상태전환에 해당합니다.**

`callSecurityCenter`, `recordLog`는 보안업체에 연락, 사용기록을 남기는 역할이지만 구현상으로 화면에 표시만하고 있습니다.

### Main 클래스

```ts
class Main {
  constructor() {
    const frame: SafeFrame = new SafeFrame();
    let hour: number = 0;

    setInterval(() => {
      hour = hour === 23 ? 0 : hour + 1;
      frame.setClock(hour);
    }, 1000);
  }
}

const m = new Main();
```

동작 테스트를 위해 `SafeFrame` 클래스를 생성하며, 1초마다 시간을 업데이트하고 있습니다.

### 실행 결과

<iframe src="https://codesandbox.io/embed/state-pattern-with-ts-xnp6n?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="state pattern with ts"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

_단순히 body에 요소들을 추가하고, Styling을 하지않아 깔끔하게 보이지는 않습니다_

## State 패턴의 구성요소

- **State**

  State 역할은 상태를 나타내며 상태가 변할 때마다 다른 동작을 하는 인터페이스를 결정합니다. 이 인터페이스는 상태에 의존한 동작을 하는 메소드의 집합이 됩니다. 예제 프로그램에서는 `State` 인터페이스가 담당하였습니다.

- **ConcreteState**

  ConcreteState 역할은 구체적인 각각의 상태를 표현하며 State 역할로 결정되는 인터페이스를 구체적으로 구현합니다. 예제 프로그램에서는 `DayState`, `NightState` 클래스가 담당하였습니다.

- **Context**

  Context 역할은 현재의 상태를 나타내는 ConcreteState 역할을 가집니다. 또한, State 패턴의 이용자에게 필요한 인터페이스를 결정합니다. 예제 프로그램에서는 `SafeFrame` 클래스가 담당하였습니다.

## Class diagram

<div align="center">

![state-diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/State_Design_Pattern_UML_Class_Diagram.svg/451px-State_Design_Pattern_UML_Class_Diagram.svg.png)

</div>

## Divide and Conquer

**Divide and Conquer(분활해서 통치해라)**라는 방침은 프로그래밍에서 자주 등장하곤 합니다. 이것은 큰 규모의 문제를 해결하고자할 때, 해당 문제를 **작은 문제로** 나누고 그래도 해결하기 힘들다면 더 작은 문제로 나누어 크고 까다로운 문제를 하나 푸는 대신에 작고 쉬운 문제를 많이 푸는 방침입니다.

State 패턴은 "상태"를 클래스로 표현하였습니다. 각각의 구체적인 상태를 각각의 클래스로 표현해서 문제를 분활한 것입니다.

State 패턴은 다뤄야할 상태가 많을 때 장점을 발휘하게 됩니다.

## 상태에 의존한 처리

SafeFrame 클래스의 `setClock` 메소드는 Main 클래스로부터 호출되어 시간의 설정을 지시하고 있습니다.

setClock 메소드 안에서 그 처리를 `state.doClock(this, hour)`로 state에 위임하고 있습니다.

즉, 시간의 설정을 현재의 상태에 의존한 처리로 취급하고 있습니다. doClock 메소드만이 아닌, State 인터페이스로 선언되고 있는 메소드는 모두 `"상태의 의존한 처리"`이고 `"상태에 따라 동작이 달라지는 처리"`입니다.

> - 추상 메소드로서 선언하고 인터페이스로 한다
>
> - 구상 메소드로서 구현하고 각각의 클래스로 한다

State 패턴에서는 "상태에 의존한 처리"를 위 두 가지 사항으로 정리할 수 있습니다.

추상 메소드로 선언하고 인터페이스로 하는 것이 `상태에 따라 달라져야할 메소드들`,

구상 메소드로서 구현하고 각각의 클래스로 하는 것이 `각각의 상태에 따라 실행되어야할 메소드들의 구현`입니다.

## 상태전환은 누가 관리해야 하는가 ?

State 패턴에서 상태전환은 **누가 관리해야 할지**는 주의해야하는 요소입니다.

예제 프로그램에서는 Context 역할의 `SafeFrame` 클래스가 상태전환을 실제로 수행하는 `changeState` 메소드를 구현하였으나 실제로 호출하는 것은 `ConcreteState` 역할의 DayState 클래스나 NightState 클래스입니다. 즉, 예제 프로그램에선느 "상태전환"을 "상태에 의존한 동작"으로 간주하고 있습니다. 이는 장점과 단점이 존재합니다.

장점은 "다른 상태로 전환하는 것은 언제인가"하는 정보가 `하나의 클래스 내에 정리`되어 있는 점입니다. 즉, DayState 클래스가 다른 상태로 전환하는 것은 언제인지를 알고 싶을 경우 DayState 클래스의 코드를 읽으면 됩니다.

단점은 `"하나의 ConcreteState 역할이 다른 ConcreteState 역할을 알아야 한다"`는 점입니다. 예제 프로그램에서는 DayState 클래스는 doClock 메소드 안에서 NightState 클래스를 사용하고 있습니다. 이는 장래에 NightState 클래스를 삭제하고 싶을 때 DayState 클래스도 수정해야 한다는 것을 의미합니다. 즉, `상태전환을 ConcreteState 역할에 맡기면 클래스 사이의 의존관계를 깊게 한다`는 것입니다.

위 방법을 포기하고 모든 상태전환을 Context 역할의 SafeFrame 클래스에 맡길 수도 있습니다. 그렇게 하면 각각의 ConcreteState 역할의 독립성이 높아져서 프로그램 전체의 예측이 좋아지는 경우가 있지만, Context 역할이 모든 ConcreteState 역할을 알아야 하는 문제가 발생합니다. 경우에 따라서 여기에 "Mediator" 패턴을 적용할 수 있습니다.

## 새로운 상태를 추가하는 것은 간단하다

State 패턴에서 새로운 상태를 추가하는 것은 간단합니다. 예제 프로그램처럼 State 인터페이스를 구현한 FooState 클래스를 만들어 필요한 메소드를 구현하면 되기 때문입니다. 단지, 상태전환의 부분이 다른 ConcreteState 역할과의 접점이 되기 때문에 주의해야할 뿐입니다.

하지만 완성된 State 패턴에 새로운 `상태의존의 처리`를 추가하는 것은 `곤란`합니다. 이는 State 인터페이스를 수정하는 것을 의미하며, 모든 ConcreteState 역할에 처리를 추가하는 일이 되기 때문입니다.

## 관련 패턴

- Singleton
- Flyweight
