# k6 Metrics

- Metrics 는 테스트 상황에서 시스템이 어떻게 수행했는지를 측정하는 값이다. 
- 기본적으로 k6는 자동적으로 내장 메트릭을 수집한다. 
- 내장 메트릭 이외에도 커스텀 메트릭을 생성할 수 있다. 

- 메트릭타입은 4가지가 있다. 
  - Counters 합계값
  - Gauges 트랙은 최소/최대/마지막 값을 나타낸다.
  - Rate 트랙은 얼마나 자주 0이 아닌 값(true)이 발생했는지 측정한다. 
  - 복수 값에 대해 Trends 를 계산하여 통계값을 반환한다. 

## Built-in metrics

- built-in 메트릭은 표준 출력으로 반환된다. 

```js
import http from 'k6/http';

export default function () {
  http.get('https://test-api.k6.io/');
}
```

- 처리 결과는 다음과 같다. 

```go
k6 run script.js

          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: http_get.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m03.8s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m03.8s/10m0s  1/1 iters, 1 per VU

     data_received..................: 22 kB 5.7 kB/s
     data_sent......................: 742 B 198 B/s
     http_req_blocked...............: avg=1.05s    min=1.05s    med=1.05s    max=1.05s    p(90)=1.05s    p(95)=1.05s
     http_req_connecting............: avg=334.26ms min=334.26ms med=334.26ms max=334.26ms p(90)=334.26ms p(95)=334.26ms
     http_req_duration..............: avg=2.7s     min=2.7s     med=2.7s     max=2.7s     p(90)=2.7s     p(95)=2.7s
       { expected_response:true }...: avg=2.7s     min=2.7s     med=2.7s     max=2.7s     p(90)=2.7s     p(95)=2.7s
     http_req_failed................: 0.00% ✓ 0        ✗ 1
     http_req_receiving.............: avg=112.41µs min=112.41µs med=112.41µs max=112.41µs p(90)=112.41µs p(95)=112.41µs
     http_req_sending...............: avg=294.48µs min=294.48µs med=294.48µs max=294.48µs p(90)=294.48µs p(95)=294.48µs
     http_req_tls_handshaking.......: avg=700.6ms  min=700.6ms  med=700.6ms  max=700.6ms  p(90)=700.6ms  p(95)=700.6ms
     http_req_waiting...............: avg=2.7s     min=2.7s     med=2.7s     max=2.7s     p(90)=2.7s     p(95)=2.7s
     http_reqs......................: 1     0.266167/s
     iteration_duration.............: avg=3.75s    min=3.75s    med=3.75s    max=3.75s    p(90)=3.75s    p(95)=3.75s
     iterations.....................: 1     0.266167/s
     vus............................: 1     min=1      max=1
     vus_max........................: 1     min=1      max=1
```

- 모든 출력된 메트릭은 http, iteration, vu 로 시작한다. 이들은 모두 내장 메트릭이다. 
- k6는 항상 다음과 같은 내장 메트릭을 가진다. 

|METRIC| NAME|	TYPE|	DESCRIPTION|
|---|---|---|---|
|vus|	Gauge| 현재 총 활동하는 가상유저|
|vus_max|	Gauge|	가상 유저의 최대 가능한 수 / VU 리소스가 사전 할당되어 로드 수준을 확장할 때 성능에 영향을 미치지 않는다. |
|iterations|	Counter|	VU가 JS 스크립트(기본 기능)을 실행한 총 회수이다.|
|iteration_duration|	Trend|	setup과 teardown에 소요된 시간을 포함하여 전체 반복을 완료하는 데 걸린 시간이다. 특정 시나리오에 대한 반복 기능의 지속 시간을 계산하려면 이 해결 방법을 시도하라.|
|dropped_iterations|	Counter|	VU부족 또는 시간 부족(반복 기반 실행기에서 만료된 maxDuration)으로 인해 시작되지 않은 반복횟수|
|data_received|	Counter|	수신된 데이터의 양이다. 이 예에서 개별 URL에 대한 데이터를 추적하는 방법을 다룬다.|
|data_sent|	Counter|	전송한 데이터 량 / 개별 URL에 대한 데이터를 추적하여 개별 URL에 대한 데이터를 추적한다.|
|checks|	Rate|	성공적으로 체크한 비율|

## HTTP-specific built-in metrics

- 이 메트릭스는 HTTP 요처을 테스트가 만들때만 생성된다. 

|METRIC| NAME|	TYPE|	DESCRIPTION|
|---|---|---|---|
|http_reqs|	Counter|	얼마나 많은 요청을 K6가 생성했는지 카운트|
|http_req_blocked|	Trend|	유용한 TCP 커넥션 슬롯에 대해서 대기한시간(블록시간) 을 측정한다.|
|http_req_connecting|	Trend|	원격 호스트와 TCP 커넥션을 만들기 까지 소요된 시간|
|http_req_tls_handshaking|	Trend|	원격 호스트와 TLS 세션 핸드쉐이킹에 소요된 시간|
|http_req_sending|	Trend|	원격 호스트에 데이터를 전송하는데 걸린 시간|
|http_req_waiting|	Trend|	원격 호스트로 부터 응답을 기다리는 시간 (첫번째 바이트가 온 시간 혹은 TTFB)|
|http_req_receiving|	Trend| 원격 호스트로 부터 데이터를 수신하는데 걸린 시간|
|http_req_duration|	Trend|	요청에 대한 총 소요시간 이는 http_req_sending + http_req_waiting + http_req_receiving 과 동일한 시간이다. (이 시간은 원격 서버가 요청을 받고 처리하고 응답을 한 시간이며 초기 DNS 룩업과 커넥션 시간은 제외이다)|
|http_req_failed|	Rate|	setResponseCallback에 따른 요청 실패율|

## 스크립트로 HTTP 접근 타이밍

- 각기 개별 HTTP 요청으로 부터 타이밍 정보에 저장하기 위해서 Response.timings 객체를 제공하며, 다양한 단계에서 밀리초 단위로 소비된 시간을 제공한다. 
  - blocked:
    - http_req_blocked 와 동일
  - connecting:
    - http_req_connecting 과 동일
  - tls_handshaking:
    - http_req_tls_handshaking과 동일
  - sending:
    - http_req_sending과 동일
  - waiting:
    - http_req_waiting과 동일
  - receiving:
    - http_req_receiving과 동일
  - duration:
    - http_req_duration과 동일

```js
import http from 'k6/http';

export default function () {
  const res = http.get('http://httpbin.test.k6.io');
  console.log('Response time was ' + String(res.timings.duration) + ' ms');
}

```

- 위 내용을 실행하고 나면 다음 결과를 확인할 수 있다. 

```go
k6 run script.js

  INFO[0001] Response time was 337.962473 ms               source=console
```

## Custom metrics

- 커스텀 메트릭을 직접 생성할 수 있다. 로드 테스트의 끝에 리포팅으로 확인할 수 있다. 

```js
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const myTrend = new Trend('waiting_time');

export default function () {
  const r = http.get('https://httpbin.test.k6.io');
  myTrend.add(r.timings.waiting);
  console.log(myTrend.name); // waiting_time
}
```

- Trend 메트릭을 waiting_time 라는 이름으로 생성했다. 
- 이 코드에서 myTrend라는 이름의 변수로 담았다. 
- 커스텀 메트릭은 테스트 끝 부분에서 다음과 같이 확인할 수 있다. 

```go
k6 run script.js

  ...
  INFO[0001] waiting_time                                  source=console

  ...
  iteration_duration.............: avg=1.15s    min=1.15s    med=1.15s    max=1.15s    p(90)=1.15s    p(95)=1.15s
  iterations.....................: 1     0.864973/s
  waiting_time...................: avg=265.245396 min=265.245396 med=265.245396 max=265.245396 p(90)=265.245396 p(95)=265.245396

```

- 선택적으로 사용자 지정 메트릭에 대한 값에 태그를 지정할 수 있다. 
- 테스트 결과를 분석할때 유용하다. 

## Metric types

- 모든 메트릭(기본 제공 및 사용자 지정모두)에는 유형이 있다. 
- k6의 4가지 다른 메트릭 유형은 다음과 같다. 

|METRIC Type| Description|
|---|---|
|Counter|  추가된 값의 누적값에 대한 메트릭이다.|
|Gauge| min/max/last 값이 저장된다. 최종값이다.|
|Rate| 0이 아닌 추가된 값의 백분율을 추적하는 메트릭이다.|
|Trend| 추가된 값에 대한 통계 계산결과를 나타낸다. (min/max/average/percentiles)|

### Counter 예제

```js
import { Counter } from 'k6/metrics';

const myCounter = new Counter('my_counter');

export default function() {
  myCounter.add(1);
  myCounter.add(2);
}
```

- 실행결과 다음과 같이 나타낸다.

```go
k6 run script.js

  ...
  iteration_duration...: avg=16.48µs min=16.48µs med=16.48µs max=16.48µs p(90)=16.48µs p(95)=16.48µs
  iterations...........: 1   1327.67919/s
  my_counter...........: 3   3983.037571/s
```

- 만약 1번만 반복된다면 즉, --iterations 혹은 --duration 값을 지정하지 않는다면 my_counter의 최종값은 3이 된다. 

### Gauge

```js
import { Gauge } from 'k6/metrics';

const myGauge = new Gauge('my_gauge');

export default function () {
  myGauge.add(3);
  myGauge.add(1);
  myGauge.add(2);
}
```

- 출력은 다음과 같다. 

```go
k6 run script.js

  ...
  iteration_duration...: avg=21.74µs min=21.74µs med=21.74µs max=21.74µs p(90)=21.74µs p(95)=21.74µs
  iterations...........: 1   1293.475322/s
  my_gauge.............: 2   min=1         max=3
```

- my_gauge 의 최종 결과값은 2가 된다. 
- 이 값은 저장된 최종 값만을 반환한다. 

### Trend

```js
import { Trend } from 'k6/metrics';

const myTrend = new Trend('my_trend');

export default function () {
  myTrend.add(1);
  myTrend.add(2);
}
```

- 코드 출력은 다음과 같다. 

```go
k6 run script.js

  ...
  iteration_duration...: avg=20.78µs min=20.78µs med=20.78µs max=20.78µs p(90)=20.78µs p(95)=20.78µs
  iterations...........: 1   1217.544821/s
  my_trend.............: avg=1.5     min=1       med=1.5     max=2       p(90)=1.9     p(95)=1.95
```

- trend 메트릭은 샘플 값의 셋을 저장한다. 이는 (최소, 최대, 평균, 중앙값 또는 백분위수) 에 대한 통계를 출력한다.
- 기본적으로 k6은 평균, 최소, 최대, 중앙값, 90, 95 백분위수를 인쇄한다. 

### Rate

```js
import { Rate } from 'k6/metrics';

const myRate = new Rate('my_rate');

export default function () {
  myRate.add(true);
  myRate.add(false);
  myRate.add(1);
  myRate.add(0);
}
```

- 이후 출력은 다음과 같다. 

```go
k6 run script.js

  ...
  iteration_duration...: avg=22.12µs min=22.12µs med=22.12µs max=22.12µs p(90)=22.12µs p(95)=22.12µs
  iterations...........: 1      1384.362792/s
  my_rate..............: 50.00% ✓ 2           ✗ 2
```

- my_rate 의 결과값은 50%로 출력된다. 이는 0이 아닌 값이 2번 입력되었고, 0이 2번 입력 되었으므로 50%가 출력된 것이다. 

- 노트
  - 커스텀 메트릭은 VU반복의 종료시점에 VU 쓰레드로 부터 수집된 메트릭이다. 
  - 이 의미는 실행 스크립트의 경우 테스트가 잠시 실행될 때까지 사용자 지정 메트릭이 표시되지 않을 수 있다. 

from: https://k6.io/docs/using-k6/metrics/

