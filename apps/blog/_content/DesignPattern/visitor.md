---
title: 'Visitor pattern with TypeScript'
date: 2021-09-26 22:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## Visitor 패턴이란 ?

`Visitor`은 방문자를 의미한다.

데이터 구조 안에 많은 요소가 저장되어 있고, 각 요소에 대해서 어떤 `처리`를 해야될 때 해당 처리의 코드는 어디에 써야할까 ?

일반적으로 데이터 구조를 표현하는 클래스 안에 기술할 것이다. 하지만 처리의 종류가 여러개거나 새로운 처리가 필요할 시 데이터 구조 클래스를 수정해야 한다.

Visitor 패턴에서는 데이터 `구조와 처리를 분리`한다. 그리고 데이터 구조 안을 돌아다니는 `방문자`에게 처리를 위임한다.

그렇다면 새로운 처리를 추가하고 싶을 때에는 새로운 방문자를 만들면 된다.

## 예제 프로그램

`Composite` 패턴으로 파일과 디렉터리로 이루어진 데이터 구조 안을 `방문자`가 돌아다니고 파일의 종류를 표시하는 프로그램이다.

| 이름                   | 해설                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| Visitor                | 파일과 디렉터리를 방문하는 방문자를 나타내는 추상 클래스                |
| Element                | Visitor 클래스의 생성자를 받아들이는 데이터 구조를 나타내는 인터페이스  |
| ListVisitor            | Visitor 클래스의 하위 클래스로 파일과 디렉터리의 종류를 나타내는 클래스 |
| Entry                  | File과 Directory의 상위 클래스가 되는 추상 클래스                       |
| File                   | 파일을 나타내는 클래스                                                  |
| Directory              | 디렉터리를 나타내는 클래스                                              |
| FileTreatmentException | File에 대해서 add한 경우에 발생하는 예외 클래스                         |
| Main                   | 동작 테스트용 클래스                                                    |

### Visitor 클래스

```ts
import { File } from './File';
import { Directory } from './Directory';

export abstract class Visitor {
  public abstract visit(file: File): void;
  public abstract visit(directory: Directory): void;
}
```

`Visitor` 클래스는 **방문자**를 나타내는 추상 클래스이다.

인수를 `File`, `Directory`로 구분한 메소드가 `Overload`되어 선언되어 있다.

### Element 인터페이스

```ts
export interface Element {
  accept: (v: Visitor) => void;
}
```

`Element` 인터페이스는 방문자를 받아들이는 인터페이스로써, Visitor 클래스를 인수로 갖는 메소드 `accept`를 선언하고 있다.

간단히 비유하자면 호텔은 `Element`, 호텔의 투숙객은 `Visitor`가 되는 것이다.

### Entry 클래스

```ts
export abstract class Entry implements Element {
  public abstract accept: (v: Visitor) => void;
  public abstract getName: () => string;
  public abstract getSize: () => number;

  public add = (entry: Entry): Entry => {
    throw new FileTreatmentException();
  };

  public iterator = (): Entry[] => {
    throw new FileTreatmentException();
  };

  public toString = (): string => {
    return `${this.getName()} (${this.getSize()})`;
  };
}
```

Composite 패턴의 `Component` 역할을 하는 클래스를 Element를 구현하도록 한 클래스이다.

Element 인터페이스에 선언된 추상 메소드 `accept`는 하위 클래스인 `File`, `Directory` 클래스에서 구현한다.

`add`, `iterator` 메소드는 Directory 클래스에서만 유효하므로 에러로 처리하고 있다.

### File 클래스

```ts
export class File extends Entry {
  private name: string;
  private size: number;

  constructor(name: string, size: number) {
    super();
    this.name = name;
    this.size = size;
  }

  public getName = (): string => {
    return this.name;
  };

  public getSize = (): number => {
    return this.size;
  };

  public accept = (v: Visitor): void => {
    v.visit(this);
  };
}
```

Composite 패턴의 `Leaf` 역할의 클래스이며 추가적으로 `accept` 메소드를 구현하고 있다.

this가 File 클래스의 생성자이기 때문에, Overload된 두 메소드 중 `visit(File)`이 호출되며,

visit 메소드를 호출하여 방문한 File의 인스턴스를 Visitor에게 알려준다.

### Directory 클래스

```ts
export class Directory extends Entry {
  private name: string;
  private dir: Entry[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  public getName = (): string => {
    return this.name;
  };

  public getSize = (): number => {
    let size = 0;
    for (let entry of this.dir) size += entry.getSize();
    return size;
  };

  public add = (entry: Entry): Entry => {
    this.dir.push(entry);
    return this;
  };

  public iterator = (): Entry[] => {
    return this.dir;
  };

  public accept = (v: Visitor): void => {
    v.visit(this);
  };
}
```

Composite 패턴의 `Composite` 역할의 클래스이며 추가적으로 `iterator`, `accept` 메소드를 구현하고 있다.

`iterator` 메소드는 Directory에 포함되어 있는 Entry의 종류를 얻기 위해 사용되며,

`accept` 메소드는 위 File 클래스와 같은 이유로 `visit(Directory)`가 호출되며 Visitor에게 Directory의 인스턴스를 알려준다.

### ListVisitor 클래스

```ts
export class ListVisitor extends Visitor {
  private currentdir: string = '';

  visit(file: File): void;
  visit(directory: Directory): void;

  public visit(value: File | Directory) {
    console.log(`${this.currentdir}/${value}`);
    if (value instanceof File) return;

    let savedir = this.currentdir;
    this.currentdir = `${this.currentdir}/${value.getName()}`;
    for (let entry of value.iterator()) {
      entry.accept(this);
    }
    this.currentdir = savedir;
  }
}
```

`ListVisitor` 클래스는 Visitor 클래스의 하위 클래스로써 `visit(File)`, `visit(Directory)` 를 구현하고 있다.

`currentdir` 필드는 현재 주목하고 있는 디렉터리의 이름을 저장한다.

`visit` 메소드는 동일하게 현재 위치를 출력하며,
Directory일 경우 해당 디렉터리의 각 엔트리에 대해서 accept 메소드를 호출한다.

`accept` 메소드는 visit 메소드를, `visit` 메소드는 accept 메소드를 호출하고 있는, 서로 상대를 호출하는 모습을 띄고 있다.

### FileTreatmentException 클래스

```ts
export class FileTreatmentException {
  constructor(msg?: String) {
    if (msg) throw Error(msg as string);
  }
}
```

`File`에서 add, iterator를 호출하였을 때 Error를 throw하는 클래스이다.

### Main 클래스

```ts
export class Main {
  main() {
    try {
      console.log('Making root entries...');
      const rootdir: Directory = new Directory('root');
      const bindir: Directory = new Directory('bin');
      const tmpdir: Directory = new Directory('tmp');
      const usrdir: Directory = new Directory('usr');
      rootdir.add(bindir);
      rootdir.add(tmpdir);
      rootdir.add(usrdir);
      bindir.add(new File('vi', 10000));
      bindir.add(new File('latex', 20000));
      rootdir.accept(new ListVisitor());

      console.log('\n');
      console.log('Making user entries...');
      const Kim: Directory = new Directory('Kim');
      const Oh: Directory = new Directory('Oh');
      const Park: Directory = new Directory('Park');
      usrdir.add(Kim);
      usrdir.add(Oh);
      usrdir.add(Park);
      Kim.add(new File('diary.html', 100));
      Kim.add(new File('foo.css', 300));
      const Wavy: Directory = new Directory('Wavy');
      Oh.add(Wavy);
      Wavy.add(new File('index.tsx', 100));
      Wavy.add(new File('App.tsx', 500));
      Park.add(new File('game.doc', 10000));
      rootdir.accept(new ListVisitor());
    } catch (error) {
      console.log(error);
    }
  }
}
```

Directory와 File을 이용하여 구조를 만든다.

그 후 출력이라는 `처리`를 위해 rootdir의 accept 메소드에 `ListVisitor` 클래스의 인스턴스를 인수로 실행한다.

### 실행 결과

<iframe src="https://codesandbox.io/embed/runtime-mountain-zhyrt?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="runtime-mountain-zhyrt"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## Visitor 패턴의 구성요소

- **Visitor**

  데이터 구조의 구체적인 요소마다 `visit(foo)` 메소드를 선언하는 역할을 한다. `foo`는 foo를 처리하기 위한 메소드이고, 실제 구현은 ConcreteVisitor 역할에 기술되어 있다. 예제 프로그램에서는 `Visitor` 클래스가 담당하였다.

- **ConcreteVisitor**

  Visitor 역할의 인터페이스를 구현하는 역할을 한다. 예제 프로그램에서는 `ListVisitor`가 담당하였다. 이 때 ListVisitor의 `currentdir` 필드값이 변화하듯 visit을 처리하는 중 내부상태가 변화하는 일도 있을 수 있다.

- **Element**

  Visitor 역할이 방문할 곳을 나타내는 역할이다. 방문자를 받아들이는 `accept` 메소드를 선언하며 인수에는 Visitor 역할이 전달된다. 예제 프로그램에서는 `Element` 인터페이스가 담당하였다.

- **ConcreteElement**

  Element 역할의 인터페이스를 구현하는 역할이다. 예제 프로그램에서는 `File`, `Directory` 클래스가 담당하였다.

- **ObjectStructure**

  Element 역할의 집합을 취급하는 역할로써 `ConcreteVisitor` 역할이 각각의 `Element` 역할을 취급할 수 있는 메소드를 구비하고 있다. 예제 프로그램에서는 `Directory` 클래스가 담당하였으며 각각의 Element 역할을 취급할 수 있는 메소드는 `iterator`였다.

## Class diagram

<div align="center">

![visitor-diagram](https://user-images.githubusercontent.com/26461307/134809802-96f3bfdd-34e9-4d07-80f2-e0796c0f4195.png)

</div>

데이터 구조를 담당하는 `Element`와 처리를 담당하는 `Visitor`가 분리되어 있다.

## Sequence diagram

<div align="center">

![visitor-sequence](https://user-images.githubusercontent.com/26461307/134809801-223d1536-daa6-4620-93fd-950cd09605b1.png)

</div>

Element는 `accept(Visitor)`하며, Visitor는 `visit(element)`하는 형태를 띄고 있다.

이 처럼 두 역할을 하는 한 쌍에 의해 실제 처리가 되는 것을 일반적으로 `더블 디스패치`라고 한다.

## 왜 이렇게까지 복잡하게 해야하나 ?

Visitor 패턴의 목적은 `처리를 데이터 구조에서 분리하는 일`이다.

만약 처리 내용을 File, Directory 클래스의 메소드로서 프로그램을 작성하면, 새로운 `처리`가 생기거나 기능을 확장해야 할 때마다 각 File, Directory 클래스를 수정해야 한다.

하지만 Visitor 패턴을 사용하여 처리와 데이터 구조를 분리하였을 시, 데이터 구조와 독립적으로 `ConcreteVisitor` 역할을 개발하면 된다.

이 처럼 File, Directory 클래스의 부품으로써의 `독립성`을 높임과 데이터 구조와 처리를 `분리`함으로써 OCP 원칙을 지킬 수 있따.

### Open-Closed Principle

> 확장에 대해서는 열려(open)있지만, 수정에 대해서는 닫혀(closed)있어야 한다.

기존의 클래스를 수정하지 않고 확장할 수 있도록 하는 것이 OCP 원칙이다.

## ConcreteVisitor 추가

구체적인 처리는 ConcreteVisitor가 전담하며, 해당 처리를 위해 ConcreteElement의 수정은 필요치 않기 때문에 **간단**하다.

## ConcreteElement 추가

ConcreteVisitor의 추가와 반대로 ConcreteElement의 추가는 곤란하다.

예제 프로그램에서 Entry 클래스의 하위에 `Device` 클래스를 만든다고 하였을 때,

Visitor 역할에 `visit(Device)` 메소드가 필요해지며, Visitor의 모든 하위 클래스에서 `visit(Device)`를 구현해야하기 때문이다.

## Visitor가 필요한 것

처리(Visitor)와 데이터 구조(Element)를 분리하는 것은 그럴듯 하지만, Element는 Visitor에게 **충분한 정보를 공개할 필요**가 있다.

예제 프로그램에서는 각 Directory 안의 각 엔트리에 대해 accept를 하기 위해 `iterator`를 제공하고 있다.

이 처럼 Visitor는 데이터 구조에 필요한 정보를 취득해서 동작한다.

필요한 정보를 얻을 수 없으면 Visitor는 제대로 일할 수 없으며, 공개할 필요 없는 정보까지 공개하게 되면 미래의 데이터 구조를 수정하기 어렵게 된다.

## 관련 패턴

- Iterator
- Composite

  방문처가 되는 데이터 구조는 Composite 패턴이 되는 경우가 많다.

- Interpreter

_이미지 출처 : https://reactiveprogramming.io/blog/en/design-patterns/visitor_
