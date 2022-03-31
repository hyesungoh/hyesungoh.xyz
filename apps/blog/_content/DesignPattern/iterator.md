---
title: 'Iterator pattern with TypeScript'
date: 2021-07-19 17:50:00
category: 'DesignPattern'
draft: false
---

본 게시물은 `Java 언어로 배우는 디자인 패턴 입문 - Yuki Hiroshi 저`를 기반으로 공부한 것을 정리하며 Typescript로 재작성해본 내용입니다.

## Iterator 패턴이란 ?

```java
// Java
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}
```

```ts
// Typescript
for (let i: number = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

위 코드는 `i`를 하나씩 증가시키며 배열 `arr`의 요소 전체를 처음부터 차례대로 검색하게 된다. 여기에서 사용되고 있는 변수 `i`의 기능을 **추상화**해서 **일반화**한 것을 디자인 패턴에서는 `Iterator` 패턴이라고 한다.

> 쉽게 말해 무엇인가 많이 모여있는 것들을 순서대로 지정하면서 전체를 검색하는 처리를 실행하기 위한 것이다.

## 예제 프로그램

작성할 예제 프로그램은 `BookShelf` 안에 `Book`을 넣고, 그 책의 이름을 차례대로 표시하는 프로그램이다.

### Aggregate 인터페이스

```java
// Java
public interface Aggregate {
    public abstract Iterator iterator();
}
```

```ts
// Typescript
interface Aggerate {
  iterator: () => myIterator; // myIterator는 후술
}
```

> Aggregate는 '모으다', '모이다', '집합'의 의미로 `집합체`를 나타낸다.

해당 인터페이스를 구현하고 있는 클래스는 배열과 같이 무엇인가가 많이 모여있으며,

집합체를 하나씩 나열, 검색, 조사하고 싶을 때 `iterator` 메소드를 사용한다.

### Iterator 인터페이스

```java
// Java
public interface Iterator {
    public abstract boolean hasNext();
    public abstract Object next();
}
```

```ts
// Typescript
interface myIterator {
  hasNext: () => boolean;
  next: () => object;
}
```

다음 값이 존재하는지를 조사하기 위한 `hasNext`, 다음 요소를 얻으며 내부 상태를 다음으로 진행시켜 두는 `next` 메소드로 이루어져 있다.

### Book 클래스

```java
// Java
public class Book {
    private String name;
    public Book(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
}
```

```ts
// Typescript
class Book {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  getName = (): string => {
    return this.name;
  };
}
```

### BookShelf 클래스

```java
// Java
public class BookShelf implements Aggregate {
    private Book[] books;
    private int  last = 0;
    public BookShelf (int maxsize) {
        this.books = new Book[maxsize];
    }
    public Book getBookAt (int index) {
        return books[index];
    }
    public void appendBook (Book book) {
        this.books[last] = book;
        last++;
    }
    public int getLength() {
        return last;
    }
    public Iterator iterator() {
        return new BookShelfIterator(this);
    }
}
```

```ts
// Typescript
class BookShelf implements Aggerate {
  private books: Book[];
  private last: number;

  constructor(maxsize: number) {
    this.books = [];
    this.last = 0;
  }

  getBookAt = (index: number): Book => {
    return this.books[index];
  };

  appendBook = (book: Book) => {
    this.books[this.last] = book;
    this.last++;
  };

  getLength = () => {
    return this.last;
  };

  iterator = () => {
    return new BookShelfIterator(this);
  };
}
```

`Aggregate` 구현하고 있는 `BookShelf` 클래스이다.

`iterator` 메소드는 `BookShelf` 클래스에 대응하는 `Iterator`로서, `BookShelfIterator`라는 클래스의 인스턴스를 생성하고 그것을 반환한다. 이 서가의 책을 하나씩 나열하고 싶을 때는 `iterator` 메소드를 호출한다.

### BookShelfIterator 클래스

```java
public class BookShelfIterator implements Iterator {
    private BookShelf bookShelf;
    private int index;
    public BookShelfIterator(BookShelf bookShelf) {
        this.bookShelf = bookShelf;
        this.index = 0;
    }
    public boolean hasNext() {
        if (index < bookShelf.getLength()) {
            return true;
        }
        return false;
    }
    public Object next() {
        Book book = bookShelf.getBookAt(index);
        index++;
        return book;
    }
}
```

```ts
// Typescript
class BookShelfIterator implements myIterator {
  private bookShelf: BookShelf;
  private index: number;

  constructor(bookShelf: BookShelf) {
    this.bookShelf = bookShelf;
    this.index = 0;
  }

  hasNext = () => {
    return this.index < this.bookShelf.getLength() ? true : false;
  };

  next = () => {
    const book: Book = this.bookShelf.getBookAt(this.index);
    this.index++;
    return book;
  };
}
```

`BookShelfIterator`를 `Iterator`로서 다루기 위해 Iterator 인터페이스를 구현하고 있으며, `BookShelf` 필드는 검색할 서가, `index` 필드는 현재 주목하고 있는 책을 가리키는 첨자이다.

`hasNext` 메소드는 Iterator 인터페이스에서 선언되어 있는 메소드를 구현한 것으로, `다음 책`이 있는지를 조사해서 있으면 `true`, 없으면 `false`를 반환합니다.

`next` 메소드는 현재 처리하고 있는 Book을 반환하고, 다시 다음으로 진행시키는 메소드이다.

### Main 클래스

```java
// java
public class Main {
    public static void main(String[] args) {
        BookShelf bookShelf = new BookShelf(4);
        bookShelf.appendBook(new Book("Apple"));
        bookShelf.appendBook(new Book("Banana"));
        bookShelf.appendBook(new Book("Chicken"));
        bookShelf.appendBook(new Book("Diamond"));

        Iterator it = bookShelf.iterator();
        while (it.hasNext()) {
            Book book = (Book)it.next();
            System.out.println(book.getName());
        }
    }
}
```

```typescript
// Typescript

class Main {
  main = () => {
    const bookShelf: BookShelf = new BookShelf(4);
    bookShelf.appendBook(new Book('Apple'));
    bookShelf.appendBook(new Book('Banana'));
    bookShelf.appendBook(new Book('Chicken'));
    bookShelf.appendBook(new Book('Diamond'));

    const it: myIterator = bookShelf.iterator();
    while (it.hasNext()) {
      const book: Book = it.next() as Book;
      console.log(book.getName());
    }
  };
}
```

4권의 책을 만들어 넣은 후, 책이 있는 한 while 루프가 돌아가고, 루프 내에서 next에 의해 책을 한 권씩 조사하게 되며 결과는 다음과 같다.

```console
Apple
Banana
Chicken
Diamond
```

## Iterator의 구성요소

- **Iterator**

요소를 순서대로 검색해가는 인터페이스를 결정하며, 예제 프로그램에서는 `Iterator (myIterator)` 인터페이스가 그 역할을 한다.

- **ConcreteIterator**

`Iterator`가 결정한 인터페이스를 실제로 구현한 것이며, 예제 프로그램에서는 `BookShelfIterator` 클래스가 담당하였다.

이 역할은 **검색하기 위해 필요한 정보**를 가지고 있어야 하며, 예제 프로그램에서는 bookShelf, index 필드를 가지고 있었다.

- **Aggregate**

`Iterator` 역할을 만들어내는 인터페이스를 결정한다. 이는 **내가 가지고 있는 요소를 순서대로 검색해 주는 것**을 만들어내는 메소드이다.

예제 프로그램에서는 `Aggregate` 인터페이스가 이 역할을 담당하며 iterator 메소드를 경정하였다.

- **ConcreteAggregate**

`Aggregate` 역할이 결정한 인터페이스를 실제로 구현하는 일을 하며, `ConcreteIterator` 역할의 인스턴스를 만들어낸다.

예제 프로그램에서는 `BookShelf` 클래스가 이 역할을 담당하였다.

## 사용 이유

배열을 이용해 반복할 수 있는데, 조금 번거로울 수 있는 `Iterator` 패턴을 왜 사용하는 것일까 ?

가장 큰 이유는 **구현과 분리**해서 하나씩 셀 수 있기 때문이다.

```typescript
while (it.hasNext()) {
  const book: Book = it.next() as Book;
  console.log(book.getName());
}
```

위 코드에서 사용되고 있는 `hasNext`와 `next`는 `Iterator`의 메소드뿐이며, `BookShelf` 구현에서 사용되고 있는 메소드는 호출되고 있지 않다. 즉, 위 while 루프는 **BookShelf의 구현에 의존하지 않는 것**이다.

만약 다른 사람이 `BookShelf`를 수정하였다 하더라도, `iterator` 메소드를 가지고 있으며 올바른 `Iterator`를 반환해 준다면 위 코드는 **변경하지 않아도 동작**한다.

디자인 패턴은 클래스의 `재이용화`를 촉진하는데, 재이용화를 촉진한다는 것은 클래스를 부품처럼 사용할 수 있게 하고, 하나의 부품을 수정해도 다른 부품에 큰 영향 없이 적은 수정만으로 끝낼 수 있다는 것을 의미한다.

> 즉 SideEffect를 최소화 한다.

따라서 예제 프로그램에서 `iterator`의 반환값을 `BookShelfIterator` 형이 아닌, `Iterator`형의 변수로 대입하는 것이며 이는 어디까지나 `Iterator`의 메소드를 사용해서 프로그래밍을 하는 방법을 나타내고 있다.

## 추상 클래스나 인터페이스

추상 클래스나 인터페이스의 사용법을 잘 모르는 사람은 Aggregate 인터페이스나 Iterater 인터페이스를 사용하지 않고 ConcreteAggregate, ConcreteIterater 역할을 사용해서 구현하기 쉽다.

> 바로 나 ...

하지만 **구체적인 클래스만 사용하면 클래스 간의 결합이 강해져서, 부품으로 재이용하는 일이 어렵다.** 결합을 약하게 해서 부품으로 재이용하기 쉽도록 하기 위해 추상 클래스나 인터페이스가 도입된다.

## Aggregate와 Iterator의 대응

`BookShelfIterator`는 `BookShelf`가 어떻게 구현되고 있는지 알기 떄문에, 다음 책을 얻기 위해 `getBookAt` 메소드를 호출하였다.

이처럼 만약 BookShelf의 구현을 전부 변경하고, **getBookAt 메소드라는 인터페이스도 변경**했을 때에는 **BookShelfIterator의 수정**이 필요하게 된다.

`Aggregate`와 `Iterator`라는 두 개의 인터페이스가 쌍을 이루듯이, `BookShelf`와 `BookShelfIterator`라는 두 개의 클래스도 쌍을 이루고 있다.

## 틀리기 쉬운 next, hasNext

`next`와 `hasNext`는 다소 헷갈리기 쉬운 이름의 메소드이다.

`next`는 현재 요소를 반환하면서, 다음 위치로 진행하는 의미이며 `hasNext`는 다음에 next 메소드를 불러도 괜찮은지를 조사하는 것이라고 기억을 해두면 좋을 것이다.

## 그 외

- 복수의 Iterator

**하나씩 나열하는 구조가 Aggregate 역할의 외부에 놓여있는 것**은 `Iterator 패턴의 특징` 중 하나인데, 이로 인해 **하나**의 `ConcreteAggregate` 역할에 대해서 **복수**의 `ConcreateIterator` 역할을 만들 수 있다.

- Iterator의 종류

예제 프로그램은 정뱡향을 한 번만 검색하는 것이였지만, _뒤에서 시작하며 역방향으로, 정방향, 역방향으로도 진행, 번호를 지정하여 이동_ 등 다양한 종류가 있다.

- 관련 패턴

`Visitor`, `Composite`, `Factory Method`
