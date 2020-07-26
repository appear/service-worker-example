# 서비스워커

웹 브라우저용으로 실행하기 위한 자바스크립트를 작성할 때는 일반적으로 브라우저 창에 출력되는 문서를 다룬다.
브라우저가 출력하는 문서를 데이터로 표현해주는 DOM이 모든것을 가능하게 해준다.
하지만 **서비스 워커** 는 DOM에 접근 할 수 없다. DOM 접근하지 못하는 스크립트가 있다면, 웹 브라우저는 기존 문서를
렌더링하는 동시에 이 스크립트를 병렬으로 실행할 수 있게되므로 두 프로세스가 완전히 분리되어 안전하게 병렬적으로 동작할 수 있음을 의미한다.

이런 제약이 처음 적응된 스크립트는 `웹 워커`이다. 웹 워커에 작성해둔 스크립트는 아무리 복잡한 연산을 요구하더라도 브라우저 창의 출력 속도를 저해하지 않았다.
서비스 워커는 웹 워커에 브라우저의 근본적인 내부 동작에 대한 권한을 부여한 것이라고 생각 할 수 있다.

## 브라우저와 서버

사용자가 웹 브라우저에 URL 을 입력했을 때, 웹 브라우저는 웹 서버에게 요청을 보낸다.
서비스 워커를 보내면 요청을 보내기전에 무언가 작업을 할 수 있다.
자바스크립트 코드는 일반적으로 서버에서 다운로드한 뒤에 실행된다. 서비스 워커를 이용하면 브라우저가 다른 것보다 우선해서 실행하는 스크립트를 작성할 수 있다.
여기서도 DOM에 접근 할 수 없는 이유를 알 수 있다. 서비스 워커가 실행될 떄는 DOM이 아직 생성되기 전이기 때문이다.

## 서비스워커 둘러보기

- 서비스 워커를 처음 설치했던 웹사이트에 요청할 떄는 브라우저가 서비스 워커에 들어 있는 명령들을 먼저 확인한다.
- 웹 사이트에 방문할 때 백그라운드에 몰래 설치된다. 그 후에는 웹사이트에 요청을 보낼 때마다 요청을 가로챈다.
- 처음에 서비스 워커를 설치했던 웹사이트에 대한 요청만 처리 할 수 있다.
- 도구 상자이다. 서비스 워커를 이용하면 알림을 푸쉬하거나 cache api 등을 이용하여 오프라인에서도 웹이 동작하게 만들 수 있다.

## 보안

나쁜 사용자가 서비스워커에 명령을 넣으면 웹 브라우저에서 해당 웹사이트를 다시는 뜨지 않도록 할 수 있다.
또는 모든 내용을 바꿔치기할 수도 있다.

이런 일들을 방지하고자 서비스 워커는 두 가지 정책을 강제한다.

- 동일 출처
- HTTPS

## 지원 범위

![지원범위](/images/can-i-use.png)

서비스워커는 이미 동작하는 사이트에 부가적으로 동작하는 것이다.
지원 브라우저에서는 서비스 워커가 동작할 것이고 미지원 브라우저에서는 웹사이트가 기존과 똑같이 동작할 것이다.

## 등록

사용자 브라우저 설치전 웹 브라우저는 서비스 워커 파일이 존재하는지 알아야한다.
서비스 워커를 등록하기 위해 `head` 에 link 요소를 삽입한다.

```html
<link rel="serviceworker" href="/serviceworker.js" />
```

link 로 서비스워커를 등록하는것을 지원하지 않는 브라우저는 js 를 이용하여 보완 할 수 있다.

```js
<script>navigator.serviceWorker.register("/serviceworker.js");</script>
```

여기서 html 와 js 의 차이점을 발견 할 수 있다.
link 를 지원하지 않는 html 에서는 해당 설정을 무시 할 것이다. 하지만 js 는 브라우저가 이해 할 수 없는 코드를 작성하면 오류를 일으키게된다.

그렇기 떄문에 아래와 같이 브라우저가 serviceWorker 를 지원할 때만 등록을 해줘야한다.

```js
<script>
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register("/serviceworker.js");
  }
</script>
```

![등록성공](/images/success_register.png)

## 적용범위

서비스워커의 적용 범위는 스크립트 파일이 위치한 곳이 기본 값이 된다.
예를 들어 `/js/serviceworker.js` 에 놓아두면 `/js` 로 시작하는 URL 만 제어 할 수 있다.

```text
- /myapp/serviceworker.js 는 /myapp/ 영역을 제어
- /myotherapp/serviceworker.js 는 /myotherapp/ 영역을 제어
```

만약 전역을 담당하는 서비스워커가 겹치는 영역이 있다면, 해당 영역을 담당하는 서비스워커가 우선적으로 동작한다.

서비스워커를 최상위 경로에 모아놓아 관리하는 방법도 있다.

```html
<link rel="serviceworker" href="/serviceworker.js" scope="/myapp/" />
```

```js
<script>
  if (navigator.serviceWorker) {
    // 글로벌 영역을 제어
    navigator.serviceWorker.register("/serviceworker.js");

    // myapp 영역을 제어
    navigator.serviceWorker.register("/serviceworker2.js", { scope: '/myapp' });
  }
</script>
```

## 비동기 등록

등록을 요청한 서비스 워커 스크립트를 브라우저가 처리하는데는 시간이 필요하다.
브라우저는 현재 웹사이트가 HTTPS 또는 localhost 에서 전송되고 있는지 검사한다.
이어서 서비스 워커 스크립트가 현재 웹사이트와 동일한 도메인에서 실행되고 있는지 검사한다.
마지막으로 서비스 워커 스크립트를 다운로드하고 해석한다.

브라우저가 이 작업을 처리하는 사이에 화면이 멈추는 것은 바람직하지 않다. 그렇기 때문에 register 함수는 비동기로 동작한다.

```js
<script>
    if (navigator.serviceWorker) {
        navigator.serviceWorker
        .register("/serviceworker.js")
        .then((registration) => {
            console.log("등록 성공", registration);
        })
        .catch((error) => {
            console.log("등록 실패", error);
        });
    }
</script>
```

## 이벤트

이벤트를 감시하는 코드를 작성할 수 있다. 이 이벤트는 사용자가 아니라 브라우저의 작업을 감시한다.

fetch 이벤트가 발생했을 떄 동작하는 함수를 만들어보자

```js
// servierworker.js

addEventListener("fetch", (fetchEvent) => {
  console.log("서비스 워커가 fetch 이벤트를 감시합니다.", fetchEvent);
});
```

우리는 fetch 이벤트가 동작할 때 log 가 찍히기를 기대한다.
하지만 새로고침을 해보면 우리가 의도한대로 동작하지 않는 것을 알 수 있다.

이는 Application 탭을 살펴보면 이유를 알 수 있다.

![새로운 서비스워커](/images/wait_new_servierworker.png)

서비스워커가 2개 인 것을 확인 할 수 있다. 서비스 워커 스크립트를 수정했을 때 브라우저는 기존 서비스 워커가 현재 브라우저에 로드되어 있는 페이지를
계속 제어하고 있기 떄문에 이전 버전의 서비스 워커를 새 버전의 서비스 워커로 교체 할 수 없다.

## 생명주기

```js
navigator.serviceWorker.register("/serviceworker.js");
```

1. 위의 코드에 의해 서비스 워커가 등록된다.
2. 등록된 서비스 워커가 다운로드된다.
3. 다운로드된 서비스 워커 파일은 브라우저에 설치된다.
4. 서비스 워커가 활성화되며 브라우저 제어권을 얻는다.
5. 활성화된 후에는 서비스워커가 사이트에 대한 모든 요청을 중계한다.

서비스 워커를 수정하는 경우, 사용자의 브라우저에 설치된 기존 서비스 워커를 수정하는것이 아니라, 완전히 새로운 버전의
서비스 워커를 추가로 제공하는 것이 된다.

서비스 워커가 업데이트되는 방식은 브라우저 자체가 업데이트되는 방식과 비슷하다.
크롬은 새 버전이 나오면 백그라운드에 다운로드해놓는다.
사용자가 브라우저를 종료한 경우에 기존 버전을 삭제하고 새 버전을 설치한다.

서비스워커도 마찬가지로 사용자가 브라우저를 재시작할 떄까지 대기해야한다.

## 갱신하기

브라우저에서 기존 서비스 워커가 제어하는 도메인의 탭이나 창이 열려 있는 동안에는 새 버전의 서비스 워커는 활성화 대기 중일 수 밖에 없다.

수정한 서비스 워커를 확실하게 적용시키는 방법은 두 가지다.

1. 설치된 도메인과 관련된 모든 창과 탭을 닫는다.
2. application 탭에서 skipWating 명령을 사용한다.

## fetch 이벤트를 이용하여 response 변조하기

```js
addEventListener("fetch", (fetchEvent) => {
  console.log("서비스 워커가 fetch 이벤트를 감시합니다.", fetchEvent);
});
```

![fetch event log](/images/fetch-event-log.png)

fetch event 객체를 살펴보면 method, mode, referrer, credentials, url 등 다양한 속성을 확인 할 수 있다.

fetch 이벤트를 감시하는 것 뿐만아니라 fetch event 객체 내부의 `respondWith` 메서드를 사용하여 response 내용을 변조 할 수 있다.

```js
addEventListener("fetch", (fetchEvent) => {
  console.log("서비스 워커가 fetch 이벤트를 감시합니다.", fetchEvent);

  fetchEvent.respondWith(new Response("변조된 Response"));
});
```

![변조된 Response](/images/respond-with.png)

## 출처

재래미 키스의 - [서비스 워커로 만드는 오프라인 웹사이트 (Going Offline)](https://book.naver.com/bookdb/book_detail.nhn?bid=16375914) 를 보고 작성한 예제와 설명 글입니다.

![출처](/images/source.png)
