---
title: 'Factory Method pattern with TypeScript'
date: 2021-08-02 17:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## Factory Method 패턴이란 ?

'Factory'는 `공장`이라는 의미를 가지고 있다.

`Factory Method` 패턴은 인스턴스를 만드는 방법을 상위 클래스 측에서 결정하지만, 구체적인 클래스 이름까지는 결정하지 않는다.

구체적인 내용은 모두 하위 클래스 측에서 수행한다.

> 인스턴스를 생성하는 공장을 `Template Method` 패턴으로 구성한 것이 `Factory Method` 패턴이 된다.

## 예제 프로그램

작성할 예제 프로그램은 `IDCard`를 만드는 공장을 소재로 하였다.

골격 역할을 할 `Product`, `Factory` 클래스, 구체적인 내용을 구현할 `IDCard`, `IDCardFactory` 클래스 나뉘어져 있다.

### Product 클래스

```java
// Java
public abstract class Product {
    public abstract void use();
}

```

```ts
// Typescript
abstract class Product {
  public abstract use(): void;
}
```

`Product` 클래스는 `제품`을 표현한 클래스이며, 추상 메소드 `use`만이 선언되어 있다.

구체적인 `use`의 구현은 모두 `Product`의 하위 클래스에게 맡기고 있다.

### Factory 클래스

```java
// Java
public abstract class Factory {
    public final Product create(String owner) {
        Product p = createProduct(owner);
        registerProduct(p);
        return p;
    }

    protected abstract Product createProduct(String owner);
    protected abstract void registerProduct(Product product);
}
```

> final 메소드는 더 이상 **오버라이딩 할 수 없음**을 뜻한다.

```ts
// Typescript
abstract class Factory {
  public create = (owner: string): Product => {
    const p: Product = this.createProduct(owner);
    this.registerProduct(p);
    return p;
  };

  protected abstract createProduct(owner: string): Product;
  protected abstract registerProduct(product: Product): void;
}
```

Factory 클래스는 인스턴스를 생성할 때 `Template Method` 패턴이 사용되고 있다.

추상 메소드 `createProduct`에서 '제품을 만들고', 만든 제품을 추상 메소드 `registerProduct`에서 '등록' 한다.

이 클래스는 **"create 메소드에서 Product의 인스턴스를 createProduct에서 만들어서 registerProduct에서 등록한다"** 라는 순서로 구현되고 있다.

> 제품을 만들고 등록하는 구현은 하위 클래스에서 수행한다.

### IDCard 클래스

```java
// Java
public class IDCard extends Product {
    private String owner;
    IDCard(String owner) {
        System.out.println(owner + "의 카드를 만듭니다.");
        this.owner = owner;
    }
    public void use() {
        System.out.println(owner + "의 카드를 사용합니다.");
    }
    public String getOwner() {
        return owner;
    }
}
```

```ts
// Typescript
class IDCard extends Product {
  private owner: string;

  constructor(owner: string) {
    super();
    console.log(`${owner}의 카드를 만듭니다.`);
    this.owner = owner;
  }

  public use = (): void => {
    console.log(`${this.owner}의 카드를 사용합니다.`);
  };

  public getOwner = (): string => {
    return this.owner;
  };
}
```

`Product` 클래스의 하위 클래스로 정의하며, `use` 메소드를 구현합니다.

### IDCardFactory 클래스

```java
// Java
public class IDCardFactory extends Factory {
    private List owners = new ArrayList();
    protected Product createProduct(String owner) {
        return new IDCard(owner);
    }
    protected void registerProduct(Product product) {
        owners.add(((IDCard)product).getOwner());
    }
    public List getOwners() {
        return owners;
    }
}
```

```ts
// Typescript
class IDCardFactory extends Factory {
  private owners: string[] = [];

  protected createProduct = (owner: string): Product => {
    return new IDCard(owner);
  };

  protected registerProduct = (product: Product): void => {
    this.owners.push((product as IDCard).getOwner());
  };

  public getOwners = (): string[] => {
    return this.owners;
  };
}
```

`IDCardFactory` 클래스는 `IDCard` 인스턴스를 생성해 **제품을 만드는** `createProduct`와

`IDCard의 owner`를 owners 필드에 추가해 **등록하는** `registerProduct` 메소드를 구현하고 있다.

### Main 클래스

```java
// Java
public class Main {
    public static void main(String[] args) {
        Factory factory = new IDCardFactory();
        Product card1 = factory.create("김철수");
        Product card2 = factory.create("박철수");
        Product card3 = factory.create("오철수");
        card1.use();
        card2.use();
        card3.use();
    }
}
```

```ts
// Typescript
class Main {
  main = () => {
    const factory: Factory = new IDCardFactory();
    const card1: Product = factory.create('김철수');
    const card2: Product = factory.create('박철수');
    const card3: Product = factory.create('오철수');
    card1.use();
    card2.use();
    card3.use();
  };
}
```

```console
김철수의 카드를 만듭니다.
박철수의 카드를 만듭니다.
오철수의 카드를 만듭니다.
김철수의 카드를 사용합니다.
박철수의 카드를 사용합니다.
오철수의 카드를 사용합니다.
```

`Main` 클래스에서는 위에서 구현한 `IDCardFactory`를 사용하여 3개의 카드를 만들고 사용하였다.

## Factory Method의 구성요소

- **Product**

예제 프로그램에서 `Product` 클래스가 역할을 담당했으며, 이 패턴에서 생성되는 인스턴스가 가져야하는 인터페이스를 결정하는 추상 클래스이다.

- **Creator**

예제 프로그램에서 `Factory` 클래스가 역할을 담당했다.

해당 요소의 역할은 인스턴스 생성의 메소드를 호출하면 `Product`가 생성된다는 것이며, 예제 프로그램에서는 `createProduct` 메소드가 담당하였다.

> new를 사용해서 실제의 인스턴스를 생성하는 대신에, 인스턴스 생성을 위한 메소드를 호출해서 구체적인 클래스 이름에 의한 속박에서 상위 클래스를 자유롭게 만든다.

- **ConcreteProduct**

예제 프로그램에서 `IDCard` 클래스가 역할을 담당헀으며, 구체적인 제품을 결정한다.

- **ConcreteCreator**

예제 프로그램에서 `IDCardFactory` 클래스가 역할을 담당했으며, 구체적인 제품을 만드는 클래스를 결정한다.

## Framework와 구체적인 내용

위에서 `추상적인 골격`, `구체적인 내용`의 두 가지 측면에 관해서 살펴보았다.

이들은 각각 `framework`, `idcard`로 나뉘어져 있는데, 이 상황에서 동일한 framework를 사용해서 'Television', 'TelevisionFactory'를 만든다고 가정하자.

이 때 `framework`의 **내용을 수정하지 않아도** 전혀 다른 제품과 공장을 만들 수 있다.

그 이유는 `frameworks`는 `idcard`를 사용하지 않기 때문, 즉 `의존하고 있지 않기` 때문이다.

## 인스턴스 생성 - 메소드의 구현 방법

예제 프로그램 `Factory` 클래스의 `createProduct` 메소드의 기술 방법은 다음 세 가지가 있다.

#### 1. 추상 메소드

```ts
abstract class Factory {
    protected abstract createProduct(owner: string): Product;
    ...
}
```

추상 메소드로 작성하면 하위 클래스는 반드시 이 메소드를 구현해야 한다.

예제 프로그램에서 사용한 방법이다.

#### 2. 디폴트의 구현을 준비

```ts
class Factory {
  protected createProduct = (owner: string): Product => {
    return new Product(owner);
  };
  ...
}
```

디폴트 메소드를 구현해두고 하위 클래스에서 구현하지 않았을 때 사용하는 방법이다.

단, 이 경우에서는 `Product` 클래스에 대해서 직접 new를 이용하고 있으므로 Product 클래스를 추상 클래스로 둘 수 없다.

#### 3. 에러를 이용

```ts
class Factory {
  protected createProduct = (owner: string): Product => {
    throw new FactoryMethodRuntimeException();
  };
  ...
}
```

디폴트의 구현 내용을 에러로 처리해 두면, 하위 클래스에서 구현하지 않았을 경우 에러가 발생하여 **구현되고 있지 않은 것**을 알려 줄 수 있다.

단, *FactoryMethodRuntimeException*는 별도로 작성되어 있다고 가정한다.

## 그 외

- 패턴 이용과 개발자 간의 의사 소통

  여러 디자인 패턴들은 1개의 클래스만을 읽는 것이 아니기 때문에, 실제 이루어지는 동작에 비해 복잡한 프로그래밍으로 느껴질 수 있다.

  일반적으로 디자인 패턴을 사용해서 어떤 클래스를 설계할 때, 그 클래스를 보수하는 사람에게 설계자가 의도한 디자인 패턴이 무엇인지를 전달할 필요가 있다. 그렇지 않으면 설계자의 처음 의도와는 다동떨어진 수정이 가해질 가능성이 있기 때문이다.

  프로그램의 주석이나 개발 문서 안에 실제로 사용되고 있는 `디자인 패턴의 명칭과 의도를 기술`해 놓는 것도 좋은 방법이다.

- 관련 패턴

  `Template Method`, `Singleton`, `Composite`, `Iterator`
