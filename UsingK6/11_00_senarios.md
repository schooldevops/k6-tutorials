# 시나리오

- 시나리오는 VU 및 반복이 예상되는 방식에 대한 심층 구성을 만든다.
- 이를 통해 부하 테스트에서 다양한 트래픽 패턴을 모델링 할 수 있다.
- 시나리오 사용의 이점은 다음과 같다. 
  - 동일한 스크립트에서 여러 시나리오를 선언할 수 있으며 각 시나리오는 서로 다른 JavaScript 기능을 독립적으로 실행할 수 있으므로 테스트를 보다 쉽고 유연하게 구성할 수 있다. 
  - 각 시나리오는 구별되는 VU와 반복 스케줄링 패턴, 목적에 맞게 실행기로 구동되는 기능을 사용될 수 있다. 이를 통해 실제 트래픽을 더 잘 시뮬레이션 할 수 있는 고급 실팽 패턴을 모델링 할 수 있다. 
  - 시나리오는 서로 독립적이며 병렬로 실행되지만 각 시나리오의 startTime 속성을 신중하게 설정하여 순차적으로 나타나도록 만들 수 있다. 
- 각 시나리오 설정에 따라 다른 환경변수와 메트릭 태그를 사용할 수 있다. 

## Configuration

- 실행 시나리오는 주로 테스트 스크립트에서 내보낸 옵션 개체의 시나리오 키를 통해 구성된다. 
- 각 시나리오의 키는 임의적이지만 고유한 시나리오 이름일 수 있다. 결과 요약, 태그 등에 나타난다.

```js
export const options = {
  scenarios: {
    example_scenario: {
      // name of the executor to use
      executor: 'shared-iterations',

      // common scenario configuration
      startTime: '10s',
      gracefulStop: '5s',
      env: { EXAMPLEVAR: 'testing' },
      tags: { example_tag: 'testing' },

      // executor-specific configuration
      vus: 10,
      iterations: 200,
      maxDuration: '10s',
    },
    another_scenario: {
      /*...*/
    },
  },
};

```

## Executors

- executor는 k6 실행 엔진의 핵심 요소이다. 
- 각각은 VU 및 반복을 다르게 예약하며 서비스를 테스트하기 위해 모델링하려는 트래픽 유형에 따라 하나를 선택한다. 

- 실행기에 가능한 값은 하이픈으로 구분된 실행기 이름이다. 

|NAME| VALUE|	DESCRIPTION|
|---|---|---|
|Shared| iterations|	고정된 반복 횟수는 여러 VU간에 "공유" 된다. |
|Per VU iterations|	per-vu-iterations|	각 UV는 정확한 수의 반복을 실행한다. |
|Constant VUs|	constant-vus| 고정된 수의 VU는 지정된 시간 동안 가능한 한 반복한다. 	|
|Ramping VUs|	ramping-vus|	가변 수의 VU는 다음과 같이 실행된다. 지정된 시간동안 가능한 한 반복한다. |
|Constant Arrival Rate|	constant-arrival-rate|	고정된 수의 반복이 실행된다. 지정된 기간동안|
|Ramping Arrival Rate|	ramping-arrival-rate|	가변 반복 횟수는 다음과 같다. 지정된 시간에 실행된다. |
|Externally Controlled|	externally-controlled| 런타임 시 실행 제어 및 확장 k6의 REST API또는 CLI를 통해 수행 |

## 공통 옵션

|OPTION|	TYPE|	DESCRIPTION	DEFAULT|
|---|---|---|
|executor(required)| ️	string|	유니크 executor 이름. executor 섹션에서 가능한 값들의 리스트| -|
|startTime|	string|	이 시나리오가 실행을 시작해야 하는 테스트 시작 이후의 시간 오프셋이다| "0s"|
|gracefulStop|	string|	반복을 강제로 중지하기 전에 반복 실행이 완료될 때까지 기다리는 시간이다. 여기에서 테스트 실행을 정상적으로 중지하는 방법에 대해 자세히 알아보라.| "30s"|
|exec|	string|	실행을 위한 내보낼 JS 함수 이름이다.| "default"|
|env|	object|	이 시나리오에 관련된 환경 변수이다.|	{}|
|tags|	object|	이 시나리오와 관련된 태그들.|	{}|

## 예제

- 다음 스크립트는 2개의 최소 시나리오를 정의한다. 
  
```js
import http from 'k6/http';

export const options = {
  scenarios: {
    example_scenario: {
      executor: 'shared-iterations',
      startTime: '0s'
    },
    another_scenario: {
      executor: 'shared-iterations',
      startTime: '5s'
    },
  },
};

export default function () {
  http.get('https://google.com/');
}

```

- 위 스크립트를 실행하기 위해서 'k6 run script.js' 를 수행하며 추가적으로 다음 결과를 출력한다. 

```js
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: .\scenario_example.js
     output: -

  scenarios: (100.00%) 2 scenarios, 2 max VUs, 10m35s max duration (incl. graceful stop):
           * example_scenario: 1 iterations shared among 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)
           * another_scenario: 1 iterations shared among 1 VUs (maxDuration: 10m0s, startTime: 5s, gracefulStop: 30s)


running (00m05.2s), 0/2 VUs, 2 complete and 0 interrupted iterations
example_scenario ✓ [======================================] 1 VUs  00m00.2s/10m0s  1/1 shared iters
another_scenario ✓ [======================================] 1 VUs  00m00.2s/10m0s  1/1 shared iters

     data_received..................: 54 kB  11 kB/s
     data_sent......................: 2.5 kB 486 B/s
     http_req_blocked...............: avg=53.45ms  min=46.56ms  med=48.42ms  max=70.4ms   p(90)=64.25ms  p(95)=67.32ms
     http_req_connecting............: avg=19.95ms  min=18.62ms  med=19.93ms  max=21.3ms   p(90)=21.26ms  p(95)=21.28ms
     http_req_duration..............: avg=46.16ms  min=25.82ms  med=45.6ms   max=67.6ms   p(90)=65.63ms  p(95)=66.61ms
       { expected_response:true }...: avg=46.16ms  min=25.82ms  med=45.6ms   max=67.6ms   p(90)=65.63ms  p(95)=66.61ms
     http_req_failed................: 0.00%  ✓ 0        ✗ 4
     http_req_receiving.............: avg=3.56ms   min=305.8µs  med=3.05ms   max=7.84ms   p(90)=7.01ms   p(95)=7.43ms
     http_req_sending...............: avg=132.85µs min=0s       med=0s       max=531.4µs  p(90)=371.98µs p(95)=451.68µs
     http_req_tls_handshaking.......: avg=32.68ms  min=27.63ms  med=27.99ms  max=47.09ms  p(90)=41.43ms  p(95)=44.26ms
     http_req_waiting...............: avg=42.46ms  min=24.78ms  med=42.64ms  max=59.75ms  p(90)=58.45ms  p(95)=59.1ms
     http_reqs......................: 4      0.771306/s
     iteration_duration.............: avg=199.23ms min=182.79ms med=199.23ms max=215.67ms p(90)=212.38ms p(95)=214.03ms
     iterations.....................: 2      0.385653/s
     vus............................: 0      min=0      max=0
     vus_max........................: 2      min=2      max=2

```

