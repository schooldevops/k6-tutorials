# Test life cycle

- k6는 개의 스테이지를 가진다. 
- 스테이지는 항상 동일한 순서로 실행된다. 

- 1. init 는 스크립트를 초기화 한다. 파일로드, 모듈 임포트, 함수 정의등
- 2. (선택사항) setup코드는 환경을 준비하고, 데이터를 생성한다. 
- 3. VU코드는 default 함수에서 수행된다. 옵션에 정의한 만큼동작한다.
- 4. (선택사항) teardown 함수는 테스트의 환경을 정리하고, 자원을 릴리즈한다.

```js
// 1. init code

export function setup() {
  // 2. setup code
}

export default function (data) {
  // 3. VU code
}

export function teardown(data) {
  // 4. teardown code
}

```

## init context

- k6는 테스트를 수행하기 위해서 init함수에서 테스트 환경을 정의한다. 
  - 모듈 임포트
  - 로컬 파일 시스템에서 파일 로드
  - 모든 옵션에 대한 설정 테스트
  - 함수 정의 (default에서 수행 혹은 setup, teardown에서 수행)
- init 은 필수 함수이다. 

```js
// init context: importing modules
import http from 'k6/http';
import { Trend } from 'k6/metrics';

// init context: define k6 options
export const options = {
  vus: 10,
  duration: '30s',
};

// init context: global variables
const customTrend = new Trend('oneCustomMetric');

// init context: define custom function
function myCustomFunction() {
  // ...
}
```

## VU stage

- VU스테이지는 필수이다. 
- default 함수에서 실제 테스트를 수행한다. 

```js
export default function () {
  // do things here...
}

```

- VU코드는 테스트가 수행되는 기간동안 지속적으로 수행된다. 
- VU코드는 테스트를 위한 http코드를 생성하고, 메트릭의 생성, 테스트를 위한 모든 작업을 수행한다. 
- job 함수를 제외하고 모든 작업이 수행되며, job은 init함수에서 수행된다. 
  - VU코드는 로컬 파일을 읽을 수 없다. 
  - VU코드는 어떠한 모듈도 로드할 수 없다. 


## Setup and teardown stages

- default와 마찬가지로 setup과 teardown은 반드시 export 로 정의해야한다. 
- default와는 다르게 setup, teardown은 오직 한번씩만 수행된다. 
  - setup은 init 함수 다음에 수행되며 오직 한번만 수행된다. 
  - teardown은 테스트 끝에 수행되며 VU 코드가 수행되고 난뒤 바로 수행된다. 

```js
import http from 'k6/http';

export function setup() {
  const res = http.get('https://httpbin.test.k6.io/get');
  return { data: res.json() };
}

export function teardown(data) {
  console.log(JSON.stringify(data));
}

export default function (data) {
  console.log(JSON.stringify(data));
}
```

### setup, teardown 스킵하기

- 옵션을 이용하여 함수를 스킵할 수 있다. 

```go
k6 run --no-setup --no-teardown ...
```

### 데이터 전달하기 

```go
// 1. init code

export function setup() {
  // 2. setup code
}

export default function (data) {
  // 3. VU code
}

export function teardown(data) {
  // 4. teardown code
}
```

- 위와 같이 데이터를 전달할 수 있다. 

```js
export function setup() {
  return { v: 1 };
}

export default function (data) {
  console.log(JSON.stringify(data));
}

export function teardown(data) {
  if (data.v != 1) {
    throw new Error('incorrect data: ' + JSON.stringify(data));
  }
}

```

- 위와 같이 데이터를 전달할 수 있다. 
- setup에서 데이터를 반환한다. 
- 이후 defult, teardown에서 data를 파라미터로 전달 받을 수 있다. 
  - 데이터는 오직 json 데이터만 전달가능하며, 함수는 전달불가이다. 
  - 데이터가 너무 크면 더 많은 메모리가 사용된다. 
  - default() 에서 데이터를 변경할 수 없다. 
  

from: https://k6.io/docs/using-k6/test-life-cycle/

