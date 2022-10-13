# HTTP Request 사용하기 

- 로드 테스트를 할때 우선 테스트하고자 하는 대상의 HTTP 요청을 먼저 정의해야한다. 
- k6는 http 모듈을 제공하며 이는 built in 모듈이며, http 요청(get, post, put, delete 등) 을 보낼 수 있는 기능을 제공한다.

## HTTP Request 작성하기

### GET 요청하기 

- 아래는 단순 GET 을 이용하여 요청을 보낸다. 
- 02_01_http_rquest_01.js 파일을 생성하고 

```js
import http from 'k6/http';

export default function() {
  var response = http.get('http://test.k6.io');
}
```

- http.get('url'); 을 이용하여 get 요청을 url로 전송한다. 
- 요청 결과를 response 에 저장한다. 

### POST 요청하기 

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

- http.post 메소드를 이용하여 post 요청을 보낸다. 
- 이때 요청을 보내기 위해서 url, 전송데이터(payload), 헤더 및 파라미터(params) 를 매개변수로 전달할 수 있다. 
- 데이터 전송시 json을 전송하기 위해서 params.headers 에 'Content-Type' 으로 'application/json' 을 전송하도록 설정하였다. 

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
- 이 태그를 이용하여 결과에서 필터링을 하거나 분석 시 사용할 수 있다. 

|Name| description|
|---|---|
|expected_response| 기본적으로 200~399 사이의 응답을 받으면 정상이다. setResponseCallback으로 기본 행동을 변경할 수 있다. |
|group| 요청이 group 내부에서 수행되도록 한다. 태그값은 그룹 이름이되며 기본값은 비어있다.|
|name| URL 요청의 상세 설명이다.|
|method| 요청 메소드(GET/POST/PUT...)|
|senario| 요청이 시나리오 내부에서 실행되도록 요청한다. 태그 값은 시나리오 이름이며 기본값은 default이다.|
|status| 상태값을 응답한다.|
|url| URL 요청 기본값이다.|

- 실형결과는 다음과 같이 JSON으로 볼수 있다. 테스트 결과가 어떻게 로깅되는지 확인할 수 있다. 
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

- 위와 같이 태그 내용들을 확인할 수 있다. 
- expected_response: 기대한 응답 200으로 받았다는 것을 나타낸다. (true)
- group: 지정되지 않아서 ""로 처리되었다. 
- method: 요청한 메소드가 GET임을 나타낸다. 
- name: 요청한 url 정보를 나타낸다. 
- scenario: 시나리오를 지정하거나, 태깅을 하지 않았으므로 기본 default가 출력된다. 
- status: 응답을 받은 상태 코드가 200임을 나타낸다. 
- url: 요청 경로

## URL Grouping

- 테스트를 수행할 때 url 경로중 특정 PathVariable은 변경되지만, 동일한 엔드포인트로 요청을 수행하는 경우가 자주 발생한다. 
- 만약 테스트가 동적 URL 경로를 가진다면 URL 그룹을 통해서 동적으로 요청할 수 있다.
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
- 요청한 내용 하나하나가 json으로 출력이 된다.

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

ref: https://k6.io/docs/using-k6/http-requests/