# Thresholds

- Threshold 는 pass/fail 조건으로 테스트 메트릭에 대한 검사를 수행하고 계속진행할지 종료할지 결정한다. 
- 테스트 중인 시스템(SUT)의 성능 임계값 조건을 충족하지 않으면 테스트가 실패 상태로 종료된다. 

- 종종 테스터는 임계값을 사용하여 SLO(Service Level Objectives)를 체계화 한다. 
- 예를 들어 다음 기대치를 조합하여 임계값을 생성할 수 있다. 
  - 요청에 대한 에러가 1% 미만인경우 
  - 요청의 95%의 응답이 200ms 이하인경우
  - 요청에 99%의 응답이 400ms 이하인경우 
  - 특정 엔드포인트가 항상 응답이 300ms 이하인경우
  - 커스템 메트릭에 대한 조건 검사

- Threshold들은 로드 테스팅 자동화의 핵심이다. https://k6.io/docs/testing-guides/automated-performance-testing
- 1. 테스트의 Threshold 를 준다. 
- 2. 실행을 자동화 한다. 
- 3. 테스트 실패에 대해 alert 를 설정한다. 

- 그 후에는 SUT가 성능 기대치를 충족하지 못한 후에만 테스트에 대해 고민하고 시스템을 개선해야한다. 

## 예:  HTTP errors and response duration

- 이 샘플 스크립트는 2개 Thresholds를 지정했다. 
- 하나는 HTTP 에러에 대한 비율을 검증한다. (http_req_failed 메트릭이용)
- 다른 하나는 특정 기간동안 응답의 95%가 발생했는지 검증한다. (http_req_duration 메트릭)

```js
import http from 'k6/http';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors 가 1% 이하이어야함
    http_req_duration: ['p(95)<200'], // 요청의 95% 가 200ms 이하 이어야함
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
}

```

- 즉, pass 조건에 대한 특정 표션식을 지정하면, 만약 금정 결과가 실패하였을때 k6는 전체 테스트를 실패로 간주한다. 
- 테스트가 끝날때 해당 조건식이 false로 평가되면 k6는 전체 실패로 간주한다. 
- 이후 k6 출력은 다음과 같다. 

```go
   ✓ http_req_duration..............: avg=151.06ms min=151.06ms med=151.06ms max=151.06ms p(90)=151.06ms p(95)=151.06ms
       { expected_response:true }...: avg=151.06ms min=151.06ms med=151.06ms max=151.06ms p(90)=151.06ms p(95)=151.06ms
   ✓ http_req_failed................: 0.00%  ✓ 0 ✗ 1

```

- 이 케이스에서, 두 임계값에 대한 기준을 충족했다.
- k6는 테스트를 통과한 것으로 간주하고 실패값은 0으로 출력하며 종료한다. 

- 만약 스레시 홀드가 실패했다면 녹색마크가 붉은색 x로 표시되고 0이아닌 종료 코드로 출력된다. 

## Copy-paste threshold 예제

- Threshold 를 시작하는 가장 빠른 방법은 기본 제공되는 메트릭을 이용하는 것이다. 
- https://k6.io/docs/using-k6/metrics#http-specific-built-in-metrics


- 아래는 요청 처리 시간이 400 이하인 요청이 90% 인지 검사하고 이를 넘어서는 경우 테스트를 종료한다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  thresholds: {
    // 요청의 90% 가 400ms 이하인지 검사
    http_req_duration: ['p(90) < 400'],
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
  sleep(1);
}
```

- 다음은 에러율이 1퍼센트 이하인지 확인한다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  thresholds: {
    // 에러 비율이 1% 이하인지 검사
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
  sleep(1);
}

```

- 단일 메트릭에 대해서 복수 threshold 역시 가능하다. 
  - 하나의 메트릭에 대해 여러 임계값을 적용할 수도 있다.
  - 서로다른 백분위수 임계값을 가진다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  thresholds: {
    // 요청 결과로 90%가 400ms이하, 95%가 800ms이하, 99.9%가 초 이하 2s.
    http_req_duration: ['p(90) < 400', 'p(95) < 800', 'p(99.9) < 2000'],
  },
};

export default function () {
  const res1 = http.get('https://test-api.k6.io/public/crocodiles/1/');
  sleep(1);
}

```

- 그룹 duration 스레시홀드 지정
  - 각 그룹에 스레시홀드를 지정할 수 있다. 
  - 이 코드에는 개별 요청 및 일괄 요청에 대한 그룹이 있다. 각 그룹에는 서로다른 임계값이 있다.
  - 위 처리는 요청 결과로 90%가 400 이하로 응답했고, 95%가 800 이하로 응답했으며, 99.9 가 2000 이내에 응답했음을 체크한다. 

<br/>

- 아래 예제는 그룹별로 Threshold 를 검사한다.  
  
```js
import http from 'k6/http';
import { group, sleep } from 'k6';

export const options = {
  thresholds: {
    'group_duration{group:::individualRequests}': ['avg < 400'],
    'group_duration{group:::batchRequests}': ['avg < 200'],
  },
  vus: 1,
  duration: '10s',
};

export default function () {
  group('individualRequests', function () {
    http.get('https://test-api.k6.io/public/crocodiles/1/');
    http.get('https://test-api.k6.io/public/crocodiles/2/');
    http.get('https://test-api.k6.io/public/crocodiles/3/');
  });

  group('batchRequests', function () {
    http.batch([
      ['GET', `https://test-api.k6.io/public/crocodiles/1/`],
      ['GET', `https://test-api.k6.io/public/crocodiles/2/`],
      ['GET', `https://test-api.k6.io/public/crocodiles/3/`],
    ]);
  });

  sleep(1);
}
```

- 위 코드 결과는 individualRequests 요청 그룹에서 평균 응답시간이 400 이상인경우 테스트를 종료한다. 
- 그리고 batchRequests 요청 그룹에서 평균 응답 시간이 200 이상인경우 테스트를 종료한다. 

<br/>

- Threshold 신택스
  - 임계값을 사용하려면 하나 이상의 threshold_expression을 정의해야한다.

```js
export const options = {
  thresholds: {
    metric_name1: ['threshold_expression', `...`], // 간단한 형식
    metric_name2: [
      {
        threshold: 'threshold_expression',
        abortOnFail: true, // boolean
        delayAbortEval: '10s', // string
      },
    ], // 완전한 형식
  },
};
```

- 이 선언은 metric_name1 및 metric_name2 메트릭에 대한 임계값을 구성한다.
- 임계값 통과 또는 실패 여부를 결정하기 위해 스크립트는 'threshold_expression' 을 평가한다. 

- 'threshold_expression' 은 반드시 다음 형식이어야한다. 
- aggregation_method 오퍼레이터 값

- 예
  - avg < 200 // 평균 duration은 200ms 이하
  - count >= 500 // count는 500 이상
  - p(90) < 300 // 90%의 샘플값은 300 미만

- threshold 표현식은 true/false 로 평가된다. 

- k6에 포함된 메트릭 타입의 각각은 임계값 표현식에서 사용할 수 있는 집계 방법 세트를 제공한다. 

|Metric type| Aggregation Methods|
|---|---|
|Counter| count/rate|
|Gauge| value|
|Rate| rate|
|Trend| avg/min/max/med 그리고 p(N) 이며 N은 0.0에서 100.0이고 백분위는 p(99.99) 이다. 이 값의 유닛은 밀리초이다|

- 다음은 모든 다른 유형의 메트릭을 사용하고 각각에 대해 다른 유형의 임계값을 설정하는 샘플이다.

```js
import http from 'k6/http';
import { Trend, Rate, Counter, Gauge } from 'k6/metrics';
import { sleep } from 'k6';

export const TrendRTT = new Trend('RTT');
export const RateContentOK = new Rate('Content OK');
export const GaugeContentSize = new Gauge('ContentSize');
export const CounterErrors = new Counter('Errors');
export const options = {
  thresholds: {
    'Errors': ['count<100'],
    'ContentSize': ['value<4000'],
    'Content OK': ['rate>0.95'],
    'RTT': ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/1/');
  const contentOK = res.json('name') === 'Bert';

  TrendRTT.add(res.timings.duration);
  RateContentOK.add(contentOK);
  GaugeContentSize.add(res.body.length);
  CounterErrors.add(!contentOK);

  sleep(1);
}
```

- 다음 threshold가 있다.
  - counter 메트릭은 컨텐츠 응답이 정상이지 않은 총 횟수를 추적하고 있다. 
    - 여기서 성공 기준은 컨텐츠가 99번 이상 나쁠수 없다는 것이다. 
  - gauge 메트릭은 반환된 컨텐츠의 최신 크기를 포함한다. 
    - 이 메트릭의 성공 기준은 반환된 컨텐츠가 4000 바이트보다 작은것이다. 
  - 컨텐츠가 얼마나 자주 반환되었는지 추적하는 비율 측정항목은 OK이다. 
    - 이 측정항목에는 하나의 성공 기준이 있다. 컨텐츠가 95% 이상이 정상이다. 
  - 트렌드 메트릭은 응답시간 샘플이 제공되고 다음 임계값 기준이 있는 추세 메트릭이다.
    - 99번째 백분위수 응답 시간은 300ms 미만이어야한다. 
    - 70번째 백분위수 응답 시간은 250ms 미만이어야한다.
    - 평균 응답시간은 200ms 미만이어야한다.
    - 중간 응답 시간은 150ms 미만이어야한다.
    - 최소 응답 시간은 100ms 미만이어야한다.
- 공통 실수
  - 동일한 객체 키에 반복으로 동일한 메트릭으로 여러개의 Threshold 를 지정하지 마라. 

```js
export const options = {
  thresholds: {
    // avoid using the same metric more than once here
    // metric_name: [ 'count<100' ],
    // metric_name: [ 'rate<50' ],
  },
};
```

- 임계값은 JavaScript 객체의 속성으로 정의되는 동일한 속성 이름으로 여러 개를 지정할 수 있다. 
- 마지막 하나만 남게 된다. 
- 나머지는 조용히 무시된다. 대신 동일한 키에 대한 배열로 저장하면 된다. 

## 태그를 기준으로 threshold 검사하기

- 단일  URL또는 특정 태그에 임계값을 지정하는 것이 가끔 필요하다. 
- k6에서 태그가 지정된 요청은 임계값에서 사용할 수 있는 하위 지표를 생성한다. 

```js
export const options = {
  thresholds: {
    'metric_name{tag_name:tag_value}': ['threshold_expression'],
  },
};

```

- 완전한 예제는 다음과 같다. 

```js
import http from 'k6/http';
import { sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const options = {
  thresholds: {
    'http_req_duration{type:API}': ['p(95)<500'], // threshold on API requests only
    'http_req_duration{type:staticContent}': ['p(95)<200'], // threshold on static content only
  },
};

export default function () {
  const res1 = http.get('https://test-api.k6.io/public/crocodiles/1/', {
    tags: { type: 'API' },
  });
  const res2 = http.get('https://test-api.k6.io/public/crocodiles/2/', {
    tags: { type: 'API' },
  });

  const responses = http.batch([
    ['GET', 'https://test-api.k6.io/static/favicon.ico', null, { tags: { type: 'staticContent' } }],
    [
      'GET',
      'https://test-api.k6.io/static/css/site.css',
      null,
      { tags: { type: 'staticContent' } },
    ],
  ]);

  sleep(1);
}

```

## Threshold 를 벗어나면 테스트 중지하기

- 스레시홀드를 넘어서는 경우 테스트를 중지하고자 한다면 abortOnFail 속성을 true로 둔다. 
- abortOnFail 를 지정하면 threshold 가 실패하면 바로 종료한다. 

- 가끔 임계값을 넘어 테스트가 중요한 데이터를 생성하기 전에 중단될 수 있다. 
- 이러한 현상을 막기 위해서 delayAbortEval을 사용하여 abortOnFail 을 지연할 수 있다. 
- 이 스크립트에서 abortOnFail 은 10초 지연된다. 
- 10초후 테스트가 p(99) < 10 임계값을 실패하면 테스트가 중단되는 예제이다.

```js
export const options = {
  thresholds: {
    metric_name: [
      {
        threshold: 'p(99) < 10', // string
        abortOnFail: true, // boolean
        delayAbortEval: '10s', // string
        /*...*/
      },
    ],
  },
};

```

|Name| Type| Description|
|---|---|---|
|threshold| string| 임계값 표현식이다. 검증할 식을 기술한다.|
|abortOnFail| boolean| 테스트중에 임계값을 넘어서면 abort 할지 여부 true인경우 동작한다.|
|delayAboutEval| string| 만약 종료하기 전에 특정 메트릭 샘플을 수집해야하는경우 종료 시점을 딜레이 할 수 있다. |


- 다음은 샘플 예제이다. 

```js
import http from 'k6/http';

export const options = {
  vus: 30,
  duration: '2m',
  thresholds: {
    http_req_duration: [{ threshold: 'p(99) < 10', abortOnFail: true }],
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
}

```

- k6가 k6클라우드에서 실행될 때 임계값은 60초마다 평가된다. 
- 따라서 abortOnFail 기능은 최대 60초까지 지연될 수 있다. 

## checks 를 이용하여 로드 테스트 실패하기

- Check는 검증을 코드로 수행하기 좋은 도구이다. 
- check는 thresholds와는 다르게 종료조건으로 사용되지 않는다. 

- 만약 checks만 이용하여 검증을 하면, 전체 테스트를 종료할 수 없다. 
- checks와 thresholds를 조합하여 사용한다. 

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
  thresholds: {
    // the rate of successful checks should be higher than 90%
    checks: ['rate>0.9'],
  },
};

export default function () {
  const res = http.get('http://httpbin.test.k6.io');

  check(res, {
    'status is 500': (r) => r.status == 500,
  });

  sleep(1);
}
```

- 이 예제에서 threshold는 checks 메트릭에 설정된다. 
- 성공율이 90% 이상인경우로 설정했다. 
- 추가적으로 tags를 체크에 이용할 수 있다. 만약 특정 체크나 체크그룹에 임계를 지정할 수 있다. 

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
  thresholds: {
    'checks{myTag:hola}': ['rate>0.9'],
  },
};

export default function () {
  let res;

  res = http.get('http://httpbin.test.k6.io');
  check(res, {
    'status is 500': (r) => r.status == 500,
  });

  res = http.get('http://httpbin.test.k6.io');
  check(
    res,
    {
      'status is 200': (r) => r.status == 200,
    },
    { myTag: 'hola' }
  );

  sleep(1);
}

```

from: https://k6.io/docs/using-k6/thresholds/

## Wrap Up

- 지금까지 check와 thresholds 를 알아보았다. 
- check는 검증이 성공했는지 / 실패했는지를 검사하고, 실패했다고 해서 테스트가 바로 종료되지는 않는다. 
- thresholds 는 검증을 성공하면 계속해서 테스트가 수행되며, 실패하면 테스트를 바로 종료한다. 
- check와 thresholds를 함께 이용하여 검증을 수행할 수 있다. 
- 또한 threshold 에서 실패인경우에도 계속해서 테스트할지 여부도 설정할 수 있다는 것을 알게 되었다. 
  

