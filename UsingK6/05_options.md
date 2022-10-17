# Options 사용하기 

- k6는 옵션을 이용하여 테스트를 위한 시나리오, 워크로드, 테스트 시간등을 지정할 수 있다.
- k6는 다양한 방법으로 옵션을 지정하는 방법을 제공하고 있다. 
  - CLI 플래그로 지정
  - 환경변수로 지정
  - 스크립트에서 options 객체 이용하기 

- 테스트 케이스에 따라서 어떤 옵션을 이용할지 지정할 수 있다. 
- 테스트 중 옵션에 엑세스도 가능하다. 

## 옵션 이용 순서

- 중복 옵션이 들어온경우 아래 순서대로 우선순위에 따라 적용된다. 

1. 기본 옵션이용됨
2. --config 로 지정한 플래그로 옵션 사용 
3. script에서 옵션 값 지정
4. 환경변수 이용
5. CLI 플래그 이용 

- 위와 같이 1 --> 5번의 순으로 옵션을 검사하여 사용한다. 
- 5가 가장 우선순위가 높다.

## 옵션을 어디에 설정할까? 

- 옵션은 개인 선호에 따른 위치에서 사용된다. 
- 어떤때는 테스트 컨텍스트에 따라 옵션을 배치할 가장 합리적인 위치가 결정된다. 

### 버젼을 제어하고 테스트를 깔끔하기 유지하기 위한 스크립트 옵션

- 스크립트 옵션 개체는 일반적으로 옵션을 넣는 가장 좋은 위치이다. 
- 자동으로 버젼 제어를 제공하고 쉽게 재사용이 가능하며, 스크립트를 모듈화 할 수 있다. 

### 사용할 때 즉시 옵션을 플래그로 지정

- 커맨드 라인으로 실행하려는 경우 명령줄 플래그를 이용하면 된다. 
- 커맨드 라인을 이용하면, 파일내 지정한 옵션을 오버라이드 할 수 있다. (우선순위 참고)

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

- 위 옵션은 hosts, stages, thresholds, noConnectionReuse, userAgent 와 같은 옵션을 지정하였다. 
- hosts:
  - DNS를 확인할때 해당 옵션으로 재정의할 수 있다. 
  - "domain" : "ip:port" 형태로 호스트를 지정할 수 있다. 
- stages:
  - stages 는 테스트 부하가 주입되는 단계를 설정할 수 있다. 
  - 일반적으로 테스트는 RampUp --> Load --> RampBackDown 의 순서로 수행이 된다. 
  - 위 예제에서는 RampUp으로 10유저를 1분간 생성한다. 그리고 Load는 20 유저를 1분간 수행하고, 마지막으로 RampBackDown으로 사용자를 1분동안 0으로 만든다. 
- threshold:
  - 테스트 종료 조건을 지정하고, 해당 종료조건을 넘어서게 되면 테스트를 종료하게 된다. 
- noConnectionReuse:
  - keepalive를 유지할지 여부를 결정한다. 
  - 기본값은 false이며, true인경우 커넥션을 재사용하지 않으므로 keepalive를 유지하게 된다. 
- userAgent:
  - http 요청을 보낼때 사용자 agent 정보를 지정한다. 
  - 이렇게 지정하고 테스트를 수행하면 워크로드 요청시 agent를 실어서 전송하게 된다. 

## 환경 변수에 옵션 설정

- 환경 변수를 지정하고, 이를 테스트 옵션으로 활용하여 테스트를 수행할 수 있다. 
  
```go
K6_NO_CONNECTION_REUSE=true K6_USER_AGENT="MyK6UserAgentString/1.0" k6 run script.js

k6 run --no-connection-reuse --user-agent "MyK6UserAgentString/1.0" script.js

```

## k6 환경변수 이용

- '--env' 옵션 커맨드를 이용하면 환경변수 값으로 원하는 값을 k6에 전달할 수 있다. 
  
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

- 위와 같이 외부에서 주입된 환경 변수는 __ENV.MY_USER_AGENT 에대입된다.
- 환경 변수는 __ENV. 으로 접근이 가능하다. 

## 스크립트에서 옵션값 획득하기. 

- 옵션값을 지정한 경우, 실제 실행되는 함수에서 해당 옵션을 이용할 수 있다. 

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

- 위 코드는 exec.test.options 로 옵션의 최 상단에 접근한다. 
- 이후 scenarios 를 이용하면 현재 시나리오에 접근이 가능하다. 모든 테스트는 시나리오가 있다. 
- default 시나리오에 접근하였다. 시나리오 이름이 없다면 default가 기본 이름이다. 
- stages 중 인덱스를 이용하여 접근한다. 여기서는 0번 스테이지에 접근하였다. 
- stages[0].targets 를 통해서 대상 vuser를 조회하였다. 값은 100이 출력될 것이다. 

## config 옵션 파일 이용하기 .

- config 옵션을 이용하여 옵션 파일을 테스트에 주입할 수 있다. 
- 옵션 파일은 json 형태로 작성이 가능하며, 해당 파일을 --config 라는 옵션을 이용하여 k6에 전달하고 있다. 

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
//  내보낸 옵션 개체를 채우는 데 사용되는 부하 테스트 구성
const testConfig = JSON.parse(open('./config/test.json'));
// 위 옵션에서 전달된 옵션 정보를 세팅한다. 
export const options = testConfig;
```

from: https://k6.io/docs/using-k6/k6-options/how-to/