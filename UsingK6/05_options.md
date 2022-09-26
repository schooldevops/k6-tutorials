# Options 사용하기 

- k6는 복수의 위치에서 옵션을 설정할 수 있다. 
  - CLI 플래그로 지정
  - 환경변수로 지정
  - 스크립트에서 options 객체 이용하기 

- 테스트 케이스에 따라서 어떤 옵션을 이용할지 지정할 수 있다. 
- 테스트 중 옵션에 엑세스도 가능하다. 

## 옵션 이용 순서

1. 기본 옵션이용됨
2. --config 로 지정한 플래그로 옵션 사용 
3. script에서 옵션 값 지정
4. 환경변수 이용
5. CLI 플래그 이용 

- 위와 같이 1 --> 5번의 순으로 옵션을 검사하여 사용한다. 
- 5가 가장 우선순위가 높다.

## 옵션을 어디에 설정할까? 

- 가끔 옵션은 개인 선호에 따라 사용된다. 
- 어떤때는 테스트 컨텍스트에 따라 옵션을 배치할 가장 합리적인 위치가 결정된다. 

### 버젼을 제어하고 테스트를 깔끔하기 유지하기 위한 스크립트 옵션

- 스크립트 옵션 개체는 일반적으로 옵션을 넣는 가장 좋은 위치이다. 
- 자동으로 버젼 제어를 제공하고 쉽게 재사용이 가능하며, 스크립트를 모듈화 할 수 있다. 

### 사용할때 즉시 옵션을 플래그로 지정

- 커맨드 라인으로 실행하려는 경우 명령줄 플래그가 편리하다. 
- 커맨드 라인을 이용하면, 파일내 지정한 옵션을 오버라이드 할 수 있다. (우선순위에 따라)

### 환경변수 옵션 설정, 빌드 체인으로 부터 옵션 설정시

## 옵션 예제

```js
import http from 'k6/http';

export const options = {
  hosts: { 'test.k6.io': '1.2.3.4' },
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: { http_req_duration: ['avg<100', 'p(95)<200'] },
  noConnectionReuse: true,
  userAgent: 'MyK6UserAgentString/1.0',
};

export default function () {
  http.get('http://test.k6.io/');
}
```

## 환경 변수에 옵션 설정

```go
K6_NO_CONNECTION_REUSE=true K6_USER_AGENT="MyK6UserAgentString/1.0" k6 run script.js

k6 run --no-connection-reuse --user-agent "MyK6UserAgentString/1.0" script.js

```

## k6 환경변수 이용

```go
k6 run script.js --env MY_USER_AGENT="hello"
```

```js
import http from 'k6/http';

export const options = {
  userAgent: __ENV.MY_USER_AGENT,
};

export default function () {
  http.get('http://test.k6.io/');
}

```

- 위와 같이 __ENV.MY_USER_AGENT 에대입된다.

## 스크립트에서 옵션값 획득하기. 

```js
import exec from 'k6/execution';

export const options = {
  stages: [
    { duration: '5s', target: 100 },
    { duration: '5s', target: 50 },
  ],
};

export default function () {
  console.log(exec.test.options.scenarios.default.stages[0].target); // 100
}

```

## config 옵션 파일 이용하기 .

- config 옵션을 이용하여 옵션 파일을 테스트에 주입할 수 있다. 

```go
k6 run --config options.json script.js
```

- options.json 파일을 다음과 같이 작성한다. 

```json
{
  "hosts": {
    "test.k6.io": "1.2.3.4"
  },
  "stages": [
    {
      "duration": "1m",
      "target": 10
    },
    {
      "duration": "1m",
      "target": 30
    },
    {
      "duration": "1m",
      "target": 0
    }
  ],
  "thresholds": {
    "http_req_duration": ["avg<100", "p(95)<200"]
  },
  "noConnectionReuse": true,
  "userAgent": "MyK6UserAgentString/1.0"
}
```

- 다른 방법은 옵션 파일을 소스에서 불러오는 방법이 있다. 

```js
// load test config, used to populate exported options object:
const testConfig = JSON.parse(open('./config/test.json'));
// combine the above with options set directly:
export const options = testConfig;
```

from: https://k6.io/docs/using-k6/k6-options/how-to/