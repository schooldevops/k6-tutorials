# HTTP Request 사용하기 

- 새로운 로드 테스트를 할때 우선 테스트하고자 하는 대상의 HTTP 요청을 먼저 정의해야한다. 

## HTTP Request 작성하기

- 아래는 단순 GET 버젼이다. 
- 02_01_http_rquest_01.js 파일을 생성하고 

```js
import http from 'k6/http';

export default function() {
  http.get('http://test.k6.io');
}
```

- 다음은 POST 요청을 해보자. 

```js
import http from 'k6/http';

export default function () {
  const url = 'http://test.k6.io/login';
  const payload = JSON.stringify({
    email: 'aaa',
    password: 'bbb',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}

```

## 가능한 메소드

- http module 에서 다양한 HTTP 메소드를 제공한다. 

|name| value|
|---|---|
|batch()| 여러개의 HTTP요청을 병렬로 호출한다. |
|del()| HTTP DELETE 요청을 수행한다. |
|get()| HTTP GET 요청을 수행한다. |
|head()| HTTP HEAD 요청을 수행한다. |
|options()| HTTP OPTIONS 요청을 수행한다.|
|patch(): HTTP PATCH 요청을 수행한다. |
|post(): HTTP POST 요청을 수행한다. |
|put(): HTTP PUT 요청을 수행한다. |
|request(): 다양한 타입의 HTTP 요청을 수행한다. |

- 자세한 샘플은 https://k6.io/docs/javascript-api/k6-http/ 에서 찾아보자. 

## HTTP Request Tag

- k6는 자동적으로 HTTP request에 태그를 적용한다. 
- 이 태그를 이용하여 결과에서 필터링을 하거나 분석시 사용할 수 있다. 

|Name| description|
|---|---|
|expected_response| 기본적으로 200~399 사이의 응답을 받으면 정상이다. setResponseCallback으로 기본 행동을 변경할 수 있다. |
|group| 요청이 group 내부에서 수행되도록 한다. 태그값은 그룹 이름이되며 기본값은 비어있다.|
|name| URL 요청의 상세 설명이다.|
|method| 요청 메소드(GET/POST/PUT...)|
|senario| 요청이 시나리오 내부에서 실행되도록 요청한다. 태그 값은 시나리오 이름이며 기본값은 default이다.|
|status| 상태값을 응답한다.|
|url| URL 요청 기본값이다.|

- JSON 예제를 다음과 같이 볼수 있다. 테스트 결과가 어떻게 로깅되는지 확인할 수 있다. 
- 이 예제에서 지표는 HTTP 요청 기간이다.

```json
{
  "type": "Point",
  "metric": "http_req_duration",
  "data": {
    "time": "2017-06-02T23:10:29.52444541+02:00",
    "value": 586.831127,
    "tags": {
      "expected_response": "true",
      "group": "",
      "method": "GET",
      "name": "http://test.k6.io",
      "scenario": "default",
      "status": "200",
      "url": "http://test.k6.io"
    }
  }
}
```

- 위와 같이 tags 하위 태그에 태그 내용들을 확인할 수 있다. 

## URL Grouping

- 기본적으로 tags는 name 필드를 가진다. 이는 요청 URL의 값을 저장한다. 
- 만약 테스트가 동적 URL 경로를 가진다면, 이 동작을 원하지 않을 수 있다. 이로 인해 많은 수의 고유 URL이 메트릭 스트림으로 가져올 수 있다. 
- 다음은 100개의 다른 URL을 호출한다. 

```js
import http from 'k6/http';

export default function () {
  for (let id = 1; id <= 100; id++) {
    http.get(`http://example.com/posts/${id}`);
  }
}
// tags.name=\"http://example.com/posts/1\",
// tags.name=\"http://example.com/posts/2\",
```

- 다음은 단일 메트릭에 리포트 되길 원할 것이다. 
- 동적 URL로 부터 데이터 집계를 위해서 명시적인 태그 이름을 지원한다. 

```js
import http from 'k6/http';

export default function () {
  for (let id = 1; id <= 100; id++) {
    http.get(`http://example.com/posts/${id}`, {
      tags: { name: 'PostsItemURL' },
    });
  }
}
// tags.name=\"PostsItemURL\",
// tags.name=\"PostsItemURL\",
```

- 실행하기

```go
$ k6 run 01_http_request_04.js --out json=result01.json
```

- JSON 출력 결과는 다음과 같다. 

```json
{
    "type":"Point",
    "metric":"http_req_duration",
    "data": {
        "time":"2017-06-02T23:10:29.52444541+02:00",
        "value":586.831127,
        "tags": {
            "method":"GET",
            "name":"PostsItemURL",
            "status":"200",
            "url":"http://example.com/1"
        }
    }
}

// and

{
    "type":"Point",
    "metric":"http_req_duration",
    "data": {
        "time":"2017-06-02T23:10:29.58582529+02:00",
        "value":580.839273,
        "tags": {
            "method":"GET",
            "name":"PostsItemURL",
            "status":"200",
            "url":"http://example.com/2"
        }
    }
}
```

- 위 내용은 동일한 name 결과를 출력한다. name: PostsItemURL 로 된 100개의 요청을 json파일에서 확인할 수 있을 것이다. 

- 다른 대안으로 http.url 을 이용하면 name 태그에 템플릿으로 출력된다.

```js
import http from 'k6/http';

export default function () {
  for (let id = 1; id <= 100; id++) {
    http.get(http.url`http://example.com/posts/${id}`);
  }
}
// tags.name="http://example.com/posts/${}",
// tags.name="http://example.com/posts/${}",

```

from: https://k6.io/docs/using-k6/http-requests/