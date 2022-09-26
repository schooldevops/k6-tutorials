# Check 

- Check는 불리언 조건을 검증한다. 
- 테스트는 종종 시스템 응답이 기대한 내용인지 확인하기 위해서 check를 사용한다. 
- 예를 들어 POST 요청에 response.status == 201이 있는지 또는 본문이 특정 크기인지 확인할 수 있다.

- 검사는 많은 테스트 프레임워크가 주장이라고 부르는 것과 유사하지만 실패한 검사로 인해 테스트가 중단되거나 실패 상태로 완료되지 않는다. 
- 대신 k6은 테스트가 계속 실행될 때 실패한 검사의 비율을 추적한다. (각 검사는 비율 메트릭을 생성함)

- 검사를 중단하거나 테스트에 실패하려면 이를 Thresholds 과 결합할 수 있다. 

## Check for HTTP response code

- HTTP 요청 과 응답과 관련된 검사를 코드하는데 유용하다. 
- 예를 들어 이 스니펫은 HTTP 응답 코드가 200인지 확인한다. 

```js
import { check } from 'k6';
import http from 'k6/http';

export default function () {
  const res = http.get('http://test.k6.io/');
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}
```

## 응답 body에서 텍스트를 체크한다. 

- 가끔 HTTP 200 응답은 에러 메시지를 포함한다. 
- 이런 상황에서 응답 body가 올바른지 검사가 필요하다. 
  
```js
import { check } from 'k6';
import http from 'k6/http';

export default function () {
  const res = http.get('http://test.k6.io/');
  check(res, {
    'verify homepage text': (r) =>
      r.body.includes('Collection of simple web-pages suitable for load testing'),
  });
}
```

## 응답 body 크기 체크 

- 응답 바디의 크기를 검사하기 위해서 check 를 다음과 같이 이용할 수 있다. 

```js
import { check } from 'k6';
import http from 'k6/http';

export default function () {
  const res = http.get('http://test.k6.io/');
  console.log('body size: ' + res.body.length)
  check(res, {
    'body size is 11278 bytes': (r) => r.body.length == 11278,
  });
}
```

## 패스된 체크의 퍼센트 확인하기

- 스크립트가 체크를 포함하면 써머리 리포트는 테스트의 체크가 통과했는지의 비율을 나타낸다.

```go
k6 run script.js

  ...
    ✓ is status 200

  ...
  checks.........................: 100.00% ✓ 1        ✗ 0
  data_received..................: 11 kB   12 kB/s
```

- 이 예제에서 "is status 200" 을 체크하고 100% 응답값이 맞는지 검사한다. 

## 복수 체크 추가하기

- 복수 체크를 수행할 수 있다. check() 단일 상태 체크 

```js
import { check } from 'k6';
import http from 'k6/http';

export default function () {
  const res = http.get('http://test.k6.io/');
  check(res, {
    'is status 200': (r) => r.status === 200,
    'body size is 11,105 bytes': (r) => r.body.length == 11105,
  });
}
```

- 테스트 수행이 되면 결과는 다음과 같다. 

```go
k6 run checks.js

  ...
    ✓ is status 200
    ✓ body size is 11,105 bytes

  ...
  checks.........................: 100.00% ✓ 2        ✗ 0
  data_received..................: 11 kB   20 kB/s
```

from: https://k6.io/docs/using-k6/checks/
