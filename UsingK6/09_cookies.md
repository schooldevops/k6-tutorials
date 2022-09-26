# Cookies

- HTTP 쿠키는 웹 사이트에서 사용되고, 사용자 디바이스에 상태 정보의 조각을 저장한다. 
- Set-Cookie HTTP 헤더를 통해서 서버는 사용자 머신에 저장되길 원하는 정보가 무엇인지 알려준다. 

- 사용자의 브라우저는 쿠키 데이터를 저장하고, 서버의 호스트 네임과 연관된 정보를 저장한다. 
- 해당 호스트 이름에 대한 각 후속 요청에 대해 쿠키 헤더에 저장된 쿠키 데이터가 포함된다. 

- 그런다음 특정 하위 도메인 또는 경로로 제한하는 것을 포함하여 쿠키 데이터를 보낼지 여부에 대한 보다 구체적인 규칙을 제어할 수 있다. 
- 쿠키에 만료 날짜를 설정하고 암호화된 (SSL/TLS) 연결을 통해서만 쿠키를 보내도록 브라우저에 지시할 수도 있다. 

## Cookies with k6

- 대부분의 목적을 위해 k6는 설명된 대로 쿠키의 수신, 저장 및 전송을 투명하게 관리한다. 
- 쿠키 기반 웹 사이트 또는 앱 테스트는 특별한 조치 없이 작동한다. 

- 그러나 어떤 경우에는 쿠키를 더 많이 제어해야 할 수 도 있다. 
- k6는 이를 위한 여러 옵션을 제공한다. 
- 다음을 수행할 수 있다. 
  - HTTP 헤더를 직접 관리한다. 
  - 더 인체공학적인 쿠키 API를 사용하라. 
- 다음 섹션에서는 쿠키 API를 사용하는 방법을 보여준다. 

## Setting simple cookies

- 쿠키가 이전에 브라우저에 의해 설정되었고 이제 서버에 대한 후속 요청에 포함되어야 한다고 시뮬레이션 하려면 쿠키 요청 매개변수에 쿠키를 포함한다. 

```js
import http from 'k6/http';

export default function () {
  http.get('https://httpbin.test.k6.io/cookies', {
    cookies: {
      my_cookie: 'hello world',
    },
  });
}

```

- 이는 해당 요청에 대한 쿠키에만 적용된다. 
- 후속 요청에 대해서는 전송되지 않는다. 
- 후속 요청을 위해 쿠키를 보내려면 쿠키 jar에 추가하라. 
- 기본적으로 k6에는 각 VU에 대한 쿠키 항아리가 있으며, 쿠키를 설정하고 검사하기 위해 상호작용 할 수 있다. 

```js
import http from 'k6/http';

export default function () {
  const jar = http.cookieJar();
  jar.set('https://httpbin.test.k6.io/cookies', 'my_cookie', 'hello world');
  http.get('https://httpbin.test.k6.io/cookies');
}
```

- per-VU 쿠키 jar 는 Set-Cookie 에 의해서 서버에서 수신된 모든 쿠키를 저장한다. 
- VU별 쿠키  jar를 재정의하는 "로컬 쿠키 jar"를 만들수도 있다. 이후 참조 

- 이미 VU별 쿠키 jar의 일부인 쿠키를 재정의할 수도 있다. 

```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const jar = http.cookieJar();
  jar.set('https://httpbin.test.k6.io/cookies', 'my_cookie', 'hello world');

  const cookies = {
    my_cookie: {
      value: 'hello world 2',
      replace: true,
    },
  };

  const res = http.get('https://httpbin.test.k6.io/cookies', {
    cookies,
  });

  check(res.json(), {
    'cookie has correct value': (b) => b.cookies.my_cookie == 'hello world 2',
  });
}

```

## Accessing cookie

- 특정 응답에 대해 어떤 쿠키가 설정되었는지 확인하려면 응답 객체의 쿠키 속성을 확인하라. 

```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://httpbin.test.k6.io/cookies/set?my_cookie=hello%20world', {
    redirects: 0,
  });
  check(res, {
    "has cookie 'my_cookie'": (r) => r.cookies.my_cookie.length > 0,
    'cookie has correct value': (r) => r.cookies.my_cookie[0].value === 'hello world',
  });
}

```

- 응답 객체의 쿠키 속성은 키가 쿠키 이름이고 값이 응답 쿠키 객체의 배열인 맵이다. 
- 이 배열은 RFC6265에 지정된 대로 이름은 같지만 도메인 또는 경로 속성이 다른 여러 쿠키를 지원할 수 있다. 

## Properties of a response cookie object

- response 쿠키 객체는 다음 속성을 포함한다. 

|PROPERTY|	TYPE|	DESCRIPTION|
|---|---|---|
|name|	string|	쿠키의 이름 |
|value|	string|	키키의 값 |
|domain|	string|	이 쿠키를 보낼 호스트 이름을 결정하는 도메인 |
|path|	string|	요청 경로가 이 값과 일치하는 경우에만 쿠키가 전송되도록 제한 |
|expires|	string|	쿠키가 expire되면 다음과 같은 RCS1123 형식이어야한다. Mon, 02 Jan 2006 15:04:05 MST|
|max_age|	number|	만료와 같은 목적으로 사용되지만 쿠키가 유효한 시간(초)로 정의된다. |
|secure|	boolean|	만약 true라면 쿠키는 암호화된(SSL/TLS)연결을 통해서만 전송된다.|
|http_only|	boolean|	만약 true라면 브라우저 환경에서 쿠키가 JavaScript에 노출되지 않는다.|

## Inspecting a cookie in the jar

- 특정 URL에 대해 쿠키 jar에 어떤 쿠키가 설정되고 저장되었는지 확인하려면 쿠키jar객체의 cookieForURL()메소드를 사용하라. 

```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://httpbin.test.k6.io/cookies/set?my_cookie=hello%20world', {
    redirects: 0,
  });
  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL('http://httpbin.test.k6.io/');
  check(res, {
    "has cookie 'my_cookie'": (r) => cookies.my_cookie.length > 0,
    'cookie has correct value': (r) => cookies.my_cookie[0] === 'hello world',
  });
}
```

- jar 의 cookieForURL()메소드가 반환하는 쿠키 객체는 키가 쿠키 이름이고 값이 쿠키 값(문자열)의 배열인 맵이다.
- RFC6265의 일부인 동일한 이름(그러나 다른 도메인 및/또는 경로 속성)을 가진 여러 쿠키를 지원하기 위한 배열이다. 

## Setting advanced cookies with attributes

- 쿠키 동작을 보다 엄격하게 제어하는 쿠키를 설정하려면 쿠키를 쿠키 jar에 추가해야한다. 

```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const jar = http.cookieJar();
  jar.set('https://httpbin.test.k6.io/cookies', 'my_cookie', 'hello world', {
    domain: 'httpbin.test.k6.io',
    path: '/cookies',
    secure: true,
    max_age: 600,
  });
  const res = http.get('https://httpbin.test.k6.io/cookies');
  check(res, {
    'has status 200': (r) => r.status === 200,
    "has cookie 'my_cookie'": (r) => r.cookies.my_cookie[0] !== null,
    'cookie has correct value': (r) => r.cookies.my_cookie[0].value == 'hello world',
  });
}

```

## Local cookie jars

- VU별 쿠키 항아리 외에도 요청별로 VU별 쿠키 jar를 재정의하는 로컬 쿠키 jar를 만들 수도 있다. 

```js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const jar = new http.CookieJar();

  // Add cookie to local jar
  const cookieOptions = {
    domain: 'httpbin.test.k6.io',
    path: '/cookies',
    secure: true,
    max_age: 600,
  };
  jar.set('https://httpbin.test.k6.io/cookies', 'my_cookie', 'hello world', cookieOptions);

  // Override per-VU jar with local jar for the following request
  const res = http.get('https://httpbin.test.k6.io/cookies', { jar });
  check(res, {
    'has status 200': (r) => r.status === 200,
    "has cookie 'my_cookie'": (r) => r.cookies.my_cookie[0] !== null,
    'cookie has correct value': (r) => r.cookies.my_cookie[0].value == 'hello world',
  });
}
```

## Examples

```js
// Example showing two methods how to log all cookies (with attributes) from a HTTP response.
import http from 'k6/http';

function logCookie(c) {
  // Here we log the name and value of the cookie along with additional attributes.
  // For full list of attributes see:
  // https://k6.io/docs/using-k6/cookies#properties-of-a-response-cookie-object
  const output = `
     ${c.name}: ${c.value}
     tdomain: ${c.domain}
     tpath: ${c.path}
     texpires: ${c.expires}
     thttpOnly: ${c.http_only}
  `;
  console.log(output);
}
export default function () {
  const res = http.get('https://www.google.com/');

  // Method 1: Use for-loop and check for non-inherited properties
  for (const name in res.cookies) {
    if (res.cookies.hasOwnProperty(name) !== undefined) {
      logCookie(res.cookies[name][0]);
    }
  }

  // Method 2: Use ES6 Map to loop over Object entries
  new Map(Object.entries(res.cookies)).forEach((v, k) => {
    logCookie(v[0]);
  });
}

```