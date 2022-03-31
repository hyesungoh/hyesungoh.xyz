---
title: '[백준 자동 채점 프로그램] - python, selenium, bs4'
date: 2021-03-24 00:24:00
category: 'Project'
draft: false
---

학과 조교를 수행하며 개발한, **백준 채점 자동화 프로그램** 입니다.

## 개발도구

<img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=Python&logoColor=white" alt="python"/>

<img src="https://img.shields.io/badge/Selenium-43B02A?style=flat-square&logo=Selenium&logoColor=white" alt="selenium"/>

파이썬과 함께 동적 웹 크롤링을 위해 Selenium을 사용하였습니다.

## 해결하고자 한 문제

제가 처한 상황은 다음과 같습니다.

1. 매주 2문제씩 백준 출처의 알고리즘 문제를 제출
2. 해당 강의 수강생은 약 40명
3. 백준 정답 기준으로 채점
4. 채점 결과를 바탕으로 교내 시스템에 입력

위 과정을 수작업으로 수행하게될 시 매주 1시간 30분 이상의 시간이 소모되어

최소한 3번까지 자동화를 통해 시간을 단축시키고자 하였습니다.

## 결과

> 결과물 [Youtube Link](https://youtu.be/jMBtbVg0Abw)

- 동적 크롤링

![동적 크롤링](https://user-images.githubusercontent.com/26461307/112181418-c7550c00-8c3f-11eb-87e3-271008b5f301.png)

- 채점결과 CSV 파일로 저장

![채점결과](https://user-images.githubusercontent.com/26461307/112181432-ca4ffc80-8c3f-11eb-845d-4d7cc88318f2.png)

위에서 기술한 것처럼 Python과 Selenium을 사용하여 구현하였습니다.

먼저 해당 프로그램의 확정성을 고려해 `이름(학번) - 백준 ID`로 이루어진 csv 파일을 읽었으며, 동적 크롤링을 통해 매 학생들의 결과를 실시간으로 확인할 수 있게 하였습니다.

위 `4번`의 입력을 위해 최종적으로 csv 파일로써 결과를 저장하는 방식으로 구현하였습니다.

해당 프로그램을 개발함으로써 매주 최대 1시간 20분, 한 학기에 약 18시간을 절약할 수 있었습니다.

<details>

<summary>

## 👉 구현 과정 보기

</summary>

- `이름(학번), 백준 ID`로 이루어진 CSV 파일을 읽어 딕셔너리화하여 반환

```python
def return_student_information():
    file = open(CSV_FILE_NAME, "r", encoding='utf-8')
    reader = csv.reader(file)

    student_information = {}
    for line in reader:
        if line[0] == "성명": continue
        student_information[line[0]] = line[1]

    file.close()
    # student_information = {"오혜성": "hs980414", "한슬희": "3021062"}
    return student_information
```

- 백준 ID를 이용해 백준 프로필로 이동 후 주차별 통과 여부, 각 문제별 풀었는 지 확인하여 반환

```python
def grading(student_id, problems):
    driver.get(BOJ_URL + student_id)
    page_source = BeautifulSoup(driver.page_source, "html.parser")s

    correct_div = page_source.find("div", {"class": "panel-body"})
    students_answers = []
    for answer in correct_div.findAll("a"):
        students_answers.append(answer.get_text())

    is_passed = 'O'
    is_solve_by_problems = []

    for problem in problems:
        if problem not in students_answers:
            is_passed = 'X'
            is_solve_by_problems.append('X')
        else: is_solve_by_problems.append('O')

    return [is_passed, is_solve_by_problems]
```

- 성명, 백준 ID, 제출 결과, 각 문제별 결과를 CSV 파일로 저장

```python
def write_csv():
    def write_base():
        csv_infomation = current_date + "/" + problems[0] + "/" + problems[1]
        writer.writerow([csv_infomation])
        writer.writerow(["성명", "백준 ID", "제출 결과"] + problems)

    problems = input("이번 주 제출 문제 '공백으로 나누어' 입력하세요 : ").split()
    file = open(GRADING_FILE_NAME, "w", newline='')
    writer = csv.writer(file)
    write_base()

    students_information = return_student_information()
    total_students_length = len(students_information)

    for index, student_information in enumerate(students_information.items()):
        student_name, student_id = student_information

        if student_id == "미제출":
            writer.writerow([student_name, "ID 미제출"])
        else:
            is_passed, is_solve_by_problems = grading(student_id, problems)
            writer.writerow([student_name, student_id, is_passed] + is_solve_by_problems)
        print("%d / %d ------- %s 학생 : %s" %(index+1, total_students_length, student_name, is_passed))
    file.close()

```

</details>

## 겪었던 이슈

- Selenium chrome driver version
  - 로컬 [chrome 버전에 맞는 driver](https://chromedriver.chromium.org/downloads)을 업데이트하여 수정

## 마치며

제가 직접 놓인 상황을 자동화 프로그램이란 종목으로 개선하면서 또 다른 개발의 재미를 느낄 수 있었습니다.

최대한 빠르게 개발하고자 날개발을 한 감이 없진 않지만, 큰 오류가 발견되지 않고 조교 역할을 마칠 때까지 요긴하게 사용하여 기분 좋았던 경험이였습니다.

제가 절약한 시간은 약 18시간 정도지만, 앞으로 같은 과목의 조교 역할을 수행할 후임자분들의 시간 또한 절약할 수 있지 않을까라는 생각에 인계할 계획입니다.

#### [깃허브에서 보기](https://github.com/hyesungoh/BOJ_grading_automation)
