# Environment variables

- 종종 서로다른 컨텍스트에서 재사용을 위해서 약간의 스크립트 수정이 필요할 수 있다. 
- 이러한 서로 다른 컨텍스트나 환경에 대해 여러 개의 개별 스크립트를 만드는 대신 환경 변수를 사용하여 스크립트 일부를 조정할 수 있도록 만들 수 있다. 

- 다음 2가지 이유로 환경변수가 필요하다. 
  - 환경 변수 값을 k6 스크립트에 전달
  - k6 옵션을 환경 변수로 설정할 수 있다. 

## Passing environment variables to the k6 script

- k6 에서 환경 변수들은 글로벌로 드러난다. __ENV 변수로 접근이 가능하다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const res = http.get(`http://${__ENV.MY_HOSTNAME}/`);
  sleep(1);
}
```

- 추천되는 옵션은 환경 변수 전달을 위해서 하나 혹은 여러개의 '-e / -env' 을 이용하여 CLI 를 실행한다. (모든 플랫폼에서 동일하게 동작한다.)

```js
k6 run -e MY_HOSTNAME=test.k6.io script.js
```

- '-e' 플래그는 옵션을 설정할 수 없다. 
  - 이 플래그는 스크립트에 변수를 전달한다. 이 스크립트는 사용하거나, 무시할 수 있다. 
  - 예를 들얼 -e K^_ITERATIONS=120 은 스크립트 반복을 설정할수는 없다. 
  - K6_ITERATIONS k6 run script.js 를 수행한다. 자체 반복으르 수행할 수 있다. 

## 환경 변수를 이용한 k6 옵션 설정 

- k6 options 설정을 환경변수를 이용하여 수행가능하다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const res = http.get('https://test.k6.io');
  sleep(1);
}
```

- 기본적으로 이 스크립트의 로컬 실행은 한번만 하나의 UV를 이용하여 수행된다. 
- 기본 행위를 변경하기 위해서는 k6 options 는 환경변수로 전달가능하다. 
- 예를 들어 10명의 가상 유저를 10초동안 수행하기 위한 설정을 수행한다. 

```go
K6_VUS=10 K6_DURATION=10s k6 run script.js
```

- 이전 예제에서 보여준것과 같이 K6_ 라는 프리픽스가 필요하다. 이는 오션 파라미터로 검증된다. 
- 그러나 확인할 것은 모든 옵션들은 환경 변수로 지원된다
- 각 옵션에 대한 설명서를 확인하면 하나인지 확인할 수 있다. 

- 여러 위치에서 옵션을 정의할 때 사용할 옵션을 결정하는 우선순위가 있다. 
- 항상 가장 높은 우선순위를 위해서는 환경 변수 대신 명령줄 플래그를 사용하라. 

```js
k6 run -e MY_HOSTNAME=test.k6.io --duration 10s --vus 10 script.js
```