# Tags and Groups

- 로그 테스트는 다른 하위 시스템과 리소스를 대상으로 한다. 
- 이로 인해 성능을 저하시키는 문제를 정확히 찾아내기 어려울 수 있다. 

- k6는 2가지 스크립팅 API를 제공하여 가시성, 소트, 테스트 결과 필터링을 수행할 수 있게한다. 
  - Tags: 
    - check, threshold, custom metrics, 심층 필터링 등을 위해서 분류를 할 수 있다. 
  - Groups:
    - 태그를 스크립트 함수에 적용한다. 

- 이러한 미세한 태그 이외에도 옵션을 사용하여 테스트 전체 태그를 설정할 수 있다. 
- 이러한 태글르 사용하여 여러 테스트의 결과를 비교할 수 있다. 
- 추가적으로 결과를 필터링, 임계값 분석 작업을 제한할 수도 있다. 

## Tags

- Tags는 k6 엔터티를 카테고리화 하고, 테스트 결과를 필터링 한다. 
- k6는 2가지 타입의 태그를 제공한다. 
  - System 태그들은 k6에서 자동으로 할당된다. 
  - User-defined 태그 들은 스크립트를 작성할때 직접 지정이 가능하다. 

## System tags

- 현재 k6는 자동적으로 태그를 생성하고 있다. 

|TAG|	DESCRIPTION|
|---|---|
|proto|	사용하는 프로토콜 (예 HTTP/1.1)|
|subproto|	하위 프로토콜 이름이며 websocked에 의해서 사용된다. |
|status|	HTTP 상태코드 (200/404 등)|
|method|	HTTP 메소드 이름 (GET/POST등) 혹은 gRPC를 위한 RPC 메소드|
|url|	HTTP 요청 URL|
|name|	HTTP 요청 이름 |
|group|	전체 그룹 경로 해당 값에 대한 자세한 내용은 이전 설명 참조 (https://k6.io/docs/using-k6/tags-and-groups/#groups)|
|check|	check 이름|
|error|	스트링으로 non-HTTP 에러 메시지이다 (네트워크 혹은 DNS에러)|
|error_code|	에러 타입에 대한 코드| 현제 에러 코드들의 리스트로 Error Code page 에서 확인할 수 있따. https://k6.io/docs/javascript-api/error-codes|
|tls_version|	TLS버젼 |
|scenario|	메트릭이 방출된 시나리오 이름|
|service|	gRPC를 위한 RPC 서비스 이름 |
|expected_response|	responseCallback 를 기반으로하는 true/false 값 기본적으로 상태가 2xx인지 3xx인지 확인한다. |

- 위 태그의 몇몇을 비활성화 하기 위해서 systemTags 옵션을 이용할 수 있다. 
- 기억할 것은 몇몇 데이터 컬렉터들(cloud와 같은) 은 특정 태그가 꼭 필요하다. 
- 그리고 몇몇 시스템 태그를 필요한경우 활성화 할 수 있다. 

|TAG|	DESCRIPTION|
|---|---|
|vu|	요청을 실행한 가상 유저의 ID |
|iter|	반복횟수|
|ip|	원격 서버의 IP주소|
|ocsp_status|	Online Certificate Status Protocol (OCSP) HTTPS 상태 https://k6.io/docs/using-k6/protocols/ssl-tls/online-certificate-status-protocol-ocsp|

## 사용자 정의 태그 

- 사용자 정의 태그를 이용하여 k6 엔터티를 카테고리화 할 수 있다. 
- 다음 엔터티에 태그를 걸수 있다. 
  - requests
  - checks
  - thresholds
  - custom metrics

```js
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check } from 'k6';

const myTrend = new Trend('my_trend');

export default function () {
  // Add tag to request metric data
  const res = http.get('http://httpbin.test.k6.io/', {
    tags: {
      my_tag: "I'm a tag",
    },
  });

  // Add tag to check
  check(res, { 'status is 200': (r) => r.status === 200 }, { my_tag: "I'm a tag" });

  // Add tag to custom metric
  myTrend.add(res.timings.connecting, { my_tag: "I'm a tag" });
}

```

## 테스트 전반의 태그

- request, check, threshold, custom metrics에 태그를 걸수 있지만, 테스트 전체에 태그를 걸 수 있다. 
- 다음 2가지 방법을 이용할 수 있다. 
  - CLI 를 이용하여 '--tag NAME=VALUE' 옵션을 이용할 수 있다. 
  - 스크립트에 추가 

```js
export const options = {
  tags: {
    name: 'value',
  },
};
```

## 코드 정의 태그 

- 어떤 사용자 정의 태그를 설정할지 처리하기 위한 고급 로직이 있는 사용자 정의 태그가 필요한경우 코드에서 태그를 정의하여 수행할 수 있다.
- 향상된 태깅 워크플로우를 지원하기 위해서 스크립트 코드로 부터 바로 set/get 할 수 있다. 
- https://k6.io/docs/javascript-api/k6-execution/#vu k6/execution.vu.tags 객체의 속성은 키/값 쌍을 새로운 태그로 동적으로 할당이 가능하다. 
- 다음 예제에서 볼수 있듯이 중첩된 그룹에서 컨테이너 그룹을 추적하고 중첩된 그룹의 하위 메트릭을 집계하는데 유용할 수 있다. 

```js
import http from 'k6/http';
import exec from 'k6/execution';
import { group } from 'k6';

export const options = {
  thresholds: {
    'http_reqs{container_group:main}': ['count==3'],
    'http_req_duration{container_group:main}': ['max<1000'],
  },
};

export default function () {
  exec.vu.tags.containerGroup = 'main';

  group('main', function () {
    http.get('https://test.k6.io');
    group('sub', function () {
      http.get('https://httpbin.test.k6.io/anything');
    });
    http.get('https://test-api.k6.io');
  });

  delete exec.vu.tags.containerGroup;

  http.get('https://httpbin.test.k6.io/delay/3');
}

```

- 동일한 api를 이용하여, 이미 지정한 사용자 정의 혹은 시스템 정의 태그를 조회할 수 있다. 

```js
import exec from 'k6/execution';

export default function () {
  const tag = exec.vu.tags['scenario'];
  console.log(tag); // default
}
```

## Tagging stage

- [k6-jslib-utils](https://k6.io/docs/javascript-api/jslib/utils) 프로젝트의 몇가지 헬퍼 함수들 덕분에 states 옵션을 지원한다. 
- 그리고 태그는 현재 진행중인 스테이지에 추가될 수 있다. 
- 유사하게 태깅을 위한 다른 방법은 태그는 반복중에 수집된 모든 샘플에 추가된다. 
- 태깅을 위한 첫번째 방법은 작업을 실행한 단계를 식별하기 위한 단계 태그를 설정하기 위해 tagWithCurrentStageIndex 함수를 호출하는 것이다. 

```js
import http from 'k6/http';
import exec from 'k6/execution';
import { tagWithCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';

export const options = {
  stages: [
    { target: 5, duration: '5s' },
    { target: 10, duration: '10s' },
  ],
};

export default function () {
  tagWithCurrentStageIndex();

  // all the requests will have a `stage` tag
  // with its value equal to the the index of the stage
  http.get('https://test.k6.io'); // e.g. {stage: "1"}
}

```

- 추가적으로 profiling 함수 tagWithCurrentStageProfile 는 현재 수행되는 스테이지의 계산된 프로파일에 태그를 추가할 수 있다. 

```js
import http from 'k6/http';
import exec from 'k6/execution';
import { tagWithCurrentStageProfile } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';

export const options = {
  stages: [{ target: 10, duration: '10s' }],
};

export default function () {
  tagWithCurrentStageProfile();

  // all the requests are tagged with a `stage` tag
  // with the index of the stage as value
  http.get('https://test.k6.io'); // {stage_profile: ramp-up}
}

```

- 제공된 값은 현재 스테이지를 기준으로 작성이 되며 다음 옵션중에 하나이다. 

PROFILE,	DESCRIPTION
ramp-up,	현재 스테이지는 이전 단계의 목표보다 더 큰 목표가 있다. 
steady,	현재 스테이지는 이전 단계의 목표와 동일한 목표가 있따. 
ramp-down,	현재 스테이지 목표가 이전 단계의 목표보다 적다. 

- 태그 결과는 다음과 같다. 

```js
{
  "type ": "Point ",
  "data ": {
    "time ": "2017-05-09T14:34:45.239531499+02:00 ",
    "value ": 459.865729,
    "tags ": {
      "group ": "::my group::json ",
      "method ": "GET ",
      "status ": "200 ",
      "url ": "https://httpbin.test.k6.io/get "
    }
  },
  "metric ": "http_req_duration "
}

```

- 태그가 테스트 결과 출력에 어떤 영향을 미치는지 보려면 k6 결과 출력 구분을 참조하라. 
- https://k6.io/docs/results-visualization/json

## Groups 

- 추가 구성을 위해서 groups 를 사용하여 기능별로 스트립트를 그룹화 할 수 있따. 
- BDD 스타일 테스트를 위해서 그룹을 중첩할 수 있다. 

- 그룹에서 내보낸 모든 메트릭에는 ::(콜론 2개)로 구분된 모든 래핑 그룹 이름의 값이 있는 태그 그룹이 있다. 
- 루트 그룹은 '' (빈 문자열) 이름을 사용한다. 
- Cool requests라는 단일 그룹이 있는경우 그룹의 실제 값은 ::cool requests 이다. 

- 예를 들어 그룹을 사용하여 페이지 로드 또는 사용자 작업별로 여러 요청을 구성할 수 있다. 

```js
import { group } from 'k6';

export default function () {
  group('visit product listing page', function () {
    // ...
  });
  group('add several products to the shopping cart', function () {
    // ...
  });
  group('visit login page', function () {
    // ...
  });
  group('authenticate', function () {
    // ...
  });
  group('checkout process', function () {
    // ...
  });
}

```

- 그룹은 내부적으로 다음 작업을 수행한다. 
  - 각 group() 함수에 대해 k6은 group_duration 메트릭을 내보낸다. 여기에는 그룹 함수를 실행하는 총 시간이 포함된다. 
  - 태그 지정 가능한 리소스(검사, 요청 또는 사용자 지정 메트릭)가 그룹 내에서 실행되면 k6는 현재 그룹 이름으로 태그 그룹을 설정한다. 자세한 내용은 태그 섹션을 참조 

- group_duration 메트릭과 group 태깅, 두 옵션 모두 복잡한 테스트 결과를 분석하고 시각화 하는데 도움을 준다. 
- k6 결과 출력에서 어떻게 작동하는지 확인하라. 

### 권장하지 않음 : 요청당 하나의 그룹 

- 각 요청마다 그룹으로 래핑하는 것은 불필요한 보일러프레이트 소스이다. 

```js
import { group, check } from 'k6';
import http from 'k6/http';

const id = 5;

// reconsider this type of code
group('get post', function () {
  http.get(`http://example.com/posts/${id}`);
});
group('list posts', function () {
  const res = http.get(`http://example.com/posts`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
});

```

- 코드가 앞의 스니펫과 같으면 다음 전략을 고려하여 더 깔끔한 코드를 작성하라. 
  - 동적 URL을 위해서 URL grouping 기능 이용 
  - 요청에 의미있는 이름을 지정하기 위해서 tags.name에 이름을 할당하라. 
  - 공통 논리를 재사용하거나 코드를 더 잘 구성하려면 함수에서 논리를 그룹화하거나 로컬 JavaScript 모듈을 만들고 테스트 스크립트로 가져온다.
  - 고급 사용자 패턴을 모델링하려면 시나리오를 확인하라. 

from: https://k6.io/docs/using-k6/tags-and-groups/
