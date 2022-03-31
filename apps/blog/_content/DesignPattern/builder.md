---
title: 'Builder pattern with TypeScript'
date: 2021-08-21 17:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## Builder 패턴이란 ?

빌딩을 세울 때 우선 지반을 다지고, 골격을 세우고, 아래에서 위로 조금씩 만들어 간다.

이렇게 일반적으로 복잡한 건물을 세울 때 한 번에 완성시키기는 어렵다.

이 처럼 **우선 전체를 구성하고 있는 각 부분을 만들고 단계를 밟아 만들어 가는**

구조를 가진 인스턴스를 쌓아 올리는 것이 `Builder 패턴` 이다.

## 예제 프로그램

작성할 예제 프로그램은 **문서**를 작성하는 프로그램이며,

문서는 _타이틀을 한 개 포함한다_, _문자열을 몇 개 포함한다_, *개별 항목을 몇 개 포함한다*는 구조를 가지고 있다.

| 이름        | 해설                                               |
| ----------- | -------------------------------------------------- |
| Builder     | 문서를 구성하기 위한 메소드를 결정하는 추상 클래스 |
| Director    | 한 개의 문서를 만드는 클래스                       |
| TextBuilder | 일반 텍스트를 이용해서 문서를 만드는 클래스        |
| HTMLBuilder | HTML 파일을 이용해서 문서를 만드는 클래스          |
| Main        | 동작 테스트용 클래스                               |

### Builder 클래스

```java
// Java
public abstract class Builder {
    public abstract void makeTitle(String title);
    public abstract void makeString(String str);
    public abstract void makeItems(String[] items);
    public abstract void close();
}
```

```ts
// Typescript
abstract class Builder {
  public abstract makeTitle(title: String): void;
  public abstract makeString(str: String): void;
  public abstract makeItems(items: String[]): void;
  public abstract close(): void;
}
```

`Builder` 클래스는 `문서`를 만들 메소드들을 선언하고 있는 추상 클래스이다.

### Director 클래스

```java
// Java
public class Director {
    private Builder builder;
    public Director(Builder builder) {
        this.builder = builder;
    }
    public void construct() { // 문서 구축
        builder.makeTitle("안녕하세요"); // 타이틀
        builder.makeString("아침과 낮에"); // 문자열
        builder.makeItems(new String[]{"좋은 아침입니다", "안녕하세요"}); // 개별 항목
        builder.close(); // 문서 완성
    }
}
```

```ts
// Typescript
class Director {
  private builder: Builder;

  public constructor(builder: Builder) {
    this.builder = builder;
  }

  // 문서 구축
  public construct = (): void => {
    this.builder.makeTitle('안녕하세요'); // 타이틀
    this.builder.makeString('아침과 낮에'); // 문자열
    this.builder.makeItems(['좋은 아침입니다', '안녕하세요']); // 개별 항목
    this.builder.close(); // 문서 완성
  };
}
```

`Director` 클래스는 `Builder` 클래스로 선언되어 있는 메소드를 사용해서 `문서`를 만듭니다.

`Director` 클래스의 생성자의 인수는 `Builder형`인데,

실제로 Builder 클래스의 인스턴스가 인수로 주어지는 경우는 없다.

Builder 클래스는 **추상** 클래스이며, 이는 인스턴스를 만들 수 없기 때문이다.

즉, Director 클래스의 생성자에 전달되는 것은 Builder 클래스의 **하위** 클래스인 `TextBuilder`, `HTMLBuilder` 클래스의 인스턴스이다.

> construct 메소드를 호출하면 문서가 만들어진다.

### TextBuilder 클래스

```java
// Java
public class TextBuilder extends Builder {
    private StringBuffer buffer = new StringBuffer();
    public void makeTitle(String title) { // 타이틀
        buffer.append("=================\n");
        buffer.append("<" + title + ">\n");
    }
    public void makeString(String str) { // 일반 텍스트
        buffer.append(str + "\n");
    }
    public void makeItems(String[] items) { // 개별 항목
        for (int i =0; i < items.length; i++) {
            buffer.append("-" + items[i] + "\n");
        }
    }
    public void close() { // 종료선
        buffer.append("=================\n");
    }
    public String getResult() { // 완성한 문서
        return buffer.toString();
    }
}
```

```ts
// Typescript
class TextBuilder extends Builder {
  private buffer: string[] = [];
  public makeTitle = (title: String): void => {
    this.buffer.push('=================\n');
    this.buffer.push(title + '\n');
  };

  public makeString = (str: String): void => {
    this.buffer.push(str + '\n');
  };

  public makeItems = (items: String[]): void => {
    for (let i = 0; i < items.length; i++) {
      this.buffer.push(items[i] + '\n');
    }
  };

  public close = (): void => {
    this.buffer.push('=================\n');
  };

  public getResult = (): String => {
    return this.buffer.join('');
  };
}
```

`TextBuilder` 클래스는 Builder 클래스의 하위 클래스이다.

일반 텍스트를 사용해서 문서를 구축하고 결과를 String으로 반환한다.

### HTMLBuilder 클래스

```java
// Java
import java.io.*;

public class HTMLBuilder extends Builder {
    private String filename;
    private PrintWriter writer;
    public void makeTitle(String title) {
        filename = title + ".html";
        // 중략
    }
    public void makeString(String str) {
        writer.println("<p>" + str + "</p>");
    }
    public void makeItems(String[] items) {
        for (int i = 0; i < items.length; i++) {
            // 중략
        }
    }
    public void close() {
        writer.close();
    }
    public String getResult() { // 파일명을 반환
        return filename;
    }
}
```

> HTML 파일을 만들고 작성하는 내용이라 TS는 생략하겠습니다.

HTMLBuilder 클래스도 Builder 클래스의 하위 클래스이며, HTML 파일로 문서를 구축하고 파일명을 반환한다.

### Main 클래스

```java
public class Main {
    public static void Main(String[] args) {
        if (args.length != 1) {
            usage();
            System.exit(0);
        }
        if (args[0].equals("plain")) {
            TextBuilder textbuilder = new TextBuilder();
            Director director = new Director(textbuilder);
            director.consturct();
            String result = textbuilder.getResult();
            System.out.println(result);
        } else if (args[0].equals("html")) {
            HTMLBuilder htmlbuilder = new HTMLBuilder();
            Director director = new Director(htmlbuilder);
            director.construct();
            String filename = htmlbuilder.getResult();
            System.out.println(filename + "가 작성되었습니다");
        } else {
            usage();
            System.exit(0);
        }
    }

    public static void usage() {
        System.out.println("Usage: java Main plane 일반 텍스트로 문서작성");
        System.out.println("Usage: java Main html  HTML 파일로 문서작성");
    }
}
```

> TextBuilder 클래스의 인스턴스 혹은 HTMLBuilder 클래스의 인스턴스를
> Director 클래스의 생성자에게 전달한다.

TexBuilder, HTMLBuilder는 Builder 클래스의 하위 클래스이고

Director는 Builder의 메소드만을 사용해서 문서를 작성한다.

Builder의 메소드만을 사용한다는 것은 **Director는 실제로 동작하는 것이 TextBuilder인지, HTMLBuilder인지 모른다**는 뜻이다.

따라서 Builder는 문서를 구축하려는 목적을 달성하기 위해서 필요 충분한 메소드군을 선언할 필요가 있다.

단, 일반 텍스트나 HTML 파일에 **고유의 메소드까지 Builder가 제공해서는 안된다.**

## Builder 패턴의 구성요소

- **Builder**

  Builder 역할은 인스턴스를 생성하기 위한 인터페이스를 결정한다.

  인스턴스의 각 부분을 만들기 위한 메소드가 준비되어 있으며, 예제 프로그램에서는 Builder 클래스가 이 역할을 담당한다.

- **ConcreteBuilder**

  ConcreteBuilder 역할은 Builder 역할의 인터페이스를 구현하고 있는 클래스이다.

  실제 인스턴스 작성으로 호출되는 메소드, 최종 결과를 얻기 위한 메소드가 준비되어 있다.

  예제 프로그램에서는 TextBuilder, HTMLBuilder 크래스가 이 역할을 담당한다.

- **Director**

  Director 역할은 Builder 역할의 인터페이스를 사용해서 인스턴스를 생성한다.

  ConcreteBuilder 역할과 관계없이 제대로 기능하도록 Builder 역할의 메소드만을 사용한다.

  예제 프로그램에서는 Director 클래스가 이 역할을 담당한다.

- **Client**

  Builder 패턴을 이용하는 역할이며, 예제 프로그램에서는 Main 클래스가 역할을 담당하였다.

  _GoF 책에서는 Client 역할은 Builder 패턴 안에 포함되어 있지 않다._

![diagram](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Builder_UML_class_diagram.svg/700px-Builder_UML_class_diagram.svg.png)

## 누가 무엇을 알고 있을까 ?

OOP에서 "누가 무엇을 알고 있을까?", "어떤 클래스가 어떤 메소드를 사용할 수 있을까?" 는 상당히 중요하여 주의하며 프로그래밍을 할 필요가 있다.

- Main 클래스는 Builder 클래스의 메소드를 모르며, Director 클래스의 construct 메소드만을 호출한다.

- Director 클래스는 Builder 클래스를 알고 있어, 메소드를 사용하여 문서를 구착한다. 하지만 실제로 이용하고 있는 클래스가 TextBuilder, HTMLBuilder 또는 Builder의 다른 하위 클래스인지 모른다.

- Director 클래스가 자신이 이용하고 있는 Builder 클래스의 하위 클래스를 **모르기 때문에 교체할 수 있다.**

모르기 때문에 교환이 가능하고, 교체가 가능하기 때문에 부품으로서 가치가 높다.

`교환가능성`은 클래스의 설계자로써 항상 기억할 필요가 있다.

## 설계 시에 결정할 수 있는 것, 결정할 수 없는 것

Builder 클래스는 문서를 구축할 때 필요 충분한 메소드군을 선언해야 한다.

왜냐하면 Director 클래스에 주어진 도구는 Builder 클래스가 제공하는 도구이기 때문이다.

예제 프로그램에서는 Text와 HTML 형식의 파일만을 Build 했지만, 미래에 ASDF라는 형식이 나왔을 때 ASDFBuilder 클래스를 만들 수 있을 지, 새로운 메소드가 필요할지는 모른다.

이처럼 모든 것을 예상할 수는 없기 때문에, 가까운 미래에 발생할 것으로 **예상되는 변화에 적응할 수 있도록 설계**해야 한다.

## 관련 패턴

- Template Method

  Director 역할이 Builder 역할을 제어, Template Method 패턴에서는 상위 클래스가 하위 클래스를 제어한다.

- Composite

  Builder 패턴에 의해 만들어진 생성물은 Composite 패턴이 되는 경우가 있다.

- Abstract Factory

  Builder 패턴과 마찬가지로 복잡한 인스턴스를 생선한다.

- Facade

  Director 역할은 Builder 역할의 복잡한 메소드를 조합해서 인스턴스를 구축하는 인터페이스를 외부에 제공하는 것 (construct)이다.
  Facade 패턴의 Facade 역할은 내부 모듈을 조합해 단순한 인터페이스를 외부에 제공한다.
