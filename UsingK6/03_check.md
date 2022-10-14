# Check 

- Check는 불리언 조건을 검증한다. 
- check를 활용하여 요청의 응답이 기대에 부응하는지 확인할 수 있다. 
- 예를 들어 POST 요청에 response.status == 201이 있는지 또는 본문이 특정 크기인지 확인할 수 있다.

- Check는 프로그래밍 언어에서 assume 과 유사하지만 실패했다고 테스트를 종료하지 않는다는 특징이 있다. 
- 대신 k6은 테스트가 계속 실행될 때 실패한 검사의 비율을 추적한다. (각 검사는 Rate 메트릭을 생성함)

- 검사를 중단하거나 테스트에 실패하게 하려면 이를 Thresholds 와 연결하여 사용할 수 있다. 

## Check for HTTP response code

- HTTP 요청 과 응답과 관련된 검사를 코드하는데 유용하다. 
- 예를 들어 아래 코드는 HTTP 응답 코드가 200인지 확인한다. 

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

## 응답 body에서 내용 체크하기. 

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

- 위 코드는 응답을 res에 담고, 해당 내용의 body에서 우리가 찾고자 하는 문장이 존재하는지 검사하는 코드이다. 
- 결과 내역이 존재하면 check 결과가 true가 되고, 아닌경우 false로 체크된다. 

## 응답 body size 체크 

- 응답 바디의 size를 검사하기 위해서 check 를 다음과 같이 이용할 수 있다. 

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

- 위 내용은 응답 body의 크기가 11278 인지 검사한다. 

## 성공한 검사의 비율 확인하기 

- 스크립트가 Check를 포함하면 써머리 리포트는 테스트의 검사가 통과했는지의 비율을 나타낸다.

```go
k6 run script.js

  ...
    ✓ is status 200

  ...
  checks.........................: 100.00% ✓ 1        ✗ 0
  data_received..................: 11 kB   12 kB/s
```

- 이 예제에서 "is status 200" 을 체크하고 100% 응답값이 맞는지 검사한다. 

## 여러개 Check 추가하기

- 복수 체크역시 수행할 수 있다. 

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

- 위 코드는 응답코드가 200인지 검사하고 동시에 body의 크기가 11105인지 검사한다. 
- 두 조건을 만족한경우 검사 결과는 true이며, 아닌경우 false가 집계된다. 

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

- 즉 보는바와 같이 checks 가 100% 이며, 이는 2개의 체크가 모두 성공했음을 의미한다. 
- 상단 "is status"와 "body size is" 는 check의 이름 태그이다. 

from: https://k6.io/docs/using-k6/checks/
